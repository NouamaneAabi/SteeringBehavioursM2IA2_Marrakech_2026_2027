class AttackerPlane extends Plane {
  constructor(x, y) {
    super(x, y);

    this.bodyColor = color(96, 165, 250);
    this.strokeColor = color(224, 242, 254);

    // Radar de détection (400 px par défaut), délai de délock (5 s) et cadence de tir
    this.detectionRadius = 400;
    this.unlockDelayMs = 5000;
    this.missileFireDelayMs = 1000;
    this.missileReloadDelayMs = 2000;

    this.lockedTarget = null;
    this.targetInRange = false;
    this.outOfRangeTimerMs = 0;
    this.fireCountdownMs = this.missileFireDelayMs;
  }

  applyBehaviors() {
    // Seek uniquement tant que la cible est dans le cercle de détection
    if (this.lockedTarget && this.targetInRange) {
      const seekForce = this.seek(this.lockedTarget.pos);
      this.applyForce(seekForce);
    } else {
      super.applyBehaviors();
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

  findClosestTargetInRange(targetPlanes) {
    let closest = null;
    let closestDistSq = this.detectionRadius * this.detectionRadius;

    for (let i = 0; i < targetPlanes.length; i++) {
      const candidate = targetPlanes[i];
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

  updateLock(targetPlanes, dtMs, canFire = true) {
    const list = Array.isArray(targetPlanes)
      ? targetPlanes
      : targetPlanes
        ? [targetPlanes]
        : [];

    if (list.length === 0) {
      if (this.lockedTarget) {
        this.clearLock();
      }
      return null;
    }

    // Si la cible lockée a disparu, libérer le lock
    if (this.lockedTarget && !list.includes(this.lockedTarget)) {
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

    // Si aucun verrouillage actif, rechercher la cible la plus proche dans le cercle
    if (!this.lockedTarget) {
      const detected = this.findClosestTargetInRange(list);
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

    // Tir 1 s après le verrouillage, puis rechargement périodique (2 s) tant que la cible reste lockée
    // et que l'attaquant dispose d'au moins un emplacement de missile libre
    if (this.lockedTarget && this.fireCountdownMs <= 0) {
      if (canFire) {
        this.fireCountdownMs = this.missileReloadDelayMs;
        return this.lockedTarget;
      }
      this.fireCountdownMs = 0;
    }

    return null;
  }

  show() {
    super.show();

    if (Vehicle.debug) {
      this.drawDetectionDebug();
    }
  }

  drawDetectionDebug() {
    push();
    noFill();
    strokeWeight(1.5);
    stroke(this.lockedTarget ? color(239, 68, 68, 175) : color(56, 189, 248, 140));
    circle(this.pos.x, this.pos.y, this.detectionRadius * 2);

    if (this.lockedTarget) {
      stroke(239, 68, 68, 130);
      strokeWeight(1.5);
      line(this.pos.x, this.pos.y, this.lockedTarget.pos.x, this.lockedTarget.pos.y);

      if (this.outOfRangeTimerMs > 0) {
        const remainingSec = Math.max(0, (this.unlockDelayMs - this.outOfRangeTimerMs) / 1000);
        noStroke();
        fill(254, 202, 202);
        textSize(12);
        textAlign(CENTER, BOTTOM);
        text(
          `Délock : ${remainingSec.toFixed(1)}s`,
          (this.pos.x + this.lockedTarget.pos.x) * 0.5,
          (this.pos.y + this.lockedTarget.pos.y) * 0.5 - 6
        );
      }
    }
    pop();
  }
}
