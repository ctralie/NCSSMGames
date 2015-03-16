//This file holds information about the physics of objects in the scene

//Global 
var SPHERE_RADIUS = 2;
var sphereColShape = new Ammo.btSphereShape(SPHERE_RADIUS);//Make one sphere collision shape to save memory (TODO: add flexibility for spheres of multiple radii?)
var trans = new Ammo.btTransform();

//Shape Objects
function SphereShape(radius,mass,x,y,z,v_x,v_y,v_z,colShape,restitution) {
    var startTransform = new Ammo.btTransform();
    startTransform.setIdentity();
    var isDynamic = (mass != 0);
    var localInertia = new Ammo.btVector3(v_x,v_y,v_z);
    if (isDynamic) {
        colShape.calculateLocalInertia(mass,localInertia);
    }
    startTransform.setOrigin(new Ammo.btVector3(x,y,z));
    var myMotionState = new Ammo.btDefaultMotionState(startTransform);
    var rbInfo = new Ammo.btRigidBodyConstructionInfo(mass, myMotionState, colShape, localInertia);
    var sphereBody = new Ammo.btRigidBody(rbInfo);
    sphereBody.setRestitution(restitution); 
    this.body = sphereBody;
    this.radius = radius;
    this.render = function(shaderProgram) {
        gl.bindBuffer(gl.ARRAY_BUFFER, hemisphereVertexPosBuffer);
        gl.vertexAttribPointer(shaderProgram.vPosAttrib, hemisphereVertexPosBuffer.itemSize, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, hemisphereTexCoordBuffer);
        gl.vertexAttribPointer(shaderProgram.texCoordAttrib, hemisphereTexCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, numberTexture);
        gl.uniform1i(shaderProgram.samplerUniform, 0);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, hemisphereIdxBuffer);
        gl.drawElements(gl.TRIANGLES, hemisphereIdxBuffer.numItems, gl.UNSIGNED_SHORT, 0);
        
        //Scale, translate, and rotate the sphere appropriately on top of whatever world transformation
        //has already been passed along in mvMatrix
        this.body.getMotionState().getWorldTransform(trans);
        var x = trans.getOrigin().x();
        var y = trans.getOrigin().y();
        var z = trans.getOrigin().z();
        var q = trans.getRotation();
        var TR = mat4.create();
        mat4.identity(TR);
        mat4.translate(TR, [x, y, z]);
        var quatMat = mat4.create();
        quat4.toMat4([q.x(), q.y(), q.z(), q.w()], quatMat);
        TR = mat4.multiply(TR, quatMat);
        var S = mat4.create();
        mat4.identity(S);
        mat4.scale(S, [this.radius, this.radius, this.radius]);
        //Modelview matrix for top half of sphere: M = mvMatrix*T*R*S
        mvPushMatrix();
        mvMatrix = mat4.multiply(mvMatrix, TR);
        mvMatrix = mat4.multiply(mvMatrix, S);
        setMatrixUniforms();
        gl.drawElements(gl.TRIANGLES, hemisphereIdxBuffer.numItems, gl.UNSIGNED_SHORT, 0);
        mvPopMatrix();
        
        
        mvPushMatrix();
        mat4.scale(S, [1, 1, -1]);//Bottom half needs to be flipped around the Z-axis
        mvMatrix = mat4.multiply(mvMatrix, TR);
        mvMatrix = mat4.multiply(mvMatrix, S);
        setMatrixUniforms();
        gl.drawElements(gl.TRIANGLES, hemisphereIdxBuffer.numItems, gl.UNSIGNED_SHORT, 0);        
        mvPopMatrix();
    }
}


function BoxShape(XLenHalf, YLenHalf, ZLenHalf, cx, cy, cz, v_x, v_y, v_z, mass, restitution, isFloor) {
    //Physics part of the box
    var boxShape = new Ammo.btBoxShape(new Ammo.btVector3(XLenHalf, YLenHalf, ZLenHalf));
    this.XLenHalf = XLenHalf;
    this.YLenHalf = YLenHalf;
    this.ZLenHalf = ZLenHalf;
    var boxTransform = new Ammo.btTransform(Ammo.btVector3(this.XLenHalf, this.YLenHalf, this.ZLenHalf));
    boxTransform.setIdentity();
    boxTransform.setOrigin(new Ammo.btVector3(cx, cy, cz));	 
    var isDynamic = (mass != 0);
    var localInertia;
    if (isDynamic) {
        localInertia = new Ammo.btVector3(v_x,v_y,v_z);
        boxShape.calculateLocalInertia(mass,localInertia);
    }
    else {
        localInertia = new Ammo.btVector3(0, 0, 0);
    }
    var myMotionState = new Ammo.btDefaultMotionState(boxTransform);
    var rbInfobox = new Ammo.btRigidBodyConstructionInfo(mass, myMotionState, boxShape, localInertia);
    var boxBody = new Ammo.btRigidBody(rbInfobox);
    boxBody.setRestitution(restitution);
    this.body = boxBody;
    this.isFloor = isFloor;
    this.render = function(shaderProgram) {
        gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexPosBuffer);
        gl.vertexAttribPointer(shaderProgram.vPosAttrib, cubeVertexPosBuffer.itemSize, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, cubeTexCoordBuffer);
        gl.vertexAttribPointer(shaderProgram.texCoordAttrib, cubeTexCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);
        gl.activeTexture(gl.TEXTURE0);
        if (this.isFloor == 0) {
            gl.bindTexture(gl.TEXTURE_2D, crateTexture);
        }
        else {
            gl.bindTexture(gl.TEXTURE_2D, floorTexture);
        }
        gl.uniform1i(shaderProgram.samplerUniform, 0);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeIdxBuffer);

        //Scale, translate, and rotate the box appropriately on top of whatever world transformation
        //has already been passed along in mvMatrix
        this.body.getMotionState().getWorldTransform(trans);
        var x = trans.getOrigin().x();
        var y = trans.getOrigin().y();
        var z = trans.getOrigin().z();
        var q = trans.getRotation();
        var TR = mat4.create();
        mat4.identity(TR);
        mat4.translate(TR, [x, y, z]);
        var quatMat = mat4.create();
        quat4.toMat4([q.x(), q.y(), q.z(), q.w()], quatMat);
        TR = mat4.multiply(TR, quatMat);
        var S = mat4.create();
        mat4.identity(S);
        mat4.scale(S, [this.XLenHalf, this.YLenHalf, this.ZLenHalf]);
        //Modelview matrix for top half of sphere: M = mvMatrix*T*R*S
        mvPushMatrix();
        mvMatrix = mat4.multiply(mvMatrix, TR);
        mvMatrix = mat4.multiply(mvMatrix, S);
        setMatrixUniforms();
        gl.drawElements(gl.TRIANGLES, cubeIdxBuffer.numItems, gl.UNSIGNED_SHORT, 0);
        mvPopMatrix();
    }
}

