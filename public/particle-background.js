/**
 * Infinite Plane Shader Background
 * A raymarched WebGL2 infinite checkered floor for the SQL Escape Room
 */

class InfinitePlaneBackground {
    constructor(options = {}) {
        this.config = {
            planeHeight: options.planeHeight || 0,
            epsilon: options.epsilon || 0.001,
            speed: options.speed || 1,
        };

        this.canvas = null;
        this.gl = null;
        this.program = null;
        this.rafId = null;
    }

    // Fragment shader with raymarched infinite plane
    getFragmentShader() {
        return `#version 300 es
precision highp float;

uniform float u_time;
uniform vec2  u_resolution;
uniform float u_planeHeight;
uniform float u_epsilon;
uniform float u_speed;

out vec4 fragColor;

float sdPlane(vec3 p, float h) {
    return p.y - h;
}

float mapScene(vec3 p) {
    return sdPlane(p, u_planeHeight);
}

vec3 calcNormal(vec3 p) {
    vec2 e = vec2(u_epsilon, 0.0);
    return normalize(vec3(
        mapScene(p + e.xyy) - mapScene(p - e.xyy),
        mapScene(p + e.yxy) - mapScene(p - e.yxy),
        mapScene(p + e.yyx) - mapScene(p - e.yyx)
    ));
}

float rayMarch(vec3 ro, vec3 rd) {
    float d = 0.0;
    for (int i = 0; i < 100; i++) {
        vec3 p = ro + rd * d;
        float dist = mapScene(p);
        if (dist < u_epsilon || d > 20.0) break;
        d += dist;
    }
    return d;
}

void main() {
    vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y;
    vec3 ro = vec3(0.0, u_planeHeight + 1.5, -1.5) * u_speed;
    vec3 rd = normalize(vec3(uv, 1.0));

    float d = rayMarch(ro, rd);
    vec3 color = vec3(0.02, 0.02, 0.05); // Dark blue-black background

    if (d < 20.0) {
        vec3 p = ro + rd * d;
        vec3 n = calcNormal(p);
        vec3 lightDir = normalize(vec3(1.0, 1.0, -1.0));
        float diff = max(dot(n, lightDir), 0.0);

        // Moving checkered pattern with cyber colors
        float check = mod(floor(p.x) + floor(p.z - u_time * u_speed), 2.0);
        vec3 darkTile = vec3(0.05, 0.02, 0.1);  // Deep purple
        vec3 lightTile = vec3(0.0, 0.4, 0.5);   // Cyan
        vec3 mat = mix(darkTile, lightTile, check);

        // Add glow at distance
        float glow = exp(-d * 0.1);
        color = mat * diff + vec3(0.0, 0.2, 0.3) * glow * 0.5;
    }

    fragColor = vec4(color, 1.0);
}`;
    }

    getVertexShader() {
        return `#version 300 es
in vec2 a_position;
void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
}`;
    }

    compileShader(type, src) {
        const sh = this.gl.createShader(type);
        this.gl.shaderSource(sh, src);
        this.gl.compileShader(sh);
        if (!this.gl.getShaderParameter(sh, this.gl.COMPILE_STATUS)) {
            console.error('Shader compile error:', this.gl.getShaderInfoLog(sh));
            this.gl.deleteShader(sh);
            return null;
        }
        return sh;
    }

    init(targetSelector = 'body') {
        const target = document.querySelector(targetSelector);
        if (!target) {
            console.error('Infinite plane target not found:', targetSelector);
            return false;
        }

        // Create container
        const container = document.createElement('div');
        container.id = 'infinite-plane-bg';
        container.style.cssText = `
            position: fixed;
            inset: 0;
            z-index: 0;
            pointer-events: none;
        `;

        // Create canvas
        this.canvas = document.createElement('canvas');
        this.canvas.style.cssText = 'display: block; width: 100%; height: 100%;';
        container.appendChild(this.canvas);
        target.insertBefore(container, target.firstChild);

        // Get WebGL2 context
        this.gl = this.canvas.getContext('webgl2');
        if (!this.gl) {
            console.error('WebGL2 not supported');
            container.innerHTML = '<div style="color:#00d9ff;text-align:center;padding:20px;">WebGL2 not supported</div>';
            return false;
        }

        // Compile shaders
        const vs = this.compileShader(this.gl.VERTEX_SHADER, this.getVertexShader());
        const fs = this.compileShader(this.gl.FRAGMENT_SHADER, this.getFragmentShader());
        if (!vs || !fs) return false;

        // Link program
        this.program = this.gl.createProgram();
        this.gl.attachShader(this.program, vs);
        this.gl.attachShader(this.program, fs);
        this.gl.linkProgram(this.program);

        if (!this.gl.getProgramParameter(this.program, this.gl.LINK_STATUS)) {
            console.error('Program link error:', this.gl.getProgramInfoLog(this.program));
            return false;
        }

        // Get locations
        this.posLoc = this.gl.getAttribLocation(this.program, 'a_position');
        this.resLoc = this.gl.getUniformLocation(this.program, 'u_resolution');
        this.timeLoc = this.gl.getUniformLocation(this.program, 'u_time');
        this.planeLoc = this.gl.getUniformLocation(this.program, 'u_planeHeight');
        this.epsLoc = this.gl.getUniformLocation(this.program, 'u_epsilon');
        this.speedLoc = this.gl.getUniformLocation(this.program, 'u_speed');

        // Create full-screen quad
        const quad = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);
        this.buf = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buf);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, quad, this.gl.STATIC_DRAW);

        // Setup resize handler
        this.resize = () => {
            const dpr = window.devicePixelRatio || 1;
            this.canvas.width = this.canvas.clientWidth * dpr;
            this.canvas.height = this.canvas.clientHeight * dpr;
            this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        };
        window.addEventListener('resize', this.resize);
        this.resize();

        // Start render loop
        this.render(0);
        return true;
    }

    render(t) {
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
        this.gl.useProgram(this.program);

        // Bind quad
        this.gl.enableVertexAttribArray(this.posLoc);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buf);
        this.gl.vertexAttribPointer(this.posLoc, 2, this.gl.FLOAT, false, 0, 0);

        // Set uniforms
        this.gl.uniform2f(this.resLoc, this.canvas.width, this.canvas.height);
        this.gl.uniform1f(this.timeLoc, t * 0.001);
        this.gl.uniform1f(this.planeLoc, this.config.planeHeight);
        this.gl.uniform1f(this.epsLoc, this.config.epsilon);
        this.gl.uniform1f(this.speedLoc, this.config.speed);

        this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);
        this.rafId = requestAnimationFrame((t) => this.render(t));
    }

    destroy() {
        if (this.rafId) cancelAnimationFrame(this.rafId);
        if (this.resize) window.removeEventListener('resize', this.resize);
        const container = document.getElementById('infinite-plane-bg');
        if (container) container.remove();
    }
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.infinitePlane = new InfinitePlaneBackground({
        planeHeight: 0,
        speed: 1.5
    });
    window.infinitePlane.init('body');
});
