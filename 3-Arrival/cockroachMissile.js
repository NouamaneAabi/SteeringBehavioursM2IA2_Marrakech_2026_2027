class CockroachMissile extends Vehicle {
  constructor(x, y, targetRing) {
    super(x, y);

    this.targetRing = targetRing;
    this.r = 5.5;
    this.maxSpeed = 7.5;
    this.maxForce = 0.35;
    this.maxLifeMs = 1500;
    this.ageMs = 0;

    if (targetRing) {
      const dir = p5.Vector.sub(targetRing.pos, this.pos);
      if (dir.magSq() > 0) {
        dir.setMag(this.maxSpeed * 0.65);
        this.vel = dir;
      }
    }

    this.trail = [];
    this.maxTrail = 10;
  }

  applyBehaviors() {
    if (!this.targetRing) {
      return;
    }
    const force = this.seek(this.targetRing.pos);
    this.applyForce(force);
  }

  update() {
    const dtMs = Math.min(typeof deltaTime === "number" ? deltaTime : 16.67, 100);
    this.ageMs += dtMs;

    this.trail.push({ x: this.pos.x, y: this.pos.y });
    if (this.trail.length > this.maxTrail) {
      this.trail.shift();
    }
    super.update();
  }

  isExpired() {
    return this.ageMs >= this.maxLifeMs;
  }

  show() {
    // Traînée acide/rougeâtre
    push();
    noFill();
    for (let i = 1; i < this.trail.length; i++) {
      const alpha = (i / this.trail.length) * 180;
      stroke(244, 63, 94, alpha);
      strokeWeight(1.5 + (i / this.trail.length) * 1.8);
      line(
        this.trail[i - 1].x,
        this.trail[i - 1].y,
        this.trail[i].x,
        this.trail[i].y
      );
    }
    pop();

    push();
    translate(this.pos.x, this.pos.y);
    rotate(this.vel.heading());
    noStroke();
    fill(251, 113, 133);
    triangle(this.r * 1.4, 0, -this.r, -3.2, -this.r, 3.2);
    fill(254, 240, 138);
    circle(this.r * 0.3, 0, 3);
    pop();
  }
}
