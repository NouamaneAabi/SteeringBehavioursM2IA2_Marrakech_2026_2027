class Food extends Vehicle {
  constructor(x, y) {
    super(x, y);

    this.r = random(9, 13);
    this.maxSpeed = 1.6;
    this.maxForce = 0.04;

    this.driftAngle = random(TWO_PI);
    const initialSpeed = random(0.5, 1.3);
    this.vel = createVector(
      Math.cos(this.driftAngle) * initialSpeed,
      Math.sin(this.driftAngle) * initialSpeed
    );

    const palette = [
      [251, 146, 60],  // orange vif
      [244, 63, 94],   // rose-corail
      [163, 230, 53],  // vert pomme
      [250, 204, 21]   // jaune doré
    ];
    this.rgb = palette[Math.floor(random(palette.length))];
    this.pulseOffset = random(TWO_PI);
  }

  applyBehaviors() {
    this.driftAngle += random(-0.18, 0.18);
    const desired = createVector(
      Math.cos(this.driftAngle) * this.maxSpeed,
      Math.sin(this.driftAngle) * this.maxSpeed
    );
    const force = p5.Vector.sub(desired, this.vel);
    force.limit(this.maxForce);
    this.applyForce(force);
  }

  edges() {
    const margin = this.r + 12;
    if (this.pos.x > width - margin) {
      this.pos.x = width - margin;
      this.vel.x *= -1;
      this.driftAngle = this.vel.heading();
    } else if (this.pos.x < margin) {
      this.pos.x = margin;
      this.vel.x *= -1;
      this.driftAngle = this.vel.heading();
    }

    if (this.pos.y > height - margin) {
      this.pos.y = height - margin;
      this.vel.y *= -1;
      this.driftAngle = this.vel.heading();
    } else if (this.pos.y < margin) {
      this.pos.y = margin;
      this.vel.y *= -1;
      this.driftAngle = this.vel.heading();
    }
  }

  show() {
    const pulse = 1 + Math.sin(millis() * 0.006 + this.pulseOffset) * 0.14;
    const drawR = this.r * pulse;

    push();
    translate(this.pos.x, this.pos.y);

    // Halo externe doux
    noStroke();
    fill(this.rgb[0], this.rgb[1], this.rgb[2], 65);
    circle(0, 0, drawR * 3.1);

    // Fruit / orbe principal
    stroke(255, 255, 255, 200);
    strokeWeight(1.5);
    fill(this.rgb[0], this.rgb[1], this.rgb[2], 235);
    circle(0, 0, drawR * 2);

    // Reflet
    noStroke();
    fill(255, 255, 255, 190);
    circle(-drawR * 0.3, -drawR * 0.3, drawR * 0.45);
    pop();
  }
}
