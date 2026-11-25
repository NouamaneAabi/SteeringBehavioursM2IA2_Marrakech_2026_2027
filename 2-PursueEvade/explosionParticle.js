class ExplosionParticle extends Vehicle {
  constructor(x, y) {
    super(x, y);

    const angle = random(TWO_PI);
    const speed = random(2.5, 10.5);
    this.vel = createVector(Math.cos(angle) * speed, Math.sin(angle) * speed);

    this.r = random(4, 12);
    this.maxSpeed = speed * 1.2;
    this.maxForce = 0.25;

    this.durationMs = random(350, 700);
    this.elapsedMs = 0;

    // Cible de freinage radial (steering pur)
    const burstDist = random(45, 130);
    this.burstTarget = createVector(
      x + Math.cos(angle) * burstDist,
      y + Math.sin(angle) * burstDist
    );

    // Palette feu : blanc, jaune, orange, rouge
    const palette = [
      [255, 255, 220],
      [253, 224, 71],
      [251, 146, 60],
      [239, 68, 68]
    ];
    this.rgb = palette[Math.floor(random(palette.length))];
  }

  applyBehaviors() {
    const force = this.seek(this.burstTarget);
    this.applyForce(force);
  }

  update() {
    const dtMs = Math.min(typeof deltaTime === "number" ? deltaTime : 16.67, 100);
    this.elapsedMs += dtMs;
    super.update();
  }

  isFinished() {
    return this.elapsedMs >= this.durationMs;
  }

  show() {
    const progress = constrain(this.elapsedMs / this.durationMs, 0, 1);
    const alpha = (1 - progress) * 255;
    const currentRadius = this.r * (1 - progress * 0.65);

    push();
    noStroke();
    fill(this.rgb[0], this.rgb[1], this.rgb[2], alpha);
    circle(this.pos.x, this.pos.y, currentRadius * 2);
    pop();
  }
}
