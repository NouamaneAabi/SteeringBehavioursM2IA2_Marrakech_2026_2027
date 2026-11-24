class Missile extends Vehicle {
  constructor(
    x,
    y,
    targetPlane,
    speedMultiplier = 1.5,
    basePlaneSpeed = 4.5,
    launchAngle = null,
    maxForce = 0.45,
    maxLifeMs = 5000,
    owner = null
  ) {
    super(x, y);

    this.initialTarget = targetPlane;
    this.target = targetPlane;
    this.owner = owner;
    this.r = 8;
    this.basePlaneSpeed = basePlaneSpeed;
    this.maxSpeed = basePlaneSpeed * speedMultiplier;
    this.maxForce = maxForce;

    // Phase d'éjection perpendiculaire pendant 0,3 s avant pursuePerfect
    this.launchPhaseDurationMs = 300;
    this.launchElapsedMs = 0;

    // Durée de vie maximale du missile (5 s par défaut)
    this.maxLifeMs = maxLifeMs;
    this.ageMs = 0;

    // Impulsion initiale : à ±90° des ailes si launchAngle est fourni, sinon vers la cible
    let dir;
    if (typeof launchAngle === "number") {
      dir = createVector(Math.cos(launchAngle), Math.sin(launchAngle));
    } else if (targetPlane) {
      dir = p5.Vector.sub(targetPlane.pos, this.pos);
    } else {
      dir = p5.Vector.random2D();
    }
    if (dir.magSq() === 0) {
      dir.set(1, 0);
    }
    this.launchDirection = dir.copy().normalize();
    dir.setMag(this.maxSpeed);
    this.vel = dir;

    this.trail = [];
    this.maxTrailLength = 16;
  }

  setSpeedMultiplier(multiplier) {
    this.maxSpeed = this.basePlaneSpeed * multiplier;
  }

  selectTarget(flares = []) {
    if (!this.initialTarget) {
      return;
    }

    let bestTarget = this.initialTarget;
    const dxInit = this.initialTarget.pos.x - this.pos.x;
    const dyInit = this.initialTarget.pos.y - this.pos.y;
    let bestDistSq = dxInit * dxInit + dyInit * dyInit;

    for (let i = 0; i < flares.length; i++) {
      const flare = flares[i];
      if (flare.owner !== this.initialTarget) {
        continue;
      }
      const dx = flare.pos.x - this.pos.x;
      const dy = flare.pos.y - this.pos.y;
      const distSq = dx * dx + dy * dy;
      if (distSq < bestDistSq) {
        bestDistSq = distSq;
        bestTarget = flare;
      }
    }

    this.target = bestTarget;
  }

  applyBehaviors() {
    if (this.launchElapsedMs < this.launchPhaseDurationMs) {
      // Avance perpendiculairement à l'avion pendant 0,3 s (steering pur)
      const desiredSpeed = p5.Vector.mult(this.launchDirection, this.maxSpeed);
      const force = p5.Vector.sub(desiredSpeed, this.vel);
      force.limit(this.maxForce);
      this.applyForce(force);
      return;
    }

    if (!this.target) {
      return;
    }
    const force = this.pursuePerfect(this.target, true);
    this.applyForce(force);
  }

  update() {
    const dtMs = Math.min(typeof deltaTime === "number" ? deltaTime : 16.67, 100);
    this.launchElapsedMs += dtMs;
    this.ageMs += dtMs;

    this.trail.push({ x: this.pos.x, y: this.pos.y });
    if (this.trail.length > this.maxTrailLength) {
      this.trail.shift();
    }
    super.update();
  }

  isExpired() {
    return this.ageMs >= this.maxLifeMs;
  }

  hasHitTarget() {
    if (!this.target) {
      return false;
    }
    const dx = this.target.pos.x - this.pos.x;
    const dy = this.target.pos.y - this.pos.y;
    const hitDist = this.r + this.target.r;
    return dx * dx + dy * dy <= hitDist * hitDist;
  }

  show() {
    // Traînée de fumée / flamme
    push();
    noFill();
    for (let i = 1; i < this.trail.length; i++) {
      const alpha = (i / this.trail.length) * 180;
      stroke(251, 146, 60, alpha);
      strokeWeight(2 + (i / this.trail.length) * 2.5);
      line(
        this.trail[i - 1].x,
        this.trail[i - 1].y,
        this.trail[i].x,
        this.trail[i].y
      );
    }
    pop();

    // Corps du missile
    push();
    translate(this.pos.x, this.pos.y);
    rotate(this.vel.heading());

    // Flamme arrière
    noStroke();
    fill(253, 224, 71, 220);
    triangle(-this.r * 1.1, -3, -this.r * 1.1, 3, -this.r * 2.3, 0);

    // Fuselage
    stroke(255);
    strokeWeight(1);
    fill(248, 250, 252);
    beginShape();
    vertex(this.r * 1.4, 0);
    vertex(this.r * 0.4, -3.5);
    vertex(-this.r * 1.1, -3.5);
    vertex(-this.r * 1.1, 3.5);
    vertex(this.r * 0.4, 3.5);
    endShape(CLOSE);

    // Ogive rouge
    noStroke();
    fill(239, 68, 68);
    triangle(this.r * 1.4, 0, this.r * 0.5, -3.2, this.r * 0.5, 3.2);
    pop();

    if (Vehicle.debug) {
      this.drawVector(this.pos, this.vel.copy().mult(6));
    }
  }
}
