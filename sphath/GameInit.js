/*
    GAME MAIN

    the final script to call from the webpage?
    this contains webGLStart() which is called on load
*/

var gl;
var glcanvas;

var lastX; 
var lastY;
var dragging = false;
var MOUSERATE = 0.005;

// game related
var prevState;
var currentState;
var gameState = { 
    Intro        :  new Intro,          // short introduction before start menu 
    StartMenu    :  new StartMenu,      // leads to game, scoreboard, or instructions
    Game         :  new Game,           // main gameplay
    PauseMenu    :  new PauseMenu,      // leads to instructions or the start menu
    Scoreboard   :  new Scoreboard,     // scoreboard for only current session atm
    Instructions :  new Instructions,   // game instructions
    //Failure      :  new Failure         // a screen to display errors i guess?
};

function repaint() {
    currentState.render();
}

//*** MOUSE INTERACTION ***//
function getMousePos(evt) {
    var rect = glcanvas.getBoundingClientRect();
    return {
        X: evt.clientX - rect.left,
        Y: evt.clientY - rect.top
    };
}
function releaseClick(evt) {
    evt.preventDefault();
    dragging = false;
    if (typeof currentState.releaseClick !== 'undefined') {
        currentState.releaseClick(evt);
    }
    return false;
} 

function makeClick(evt) {
    evt.preventDefault();
    dragging = true;
    if (typeof currentState.makeClick !== 'undefined') {
        currentState.makeClick(evt);
    }
    return false;
} 

function clickerDragged(evt) {
    evt.preventDefault();
    var mousePos = getMousePos(evt);
    var dx = mousePos.X - lastX;
    var dy = mousePos.Y - lastY; 
    lastX = mousePos.X; 
    lastY = mousePos.Y;
    if (dragging) {
        if (typeof currentState.clickerDragged !== 'undefined') {
            currentState.clickerDragged(evt,dx,dy);
        }
    }
    return false;
}


//*** INIT ***//
// <body onload="webGLStart();" text = "white" bgcolor = "black">
function webGLStart() {
    glcanvas = document.getElementById("MainGLCanvas");

    glcanvas.addEventListener('mousedown', makeClick     );
    glcanvas.addEventListener('mouseup'  , releaseClick  );
    glcanvas.addEventListener('mousemove', clickerDragged);
    
    //Support for mobile devices
    glcanvas.addEventListener('touchstart', makeClick     );
    glcanvas.addEventListener('touchend'  , releaseClick  );
    glcanvas.addEventListener('touchmove' , clickerDragged);

    initGL(glcanvas);
    initShaders();
    initGLBuffers();
    initTextures();

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);

    //currentState = gameState.Intro;
    currentState = gameState.Instructions;
    currentState = gameState.Game;
    requestAnimFrame(repaint);
}
