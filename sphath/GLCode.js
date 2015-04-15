//*****GL INITIALIZATION CODE*****//

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

///*****SHADER INITIALIZATION CODE*****///
//Type 0: Fragment shader, Type 1: Vertex Shader
var shaderProgram;
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
var numberTexture;
var boxTexture;
var floorTexture;

function handleLoadedTexture(T) {
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.bindTexture(gl.TEXTURE_2D, T);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, textureCanvas);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);

    gl.bindTexture(gl.TEXTURE_2D, null);
}

var canvasTexture;
function initTextures() {
    
    var numberImage = new Image();
    numberTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, numberTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
        new Uint8Array([255, 0, 0, 255])); // red
    numberTexture.image = DrawText('1');
    numberImage.onload = function () {
        handleLoadedTexture(textureCanvas);
    }
    //numberImage.src = "Number1.gif";
    
    var crateImage = new Image();
    crateTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, crateTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
        new Uint8Array([255, 0, 0, 255])); // red
    crateTexture.image = crateImage;
    crateImage.onload = function () {
        handleLoadedTexture(crateTexture);
    }
    crateImage.src = "img/crate.gif";
    
    var floorImage = new Image();
    floorTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, floorTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
        new Uint8Array([255, 0, 0, 255])); // red
    floorTexture.image = floorImage;
    floorImage.onload = function () {
        handleLoadedTexture(floorTexture);
    }
    floorImage.src = "img/floor.gif";
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
