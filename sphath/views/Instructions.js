
/* 
    INSTRUCTIONS

    displays a help text and a button
        return

    includes mouse listeners to exit
*/

function Instructions() {
    
    var structions = new Image();
    structions.src = 'img/crate.gif';
    structions.onload = function () {
        //console.log("structions loaded");
    }

    this.releaseClick = function (evt) {
        // if click is on button
            // go back to whence you came!!
            currentState=prevState;
            requestAnimFrame(repaint);
    }
    this.render = function () {
        //TODO very broken!!
        // follwing the tutorial at http://webglfundamentals.org/webgl/lessons/webgl-image-processing.html
        //animation loop stuff goes here
        // all the code we had before.
        var texCoordLocation = gl.getAttribLocation(shaderProgram, "a_texCoord");
 
        // provide texture coordinates for the rectangle.
        var texCoordBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
            0.0,  0.0,
            1.0,  0.0,
            0.0,  1.0,
            0.0,  1.0,
            1.0,  0.0,
            1.0,  1.0]), gl.STATIC_DRAW);
        gl.enableVertexAttribArray(texCoordLocation);
        gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, 0);
 
        // Create a texture.
        var texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
 
        // Set the parameters so we can render any size structions.
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
 
        // Upload the structions into the texture.
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, structions);

    }

   
}
