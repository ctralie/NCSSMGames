var gl;
var glcanvas;

function initGL(canvas) {
    try {
        gl = canvas.getContext("experimental-webgl");
        gl.viewportWidth = canvas.width;
        gl.viewportHeight = canvas.height;
    } catch (e) {
    }
    if (!gl) {
        alert("Could not initialise WebGL, sorry :-(.  Try a new version of chrome or firefox and make sure your newest graphics drivers are installed");
    }
}


//Type 0: Fragment shader, Type 1: Vertex Shader
function getShader(gl, filename, type) {
    var shadersrc = "";
    var shader;
    var request;
    if (type == "fragment") {
        shader = gl.createShader(gl.FRAGMENT_SHADER);
    } 
    else if (type == "vertex") {
        shader = gl.createShader(gl.VERTEX_SHADER);
    } 
    else {
        return null;
    }

    $.ajax({
        async: false,
        url: filename,
        success: function (data) {
            shadersrc = data;
        },
        dataType: 'text'
    });
    
    gl.shaderSource(shader, shadersrc);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert(gl.getShaderInfoLog(shader));
        return null;
    }

    return shader;
}


var shaderProgram;

function initShaders() {
    var fragmentShader = getShader(gl, "./FragmentShader.glsl", "fragment");
    var vertexShader = getShader(gl, "./VertexShader.glsl", "vertex");


    shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert("Could not initialise shaders");
    }

    gl.useProgram(shaderProgram);

    shaderProgram.vPosAttrib = gl.getAttribLocation(shaderProgram, "vPos");
    gl.enableVertexAttribArray(shaderProgram.vPosAttrib);

    shaderProgram.texCoordAttrib = gl.getAttribLocation(shaderProgram, "texCoord");
    gl.enableVertexAttribArray(shaderProgram.texCoordAttrib);

    shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
    shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
}


var mvMatrix = mat4.create();
var mvMatrixStack = [];
var pMatrix = mat4.create();

function mvPushMatrix() {
    var copy = mat4.create();
    mat4.set(mvMatrix, copy);
    mvMatrixStack.push(copy);
}

function mvPopMatrix() {
    if (mvMatrixStack.length == 0) {
        throw "Invalid popMatrix!";
    }
    mvMatrix = mvMatrixStack.pop();
}

function setMatrixUniforms() {
    gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
    gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
}

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

//Variables for polar camera
var theta = -Math.PI/2;
var phi = Math.PI/2;
var camCenter = [0.0, 0.0, 0.0];
var camR = 5.0;

//Initializing sphere meshes
var hemisphereVertexPosBuffer;
var hemisphereTexCoordBuffer;
var hemisphereIdxBuffer;
function initGLBuffers() {
    console.log("Initializing buffers...");
    
    //Vertex Buffer
    hemisphereVertexPosBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, hemisphereVertexPosBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(HemiSphereVertices), gl.STATIC_DRAW)
    hemisphereVertexPosBuffer.itemSize = 3;
    hemisphereVertexPosBuffer.numItems = HemiSphereVertices.length/3;
    
    //Texture coordinates buffer
    hemisphereTexCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, hemisphereTexCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(HemiSphereTexCoords), gl.STATIC_DRAW)
    hemisphereTexCoordBuffer.itemSize = 2;
    hemisphereTexCoordBuffer.numItems = HemiSphereTexCoords.length/2;
    
    //Index buffer
    hemisphereIdxBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, hemisphereIdxBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(HemiSphereIndices), gl.STATIC_DRAW);
    hemisphereIdxBuffer.itemSize = 1;
    hemisphereIdxBuffer.numItems = HemiSphereIndices.length;
    
    requestAnimFrame(repaint);   
}

function handleLoadedTexture(T) {
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.bindTexture(gl.TEXTURE_2D, T);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, T.image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
}
var numberTexture;
function initTexture() {
    var numberImage = new Image();
    numberTexture = gl.createTexture();
    numberTexture.image = numberImage;
    numberImage.onload = function () {
        handleLoadedTexture(numberTexture)
    }
    numberImage.src = "Number1.png";
}


function drawScene() {
    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    //Step 1: Update the polar camera
    mat4.perspective(45, gl.viewportWidth / gl.viewportHeight, camR/100.0, camR*2, pMatrix);

    //mat4.identity(mvMatrix);
    var sinT = numeric.sin([theta])[0];
    var cosT = numeric.cos([theta])[0];
    var sinP = numeric.sin([phi])[0];
    var cosP = numeric.cos([phi])[0];
    var T = [-sinP*cosT, -cosP, sinP*sinT];
    var U = [-cosP*cosT, sinP, cosP*sinT];
    var R = [-sinT, 0, -cosT];
    var eye = [camCenter[0] - camR*T[0], camCenter[1] - camR*T[1], camCenter[2] - camR*T[2]];
    rotMat = [[R[0], U[0], -T[0], 0], [R[1], U[1], -T[1], 0], [R[2], U[2], -T[2], 0], [0, 0, 0, 1]];
    rotMat = numeric.transpose(rotMat);
    transMat = [[1, 0, 0, -eye[0]], [0, 1, 0, -eye[1]], [0, 0, 1, -eye[2]], [0, 0, 0, 1]];
    var mvMatrix4x4 = numeric.dot(rotMat, transMat);
    mvMatrix = [];
    var i = 0;
    var j = 0;
    for (i = 0; i < 4; i++) {
        for (j = 0; j < 4; j++) {
            mvMatrix.push(mvMatrix4x4[j][i]);
        }
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, hemisphereVertexPosBuffer);
    gl.vertexAttribPointer(shaderProgram.vPosAttrib, hemisphereVertexPosBuffer.itemSize, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, hemisphereTexCoordBuffer);
    gl.vertexAttribPointer(shaderProgram.texCoordAttrib, hemisphereTexCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, numberTexture);
    gl.uniform1i(shaderProgram.samplerUniform, 0);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, hemisphereIdxBuffer);
    setMatrixUniforms();
    gl.drawElements(gl.TRIANGLES, hemisphereIdxBuffer.numItems, gl.UNSIGNED_SHORT, 0);
}


function repaint() {
    drawScene();
}

function webGLStart() {
    glcanvas = document.getElementById("MainGLCanvas");
    //Ordinary mouse clicks
    glcanvas.addEventListener('mousedown', makeClick);
    glcanvas.addEventListener('mouseup', releaseClick);
    glcanvas.addEventListener('mousemove', clickerDragged);
    
    //Support for mobile devices
    glcanvas.addEventListener('touchstart', makeClick);
    glcanvas.addEventListener('touchend', releaseClick);
    glcanvas.addEventListener('touchmove', clickerDragged);
    
    initGL(glcanvas);
    initShaders();
    initGLBuffers();
    initTexture();

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);
    
    requestAnimFrame(repaint);
}
