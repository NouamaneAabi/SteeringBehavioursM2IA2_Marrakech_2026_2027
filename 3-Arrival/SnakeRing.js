class SnakeRing extends Vehicle {
  constructor(x, y, index) {
    super(x, y);
    this.index = index;
    this.r = max(SNAKE_STYLE.minRingRadius, SNAKE_STYLE.firstRingRadius - index * SNAKE_STYLE.ringTaper);
    this.maxSpeed = WORLD.snakeBaseMaxSpeed;
    this.maxForce = 0.48;
    this.hue = PALETTE.snakeHeadHue;
    this.growthStartedAt = millis();
    this.pulseStartedAt = 0;
  }

  follow(point) {
    this.applyForce(this.arrive(point, 0));
  }

  setStyle(index, total) {
    this.index = index;
    this.r = max(SNAKE_STYLE.minRingRadius, SNAKE_STYLE.firstRingRadius - index * SNAKE_STYLE.ringTaper);
    const amount = total <= 1 ? 0 : index / (total - 1);
    this.hue = lerp(PALETTE.snakeHeadHue, PALETTE.snakeTailHue, amount);
  }

  show() {
    const growthAmount = constrain((millis() - this.growthStartedAt) / SNAKE_STYLE.growthDuration, 0, 1);
    const growthScale = growthAmount < 1 ? easeOutBack(growthAmount) : 1;
    const pulseAge = this.pulseStartedAt > 0 ? millis() - this.pulseStartedAt - this.index * 32 : Infinity;
    const pulseAmount = pulseAge >= 0 && pulseAge < SNAKE_STYLE.pulseDuration
      ? 1 - pulseAge / SNAKE_STYLE.pulseDuration
      : 0;
    const radius = this.r * growthScale * (1 + pulseAmount * 0.16);

    push();
    translate(this.pos.x, this.pos.y);
    colorMode(HSB, 360, 100, 100, 100);

    noStroke();
    fill(this.hue, 80, 100, 12 + pulseAmount * 14);
    circle(0, 0, radius * SNAKE_STYLE.glowScale);

    fill(this.hue, 72, 78 + pulseAmount * 16, 100);
    stroke(this.hue, 62, 100, 100);
    strokeWeight(1.4);
    ellipse(0, 0, radius * 2.1, radius * 1.78);

    stroke(this.hue, 45, 100, 85);
    strokeWeight(1);
    noFill();
    beginShape();
    vertex(-radius * 0.7, -radius * 0.08);
    vertex(-radius * 0.12, -radius * 0.62);
    vertex(radius * 0.52, -radius * 0.08);
    vertex(radius * 0.08, radius * 0.56);
    endShape();
    arc(0, 0, radius * 1.3, radius * 1.3, 0.2, PI - 0.2);

    if (pulseAmount > 0) {
      noFill();
      stroke(PALETTE.crystal, pulseAmount * 100, 100);
      strokeWeight(2);
      circle(0, 0, radius * 2.8);
    }

    pop();
    colorMode(RGB, 255, 255, 255, 255);
  }
}

function easeOutBack(value) {
  const overshoot = 1.70158;
  const shifted = value - 1;
  return 1 + (overshoot + 1) * shifted * shifted * shifted + overshoot * shifted * shifted;
}
