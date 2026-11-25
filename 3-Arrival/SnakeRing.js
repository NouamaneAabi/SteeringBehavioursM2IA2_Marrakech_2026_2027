class SnakeRing extends Vehicle {
  constructor(x, y, r = 14) {
    super(x, y);
    this.r = r;
    this.maxSpeed = 10;
    this.maxForce = 2;
    this.rayonZoneDeFreinage = 100;
    this.heading = 0;
    this.fillColor = color(34, 211, 238);
  }

  applyBehaviors(leader, gapDistance) {
    if (!leader) {
      return;
    }

    const dx = leader.pos.x - this.pos.x;
    const dy = leader.pos.y - this.pos.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // Zone morte quand le maillon précédent est arrêté et que la distance est déjà atteinte
    if (
      leader.vel.magSq() < 0.04 &&
      Math.abs(dist - gapDistance) < 1.5 &&
      this.vel.magSq() < 0.09
    ) {
      this.vel.set(0, 0);
      this.acc.set(0, 0);
      return;
    }

    const force = this.arrive(leader.pos, gapDistance);
    this.applyForce(force);
  }

  update() {
    super.update();
    if (this.vel.magSq() > 0.25) {
      this.heading = this.vel.heading();
    } else if (this.vel.magSq() < 0.01) {
      this.vel.set(0, 0);
    }
  }

  show() {
    push();
    translate(this.pos.x, this.pos.y);
    stroke(255, 255, 255, 190);
    strokeWeight(1.5);
    fill(this.fillColor);
    circle(0, 0, this.r * 2);
    pop();
  }
}
