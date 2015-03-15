//This file holds information about the physics of objects in the scene

//Global 
var SPHERE_RADIUS = 0.1;
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
    this.render = function(shaderProgram, mvMatrix) {
        //Scale, translate, and rotate the sphere appropriately on top of whatever world transformation
        //has already been passed along in mvMatrix
        this.body.getMotionState().getWorldTransform(trans);
        var q = trans.getRotation();
        var T = mat4.create();
        mat4.identity(T);
        mat4.translate(T, T, [trans.getOrigin().x(), trans.getOrigin().y(), trans.getOrigin().z()]);
        var TInv = mat4.create();
        mat4.identity(TInv);
        mat4.translate(TInv, TInv, [-trans.getOrigin().x(), -trans.getOrigin().y(), -trans.getOrigin().z()]);
        var R = mat4.create();
        mat4.fromQuat(R, [q.x(), q.y(), q.z(), q.w()]);
        var S = mat4.create();
        mat4.identity(S);
        mat4.scale(S, S, [this.radius, this.radius, this.radius]);
        //Modelview matrix for top half of sphere: M = mvMatrix*T*R*S*TInv
        var MTopHalf = mat4.create();
        mat4.mul(MTopHalf, mvMatrix, T);
        mat4.mul(MTopHalf, MTopHalf, R);
        mat4.mul(MTopHalf, MTopHalf, S);
        mat4.mul(MTopHalf, MTopHalf, TInv);
        //Bottom half needs to be flipped around the Z-axis
        var F = mat4.create();
        mat4.identity(F);
        mat4.scale(F, F, [this.radius, this.radius, -this.radius]);
        var MBottomHalf = mat4.create();
        mat4.mul(MBottomHalf, mvMatrix, T);
        mat4.mul(MBottomHalf, MBottomHalf, R);
        mat4.mul(MBottomHalf, MBottomHalf, F);
        mat4.mul(MBottomHalf, MBottomHalf, TInv);
        
        gl.bindBuffer(gl.ARRAY_BUFFER, hemisphereVertexPosBuffer);
        gl.vertexAttribPointer(shaderProgram.vPosAttrib, hemisphereVertexPosBuffer.itemSize, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, hemisphereTexCoordBuffer);
        gl.vertexAttribPointer(shaderProgram.texCoordAttrib, hemisphereTexCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, numberTexture);
        gl.uniform1i(shaderProgram.samplerUniform, 0);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, hemisphereIdxBuffer);
        gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, MTopHalf);
        gl.drawElements(gl.TRIANGLES, hemisphereIdxBuffer.numItems, gl.UNSIGNED_SHORT, 0);
        gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, MBottomHalf);
        gl.drawElements(gl.TRIANGLES, hemisphereIdxBuffer.numItems, gl.UNSIGNED_SHORT, 0);
    }
}


function BoxShape(XLen, YLen, ZLen, cx, cy, cz, v_x, v_y, v_z, mass, restitution) {
    //Physics part of the box
    var boxShape = new Ammo.btBoxShape(new Ammo.btVector3(XLen, YLen, ZLen));
    this.XLenHalf = XLen/2.0;
    this.YLenHalf = YLen/2.0;
    this.ZLenHalf = ZLen/2.0;
    var boxTransform = new Ammo.btTransform();
    boxTransform.setIdentity();
    boxTransform.setOrigin(new Ammo.btVector3(cx, cy, cz));	 
    var isDynamic = (mass != 0);
    var localInertia; 
    if (isDynamic) {
        localInertia = new Ammo.btVector3(v_x,v_y,v_z);
        colShape.calculateLocalInertia(mass,localInertia);
    }
    else {
        localInertia = new Ammo.btVector3(0, 0, 0);
    }
    var myMotionState = new Ammo.btDefaultMotionState(boxTransform);
    var rbInfobox = new Ammo.btRigidBodyConstructionInfo(mass, myMotionState, boxShape, localInertia);
    var boxBody = new Ammo.btRigidBody(rbInfobox);
    boxBody.setRestitution(restitution);
    this.body = boxBody;
    this.render = function(shaderProgram, mvMatrix) {
        //Scale, translate, and rotate the box appropriately on top of whatever world transformation
        //has already been passed along in mvMatrix
        this.body.getMotionState().getWorldTransform(trans);
        var q = trans.getRotation();
        var T = mat4.create();
        mat4.identity(T);
        mat4.translate(T, T, [trans.getOrigin().x(), trans.getOrigin().y(), trans.getOrigin().z()]);
        var TInv = mat4.create();
        mat4.identity(TInv);
        mat4.translate(TInv, TInv, [-trans.getOrigin().x(), -trans.getOrigin().y(), -trans.getOrigin().z()]);
        var R = mat4.create();
        mat4.fromQuat(R, [q.x(), q.y(), q.z(), q.w()]);
        var S = mat4.create();
        mat4.identity(S);
        mat4.scale(S, S, [this.XLenHalf, this.YLenHalf, this.ZLenHalf]);
        var M = mat4.create();
        mat4.mul(M, mvMatrix, T);
        mat4.mul(M, M, R);
        mat4.mul(M, M, S);
        mat4.mul(M, M, TInv);
        
        gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexPosBuffer);
        gl.vertexAttribPointer(shaderProgram.vPosAttrib, cubeVertexPosBuffer.itemSize, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, cubeTexCoordBuffer);
        gl.vertexAttribPointer(shaderProgram.texCoordAttrib, cubeTexCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, boxTexture);
        gl.uniform1i(shaderProgram.samplerUniform, 0);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeIdxBuffer);
        gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, M);
        gl.drawElements(gl.TRIANGLES, cubeIdxBuffer.numItems, gl.UNSIGNED_SHORT, 0);
    }
}

