class Flare extends Vehicle {
  constructor(x, y, owner = null, ejectAngle = null) {
    super(x, y);

    this.owner = owner;
    this.r = 5;

    // Flottement très lent dans l'espace via steering
    this.maxSpeed = 1.1;
    this.maxForce = 0.04;

    const angle = typeof ejectAngle === "number" ? ejectAngle : random(TWO_PI);
    const speed = random(0.4, 1.0);
    this.vel = createVector(Math.cos(angle) * speed, Math.sin(angle) * speed);

    this.driftAngle = angle;
    this.maxLifeMs = 3000;
    this.ageMs = 0;
  }

  applyBehaviors() {
    this.driftAngle += random(-0.25, 0.25);
    const desired = createVector(
      Math.cos(this.driftAngle) * this.maxSpeed * 0.65,
      Math.sin(this.driftAngle) * this.maxSpeed * 0.65
    );
    const force = p5.Vector.sub(desired, this.vel);
    force.limit(this.maxForce);
    this.applyForce(force);
  }

  update() {
    const dtMs = Math.min(typeof deltaTime === "number" ? deltaTime : 16.67, 100);
    this.ageMs += dtMs;
    super.update();
  }

  isExpired() {
    return this.ageMs >= this.maxLifeMs;
  }

  show() {
    const progress = constrain(this.ageMs / this.maxLifeMs, 0, 1);
    const alpha = (1 - progress * 0.45) * 255;

    push();
    noStroke();
    // Halo lumineux jaune chaud
    fill(253, 224, 71, alpha * 0.35);
    circle(this.pos.x, this.pos.y, this.r * 3.4);

    // Cœur jaune vif
    fill(254, 240, 138, alpha);
    circle(this.pos.x, this.pos.y, this.r * 2);
    pop();
  }
}
