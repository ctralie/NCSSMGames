/* 
    GAME

    the view for the actual gameplay
    includes mouse listeners for clicking balls and for pause button
*/

function Game() {
    // this grossness is so that anonymous functions can access attributes of THIS object
    var This = this;
    this.difficulty = 1;
    this.score = 0;

    this.theta = -Math.PI/2;
    this.phi = Math.PI/2;
    this.camCenter = [0.0, 5.0, 0.0];
    this.camR = 80.0;
    
    this.mass = 1;
    this.shapes = [];
    
    this.setDifficulty = function (Difficulty) {
        This.difficulty = Difficulty;
    }
    //TODO
    this.reset = function () {
        // initialize the game values and objects
        This.score = 0;
        // free the shapes before this?
        This.shapes = [];
    }

    //TODO
    // move to pause menu
    //currentState=gameState.PauseMenu;

    // move to scorebord at the end of the game
    //gameState.Scoreboard.addScore(score);
    //currentState=gameState.Scoreboard;

    /*** Copied over from initPhysics ***/
    /****STEP 1: Initialize physics engine**/
    // every single |new| currently leaks according to the bullet documentation...
    this.collisionConfig = new Ammo.btDefaultCollisionConfiguration(); 
    this.dispatcher = new Ammo.btCollisionDispatcher(this.collisionConfig);
    this.overlappingPairCache = new Ammo.btDbvtBroadphase();
    this.solver = new Ammo.btSequentialImpulseConstraintSolver();
    this.dynamicsWorld = new Ammo.btDiscreteDynamicsWorld(this.dispatcher, this.overlappingPairCache, this.solver, this.collisionConfig);
    this.dynamicsWorld.setGravity(new Ammo.btVector3(0, -10, 0));
    
    //Add 100 random spheres and a box
    for (var i = 0; i < 30; i++) {
        this.shapes.push(new SphereShape(SPHERE_RADIUS, this.mass, Math.random()*50-25,20+20*Math.random(),Math.random()*50-25, 0,0,0, sphereColShape, 0.9));
    }
    this.shapes.push(new BoxShape(50, 50, 50, 0, -50, 0, 0, 0, 0, 0, 0.9, 1));//The Floor
    this.shapes.forEach(function(shape) {
        This.dynamicsWorld.addRigidBody(shape.body);
    });
/*
    for (var i = 0; i < this.shapes.length; i++) {
        this.dynamicsWorld.addRigidBody(this.shapes[i].body);
    }
*/

    this.render = function () {
        // animation loop goes here
        /*** Copied over from drawScene ***/
        This.dynamicsWorld.stepSimulation(1.0/60.0, 10);
    
        gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        
        //Step 1: Update the modelview matrix corresponding to the polar camera
        mat4.perspective(45, gl.viewportWidth / gl.viewportHeight, This.camR/100.0, This.camR*2, pMatrix);

        var sinT = Math.sin(This.theta);
        var cosT = Math.cos(This.theta);
        var sinP = Math.sin(This.phi);
        var cosP = Math.cos(This.phi);
        var T = [-sinP*cosT, -cosP, sinP*sinT];
        var U = [-cosP*cosT, sinP, cosP*sinT];
        var R = [-sinT, 0, -cosT];
        var eye = [This.camCenter[0] - This.camR*T[0], This.camCenter[1] - This.camR*T[1], This.camCenter[2] - This.camR*T[2]];
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
        
        //Render all of the shapes
        This.shapes.forEach(function(shape) {
            shape.render(shaderProgram);
        });
        requestAnimFrame(repaint);
    }
}
