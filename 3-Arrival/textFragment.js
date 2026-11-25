class TextFragment extends Vehicle {
  constructor(x, y, targetX, targetY, r = 3.2, fillColor = "#fbbf24") {
    super(x, y);

    this.target = createVector(targetX, targetY);
    this.r = r;
    this.baseMaxSpeed = 9;
    this.baseMaxForce = 0.45;
    this.fleeMaxSpeed = 14;
    this.fleeMaxForce = 1.2;
    this.maxSpeed = this.baseMaxSpeed;
    this.maxForce = this.baseMaxForce;
    this.rayonZoneDeFreinage = 110;
    this.fleeRadius = 40;
    this.fillColor = color(fillColor);
  }

  setColor(col) {
    this.fillColor = color(col);
  }

  setTarget(x, y) {
    this.target.set(x, y);
  }

  applyBehaviors(repulsors = []) {
    const fleeRadiusSq = this.fleeRadius * this.fleeRadius;
    let closestPos = null;
    let closestDistSq = fleeRadiusSq;

    for (let i = 0; i < repulsors.length; i++) {
      const repulsor = repulsors[i];
      const rx = repulsor.pos ? repulsor.pos.x : repulsor.x;
      const ry = repulsor.pos ? repulsor.pos.y : repulsor.y;
      const dx = rx - this.pos.x;
      const dy = ry - this.pos.y;
      const distSq = dx * dx + dy * dy;

      if (distSq < closestDistSq) {
        closestDistSq = distSq;
        closestPos = repulsor.pos ? repulsor.pos : repulsor;
      }
    }

    if (closestPos) {
      this.maxSpeed = this.fleeMaxSpeed;
      this.maxForce = this.fleeMaxForce;
      const fleeForce = this.flee(closestPos);
      this.applyForce(fleeForce);
      return;
    }

    this.maxSpeed = this.baseMaxSpeed;
    this.maxForce = this.baseMaxForce;

    const dx = this.target.x - this.pos.x;
    const dy = this.target.y - this.pos.y;
    const distSq = dx * dx + dy * dy;

    if (distSq < 1.5 && this.vel.magSq() < 0.04) {
      this.vel.set(0, 0);
      this.acc.set(0, 0);
      return;
    }

    const arriveForce = this.arrive(this.target, 0);
    this.applyForce(arriveForce);
  }

  show() {
    push();
    noStroke();
    fill(this.fillColor);
    circle(this.pos.x, this.pos.y, this.r * 2);
    pop();
  }
}
