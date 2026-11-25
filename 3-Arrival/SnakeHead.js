class SnakeHead extends Vehicle {
  constructor(x, y, r = 20) {
    super(x, y);
    this.r = r;
    this.maxSpeed = 8;
    this.maxForce = 0.4;
    this.rayonZoneDeFreinage = 120;
    this.heading = 0;
    this.lookTarget = createVector(x + 1, y);

    // Cycle d'animation de la langue fourchue
    this.tongueCycleMs = 2800;
    this.tongueActiveMs = 750;
  }

  applyBehaviors(target) {
    if (!target) {
      return;
    }

    this.lookTarget.set(target.x, target.y);

    const dx = target.x - this.pos.x;
    const dy = target.y - this.pos.y;
    const distSq = dx * dx + dy * dy;

    // Zone morte à l'arrêt pour supprimer les micro-mouvements sur la cible
    if (distSq < 2.25 && this.vel.magSq() < 0.04) {
      this.vel.set(0, 0);
      this.acc.set(0, 0);
      return;
    }

    const force = this.arrive(target, 0);
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

  drawForkedTongue() {
    const phase = millis() % this.tongueCycleMs;
    if (phase > this.tongueActiveMs) {
      return;
    }

    const progress = phase / this.tongueActiveMs;
    const extension = Math.sin(progress * PI);
    const baseLen = this.r * 0.95;
    const tongueLen = baseLen + extension * this.r * 0.95;
    const wiggle = Math.sin(millis() * 0.035) * 3.5 * extension;
    const forkLen = 7 * extension;

    push();
    stroke(244, 63, 94);
    strokeWeight(2.4);
    strokeCap(ROUND);
    noFill();

    const tipX = tongueLen;
    const tipY = wiggle;
    line(this.r * 0.75, 0, tipX, tipY);
    line(tipX, tipY, tipX + forkLen, tipY - forkLen * 0.85);
    line(tipX, tipY, tipX + forkLen, tipY + forkLen * 0.85);
    pop();
  }

  drawEyes() {
    const eyeForward = this.r * 0.28;
    const eyeSide = this.r * 0.48;
    const eyeRadius = this.r * 0.3;
    const pupilRadius = eyeRadius * 0.52;

    const worldLookAngle = Math.atan2(
      this.lookTarget.y - this.pos.y,
      this.lookTarget.x - this.pos.x
    );
    const localLookAngle = worldLookAngle - this.heading;
    const pupilOffset = eyeRadius - pupilRadius - 1;
    const px = Math.cos(localLookAngle) * pupilOffset;
    const py = Math.sin(localLookAngle) * pupilOffset;

    const eyeOffsets = [-eyeSide, eyeSide];
    for (let i = 0; i < eyeOffsets.length; i++) {
      const ey = eyeOffsets[i];

      // Sclère blanche
      noStroke();
      fill(255);
      circle(eyeForward, ey, eyeRadius * 2);

      // Pupille orientée vers la souris
      fill(15, 23, 42);
      circle(eyeForward + px, ey + py, pupilRadius * 2);

      // Reflet lumineux
      fill(255, 255, 255, 210);
      circle(eyeForward + px - 1.2, ey + py - 1.2, pupilRadius * 0.55);
    }
  }

  show() {
    push();
    translate(this.pos.x, this.pos.y);
    rotate(this.heading);

    // Langue fourchue sous la tête
    this.drawForkedTongue();

    // Tête légèrement ovale orientée dans le sens de marche
    stroke(167, 243, 208, 220);
    strokeWeight(2);
    fill(20, 184, 166);
    ellipse(this.r * 0.12, 0, this.r * 2.3, this.r * 1.9);

    // Yeux qui suivent la souris
    this.drawEyes();
    pop();

    if (Vehicle.debug) {
      push();
      stroke(255, 80, 80, 180);
      strokeWeight(2);
      line(
        this.pos.x,
        this.pos.y,
        this.pos.x + this.vel.x * 8,
        this.pos.y + this.vel.y * 8
      );
      pop();
    }
  }
}
