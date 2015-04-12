/*
    BUTTON

    this is a general constructor for a square panel with centered text which willl always
    appear square to the observer.

    color is a hex string
    text is the string to be rendered
    x,y are where the center of the box appears to be from the observer
    width,height are the apparent width and height, which may have to be altered depending on the distance from the observer at which the objects are rendered
*/

function ButtonShape(color, text, x, y, width, height) {
    //TODO create the color object here
    this.color = color;
    this.text = text;

    // the size of the billboard is defined by the arc it covers when viewed from the camera
    // its location is defined the same way.

    this.onClick = function () {
        // quack
        // this is here to prevent undefined errors
        // if the panel is intended to do something on a click 
        // then this function is set
    }

    //TODO
    this.render = function () {

    }

    //TODO
    // copied from : http://www.lighthouse3d.com/opengl/billboarding/index.php
    // a tutorial on billboarding
    function billboardSphericalBegin(
                float camX, float camY, float camZ,
                float objPosX, float objPosY, float objPosZ) {

        float lookAt[3],objToCamProj[3], objToCam[3], upAux[3];
        float modelview[16],angleCosine;

        glPushMatrix();

        // objToCamProj is the vector in world coordinates from the 
        // local origin to the camera projected in the XZ plane
        objToCamProj[0] = camX - objPosX ;
        objToCamProj[1] = 0;
        objToCamProj[2] = camZ - objPosZ ;

        // This is the original lookAt vector for the object 
        // in world coordinates
        lookAt[0] = 0;
        lookAt[1] = 0;
        lookAt[2] = 1;


        // normalize both vectors to get the cosine directly afterwards
        mathsNormalize(objToCamProj);

        // easy fix to determine wether the angle is negative or positive
        // for positive angles upAux will be a vector pointing in the 
        // positive y direction, otherwise upAux will point downwards
        // effectively reversing the rotation.

        mathsCrossProduct(upAux,lookAt,objToCamProj);

        // compute the angle
        angleCosine = mathsInnerProduct(lookAt,objToCamProj);

        // perform the rotation. The if statement is used for stability reasons
        // if the lookAt and objToCamProj vectors are too close together then 
        // |angleCosine| could be bigger than 1 due to lack of precision
        if ((angleCosine < 0.99990) && (angleCosine > -0.9999))
            glRotatef(acos(angleCosine)*180/3.14,upAux[0], upAux[1], upAux[2]);   
        
        // so far it is just like the cylindrical billboard. The code for the 
        // second rotation comes now
        // The second part tilts the object so that it faces the camera

        // objToCam is the vector in world coordinates from 
        // the local origin to the camera
        objToCam[0] = camX - objPosX;
        objToCam[1] = camY - objPosY;
        objToCam[2] = camZ - objPosZ;

        // Normalize to get the cosine afterwards
        mathsNormalize(objToCam);

        // Compute the angle between objToCamProj and objToCam, 
        //i.e. compute the required angle for the lookup vector

        angleCosine = mathsInnerProduct(objToCamProj,objToCam);


        // Tilt the object. The test is done to prevent instability 
        // when objToCam and objToCamProj have a very small
        // angle between them

        if ((angleCosine < 0.99990) && (angleCosine > -0.9999))
            if (objToCam[1] < 0)
                glRotatef(acos(angleCosine)*180/3.14,1,0,0);    
            else
                glRotatef(acos(angleCosine)*180/3.14,-1,0,0);   
          
    }

}
