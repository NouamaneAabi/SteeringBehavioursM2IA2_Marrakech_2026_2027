class GridShaderLayer extends Vehicle {
  static MAX_POINTS = 64;

  static VERTEX_SHADER = `
    attribute vec3 aPosition;
    attribute vec2 aTexCoord;
    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;
    varying vec2 vTexCoord;

    void main() {
      vTexCoord = aTexCoord;
      gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(aPosition, 1.0);
    }
  `;

  static FRAGMENT_SHADER = `
    precision mediump float;
    varying vec2 vTexCoord;

    uniform vec2 u_resolution;
    uniform float u_time;
    uniform float u_gridSpacing;
    uniform float u_lineWidth;
    uniform float u_deformRadius;
    uniform float u_deformStrength;
    uniform float u_opacity;
    uniform vec3 u_gridColor;
    uniform int u_pointCount;
    uniform vec2 u_points[64];

    void main() {
      vec2 fragPx = vTexCoord * u_resolution;
      vec2 displacement = vec2(0.0);
      float energy = 0.0;

      for (int i = 0; i < 64; i++) {
        if (i >= u_pointCount) {
          break;
        }
        vec2 ptPx = u_points[i] * u_resolution;
        vec2 diff = fragPx - ptPx;
        float dist = length(diff);
        if (dist < u_deformRadius && dist > 0.001) {
          float falloff = 1.0 - dist / u_deformRadius;
          float smoothFalloff = falloff * falloff * (3.0 - 2.0 * falloff);
          displacement += normalize(diff) * (smoothFalloff * u_deformStrength);
          energy = max(energy, smoothFalloff);
        }
      }

      vec2 warpedPx = fragPx - displacement;
      vec2 cell = abs(fract(warpedPx / u_gridSpacing - 0.5) - 0.5) * u_gridSpacing;
      float d = min(cell.x, cell.y);
      float lineAlpha = 1.0 - smoothstep(u_lineWidth * 0.5, u_lineWidth * 0.5 + 1.5, d);

      vec3 activeColor = mix(u_gridColor, vec3(1.0), 0.35);
      vec3 col = mix(u_gridColor, activeColor, energy);

      float finalAlpha = lineAlpha * u_opacity * (0.65 + 0.55 * energy);
      gl_FragColor = vec4(col, clamp(finalAlpha, 0.0, 1.0));
    }
  `;

  constructor(w, h) {
    super(0, 0);

    this.scaleFactor = 0.5;
    this.bufferW = Math.max(64, Math.floor(w * this.scaleFactor));
    this.bufferH = Math.max(64, Math.floor(h * this.scaleFactor));

    this.pg = createGraphics(this.bufferW, this.bufferH, WEBGL);
    this.pg.pixelDensity(1);
    this.pg.noStroke();

    this.shader = this.pg.createShader(
      GridShaderLayer.VERTEX_SHADER,
      GridShaderLayer.FRAGMENT_SHADER
    );

    this.gridSpacing = 40;
    this.lineWidth = 1.5;
    this.deformRadius = 120;
    this.deformStrength = 34;
    this.opacity = 1.0;
    this.gridColorVec = [0.23, 0.51, 0.96];
    this.elapsedSec = 0;

    this.pointArray = new Array(GridShaderLayer.MAX_POINTS * 2).fill(0);
    this.pointCount = 0;
  }

  setGridColor(hexOrColor) {
    const c = color(hexOrColor);
    this.gridColorVec = [red(c) / 255, green(c) / 255, blue(c) / 255];
  }

  resize(w, h) {
    this.bufferW = Math.max(64, Math.floor(w * this.scaleFactor));
    this.bufferH = Math.max(64, Math.floor(h * this.scaleFactor));
    this.pg.resizeCanvas(this.bufferW, this.bufferH);
  }

  applyBehaviors(snake, cockroachLeader = null, cockroachSoldiers = [], cockroachMissiles = []) {
    if (width <= 0 || height <= 0) {
      this.pointCount = 0;
      return;
    }

    let idx = 0;

    // 1. Points du serpent (max 24 échantillons pour laisser de la place aux cafards & missiles)
    if (snake) {
      const totalNodes = 1 + snake.rings.length;
      const maxSnakePts = 24;
      const step = Math.max(1, Math.ceil(totalNodes / maxSnakePts));
      for (let i = 0; i < totalNodes && idx < GridShaderLayer.MAX_POINTS; i += step) {
        const node = i === 0 ? snake.head : snake.rings[i - 1];
        this.pointArray[idx * 2] = node.pos.x / width;
        this.pointArray[idx * 2 + 1] = node.pos.y / height;
        idx += 1;
      }
    }

    // 2. Leader cafard
    if (cockroachLeader && idx < GridShaderLayer.MAX_POINTS) {
      this.pointArray[idx * 2] = cockroachLeader.pos.x / width;
      this.pointArray[idx * 2 + 1] = cockroachLeader.pos.y / height;
      idx += 1;
    }

    // 3. Soldats cafards
    for (let i = 0; i < cockroachSoldiers.length && idx < GridShaderLayer.MAX_POINTS; i++) {
      const s = cockroachSoldiers[i];
      this.pointArray[idx * 2] = s.pos.x / width;
      this.pointArray[idx * 2 + 1] = s.pos.y / height;
      idx += 1;
    }

    // 4. Missiles des cafards
    for (let i = 0; i < cockroachMissiles.length && idx < GridShaderLayer.MAX_POINTS; i++) {
      const m = cockroachMissiles[i];
      this.pointArray[idx * 2] = m.pos.x / width;
      this.pointArray[idx * 2 + 1] = m.pos.y / height;
      idx += 1;
    }

    this.pointCount = idx;
  }

  update() {
    const dtSec = Math.min(typeof deltaTime === "number" ? deltaTime : 16.67, 100) / 1000;
    this.elapsedSec += dtSec;
  }

  show() {
    this.pg.clear();
    this.pg.shader(this.shader);
    this.shader.setUniform("u_resolution", [width, height]);
    this.shader.setUniform("u_time", this.elapsedSec);
    this.shader.setUniform("u_gridSpacing", this.gridSpacing);
    this.shader.setUniform("u_lineWidth", this.lineWidth);
    this.shader.setUniform("u_deformRadius", this.deformRadius);
    this.shader.setUniform("u_deformStrength", this.deformStrength);
    this.shader.setUniform("u_opacity", this.opacity);
    this.shader.setUniform("u_gridColor", this.gridColorVec);
    this.shader.setUniform("u_pointCount", this.pointCount);
    this.shader.setUniform("u_points", this.pointArray);
    this.pg.rect(-this.bufferW * 0.5, -this.bufferH * 0.5, this.bufferW, this.bufferH);

    push();
    image(this.pg, 0, 0, width, height);
    pop();
  }
}
