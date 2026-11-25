class Particle extends Vehicle {
  constructor(x, y, hue, radius, life) {
    super(x, y);
    this.hue = hue % 360;
    this.radius = radius;
    this.life = life;
    this.maxLife = life;
    this.isStar = false;
    this.vel = createVector(0, 0);
  }

  update() {
    if (!this.isStar) {
      super.update();
      this.life -= 1;
    }
    this.phase = (this.phase || 0) + 0.08;
  }

  isDead() {
    return !this.isStar && this.life <= 0;
  }

  show() {
    const alpha = this.isStar ? 70 + sin(this.phase) * 25 : Math.max(0, (this.life / this.maxLife) * 100);
    push();
    colorMode(HSB, 360, 100, 100, 100);
    noStroke();
    fill(this.hue, 55, 100, alpha * 0.18);
    circle(this.pos.x, this.pos.y, this.radius * 4);
    fill(this.hue, 30, 100, alpha);
    circle(this.pos.x, this.pos.y, this.radius);
    pop();
    colorMode(RGB, 255, 255, 255, 255);
  }
}
