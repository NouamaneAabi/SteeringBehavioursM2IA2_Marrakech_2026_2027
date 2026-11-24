class TargetPlane extends Plane {
  constructor(x, y) {
    super(x, y);

    this.baseMaxSpeed = this.maxSpeed;
    this.baseMaxForce = this.maxForce;

    this.unlockedColor = color(34, 197, 94);
    this.lockedColor = color(239, 68, 68);
    this.bodyColor = this.unlockedColor;
    this.strokeColor = color(255);

    this.isLocked = false;
    this.lockedBy = null;
    this.lockedByAttackers = new Set();

    // Réaction d'évasion 1 s après le verrouillage
    this.evadeDelayMs = 1000;
    this.lockElapsedMs = 0;
    this.isEvading = false;

    // Détection et fuite boostée face aux missiles (modèle 1-Seek)
    this.missileDetectionRadius = 150;
    this.missileSafeDistance = 300;
    this.fleeMaxSpeed = 9;
    this.fleeMaxForce = 0.7;
    this.isFleeingMissile = false;

    // Endurance : 2 s de fuite max, puis 1 s de régénération complète
    this.stamina = 1;
    this.staminaDrainDurationMs = 2000;
    this.staminaRegenDurationMs = 1000;
    this.isRegeneratingStamina = false;

    // Contre-mesures flares (100 au départ, largués par groupe de 10)
    this.flareCount = 100;
    this.flareBatchSize = 10;
    this.flareCooldownMs = 1000;
    this.flareCooldownTimerMs = 0;

    // Manœuvre brutale de dégagement pendant 0,5 s après largage des flares
    this.breakDurationMs = 500;
    this.breakTimerMs = 0;
    this.breakDirection = createVector(1, 0);
  }

  setLocked(locked, attacker = null) {
    const wasLocked = this.isLocked;

    if (locked && attacker) {
      this.lockedByAttackers.add(attacker);
    } else if (!locked && attacker) {
      this.lockedByAttackers.delete(attacker);
    } else if (!locked) {
      this.lockedByAttackers.clear();
    }

    this.isLocked = this.lockedByAttackers.size > 0;
    this.lockedBy = this.isLocked ? this.lockedByAttackers.values().next().value : null;

    if (!this.isLocked) {
      this.lockElapsedMs = 0;
      this.isEvading = false;
      this.bodyColor = this.unlockedColor;
    } else if (!wasLocked) {
      this.lockElapsedMs = 0;
      this.isEvading = false;
      this.bodyColor = this.lockedColor;
    }
  }

  getClosestThreat() {
    let closest = null;
    let closestDistSq = Infinity;

    this.lockedByAttackers.forEach((attacker) => {
      const dx = attacker.pos.x - this.pos.x;
      const dy = attacker.pos.y - this.pos.y;
      const distSq = dx * dx + dy * dy;
      if (distSq < closestDistSq) {
        closestDistSq = distSq;
        closest = attacker;
      }
    });

    return closest;
  }

  findClosestMissile(missiles) {
    let closest = null;
    let closestDistSq = Infinity;

    for (let i = 0; i < missiles.length; i++) {
      const missile = missiles[i];
      const dx = missile.pos.x - this.pos.x;
      const dy = missile.pos.y - this.pos.y;
      const distSq = dx * dx + dy * dy;
      if (distSq < closestDistSq) {
        closestDistSq = distSq;
        closest = missile;
      }
    }

    return { missile: closest, distSq: closestDistSq };
  }

  stopFleeingMissile() {
    this.isFleeingMissile = false;
    this.maxSpeed = this.baseMaxSpeed;
    this.maxForce = this.baseMaxForce;
    this.acc.set(0, 0);
    if (this.vel.magSq() > 0) {
      this.vel.limit(this.baseMaxSpeed);
    }
  }

  regenerateStamina(dtMs) {
    if (this.stamina < 1) {
      this.stamina = Math.min(1, this.stamina + dtMs / this.staminaRegenDurationMs);
      if (this.stamina >= 1) {
        this.isRegeneratingStamina = false;
      }
    } else {
      this.isRegeneratingStamina = false;
    }
  }

  tryReleaseFlares(missiles, dtMs) {
    if (this.flareCooldownTimerMs > 0) {
      this.flareCooldownTimerMs = Math.max(0, this.flareCooldownTimerMs - dtMs);
    }

    if (this.flareCount < this.flareBatchSize || this.flareCooldownTimerMs > 0 || missiles.length === 0) {
      return [];
    }

    const { missile: closestMissile, distSq } = this.findClosestMissile(missiles);
    const detectDistSq = this.missileDetectionRadius * this.missileDetectionRadius;
    if (!closestMissile || distSq > detectDistSq) {
      return [];
    }

    this.flareCount = Math.max(0, this.flareCount - this.flareBatchSize);
    this.flareCooldownTimerMs = this.flareCooldownMs;

    // Virage brutal perpendiculaire + accélération pendant 0,5 s
    const currentHeading = this.vel.heading();
    const toMissileAngle = Math.atan2(
      closestMissile.pos.y - this.pos.y,
      closestMissile.pos.x - this.pos.x
    );
    const leftAngle = currentHeading - HALF_PI;
    const rightAngle = currentHeading + HALF_PI;
    const leftDiff = Math.abs(Math.atan2(Math.sin(leftAngle - toMissileAngle), Math.cos(leftAngle - toMissileAngle)));
    const rightDiff = Math.abs(Math.atan2(Math.sin(rightAngle - toMissileAngle), Math.cos(rightAngle - toMissileAngle)));
    const breakAngle = leftDiff >= rightDiff ? leftAngle : rightAngle;

    this.breakDirection = createVector(Math.cos(breakAngle), Math.sin(breakAngle));
    this.breakTimerMs = this.breakDurationMs;

    // Largage de 10 flares derrière l'avion
    const released = [];
    const rearAngle = currentHeading + PI;
    for (let i = 0; i < this.flareBatchSize; i++) {
      const spread = random(-0.9, 0.9);
      const ejectAngle = rearAngle + spread;
      const offsetDist = random(8, 26);
      const fx = this.pos.x + Math.cos(ejectAngle) * offsetDist;
      const fy = this.pos.y + Math.sin(ejectAngle) * offsetDist;
      released.push(new Flare(fx, fy, this, ejectAngle));
    }

    return released;
  }

  applyBehaviors(missiles = []) {
    const dtMs = Math.min(typeof deltaTime === "number" ? deltaTime : 16.67, 100);

    // Priorité 0 : manœuvre brutale de dégagement (0,5 s après largage de flares)
    if (this.breakTimerMs > 0) {
      this.breakTimerMs = Math.max(0, this.breakTimerMs - dtMs);
      this.maxSpeed = this.fleeMaxSpeed * 1.15;
      this.maxForce = this.fleeMaxForce * 1.8;
      const desired = p5.Vector.mult(this.breakDirection, this.maxSpeed);
      const force = p5.Vector.sub(desired, this.vel);
      force.limit(this.maxForce);
      this.applyForce(force);

      if (this.breakTimerMs === 0 && !this.isFleeingMissile) {
        this.maxSpeed = this.baseMaxSpeed;
        this.maxForce = this.baseMaxForce;
        this.vel.limit(this.baseMaxSpeed);
      }
      return;
    }

    // Priorité 1 : fuite boostée (flee) si un missile entre dans le cercle de détection
    if (!this.isRegeneratingStamina && missiles.length > 0) {
      const { missile: closestMissile, distSq } = this.findClosestMissile(missiles);
      const detectDistSq = this.missileDetectionRadius * this.missileDetectionRadius;
      const safeDistSq = this.missileSafeDistance * this.missileSafeDistance;

      if (!this.isFleeingMissile && closestMissile && distSq <= detectDistSq && this.stamina > 0) {
        this.isFleeingMissile = true;
      } else if (this.isFleeingMissile && (!closestMissile || distSq >= safeDistSq)) {
        this.stopFleeingMissile();
      }

      if (this.isFleeingMissile && closestMissile) {
        this.stamina = Math.max(0, this.stamina - dtMs / this.staminaDrainDurationMs);
        if (this.stamina <= 0) {
          this.isRegeneratingStamina = true;
          this.stopFleeingMissile();
        } else {
          this.maxSpeed = this.fleeMaxSpeed;
          this.maxForce = this.fleeMaxForce;
          const fleeForce = this.flee(closestMissile);
          this.applyForce(fleeForce);
          return;
        }
      }
    } else if (this.isFleeingMissile) {
      this.stopFleeingMissile();
    }

    this.regenerateStamina(dtMs);

    // Priorité 2 : évasion parfaite (evadePerfect) 1 s après le lock
    if (this.isEvading) {
      const threat = this.getClosestThreat();
      if (threat) {
        const evadeForce = this.evadePerfect(threat, false);
        this.applyForce(evadeForce);
        return;
      }
    }

    // Priorité 3 : vol autonome (wander)
    super.applyBehaviors();
  }

  update() {
    const dtMs = Math.min(typeof deltaTime === "number" ? deltaTime : 16.67, 100);
    if (this.isLocked) {
      this.lockElapsedMs += dtMs;
      this.isEvading = this.lockElapsedMs >= this.evadeDelayMs;
    } else {
      this.lockElapsedMs = 0;
      this.isEvading = false;
    }
    super.update();
  }

  show() {
    if (this.isEvading) {
      // Clignotement vert / rouge après 1 s de lock
      const blinkRed = Math.floor(millis() / 160) % 2 === 0;
      this.bodyColor = blinkRed ? this.lockedColor : this.unlockedColor;
    } else {
      this.bodyColor = this.isLocked ? this.lockedColor : this.unlockedColor;
    }

    super.show();
    this.drawStaminaBar();
    this.drawFlareCounter();

    if (this.isLocked) {
      this.drawLockReticle();
    }

    if (Vehicle.debug) {
      this.drawMissileDetectionCircle();
    }
  }

  drawFlareCounter() {
    push();
    noStroke();
    fill(this.flareCount > 0 ? color(253, 224, 71, 230) : color(148, 163, 184, 190));
    textSize(11);
    textStyle(BOLD);
    textAlign(CENTER, TOP);
    text(`Flares: ${this.flareCount}`, this.pos.x, this.pos.y + this.r + 5);
    pop();
  }

  drawStaminaBar() {
    push();
    const barWidth = 42;
    const barHeight = 5;
    const barX = this.pos.x - barWidth / 2;
    const barY = this.pos.y - this.r - 16;

    noStroke();
    fill(15, 15, 25, 200);
    rect(barX - 1, barY - 1, barWidth + 2, barHeight + 2, 3);

    fill(this.isRegeneratingStamina ? color(251, 146, 60) : color(74, 222, 128));
    rect(barX, barY, barWidth * this.stamina, barHeight, 2);

    noFill();
    stroke(255, 255, 255, 140);
    strokeWeight(1);
    rect(barX - 1, barY - 1, barWidth + 2, barHeight + 2, 3);
    pop();
  }

  drawMissileDetectionCircle() {
    push();
    noFill();
    strokeWeight(1.5);
    if (this.isFleeingMissile) {
      stroke(255, 80, 80, 190);
      circle(this.pos.x, this.pos.y, this.missileDetectionRadius * 2);
      stroke(255, 180, 0, 90);
      circle(this.pos.x, this.pos.y, this.missileSafeDistance * 2);
    } else {
      stroke(255, 200, 0, 145);
      circle(this.pos.x, this.pos.y, this.missileDetectionRadius * 2);
    }
    pop();
  }

  drawLockReticle() {
    push();
    translate(this.pos.x, this.pos.y);
    noFill();
    stroke(239, 68, 68, 220);
    strokeWeight(2);

    const size = this.r * 1.5;
    const corner = 7;

    // Coins du réticule de verrouillage
    line(-size, -size, -size + corner, -size);
    line(-size, -size, -size, -size + corner);

    line(size, -size, size - corner, -size);
    line(size, -size, size, -size + corner);

    line(-size, size, -size + corner, size);
    line(-size, size, -size, size - corner);

    line(size, size, size - corner, size);
    line(size, size, size, size - corner);
    pop();
  }
}
