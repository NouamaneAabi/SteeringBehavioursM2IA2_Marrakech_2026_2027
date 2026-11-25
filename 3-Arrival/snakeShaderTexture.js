class SnakeShaderTexture extends Vehicle {
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

  static PRESETS = {
    scales: {
      label: "Écailles animées",
      params: [
        { key: "p1", label: "Taille écailles", min: 2, max: 14, initial: 6, step: 0.5 },
        { key: "p2", label: "Vitesse", min: 0, max: 4, initial: 1.2, step: 0.1 },
        { key: "p3", label: "Iridescence", min: 0, max: 1, initial: 0.7, step: 0.05 },
        { key: "opacity", label: "Opacité", min: 0.1, max: 1, initial: 0.85, step: 0.05 }
      ],
      fragment: `
        precision mediump float;
        varying vec2 vTexCoord;
        uniform float u_time;
        uniform float u_p1;
        uniform float u_p2;
        uniform float u_p3;
        uniform float u_opacity;

        vec3 palette(float t) {
          vec3 a = vec3(0.08, 0.55, 0.52);
          vec3 b = vec3(0.18, 0.35, 0.42);
          vec3 c = vec3(1.0, 1.0, 1.0);
          vec3 d = vec3(0.0, 0.25, 0.45);
          return a + b * cos(6.28318 * (c * t + d));
        }

        void main() {
          vec2 uv = vTexCoord * u_p1;
          float row = floor(uv.y);
          uv.x += mod(row, 2.0) * 0.5;
          vec2 f = fract(uv) - vec2(0.5, 0.5);
          float dist = length(f - vec2(0.0, -0.15));

          float scaleMask = smoothstep(0.58, 0.48, dist);
          float rim = smoothstep(0.42, 0.52, dist) * scaleMask;

          float wave = sin(vTexCoord.x * 6.28318 + vTexCoord.y * 6.28318 - u_time * u_p2);
          vec3 col = palette(wave * 0.35 * u_p3 + row * 0.08 + u_time * 0.08 * u_p2);
          col = mix(col * 0.55, col * 1.25, scaleMask);
          col += vec3(0.55, 0.95, 0.85) * rim * 0.65;

          gl_FragColor = vec4(col, u_opacity);
        }
      `
    },
    plasma: {
      label: "Plasma néon",
      params: [
        { key: "p1", label: "Fréquence", min: 1, max: 12, initial: 5, step: 0.5 },
        { key: "p2", label: "Vitesse", min: 0, max: 5, initial: 1.8, step: 0.1 },
        { key: "p3", label: "Décalage teinte", min: 0, max: 6.28, initial: 1.2, step: 0.1 },
        { key: "opacity", label: "Opacité", min: 0.1, max: 1, initial: 0.85, step: 0.05 }
      ],
      fragment: `
        precision mediump float;
        varying vec2 vTexCoord;
        uniform float u_time;
        uniform float u_p1;
        uniform float u_p2;
        uniform float u_p3;
        uniform float u_opacity;

        void main() {
          vec2 p = vTexCoord * 6.28318;
          float t = u_time * u_p2;
          float v = sin(p.x * (u_p1 * 0.25) + t);
          v += sin(p.y * (u_p1 * 0.25) - t * 0.8);
          v += sin((p.x + p.y) * (u_p1 * 0.2) + t * 0.6);
          v += sin(length(p - 3.14159) * (u_p1 * 0.3) - t);
          v *= 0.25;

          vec3 col = 0.5 + 0.5 * cos(v * 3.14159 + vec3(0.0, 2.1, 4.2) + u_p3);
          gl_FragColor = vec4(col, u_opacity);
        }
      `
    },
    cyberWaves: {
      label: "Ondes cyber",
      params: [
        { key: "p1", label: "Nombre de bandes", min: 2, max: 16, initial: 7, step: 1 },
        { key: "p2", label: "Vitesse", min: 0, max: 5, initial: 2.0, step: 0.1 },
        { key: "p3", label: "Intensité glow", min: 0.2, max: 2, initial: 1.1, step: 0.05 },
        { key: "opacity", label: "Opacité", min: 0.1, max: 1, initial: 0.85, step: 0.05 }
      ],
      fragment: `
        precision mediump float;
        varying vec2 vTexCoord;
        uniform float u_time;
        uniform float u_p1;
        uniform float u_p2;
        uniform float u_p3;
        uniform float u_opacity;

        void main() {
          vec2 uv = vTexCoord;
          float t = u_time * u_p2;
          float wave = sin(uv.x * 6.28318 * 2.0 + t) * 0.12;
          float bands = abs(sin((uv.y + wave) * 3.14159 * u_p1 - t));
          float line = pow(1.0 - bands, 3.0) * u_p3;

          vec3 base = vec3(0.03, 0.10, 0.22);
          vec3 neon = mix(vec3(0.10, 0.85, 0.95), vec3(0.65, 0.35, 1.0), 0.5 + 0.5 * sin(t + uv.x * 6.28318));
          vec3 col = base + neon * line;

          gl_FragColor = vec4(col, u_opacity);
        }
      `
    },
    magma: {
      label: "Lave / Magma",
      params: [
        { key: "p1", label: "Taille cellules", min: 2, max: 12, initial: 5, step: 0.5 },
        { key: "p2", label: "Vitesse", min: 0, max: 4, initial: 1.0, step: 0.1 },
        { key: "p3", label: "Chaleur", min: 0.3, max: 2, initial: 1.2, step: 0.05 },
        { key: "opacity", label: "Opacité", min: 0.1, max: 1, initial: 0.88, step: 0.05 }
      ],
      fragment: `
        precision mediump float;
        varying vec2 vTexCoord;
        uniform float u_time;
        uniform float u_p1;
        uniform float u_p2;
        uniform float u_p3;
        uniform float u_opacity;

        vec2 hash2(vec2 p) {
          p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
          return fract(sin(p) * 43758.5453);
        }

        void main() {
          vec2 uv = vTexCoord * u_p1;
          vec2 i = floor(uv);
          vec2 f = fract(uv);

          float minDist = 1.0;
          for (int y = -1; y <= 1; y++) {
            for (int x = -1; x <= 1; x++) {
              vec2 neighbor = vec2(float(x), float(y));
              vec2 pt = hash2(mod(i + neighbor, u_p1));
              pt = 0.5 + 0.42 * sin(u_time * u_p2 + 6.28318 * pt);
              vec2 diff = neighbor + pt - f;
              minDist = min(minDist, length(diff));
            }
          }

          float crack = smoothstep(0.18, 0.72, minDist);
          vec3 coolRock = vec3(0.16, 0.05, 0.06);
          vec3 hotLava = mix(vec3(0.95, 0.25, 0.05), vec3(1.0, 0.85, 0.2), clamp(crack * u_p3, 0.0, 1.0));
          vec3 col = mix(coolRock, hotLava, crack);

          gl_FragColor = vec4(col, u_opacity);
        }
      `
    }
  };

  constructor(size = 192) {
    super(0, 0);

    this.size = size;
    this.pg = createGraphics(size, size, WEBGL);
    this.pg.pixelDensity(1);
    this.pg.noStroke();

    this.shaders = {};
    this.activePresetKey = "scales";
    this.params = {};
    this.elapsedSec = 0;

    Object.keys(SnakeShaderTexture.PRESETS).forEach((key) => {
      const preset = SnakeShaderTexture.PRESETS[key];
      this.shaders[key] = this.pg.createShader(
        SnakeShaderTexture.VERTEX_SHADER,
        preset.fragment
      );
    });

    this.setPreset("scales");
  }

  setPreset(presetKey) {
    if (!SnakeShaderTexture.PRESETS[presetKey]) {
      return;
    }
    this.activePresetKey = presetKey;
    const preset = SnakeShaderTexture.PRESETS[presetKey];
    this.params = {};
    preset.params.forEach((param) => {
      this.params[param.key] = param.initial;
    });
  }

  setParam(key, value) {
    this.params[key] = value;
  }

  getActivePreset() {
    return SnakeShaderTexture.PRESETS[this.activePresetKey];
  }

  applyBehaviors() {
    // Pas de déplacement spatial pour la texture hors écran
  }

  update() {
    const dtSec = Math.min(typeof deltaTime === "number" ? deltaTime : 16.67, 100) / 1000;
    this.elapsedSec += dtSec;
  }

  show() {
    const sh = this.shaders[this.activePresetKey];
    if (!sh) {
      return;
    }

    this.pg.clear();
    this.pg.shader(sh);
    sh.setUniform("u_time", this.elapsedSec);
    sh.setUniform("u_p1", this.params.p1 ?? 1);
    sh.setUniform("u_p2", this.params.p2 ?? 1);
    sh.setUniform("u_p3", this.params.p3 ?? 1);
    sh.setUniform("u_opacity", this.params.opacity ?? 0.85);
    this.pg.rect(-this.size * 0.5, -this.size * 0.5, this.size, this.size);
  }

  getCanvasElement() {
    return this.pg.elt;
  }
}
