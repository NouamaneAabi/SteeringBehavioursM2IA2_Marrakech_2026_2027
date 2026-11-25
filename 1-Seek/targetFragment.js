class TargetFragment extends Vehicle {
  constructor(x, y, r, fillColor, startAngle, endAngle) {
    super(x, y);

    this.r = r;
    this.startAngle = startAngle;
    this.endAngle = endAngle;
    this.midAngle = (startAngle + endAngle) * 0.5;

    this.rCol = red(fillColor);
    this.gCol = green(fillColor);
    this.bCol = blue(fillColor);

    this.durationMs = 300;
    this.elapsedMs = 0;

    this.maxSpeed = 14;
    this.maxForce = 1.5;

    const initialSpeed = random(5, 9);
    this.vel = createVector(
      Math.cos(this.midAngle) * initialSpeed,
      Math.sin(this.midAngle) * initialSpeed
    );

    const burstDistance = r * 2.5 + 80;
    this.burstTarget = createVector(
      x + Math.cos(this.midAngle) * burstDistance,
      y + Math.sin(this.midAngle) * burstDistance
    );

    this.rotation = 0;
    this.angularVel = random(-0.08, 0.08);
  }

  applyBehaviors() {
    const force = this.seek(this.burstTarget);
    this.applyForce(force);
  }

  update() {
    const dtMs = Math.min(typeof deltaTime === "number" ? deltaTime : 16.67, 100);
    this.elapsedMs += dtMs;
    this.rotation += this.angularVel;
    super.update();
  }

  isFinished() {
    return this.elapsedMs >= this.durationMs;
  }

  show() {
    const progress = constrain(this.elapsedMs / this.durationMs, 0, 1);
    const alpha = (1 - progress) * 255;
    const scaleFactor = 1 - progress * 0.25;

    push();
    translate(this.pos.x, this.pos.y);
    rotate(this.rotation);
    scale(scaleFactor);
    fill(this.rCol, this.gCol, this.bCol, alpha);
    stroke(255, 255, 255, alpha * 0.6);
    strokeWeight(1.5);
    arc(0, 0, this.r * 2, this.r * 2, this.startAngle, this.endAngle, PIE);
    pop();
  }
}
