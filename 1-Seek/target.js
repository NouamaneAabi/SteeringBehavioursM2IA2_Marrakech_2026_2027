class Target extends Vehicle {
  constructor(x, y, speedMultiplier = 1, forceMultiplier = 1) {
    super(x, y);

    // Rayon aléatoire entre 10 et 100 pixels
    this.r = random(10, 100);

    // Recaler la position initiale dans les limites du canvas
    this.pos.x = constrain(this.pos.x, this.r, Math.max(this.r, width - this.r));
    this.pos.y = constrain(this.pos.y, this.r, Math.max(this.r, height - this.r));

    // Multiplicateurs de vague (cibles progressivement plus fortes)
    this.speedMultiplier = speedMultiplier;
    this.forceMultiplier = forceMultiplier;

    // Direction aléatoire et vitesse aléatoire entre -7 et +7 (pondérée par la vague)
    const speed = random(-7, 7) * speedMultiplier;
    this.vel = p5.Vector.random2D();
    this.vel.mult(speed);

    // Paramètres initiaux mémorisés (vitesse et accélération de création)
    this.initialSpeed = this.vel.mag();
    this.baseMaxSpeed = this.initialSpeed;
    this.baseMaxForce = this.maxForce * forceMultiplier;
    this.maxSpeed = this.baseMaxSpeed;
    this.maxForce = this.baseMaxForce;

    // Paramètres de détection et de fuite temporaire
    this.detectionRadius = 100;
    this.safeDistance = 300;
    this.fleeMaxSpeed = 12 * speedMultiplier;
    this.fleeMaxForce = 0.8 * forceMultiplier;
    this.isFleeing = false;

    // Endurance : 2 s de fuite max, puis 1 s de régénération complète
    this.stamina = 1;
    this.staminaDrainDurationMs = 2000;
    this.staminaRegenDurationMs = 1000;
    this.isRegeneratingStamina = false;

    // Points de vie initiaux entre 5 et 10
    this.hp = Math.floor(random(5, 11));

    // Couleur aléatoire claire (lisible sur fond sombre)
    this.color = color(random(150, 255), random(150, 255), random(150, 255));
  }

  findClosestVehicle(vehicles) {
    let closest = null;
    let closestDistSq = Infinity;

    for (let i = 0; i < vehicles.length; i++) {
      const vehicle = vehicles[i];
      const dx = vehicle.pos.x - this.pos.x;
      const dy = vehicle.pos.y - this.pos.y;
      const distSq = dx * dx + dy * dy;
      if (distSq < closestDistSq) {
        closestDistSq = distSq;
        closest = vehicle;
      }
    }

    return { vehicle: closest, distSq: closestDistSq };
  }

  stopFleeing() {
    this.isFleeing = false;
    this.maxSpeed = this.baseMaxSpeed;
    this.maxForce = this.baseMaxForce;
    this.acc.set(0, 0);
    if (this.vel.magSq() > 0) {
      this.vel.setMag(this.initialSpeed);
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

  applyBehaviors(vehicles = [], fleeEnabled = false) {
    const dtMs = Math.min(typeof deltaTime === "number" ? deltaTime : 16.67, 100);

    if (!fleeEnabled || vehicles.length === 0) {
      if (this.isFleeing) {
        this.stopFleeing();
      }
      this.regenerateStamina(dtMs);
      return;
    }

    if (this.isRegeneratingStamina) {
      if (this.isFleeing) {
        this.stopFleeing();
      }
      this.regenerateStamina(dtMs);
      return;
    }

    const { vehicle: closestVehicle, distSq } = this.findClosestVehicle(vehicles);
    if (!closestVehicle) {
      this.stopFleeing();
      this.regenerateStamina(dtMs);
      return;
    }

    const detectDistSq = this.detectionRadius * this.detectionRadius;
    const safeDistSq = this.safeDistance * this.safeDistance;

    if (!this.isFleeing && distSq <= detectDistSq && this.stamina > 0) {
      this.isFleeing = true;
    } else if (this.isFleeing && distSq >= safeDistSq) {
      this.stopFleeing();
    }

    if (this.isFleeing) {
      this.stamina = Math.max(0, this.stamina - dtMs / this.staminaDrainDurationMs);
      if (this.stamina <= 0) {
        this.isRegeneratingStamina = true;
        this.stopFleeing();
        return;
      }

      this.maxSpeed = this.fleeMaxSpeed;
      this.maxForce = this.fleeMaxForce;
      const fleeForce = this.flee(closestVehicle.pos);
      this.applyForce(fleeForce);
    } else {
      this.regenerateStamina(dtMs);
    }
  }

  takeDamage(amount = 1) {
    this.hp = Math.max(0, this.hp - amount);
    if (this.hp <= 0) {
      return true;
    }
    this.respawn();
    return false;
  }

  respawn() {
    const minX = this.r;
    const maxX = Math.max(this.r, width - this.r);
    const minY = this.r;
    const maxY = Math.max(this.r, height - this.r);
    this.pos.set(random(minX, maxX), random(minY, maxY));
    this.stopFleeing();
    this.vel.limit(this.baseMaxSpeed);
  }

  edges() {
    if (this.pos.x + this.r > width) {
      this.pos.x = width - this.r;
      this.vel.x *= -1;
    } else if (this.pos.x - this.r < 0) {
      this.pos.x = this.r;
      this.vel.x *= -1;
    }

    if (this.pos.y + this.r > height) {
      this.pos.y = height - this.r;
      this.vel.y *= -1;
    } else if (this.pos.y - this.r < 0) {
      this.pos.y = this.r;
      this.vel.y *= -1;
    }
  }

  show() {
    push();
    fill(this.color);
    noStroke();
    circle(this.pos.x, this.pos.y, this.r * 2);
    pop();

    this.drawHealth();
    this.drawStaminaBar();

    if (Vehicle.debug) {
      this.drawTargetDetectionCircle();
    }
  }

  drawHealth() {
    push();
    const fontSize = constrain(this.r * 0.85, 12, 34);
    textSize(fontSize);
    textStyle(BOLD);
    textAlign(CENTER, CENTER);
    stroke(255, 255, 255, 160);
    strokeWeight(2);
    fill(18, 22, 32);
    text(String(this.hp), this.pos.x, this.pos.y);
    pop();
  }

  drawStaminaBar() {
    push();
    const barWidth = constrain(this.r * 1.4, 34, 90);
    const barHeight = 6;
    const barX = this.pos.x - barWidth / 2;
    const barY = this.pos.y - this.r - 14;

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

  drawTargetDetectionCircle() {
    push();
    noFill();
    strokeWeight(1.5);
    if (this.isFleeing) {
      stroke(255, 80, 80, 180);
      circle(this.pos.x, this.pos.y, this.detectionRadius * 2);
      stroke(255, 180, 0, 90);
      circle(this.pos.x, this.pos.y, this.safeDistance * 2);
    } else {
      stroke(255, 200, 0, 150);
      circle(this.pos.x, this.pos.y, this.detectionRadius * 2);
    }
    pop();
  }
}
