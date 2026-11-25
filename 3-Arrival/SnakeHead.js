class SnakeHead extends Vehicle {
  constructor(x, y) {
    super(x, y);
    this.r = SNAKE_STYLE.headRadius;
    this.maxSpeed = WORLD.snakeBaseMaxSpeed;
    this.maxForce = 0.28;
    this.hue = PALETTE.snakeHeadHue;
    this.invulnerableUntil = 0;
    this.lastTargetAngle = 0;
  }

  follow(target) {
    this.applyForce(this.arrive(target, 0));
  }

  show(targetPosition = null) {
    const speedRatio = constrain(this.vel.mag() / this.maxSpeed, 0, 1);
    const squash = lerp(SNAKE_STYLE.scaleMin, SNAKE_STYLE.scaleMax, speedRatio);
    const flashing = millis() < this.invulnerableUntil;
    const bodyHue = flashing ? 350 : this.hue;
    const flashPhase = flashing ? (sin(frameCount * 0.45) + 1) * 0.5 : 0;
    const targetAngle = targetPosition ? p5.Vector.sub(targetPosition, this.pos).heading() - this.vel.heading() : 0;
    this.lastTargetAngle = lerp(this.lastTargetAngle, targetAngle, 0.14);

    push();
    translate(this.pos.x, this.pos.y);
    rotate(this.vel.heading());
    scale(squash, 2 - squash);
    colorMode(HSB, 360, 100, 100, 100);

    noStroke();
    fill(bodyHue, 82, 100, 15 + flashPhase * 20);
    circle(0, 0, this.r * SNAKE_STYLE.headGlowScale);

    fill(bodyHue, 72, 84, 100);
    stroke(flashing ? 350 : 188, 68, 100, 100);
    strokeWeight(2.2);
    beginShape();
    vertex(this.r * 1.55, 0);
    vertex(this.r * 0.65, -this.r * 0.7);
    vertex(-this.r * 0.55, -this.r * 0.8);
    vertex(-this.r, -this.r * 0.38);
    vertex(-this.r * 0.92, 0);
    vertex(-this.r, this.r * 0.38);
    vertex(-this.r * 0.55, this.r * 0.8);
    vertex(this.r * 0.65, this.r * 0.7);
    endShape(CLOSE);

    noStroke();
    fill(PALETTE.crystal);
    circle(this.r * 0.64, -this.r * 0.42, 6);
    circle(this.r * 0.64, this.r * 0.42, 6);

    fill('#07101f');
    const pupilX = this.r * 0.66 + cos(this.lastTargetAngle) * 1.8;
    const pupilY = sin(this.lastTargetAngle) * 1.8;
    circle(pupilX, -this.r * 0.42 + pupilY, 2.4);
    circle(pupilX, this.r * 0.42 + pupilY, 2.4);

    const tongueWave = (sin(frameCount * SNAKE_STYLE.tongueSpeed) + 1) * 0.5;
    const tongueLength = SNAKE_STYLE.tongueMaxLength * (0.45 + tongueWave * 0.55);
    stroke(PALETTE.magenta);
    strokeWeight(1.7);
    line(this.r * 1.32, 0, this.r * 1.32 + tongueLength, 0);
    line(this.r * 1.32 + tongueLength, 0, this.r * 1.32 + tongueLength + 6, -4);
    line(this.r * 1.32 + tongueLength, 0, this.r * 1.32 + tongueLength + 6, 4);

    pop();
    colorMode(RGB, 255, 255, 255, 255);
  }
}
