/* 
    SCOREBOARD
    
    displays a sorted list of all the scores achieved in the current session
    for now at least
*/

function Scoreboard() {

    this.scores = [];

    this.render = function () {
        //animation loop stuff goes here

        requestAnimFrame(repaint);
    }

    this.addScore = function (score) {
        this.scores.append(score);
    }
    // move to StartMenu
    //currentState=gameState.StartMenu;
   
}
