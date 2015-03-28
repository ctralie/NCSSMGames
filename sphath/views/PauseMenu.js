/* 
    PAUSE MENU

    displays three buttons
        resume
        help
        quit

    includes mouse listeners to watch buttons
*/

function PauseMenu() {
    

    this.render = function () {
        //animation loop stuff goes here

        requestAnimFrame(repaint);
    }

    // move to instructions
    //prevState=gameState.PauseMenu;
    //currentState=gameState.Instructions;

    // move to game
    // need to account for the lost time while paused
    //  if we are using some real clock
    //currentState=gameState.Game;

    // move to start menu through quitting
    //currentState=gameState.StartMenu;
   
}
