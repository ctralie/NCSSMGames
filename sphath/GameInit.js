/*
    GAME MAIN

    the final script to call from the webpage?
    this contains webGLStart() which is called on load
*/

//TODO where else are gl, and glcanvas declared?
var glcanvas;

// game related
var gameState = { 
    Intro        :  new Intro,          // short introduction before start menu 
    StartMenu    :  new StartMenu,      // leads to game, scoreboard, or instructions
    Game         :  new Game,           // main gameplay
    PauseMenu    :  new PauseMenu,      // leads to instructions or the start menu
    Scoreboard   :  new Scoreboard,     // scoreboard for only current session atm
    Instructions :  new Instructions,   // game instructions
    //Failure      :  new Failure         // a screen to display errors i guess?
};

var prevState;
var currentState = gameState.Intro;

function repaint() {
    currentState.render();
}

// <body onload="webGLStart();" text = "white" bgcolor = "black">
function webGLStart() {
    glcanvas = document.getElementById("MainGLCanvas");
    // moved mouse event listeners to Mouse.js
    initMouse(glcanvas);

    initGL(glcanvas);
    initShaders();
    initGLBuffers();
    initTextures();

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);

    // eventually change this to Intro or StartMenu
    currentState = gameState.Game;
    requestAnimFrame(repaint);
}
