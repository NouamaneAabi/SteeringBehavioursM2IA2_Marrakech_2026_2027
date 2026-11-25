class Predator extends Vehicle {
  constructor(x, y, type, difficulty, speedMultiplier = 1) {
    super(x, y);
    this.type = type;
    this.r = 17;
    this.detectionRadius = difficulty.predatorDetectionRadius;
    this.baseMaxSpeed = difficulty.predatorMaxSpeed * difficulty.predatorCruiseRatio * speedMultiplier;
    this.maxSpeed = this.baseMaxSpeed;
    this.maxForce = difficulty.predatorMaxForce;
    this.attackCooldown = difficulty.predatorAttackCooldown;
    this.prepareDuration = difficulty.predatorPrepareDuration;
    this.chargeDuration = difficulty.predatorChargeDuration;
    this.slowFactor = 1;
    this.state = 'track';
    this.stateLabel = 'TRAQUE';
    this.phaseUntil = 0;
    this.attackCooldownUntil = millis() + random(this.attackCooldown * 0.35, this.attackCooldown);
    this.recoveryUntil = 0;
    this.hidden = type === 'ambusher';
    this.wanderTheta = random(TWO_PI);
    this.offsetSign = random() < 0.5 ? -1 : 1;
    this.predictedPosition = createVector(x, y);
    this.attackDirection = createVector(1, 0);
    this.lastDistanceToHead = Infinity;
    this.nearMissReady = true;
    this.eatenUntil = 0;
  }

  setDifficulty(difficulty, speedMultiplier) {
    this.detectionRadius = difficulty.predatorDetectionRadius;
    this.baseMaxSpeed = difficulty.predatorMaxSpeed * difficulty.predatorCruiseRatio * speedMultiplier;
    this.maxForce = difficulty.predatorMaxForce;
    this.attackCooldown = difficulty.predatorAttackCooldown;
    this.prepareDuration = difficulty.predatorPrepareDuration;
    this.chargeDuration = difficulty.predatorChargeDuration;
  }

  setSlowFactor(factor) {
    this.slowFactor = factor;
  }

  setHunted(active) {
    this.hunted = active;
  }

  eat() {
    this.eatenUntil = millis() + PREDATOR_AI.stunDuration * 3;
    this.state = 'eaten';
    this.stateLabel = 'ÉLIMINÉ';
    this.pos.set(-this.r * 4, -this.r * 4);
    this.vel.set(0, 0);
  }

  getEffectiveSpeed() {
    if (this.state === 'charge') return this.baseMaxSpeed * PREDATOR_AI.chargeMultiplier * this.slowFactor;
    if (this.state === 'exhaust' || this.state === 'stunned') return this.baseMaxSpeed * PREDATOR_AI.exhaustSpeedRatio * this.slowFactor;
    if (this.state === 'flee') return this.baseMaxSpeed * PREDATOR_AI.fleeSpeedRatio * this.slowFactor;
    return this.baseMaxSpeed * this.slowFactor;
  }

  calculatePrediction(head) {
    const distance = p5.Vector.dist(this.pos, head.pos);
    const travelTime = constrain(distance / Math.max(this.getEffectiveSpeed(), 0.1), 0, PREDATOR_AI.predictionMaxTime);
    this.predictedPosition.set(head.pos);
    this.predictedPosition.add(head.vel.copy().mult(travelTime));
    return travelTime;
  }

  startPreparation(head) {
    this.state = 'prepare';
    this.stateLabel = 'PRÉPARATION';
    this.phaseUntil = millis() + this.prepareDuration;
    const retreat = p5.Vector.sub(this.pos, head.pos);
    if (retreat.magSq() === 0) retreat.set(1, 0);
    this.attackDirection = retreat.normalize();
    this.vel = this.attackDirection.copy().mult(this.baseMaxSpeed * PREDATOR_AI.preparationRetreat);
  }

  startCharge(head) {
    this.state = 'charge';
    this.stateLabel = 'CHARGE';
    this.phaseUntil = millis() + this.chargeDuration;
    this.calculatePrediction(head);
    this.attackDirection = p5.Vector.sub(this.predictedPosition, this.pos);
    if (this.attackDirection.magSq() === 0) this.attackDirection.set(1, 0);
    this.attackDirection.normalize();
    this.vel = this.attackDirection.copy().mult(this.getEffectiveSpeed());
    this.nearMissReady = true;
  }

  startExhaustion() {
    this.state = 'exhaust';
    this.stateLabel = 'ÉPUISÉ';
    this.phaseUntil = millis() + PREDATOR_AI.exhaustDuration;
    this.attackCooldownUntil = millis() + this.attackCooldown;
  }

  stunFromContact(head) {
    this.state = 'stunned';
    this.stateLabel = 'ÉTOURDI';
    this.phaseUntil = millis() + PREDATOR_AI.stunDuration;
    this.recoveryUntil = this.phaseUntil + this.attackCooldown;
    const fleeDirection = p5.Vector.sub(this.pos, head.pos);
    if (fleeDirection.magSq() === 0) fleeDirection.set(1, 0);
    this.vel = fleeDirection.normalize().mult(this.baseMaxSpeed);
  }

  applyFlee(head) {
    const away = p5.Vector.sub(this.pos, head.pos);
    if (away.magSq() > 0) this.applyForce(this.seek(this.pos.copy().add(away.setMag(PREDATOR_AI.flankerOffset))));
  }

  applyDynamicPursue(head, offset = null) {
    this.calculatePrediction(head);
    if (offset) this.predictedPosition.add(offset);
    this.applyForce(this.seek(this.predictedPosition));
  }

  applyPatrol(head) {
    const anchor = foods.length > 0 ? foods[0].pos : createVector(width / 2, height / 2);
    const toAnchor = p5.Vector.sub(anchor, this.pos);
    const tangent = createVector(-toAnchor.y, toAnchor.x);
    if (tangent.magSq() > 0) tangent.setMag(this.maxSpeed * 0.7);
    const orbitPoint = anchor.copy().add(toAnchor.setMag(PREDATOR_AI.patrollerRadius)).add(tangent);
    this.applyForce(this.seek(orbitPoint));
    if (p5.Vector.dist(this.pos, anchor) > PREDATOR_AI.patrollerRadius * 1.8) this.applyForce(this.seek(anchor));
  }

  update(head, obstacles = [], predators = [], speedMultiplier = 1) {
    const now = millis();
    if (this.eatenUntil && now < this.eatenUntil) return;
    if (this.eatenUntil && now >= this.eatenUntil) {
      this.eatenUntil = 0;
      this.pos.set(random(this.r, width - this.r), random(this.r, height - this.r));
      this.state = 'track';
      this.stateLabel = 'TRAQUE';
    }
    const distance = p5.Vector.dist(this.pos, head.pos);
    const inRange = distance < this.detectionRadius;
    this.maxSpeed = this.getEffectiveSpeed();

    if (this.hunted) {
      this.state = 'flee';
      this.stateLabel = 'FUITE';
      this.applyFlee(head);
    } else if (this.state === 'stunned') {
      this.applyFlee(head);
      if (now >= this.phaseUntil) {
        this.state = 'track';
        this.stateLabel = 'TRAQUE';
        this.attackCooldownUntil = now + this.attackCooldown;
      }
    } else if (this.state === 'prepare') {
      this.vel.lerp(this.attackDirection.copy().mult(this.maxSpeed), 0.18);
      if (now >= this.phaseUntil) this.startCharge(head);
    } else if (this.state === 'charge') {
      this.vel.lerp(this.attackDirection.copy().mult(this.maxSpeed), 0.25);
      if (now >= this.phaseUntil) this.startExhaustion();
    } else if (this.state === 'exhaust') {
      this.applyForce(this.wander());
      if (now >= this.phaseUntil) {
        this.state = 'track';
        this.stateLabel = 'TRAQUE';
      }
    } else {
      this.state = 'track';
      this.stateLabel = 'TRAQUE';
      if (this.type === 'ambusher') {
        this.hidden = !inRange;
        if (this.hidden) this.applyPatrol(head);
        else this.applyDynamicPursue(head);
      } else if (this.type === 'patroller') {
        if (inRange) this.applyDynamicPursue(head);
        else this.applyPatrol(head);
      } else if (this.type === 'flanker') {
        const side = head.vel.copy();
        if (side.magSq() === 0) side.set(1, 0);
        side.normalize().rotate(HALF_PI * this.offsetSign).mult(PREDATOR_AI.flankerOffset);
        this.applyDynamicPursue(head, side);
      } else {
        this.applyDynamicPursue(head);
      }
      if (inRange && distance < this.detectionRadius * 0.78 && now >= this.attackCooldownUntil) this.startPreparation(head);
    }

    if (this.state !== 'charge' && this.state !== 'prepare') {
      this.applyForce(this.separation(predators).mult(WEIGHTS.separation));
      this.applyForce(this.avoidObstacles(obstacles).mult(WEIGHTS.obstacleAvoidance));
      this.applyForce(this.boundaryAvoidance().mult(WEIGHTS.boundaryAvoidance));
    } else {
      this.applyForce(this.avoidObstacles(obstacles).mult(WEIGHTS.obstacleAvoidance * 0.35));
      this.applyForce(this.boundaryAvoidance().mult(WEIGHTS.boundaryAvoidance));
    }

    super.update();
    this.pos.x = constrain(this.pos.x, this.r, width - this.r);
    this.pos.y = constrain(this.pos.y, this.r, height - this.r);
    this.lastDistanceToHead = distance;
  }

  show() {
    if (this.eatenUntil && millis() < this.eatenUntil) return;
    const warning = this.state === 'prepare';
    const charge = this.state === 'charge';
    const aura = warning ? 190 : charge ? 240 : 120;
    const scale = warning ? 1.2 : charge ? 1.08 : 1;
    push();
    colorMode(HSB, 360, 100, 100, 100);
    noStroke();
    fill(charge ? 5 : 315, 80, 100, aura * 0.16);
    circle(this.pos.x, this.pos.y, this.r * 4.2 * scale);
    fill(charge ? 8 : 345, 75, 100, 100);
    circle(this.pos.x, this.pos.y, this.r * 1.8 * scale);
    fill(55, 30, 100, 100);
    circle(this.pos.x + this.vel.x * 2, this.pos.y + this.vel.y * 2 - 4, 4);
    circle(this.pos.x + this.vel.x * 2, this.pos.y + this.vel.y * 2 + 4, 4);
    pop();
    colorMode(RGB, 255, 255, 255, 255);

    if (warning) {
      push();
      stroke('#ff557b');
      strokeWeight(1.2);
      line(this.pos.x, this.pos.y, this.predictedPosition.x, this.predictedPosition.y);
      pop();
    }

    if (Vehicle.debug) {
      push();
      noFill();
      stroke(255, 70, 150, 120);
      circle(this.pos.x, this.pos.y, this.detectionRadius * 2);
      stroke(charge ? '#ff557b' : '#ffe49b');
      circle(this.predictedPosition.x, this.predictedPosition.y, 8);
      line(this.pos.x, this.pos.y, this.predictedPosition.x, this.predictedPosition.y);
      fill(255, 240, 210);
      noStroke();
      textSize(10);
      textAlign(CENTER, BOTTOM);
      text(this.stateLabel, this.pos.x, this.pos.y - this.r * 2.2);
      pop();
    }
  }
}



