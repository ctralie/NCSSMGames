/* 
    GAME

    the view for the actual gameplay
    includes mouse listeners for clicking balls and for pause button
*/

function Game() {
    var difficulty = 1;
    var score = 0;

    var theta = -Math.PI/2;
    var phi = Math.PI/2;
    var camCenter = [0.0, 5.0, 0.0];
    var camR = 180.0;
    
    var mass = 0.00001;
    var shapes = [];
    var now = new Date();
    
    var pixels = new Uint8Array(4);
    
    function getElapsedTime() {
        // elapsed time since last call
        // in seconds
        var here = now;
        now = new Date();
        return (now - here)/1000.0;
    }
        
    this.setDifficulty = function (Difficulty) {
        difficulty = Difficulty;
    }
    //TODO
    this.reset = function () {
        // initialize the game values and objects
        score = 0;
        // free the shapes before this?
        shapes = [];
    }

    function pause () {
        currentState=gameState.PauseMenu;
        requestAnimFrame(repaint);
    }

    // move to scorebord at the end of the game
    function gameOver () {
        gameState.Scoreboard.addScore(score);
        currentState=gameState.Scoreboard;
        requestAnimFrame(repaint);
    }

    // every single |new| currently leaks according to the bullet documentation...
    var collisionConfig = new Ammo.btDefaultCollisionConfiguration(); 
    var dispatcher = new Ammo.btCollisionDispatcher(collisionConfig);
    var overlappingPairCache = new Ammo.btDbvtBroadphase();
    var solver = new Ammo.btSequentialImpulseConstraintSolver();
    var dynamicsWorld = new Ammo.btDiscreteDynamicsWorld(dispatcher, overlappingPairCache, solver, collisionConfig);
    dynamicsWorld.setGravity(new Ammo.btVector3(0, -10, 0));

    //TODO not sure if this should be exposed?
    this.dynamicsWorld = dynamicsWorld;
    
    var rand = function (x) {
        return Math.random()*x-x/2;
    }
    //Add 100 random spheres and a box
    var v = 100;
    for (var i = 0; i < 30; i++) {
        shapes.push(new SphereShape( Math.floor(Math.random()*10-1),SPHERE_RADIUS, mass, rand(50),30+rand(20),rand(50), rand(v),rand(v),rand(v), sphereColShape, 0.9));
    }
    shapes.push(new BoxShape(50, 50, 50, 0, -100, 0, 0, 0, 0, 0, 0.9, 1));//The Floor
    shapes.push(new BoxShape(50, 50, 50, 0,  100, 0, 0, 0, 0, 0, 0.9, 1));//ceiling
    shapes.push(new BoxShape(50, 50, 50, 0, 0, -100, 0, 0, 0, 0, 0.9, 1));//back
    shapes.push(new BoxShape(50, 50, 50, -100, 0, 0, 0, 0, 0, 0, 0.9, 1));//left
    shapes.push(new BoxShape(50, 50, 50,  100, 0, 0, 0, 0, 0, 0, 0.9, 1));//right
    shapes.push(new BoxShape(50, 50, 50, 0, 0,  100, 0, 0, 0, 0, 0.9, 1));//front
    shapes.forEach(function(shape) {
        dynamicsWorld.addRigidBody(shape.body);
    });
    // this makes the front box invisible
    shapes.pop()

    //*** MOUSE INTERACTION ***//
    // to add click events specific to this view,
    // add this.releaseClick or this.makeClick 
        
    this.clickerDragged = function (evt,dx,dy) {
        theta = theta - MOUSERATE*dx;
        phi = phi - MOUSERATE*dy;
        requestAnimFrame(repaint);
    }

    //*** RENDER ***//
    this.render = function () {
        dynamicsWorld.stepSimulation(getElapsedTime(), 10);
    
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
        
        if (justClicked) {
        	//Render ID offscreen
        	gl.bindFramebuffer(gl.FRAMEBUFFER, pickingFramebuffer);
			for (i = 0; i < shapes.length; i++) {
				if (shapes[i] instanceof SphereShape) {
					//Only picking the spheres
					shapes[i].render(shaderProgram, (i+1)/255.0);
				}
			}
			//Figure out what element was selected by loading the pixel that the
			//user clicked on and looking at the red channel
			gl.readPixels(lastX, glcanvas.height - lastY, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
			var ID = parseInt("" + pixels[0]) - 1;
			if (ID > -1) {
				var selElem = document.getElementById("SelectedElem");
				selElem.innerHTML = "(" + lastX + "," + lastY + ") ID = " + ID + ", Number = " + shapes[ID].number;
			}
			gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        	justClicked = false;
        }
        //Render all of the shapes
        for (i = 0; i < shapes.length; i++) {
            //shapes[i].render(shaderProgram, i/255.0);
            shapes[i].render(shaderProgram, -1);
        }
        requestAnimFrame(repaint);
    }
}
