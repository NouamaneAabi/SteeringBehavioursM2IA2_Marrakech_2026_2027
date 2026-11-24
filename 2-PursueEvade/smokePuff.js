class SmokePuff extends Vehicle {
  constructor(x, y, baseVel = null) {
    super(x, y);

    const angle = random(TWO_PI);
    const speed = random(0.6, 2.6);
    this.vel = createVector(Math.cos(angle) * speed, Math.sin(angle) * speed);
    if (baseVel) {
      this.vel.add(p5.Vector.mult(baseVel, 0.25));
    }

    this.initialRadius = random(5, 11);
    this.maxRadius = this.initialRadius * random(2.2, 3.4);
    this.r = this.initialRadius;

    this.maxSpeed = 3.2;
    this.maxForce = 0.08;

    this.durationMs = random(450, 750);
    this.elapsedMs = 0;

    // Dérive lente vers l'extérieur par steering
    const driftDist = random(25, 65);
    this.driftTarget = createVector(
      x + Math.cos(angle) * driftDist,
      y + Math.sin(angle) * driftDist
    );

    // Teintes de fumée gris-bleuté / blanc cassé (distinctes de l'explosion de feu)
    const shade = random(165, 225);
    this.rgb = [shade, shade + 8, Math.min(255, shade + 22)];
  }

  applyBehaviors() {
    const force = this.seek(this.driftTarget);
    this.applyForce(force);
  }

  update() {
    const dtMs = Math.min(typeof deltaTime === "number" ? deltaTime : 16.67, 100);
    this.elapsedMs += dtMs;
    super.update();
  }

  isFinished() {
    return this.elapsedMs >= this.durationMs;
  }

  show() {
    const progress = constrain(this.elapsedMs / this.durationMs, 0, 1);
    const currentRadius = lerp(this.initialRadius, this.maxRadius, progress);
    const alpha = (1 - progress) * 160;

    push();
    noStroke();
    fill(this.rgb[0], this.rgb[1], this.rgb[2], alpha);
    circle(this.pos.x, this.pos.y, currentRadius * 2);

    // Fin contour de dissipation sur les premières frames
    if (progress < 0.45) {
      noFill();
      stroke(148, 163, 184, (1 - progress / 0.45) * 140);
      strokeWeight(1.2);
      circle(this.pos.x, this.pos.y, currentRadius * 2.2);
    }
    pop();
  }
}
