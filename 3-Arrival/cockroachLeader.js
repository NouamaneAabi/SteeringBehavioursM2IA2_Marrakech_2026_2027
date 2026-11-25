class CockroachLeader extends Vehicle {
  constructor(x, y) {
    super(x, y);

    this.r = 16;
    this.maxSpeed = 3.0;
    this.maxForce = 0.12;
    this.heading = random(TWO_PI);
    this.moveDirectionAngle = this.heading;
    this.prevPos = this.pos.copy();
    this.vel = createVector(Math.cos(this.heading), Math.sin(this.heading));
    this.vel.setMag(this.maxSpeed);

    // Paramètres Wander
    this.wanderDistance = 100;
    this.wanderRadius = 42;
    this.wanderTheta = random(TWO_PI);
    this.displaceRange = 0.25;

    // Zone d'exclusion devant le leader (les soldats doivent la fuir)
    this.frontZoneDistance = 85;
    this.frontZoneRadius = 75;

    // Détection de la tête du serpent (fuite à vitesse inchangée)
    this.snakeDetectionRadius = 60;

    // Cycle d'arrêt pour donner l'ordre de tir (toutes les 5 à 10 s)
    this.nextFireOrderMs = random(5000, 10000);
    this.haltDurationMs = 1400;
    this.haltingTimerMs = 0;
    this.isHalted = false;
  }

  getFrontExclusionCenter() {
    return createVector(
      this.pos.x + Math.cos(this.moveDirectionAngle) * this.frontZoneDistance,
      this.pos.y + Math.sin(this.moveDirectionAngle) * this.frontZoneDistance
    );
  }

  getFormationSlot(row, col) {
    const spacingX = 34;
    const spacingY = 30;
    const backOffset = 48 + row * spacingY;
    const sideOffset = (col - 1.5) * spacingX;

    const fx = Math.cos(this.moveDirectionAngle);
    const fy = Math.sin(this.moveDirectionAngle);
    const rx = -fy;
    const ry = fx;

    return createVector(
      this.pos.x - fx * backOffset + rx * sideOffset,
      this.pos.y - fy * backOffset + ry * sideOffset
    );
  }

  applyBehaviors(snakeHead = null) {
    if (snakeHead) {
      const dx = snakeHead.pos.x - this.pos.x;
      const dy = snakeHead.pos.y - this.pos.y;
      if (dx * dx + dy * dy <= this.snakeDetectionRadius * this.snakeDetectionRadius) {
        this.isHalted = false;
        const fleeForce = this.flee(snakeHead.pos);
        this.applyForce(fleeForce);
        return;
      }
    }

    if (this.isHalted) {
      this.vel.set(0, 0);
      this.acc.set(0, 0);
      return;
    }

    const circleCenter = this.vel.copy();
    if (circleCenter.magSq() < 1e-4) {
      circleCenter.set(Math.cos(this.heading), Math.sin(this.heading));
    }
    circleCenter.setMag(this.wanderDistance);
    circleCenter.add(this.pos);

    this.wanderTheta += random(-this.displaceRange, this.displaceRange);
    const angle = this.heading + this.wanderTheta;
    const targetPt = createVector(
      circleCenter.x + this.wanderRadius * Math.cos(angle),
      circleCenter.y + this.wanderRadius * Math.sin(angle)
    );

    const force = this.seek(targetPt);
    this.applyForce(force);
  }

  updateTimingAndCheckFireOrder(dtMs) {
    if (this.isHalted) {
      this.haltingTimerMs -= dtMs;
      if (this.haltingTimerMs <= 0) {
        this.isHalted = false;
        this.nextFireOrderMs = random(5000, 10000);
        this.vel.set(Math.cos(this.heading) * this.maxSpeed, Math.sin(this.heading) * this.maxSpeed);
      }
      return false;
    }

    this.nextFireOrderMs -= dtMs;
    if (this.nextFireOrderMs <= 0) {
      this.isHalted = true;
      this.haltingTimerMs = this.haltDurationMs;
      this.vel.set(0, 0);
      this.acc.set(0, 0);
      return true;
    }

    return false;
  }

  update() {
    if (!this.isHalted) {
      this.prevPos.set(this.pos.x, this.pos.y);
      super.update();
      const dx = this.pos.x - this.prevPos.x;
      const dy = this.pos.y - this.prevPos.y;
      if (dx * dx + dy * dy > 0.04) {
        this.moveDirectionAngle = Math.atan2(dy, dx);
        this.heading = this.moveDirectionAngle;
      }
    }
  }

  edges() {
    const margin = 50;
    if (this.pos.x > width - margin) {
      this.pos.x = width - margin;
      this.vel.x *= -1;
      this.heading = this.vel.heading();
    } else if (this.pos.x < margin) {
      this.pos.x = margin;
      this.vel.x *= -1;
      this.heading = this.vel.heading();
    }

    if (this.pos.y > height - margin) {
      this.pos.y = height - margin;
      this.vel.y *= -1;
      this.heading = this.vel.heading();
    } else if (this.pos.y < margin) {
      this.pos.y = margin;
      this.vel.y *= -1;
      this.heading = this.vel.heading();
    }
  }

  drawCockroachBody(carapaceColor, accentColor) {
    const legWiggle = this.isHalted ? 0 : Math.sin(millis() * 0.025) * 3;

    // 6 pattes animées
    stroke(accentColor);
    strokeWeight(1.8);
    noFill();
    for (let i = -1; i <= 1; i++) {
      const lx = i * (this.r * 0.45);
      const wiggle = i % 2 === 0 ? legWiggle : -legWiggle;
      line(lx, -this.r * 0.4, lx - 4 + wiggle, -this.r * 1.05);
      line(lx, this.r * 0.4, lx - 4 - wiggle, this.r * 1.05);
    }

    // Antennes
    strokeWeight(1.2);
    line(this.r * 0.85, -3, this.r * 1.55, -8 + legWiggle * 0.5);
    line(this.r * 0.85, 3, this.r * 1.55, 8 - legWiggle * 0.5);

    // Carapace ovale
    stroke(255, 255, 255, 190);
    strokeWeight(1.5);
    fill(carapaceColor);
    ellipse(0, 0, this.r * 2.0, this.r * 1.15);

    // Couronne dorée du leader
    noStroke();
    fill(250, 204, 21);
    circle(this.r * 0.2, 0, this.r * 0.55);
  }

  show() {
    if (Vehicle.debug) {
      const front = this.getFrontExclusionCenter();
      push();
      noFill();
      stroke(239, 68, 68, 130);
      strokeWeight(1.5);
      circle(front.x, front.y, this.frontZoneRadius * 2);
      line(this.pos.x, this.pos.y, front.x, front.y);

      stroke(250, 204, 21, 130);
      circle(this.pos.x, this.pos.y, this.snakeDetectionRadius * 2);
      pop();
    }

    push();
    translate(this.pos.x, this.pos.y);
    rotate(this.heading);
    this.drawCockroachBody(
      this.isHalted ? color(220, 38, 38) : color(180, 83, 9),
      color(251, 191, 36)
    );
    pop();
  }
}
