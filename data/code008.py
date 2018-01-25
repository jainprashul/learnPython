#this code moves tank as long as it can
#and picks stars when it finds them

#note that content of both "while" and "if"
#is indented with 4 spaces relative to "parent" block

right()

while look_ahead() != 'out':
    if look_below() == 'star':
        pick()
    forward()

left()

#run this code, then add more
#to collect the stars from the upper passage

