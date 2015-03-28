/*
    MOUSE INTERACTION CODE

    TODO pass events through currentState
*/
function degToRad(degrees) {
    return degrees * Math.PI / 180;
}

var lastX;
var lastY;
var dragging = false;
var MOUSERATE = 0.005;

//Functions to handle mouse motion
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
    return false;
}

function makeClick(evt) {
    evt.preventDefault();
    dragging = true;
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
        self.theta = self.theta - MOUSERATE*dx;
        self.phi = self.phi - MOUSERATE*dy;
        requestAnimFrame(repaint);
    }
    return false;
}

function initMouse(canvas) {
    //Ordinary mouse clicks
    canvas.addEventListener('mousedown', makeClick);
    canvas.addEventListener('mouseup', releaseClick);
    canvas.addEventListener('mousemove', clickerDragged);
    
    //Support for mobile devices
    canvas.addEventListener('touchstart', makeClick);
    canvas.addEventListener('touchend', releaseClick);
    canvas.addEventListener('touchmove', clickerDragged);
    console.log("Mouse Enabled...");
}
