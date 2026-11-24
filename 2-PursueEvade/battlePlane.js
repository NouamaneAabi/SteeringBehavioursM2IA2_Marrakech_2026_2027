class BattlePlane extends Plane {
  constructor(x, y, id = 1) {
    super(x, y);

    this.id = id;
    this.baseMaxSpeed = this.maxSpeed;
    this.baseMaxForce = this.maxForce;

    this.normalColor = color(96, 165, 250);
    this.lockedColor = color(239, 68, 68);
    this.evadeAltColor = color(34, 197, 94);
    this.winnerColor = color(250, 204, 21);
    this.bodyColor = this.normalColor;
    this.strokeColor = color(224, 242, 254);

    // Capacités d'attaquant (radar, lock, cadence de tir)
    this.detectionRadius = 400;
    this.unlockDelayMs = 5000;
    this.missileFireDelayMs = 1000;
    this.missileReloadDelayMs = 2000;

    this.lockedTarget = null;
    this.targetInRange = false;
    this.outOfRangeTimerMs = 0;
    this.fireCountdownMs = this.missileFireDelayMs;

    // Capacités de cible (verrouillé par d'autres avions)
    this.isLocked = false;
    this.lockedBy = null;
    this.lockedByAttackers = new Set();
    this.evadeDelayMs = 1000;
    this.lockElapsedMs = 0;
    this.isEvading = false;

    // Détection et fuite boostée face aux missiles ennemis
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

    this.isWinner = false;
  }

  setLocked(locked, attacker = null) {
    const wasLocked = this.isLocked;

    if (locked && attacker && attacker !== this) {
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
    } else if (!wasLocked) {
      this.lockElapsedMs = 0;
      this.isEvading = false;
    }
  }

  clearLock() {
    if (this.lockedTarget) {
      this.lockedTarget.setLocked(false, this);
    }
    this.lockedTarget = null;
    this.targetInRange = false;
    this.outOfRangeTimerMs = 0;
    this.fireCountdownMs = this.missileFireDelayMs;
  }

  findClosestTargetInRange(planes) {
    let closest = null;
    let closestDistSq = this.detectionRadius * this.detectionRadius;

    for (let i = 0; i < planes.length; i++) {
      const candidate = planes[i];
      if (candidate === this) {
        continue;
      }
      const dx = candidate.pos.x - this.pos.x;
      const dy = candidate.pos.y - this.pos.y;
      const distSq = dx * dx + dy * dy;
      if (distSq <= closestDistSq) {
        closestDistSq = distSq;
        closest = candidate;
      }
    }

    return closest;
  }

  updateLock(planes, dtMs, canFire = true) {
    if (planes.length <= 1) {
      if (this.lockedTarget) {
        this.clearLock();
      }
      return null;
    }

    if (this.lockedTarget && !planes.includes(this.lockedTarget)) {
      this.clearLock();
    }

    const detectDistSq = this.detectionRadius * this.detectionRadius;

    if (this.lockedTarget) {
      const dx = this.lockedTarget.pos.x - this.pos.x;
      const dy = this.lockedTarget.pos.y - this.pos.y;
      const distSq = dx * dx + dy * dy;

      if (distSq <= detectDistSq) {
        this.targetInRange = true;
        this.outOfRangeTimerMs = 0;
        this.fireCountdownMs -= dtMs;
        this.lockedTarget.setLocked(true, this);
      } else {
        this.targetInRange = false;
        this.fireCountdownMs -= dtMs;
        this.outOfRangeTimerMs += dtMs;
        if (this.outOfRangeTimerMs >= this.unlockDelayMs) {
          this.clearLock();
        }
      }
    }

    if (!this.lockedTarget) {
      const detected = this.findClosestTargetInRange(planes);
      if (detected) {
        this.lockedTarget = detected;
        this.targetInRange = true;
        this.outOfRangeTimerMs = 0;
        this.fireCountdownMs = this.missileFireDelayMs - dtMs;
        detected.setLocked(true, this);
      } else {
        this.targetInRange = false;
      }
    }

    if (this.lockedTarget && this.fireCountdownMs <= 0) {
      if (canFire) {
        this.fireCountdownMs = this.missileReloadDelayMs;
        return this.lockedTarget;
      }
      this.fireCountdownMs = 0;
    }

    return null;
  }

  getClosestLockingThreat() {
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

  findClosestEnemyMissile(missiles) {
    let closest = null;
    let closestDistSq = Infinity;

    for (let i = 0; i < missiles.length; i++) {
      const missile = missiles[i];
      if (missile.owner === this) {
        continue;
      }
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

  applyBehaviors(missiles = []) {
    const dtMs = Math.min(typeof deltaTime === "number" ? deltaTime : 16.67, 100);

    // Priorité 1 : fuite boostée face à un missile ennemi
    if (!this.isRegeneratingStamina && missiles.length > 0) {
      const { missile: closestMissile, distSq } = this.findClosestEnemyMissile(missiles);
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

    // Priorité 2 : évasion parfaite (evadePerfect) 1 s après avoir été locké
    if (this.isEvading) {
      const threat = this.getClosestLockingThreat();
      if (threat) {
        const evadeForce = this.evadePerfect(threat, false);
        this.applyForce(evadeForce);
        return;
      }
    }

    // Priorité 3 : poursuite (seek) tant que sa cible est dans son cercle de détection
    if (this.lockedTarget && this.targetInRange) {
      const seekForce = this.seek(this.lockedTarget.pos);
      this.applyForce(seekForce);
      return;
    }

    // Priorité 4 : patrouille autonome (wander)
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
    if (this.isWinner) {
      this.bodyColor = this.winnerColor;
    } else if (this.isEvading) {
      const blinkRed = Math.floor(millis() / 160) % 2 === 0;
      this.bodyColor = blinkRed ? this.lockedColor : this.evadeAltColor;
    } else if (this.isLocked) {
      this.bodyColor = this.lockedColor;
    } else {
      this.bodyColor = this.normalColor;
    }

    super.show();
    this.drawStaminaBar();
    this.drawPilotId();

    if (this.isWinner) {
      this.drawWinnerHalo();
    } else if (this.isLocked) {
      this.drawLockReticle();
    }

    if (Vehicle.debug) {
      this.drawDebugOverlays();
    }
  }

  drawPilotId() {
    push();
    noStroke();
    fill(255, 255, 255, 210);
    textSize(11);
    textStyle(BOLD);
    textAlign(CENTER, TOP);
    text(`#${this.id}`, this.pos.x, this.pos.y + this.r + 4);
    pop();
  }

  drawWinnerHalo() {
    push();
    noFill();
    stroke(250, 204, 21, 220);
    strokeWeight(2.5);
    const pulse = Math.sin(millis() * 0.008) * 5;
    circle(this.pos.x, this.pos.y, (this.r * 2.1 + pulse) * 2);
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

  drawLockReticle() {
    push();
    translate(this.pos.x, this.pos.y);
    noFill();
    stroke(239, 68, 68, 220);
    strokeWeight(2);

    const size = this.r * 1.5;
    const corner = 7;

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

  drawDebugOverlays() {
    push();
    noFill();
    strokeWeight(1.5);

    // Radar d'attaque
    stroke(this.lockedTarget ? color(239, 68, 68, 130) : color(56, 189, 248, 95));
    circle(this.pos.x, this.pos.y, this.detectionRadius * 2);

    if (this.lockedTarget) {
      stroke(239, 68, 68, 100);
      line(this.pos.x, this.pos.y, this.lockedTarget.pos.x, this.lockedTarget.pos.y);
    }

    // Détection missiles
    stroke(this.isFleeingMissile ? color(255, 80, 80, 190) : color(255, 200, 0, 120));
    circle(this.pos.x, this.pos.y, this.missileDetectionRadius * 2);
    pop();
  }
}
