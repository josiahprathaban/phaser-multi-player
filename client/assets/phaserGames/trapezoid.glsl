precision mediump float;

uniform sampler2D uMainSampler;
varying vec2 outTexCoord;

uniform float skewFactor;

void main(void) {
    vec2 uv = outTexCoord;

    // Apply trapezoid distortion
    float offset = (0.5 - uv.y) * skewFactor;
    uv.x += offset;

    gl_FragColor = texture2D(uMainSampler, uv);
}
