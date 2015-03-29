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
    var camR = 80.0;
    
    var mass = 1;
    var shapes = [];
    var now = new Date();
    
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
    
    //Add 100 random spheres and a box
    for (var i = 0; i < 30; i++) {
        shapes.push(new SphereShape(SPHERE_RADIUS, mass, Math.random()*50-25,20+20*Math.random(),Math.random()*50-25, 0,0,0, sphereColShape, 0.9));
    }
    shapes.push(new BoxShape(50, 50, 50, 0, -50, 0, 0, 0, 0, 0, 0.9, 1));//The Floor
    shapes.forEach(function(shape) {
        dynamicsWorld.addRigidBody(shape.body);
    });

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
        
        //Render all of the shapes
        shapes.forEach(function(shape) {
            shape.render(shaderProgram);
        });
        requestAnimFrame(repaint);
    }
}
