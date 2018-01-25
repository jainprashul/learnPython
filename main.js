$(function() {
    
    var level = determineLevel();
    
    window.operations = [];
    brEditor = ace.edit('editor');
    brEditor.getSession().setMode("ace/mode/python");
    window.initCode = loadFile('data/game01.py');
    window.gameData = JSON.parse(loadFile('data/level' + level + '.json'));
    $('h1').text($('h1').text() + ' - ' + window.gameData.title);
    $('#statement-pane').html(loadFile('data/en/descr' + level + '.txt'));
    brEditor.setValue(loadFile('data/code' + level + '.py'));
    brEditor.moveCursorTo(0, 0, false);
    brEditor.selection.clearSelection();
    brython();
    game = new Game(window.gameData);
    
    $('#reset-button').click(function() {
        game.reset();
    });
    
    $('#level-select').change(function() {
        switchLevel($(this).val());
    });
    
    function switchLevel(level) {
        var href = location.href.replace(/^(.*)\?.*/, '$1');
        location.href = href + '?level=' + level;
    }
    
    function loadFile(url) {
        return $.ajax(url, {async:false}).responseText;
    }
    
    function determineLevel() {
        var m = location.href.match(/level\=(\d+)/);
        if (m == null || m.length < 1) {
            return '001';
        }
        var v = parseInt(m[1]);
        $('#level-select').val(v);
        var s = '00' + parseInt(m[1]);
        return s.substring(s.length - 3);
    }
    
    window.nextLevel = function() {
        switchLevel(window.gameData.next);
    }
    
});

