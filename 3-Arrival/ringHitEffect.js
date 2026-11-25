class RingHitEffect extends Vehicle {
  constructor(x, y) {
    super(x, y);

    const angle = random(TWO_PI);
    const speed = random(1.8, 5.5);
    this.vel = createVector(Math.cos(angle) * speed, Math.sin(angle) * speed);
    this.r = random(3, 6.5);
    this.maxSpeed = 6;
    this.maxForce = 0.15;

    this.durationMs = random(240, 420);
    this.elapsedMs = 0;

    const burstDist = random(20, 55);
    this.burstTarget = createVector(
      x + Math.cos(angle) * burstDist,
      y + Math.sin(angle) * burstDist
    );
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

    push();
    noStroke();
    fill(244, 63, 94, alpha);
    circle(this.pos.x, this.pos.y, this.r * 2 * (1 - progress * 0.5));
    pop();
  }
}
