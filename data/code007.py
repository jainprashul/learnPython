#the code below contains "while" loop
#note colon after condition
#and that command(s) inside are indented with 4 spaces

#condition consists of call to "look_ahead()" function
#it returns either 'wall' or 'star' or '' (empty string)

#we move forward while there is no wall ahead

while look_ahead() != 'wall':
    forward()

#now make tank turn after reaching the wall
#and run to star to pick it.
#perhaps it is a place for second loop.

