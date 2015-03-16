var gl;
var glcanvas;


///*****SHADER INITIALIZATION CODE*****///
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

    //TODO: Get rid of synchronous mode
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

///*****MOUSE INTERACTION CODE*****///
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
var camCenter = [0.0, 5.0, 0.0];
var camR = 80.0;


///*****VERTEX BUFFER INITIALIZTION*****///
//Initializing sphere meshes
var hemisphereVertexPosBuffer;
var hemisphereTexCoordBuffer;
var hemisphereIdxBuffer;
var cubeVertexPosBuffer;
var cubeTexCoordBuffer;
var cubeIdxBuffer;
function initGLBuffers() {
    console.log("Initializing buffers...");
    
    //Hemisphere
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
 
    //Cube
    //Vertex Buffer
    cubeVertexPosBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexPosBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(CubeVertices), gl.STATIC_DRAW)
    cubeVertexPosBuffer.itemSize = 3;
    cubeVertexPosBuffer.numItems = CubeVertices.length/3;
    
    //Texture coordinates buffer
    cubeTexCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeTexCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(CubeTexCoords), gl.STATIC_DRAW)
    cubeTexCoordBuffer.itemSize = 2;
    cubeTexCoordBuffer.numItems = CubeTexCoords.length/2;
    
    //Index buffer
    cubeIdxBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeIdxBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(CubeIndices), gl.STATIC_DRAW);
    cubeIdxBuffer.itemSize = 1;
    cubeIdxBuffer.numItems = CubeIndices.length;

    requestAnimFrame(repaint);   
}


///*****TEXTURE BUFFER INITIALIZATION*****///
function handleLoadedTexture(T) {
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.bindTexture(gl.TEXTURE_2D, T);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, T.image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
}

var numberTexture;
var boxTexture;
var floorTexture;
function initTextures() {
    var numberImage = new Image();
    numberTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, numberTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
        new Uint8Array([255, 0, 0, 255])); // red
    numberTexture.image = numberImage;
    numberImage.onload = function () {
        handleLoadedTexture(numberTexture);
    }
    numberImage.src = "Number1.gif";
    
    var crateImage = new Image();
    crateTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, crateTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
        new Uint8Array([255, 0, 0, 255])); // red
    crateTexture.image = crateImage;
    crateImage.onload = function () {
        handleLoadedTexture(crateTexture);
    }
    crateImage.src = "crate.gif";
    
    var floorImage = new Image();
    floorTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, floorTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
        new Uint8Array([255, 0, 0, 255])); // red
    floorTexture.image = floorImage;
    floorImage.onload = function () {
        handleLoadedTexture(floorTexture);
    }
    floorImage.src = "floor.gif";
}


///*****MATRICES*****///
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


///*****DRAWING CODE*****///
function drawScene() {
    dynamicsWorld.stepSimulation(1.0/60.0, 10);
    
    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    //Step 1: Update the modelview matrix corresponding to the polar camera
    mat4.perspective(45, gl.viewportWidth / gl.viewportHeight, camR/100.0, camR*2, pMatrix);

    var sinT = Math.sin(theta);
    var cosT = Math.cos(theta);
    var sinP = Math.sin(phi);
    var cosP = Math.cos(phi);
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
	/*mat4.identity(mvMatrix);
	mat4.translate(mvMatrix, [0, 0, 0]);*/
    
    //Render all of the shapes
	shapes.forEach(function(shape) {
		shape.render(shaderProgram);
    });
    requestAnimFrame(repaint);
}


function repaint() {
    drawScene();
}

var shapes = [];
var dynamicsWorld;
//*****GL INITIALIZATION CODE*****//
function initPhysics() {
	/****STEP 1: Initialize physics engine**/
	 var collisionConfiguration = new Ammo.btDefaultCollisionConfiguration(); // every single |new| currently leaks according to the bullet documentation...
	var dispatcher = new Ammo.btCollisionDispatcher(collisionConfiguration);
	var overlappingPairCache = new Ammo.btDbvtBroadphase();
	var solver = new Ammo.btSequentialImpulseConstraintSolver();
	dynamicsWorld = new Ammo.btDiscreteDynamicsWorld(dispatcher, overlappingPairCache, solver, collisionConfiguration);
	dynamicsWorld.setGravity(new Ammo.btVector3(0, -10, 0));

    //Add 100 random spheres and a box
   	var mass = 1;
	for (var i = 0; i < 30; i++) {
		shapes.push(new SphereShape(SPHERE_RADIUS, mass, Math.random()*50-25,20+20*Math.random(),Math.random()*50-25, 0,0,0, sphereColShape, 0.9));
		//shapes.push(new BoxShape(2, 2, 2, mass, Math.random()*50-25,25+10*Math.random(),Math.random()*50-25, 0,0,0, 0.9, 0));
	}
	shapes.push(new BoxShape(50, 50, 50, 0, -50, 0, 0, 0, 0, 0, 0.9, 1));//The Floor
	shapes.forEach(function(shape) {
		dynamicsWorld.addRigidBody(shape.body);
    });
}

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
    initTextures();
    initPhysics();

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);
    
    requestAnimFrame(repaint);
}
