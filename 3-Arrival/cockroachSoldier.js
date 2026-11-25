class CockroachSoldier extends Vehicle {
  constructor(x, y, row = 0, col = 0) {
    super(x, y);

    this.row = row;
    this.col = col;
    this.r = 10;
    this.maxSpeed = 5.5;
    this.maxForce = 0.35;
    this.rayonZoneDeFreinage = 65;
    this.snakeDetectionRadius = 60;
    this.heading = random(TWO_PI);
    this.legPhase = random(TWO_PI);
  }

  applyBehaviors(leader, snakeHead = null) {
    if (!leader) {
      return;
    }

    // Priorité 1 : fuir la tête du serpent si elle s'approche dans le rayon de détection (sans changer maxSpeed)
    if (snakeHead) {
      const sdx = snakeHead.pos.x - this.pos.x;
      const sdy = snakeHead.pos.y - this.pos.y;
      if (sdx * sdx + sdy * sdy <= this.snakeDetectionRadius * this.snakeDetectionRadius) {
        const fleeSnakeForce = this.flee(snakeHead.pos);
        this.applyForce(fleeSnakeForce);
        return;
      }
    }

    // Si le leader s'arrête, toute la formation s'arrête
    if (leader.isHalted) {
      this.vel.set(0, 0);
      this.acc.set(0, 0);
      return;
    }

    // Règle Leader Following : fuir la zone devant le leader si on s'y trouve
    const frontCenter = leader.getFrontExclusionCenter();
    const dx = this.pos.x - frontCenter.x;
    const dy = this.pos.y - frontCenter.y;
    const frontRadiusSq = leader.frontZoneRadius * leader.frontZoneRadius;

    if (dx * dx + dy * dy < frontRadiusSq) {
      const fleeForce = this.flee(frontCenter);
      fleeForce.mult(1.6);
      this.applyForce(fleeForce);
      return;
    }

    // Sinon, rejoindre sa case dans la formation 4x4 derrière le leader
    const slotPos = leader.getFormationSlot(this.row, this.col);
    if (
      Math.abs(slotPos.x - this.pos.x) < 1.5 &&
      Math.abs(slotPos.y - this.pos.y) < 1.5 &&
      leader.isHalted &&
      this.vel.magSq() < 0.04
    ) {
      this.vel.set(0, 0);
      this.acc.set(0, 0);
      return;
    }

    const arriveForce = this.arrive(slotPos, 0);
    this.applyForce(arriveForce);
  }

  update() {
    super.update();
    if (this.vel.magSq() > 0.09) {
      this.heading = this.vel.heading();
    } else if (this.vel.magSq() < 0.01) {
      this.vel.set(0, 0);
    }
  }

  show() {
    if (Vehicle.debug) {
      push();
      noFill();
      stroke(250, 204, 21, 110);
      strokeWeight(1);
      circle(this.pos.x, this.pos.y, this.snakeDetectionRadius * 2);
      pop();
    }

    const legWiggle = this.vel.magSq() < 0.04
      ? 0
      : Math.sin(millis() * 0.03 + this.legPhase) * 2.4;

    push();
    translate(this.pos.x, this.pos.y);
    rotate(this.heading);

    // 6 pattes
    stroke(217, 119, 6);
    strokeWeight(1.4);
    noFill();
    for (let i = -1; i <= 1; i++) {
      const lx = i * (this.r * 0.42);
      const w = i % 2 === 0 ? legWiggle : -legWiggle;
      line(lx, -this.r * 0.35, lx - 3 + w, -this.r * 0.95);
      line(lx, this.r * 0.35, lx - 3 - w, this.r * 0.95);
    }

    // Antennes
    strokeWeight(1);
    line(this.r * 0.8, -2, this.r * 1.4, -5 + legWiggle * 0.4);
    line(this.r * 0.8, 2, this.r * 1.4, 5 - legWiggle * 0.4);

    // Carapace brun-cuivré
    stroke(254, 215, 170, 180);
    strokeWeight(1.2);
    fill(146, 64, 14);
    ellipse(0, 0, this.r * 1.9, this.r * 1.1);
    pop();
  }
}
