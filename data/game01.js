$(function() {
    function doOperations() {
        if (operations.length == 0 || !game.isReady()) {
            return;
        }
        op = operations.shift();
        opcode = op[0];
        if (opcode == 'prn') {
            var pre = $('#output-pre');
            pre.text(pre.text() + op[1]);
        } else if (opcode == 'end') {
            if (op[1] == 1) {
                if (confirm('Well done!\nYou\'ve completed this level!\n\nSwitch to next level?')) {
                    nextLevel();
                }
            } else {
                alert('Task not completed:\n' + op[2]);
            }
            operations = [];
        } else {
            try {
                game.operation(op);
            } catch (e) {
                alert('Error:\n' + e.message);
                operations = [];
            }
        }
    }
    
    setInterval(doOperations, 50);
});

function Game(data) {
    
    var self = this;
    var objGroup = null;
    var objects = null;
    var sz = 40;
    var width = data.width;
    var height = data.height;
    var stepTime = 500;
    var rotation = [[0, 1], [-1, 0], [0, -1], [1, 0]];
    var lcg0 = Math.floor(Math.random() * 1000000);
    var lcg = lcg0;
    var phaserGame;
    var busy = 'init';
    
    phaserGame = gameSetup(data);
    
    this.reset = function() {
        window.operations = [];
        destroy();
        lcg = lcg0;
        busy = 'init';
    }
    
    this.isReady = function() {
        return busy === null;
    }
    
    this.isSuccess = function() {
        var stars = objects['star'];
        for (var i = 0; i < stars.length; i++) {
            if (stars[i].alive) {
                return false;
            }
        }
        return true;
    }
    
    this.operation = function(op) {
        switch (op[0]) {
            case 'fwd': self.forward(); break;
            case 'lt': self.left(); break;
            case 'rt': self.right(); break;
            case 'pck': self.pick(); break;
        }
    }
    
    this.forward = function() {
        var tank = getTank();
        var rot = rotation[tank.rot];
        var nextX = tank.logicX + rot[0];
        var nextY = tank.logicY + rot[1];
        tank.move = {x0:tank.x, y0:tank.y, t0:phaserGame.time.now};
        tank.logicX = nextX;
        tank.logicY = nextY;
        tank.move.t1 = tank.move.t0 + stepTime;
        tank.move.x1 = mkX(tank.logicX);
        tank.move.y1 = mkY(tank.logicY);
        busy = 'move';
    }
    
    this.left = function() {
        turn(1);
    }
    
    this.right = function() {
        turn(-1);
    }
    
    this.pick = function() {
        var tank = getTank();
        var star = findObject(tank.logicX, tank.logicY, 'star');
        star.kill();
    }
    
    function turn(phi) {
        var tank = getTank();
        tank.move = {d0: tank.rot * Math.PI / 2, t0: phaserGame.time.now};
        tank.rot = (tank.rot + rotation.length + phi) % rotation.length;
        tank.move.d1 = tank.move.d0 + phi * Math.PI / 2;
        tank.move.t1 = tank.move.t0 + stepTime;
        busy = 'turn';
    }
    
    function gameSetup(data) {
        var game = new Phaser.Game(data.width * sz, data.height * sz,
                Phaser.AUTO, 'gamescreen',
                { preload: gamePreload, update: gameUpdate });
        return game;
    }
    
    function rnd() {
        lcg = (250001 * lcg + 13) % 65536;
        return lcg;
    }
    
    function gamePreload() {
        phaserGame.load.spritesheet('star', 'data/star.png', 40, 40);
        phaserGame.load.image('wall', 'data/wall.png');
        phaserGame.load.spritesheet('tank', 'data/tank.png', 40, 40);
        phaserGame.load.spritesheet('grass', 'data/grass.png', 20, 20);
        phaserGame.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        phaserGame.scale.maxWidth = width * sz;
        phaserGame.scale.maxHeight = height * sz;
        phaserGame.scale.refresh();
    }
    
    function setup() {
        phaserGame.stage.backgroundColor = '#3c6';
        objGroup = phaserGame.add.group();
        objects = [];
        placeGrass();
        placeStars(data.stars);
        placeWalls(data.walls);
        placeTank(data.tank);
    }
    
    function destroy() {
        for (var key in objects) {
            var obj = objects[key];
            if (obj instanceof Array) {
                for (var i in obj) {
                    obj[i].destroy();
                }
            } else {
                obj.destroy();
            }
        }
        objects = [];
        objGroup.destroy();
    }
    
    function placeGrass() {
        for (var j = 0; j < height; j++) {
            for (var i = 0; i < width; i++) {
                var g = rnd() % 7;
                if (g >= 2) {
                    continue;
                }
                addObject(i, j, 'grass').frame = g;
            }
        }
    }
    
    function placeWalls(data) {
        if (typeof(data) == 'undefined') {
            return;
        }
        for (var i = 0; i < data.length; i++) {
            var wall = data[i];
            for (var j = 0; j < wall.len; j++) {
                addObject(wall.x + j, wall.y, 'wall');
            }
        }
    }

    function placeStars(data) {
        for (var i = 0; i < data.length; i++) {
            var star = data[i];
            addObject(star.x, star.y, 'star');
        }
    }
    
    function placeTank(data) {
        var tank = addObject(data.x, data.y, 'tank');
        tank.initX = data.x;
        tank.initY = data.y;
        tank.rot = 0;
    }
    
    function getTank() {
        return objects['tank'][0];
    }
    
    function findObject(x, y, kind) {
        var objs = objects[kind];
        if (typeof(objs) == 'undefined') {
            return null;
        }
        for (var i = 0; i < objs.length; i++) {
            var o = objs[i];
            if (o.logicX == x && o.logicY == y) {
                return o;
            }
        }
        return null;
    }
    
    function addObject(x, y, kind) {
        var img = objGroup.create(mkX(x), mkY(y), kind);
        scale(img, sz, sz);
        img.logicX = x;
        img.logicY = y;
        img.anchor.setTo(0.5, 0.5);
        if (typeof(objects[kind]) == 'undefined') {
            objects[kind] = [];
        }
        objects[kind].push(img);
        return img;
    }

    function mkX(x) {
        return x * sz + sz / 2;
    }
    
    function mkY(y) {
        return (height - y) * sz - sz / 2;
    }
    
    function scale(image, w, h) {
        image.scale.setTo(w / image.width, h / image.height);
    }
    
    function gameUpdate() {
        if (busy == 'init') {
            setup();
            busy = null;
        }
        if (busy == 'move') {
            processMove();
        } else if (busy == 'turn') {
            processTurn();
        }
        animateStars();
    }
    
    function processMove() {
        var tank = getTank();
        var move = tank.move;
        var now = phaserGame.time.now;
        var alpha = (now - move.t0) / (move.t1 - move.t0);
        if (alpha < 1) {
            tank.x = Math.round(alpha * (move.x1 - move.x0) + move.x0);
            tank.y = Math.round(alpha * (move.y1 - move.y0) + move.y0);
            animateTank(now);
        } else {
            tank.x = move.x1;
            tank.y = move.y1;
            animateTank(0);
            busy = null;
        }
    }
    
    function processTurn() {
        var tank = getTank();
        var move = tank.move;
        var now = phaserGame.time.now;
        var alpha = (now - move.t0) / (move.t1 - move.t0);
        if (alpha < 1) {
            tank.frame = 0;
            tank.rotation = -(alpha * (move.d1 - move.d0) + move.d0);
            animateTank(now);
        } else {
            tank.frame = tank.rot;
            tank.rotation = 0;
            animateTank(0);
            busy = null;
        }
    }
    
    function animateTank(t) {
        var tank = getTank();
        tank.frame = (tank.frame & 0x3) + (Math.floor(t / 150) % 4) * 4;
    }
    
    function animateStars() {
        var stars = objects['star'];
        if (typeof(stars) == 'undefined') {
            return;
        }
        var t = Math.floor(phaserGame.time.now / 100);
        for (var i = 0; i < stars.length; i++) {
            stars[i].frame = (i + t) % 4;
        }
    }
    
}

