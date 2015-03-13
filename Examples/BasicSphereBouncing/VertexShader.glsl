attribute vec3 vPos;
attribute vec3 vNormal;

attribute vec2 texCoord;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;

varying vec2 vTextureCoord;

void main(void) {
    gl_Position = uPMatrix * uMVMatrix * vec4(vPos, 1.0);
    vTextureCoord = texCoord;
}
