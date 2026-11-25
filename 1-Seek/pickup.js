class Pickup extends Vehicle {
  constructor(x, y, index) {
    super(x, y);
    this.r = 11;
    this.hue = (index * 31 + 35) % 360;
    this.phase = random(TWO_PI);
    this.collected = false;
  }

  update() {
    this.phase += 0.06;
  }

  move() {
    super.update();
  }

  collect() {
    this.respawn();
  }

  respawn() {
    this.pos.set(random(70, width - 70), random(150, height - 70));
    this.phase = random(TWO_PI);
    this.hue = (this.hue + 47) % 360;
  }

  show() {
    const pulse = 1 + sin(this.phase) * 0.15;
    push();
    translate(this.pos.x, this.pos.y);
    colorMode(HSB, 360, 100, 100, 100);
    noStroke();
    fill(this.hue, 85, 100, 18);
    circle(0, 0, this.r * 3.4 * pulse);
    fill(this.hue, 75, 100, 95);
    rotate(QUARTER_PI + sin(this.phase) * 0.1);
    quad(0, -this.r * pulse, this.r * pulse, 0, 0, this.r * pulse, -this.r * pulse, 0);
    fill(0, 0, 100, 90);
    circle(0, 0, 4);
    pop();
    colorMode(RGB, 255, 255, 255, 255);
  }
}
