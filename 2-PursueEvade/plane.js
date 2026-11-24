class Plane extends Vehicle {
  constructor(x, y) {
    super(x, y);

    this.r = 18;
    this.maxSpeed = 4.5;
    this.maxForce = 0.16;

    this.vel = p5.Vector.random2D();
    this.vel.setMag(this.maxSpeed);

    // Paramètres du comportement Wander pour un vol fluide
    this.wanderDistance = 90;
    this.wanderRadius = 40;
    this.wanderTheta = random(TWO_PI);
    this.displaceRange = 0.25;

    this.bodyColor = color(180, 210, 240);
    this.strokeColor = color(255);
  }

  wander() {
    const circleCenter = this.vel.copy();
    if (circleCenter.magSq() === 0) {
      circleCenter.set(1, 0);
    }
    circleCenter.setMag(this.wanderDistance);
    circleCenter.add(this.pos);

    this.wanderTheta += random(-this.displaceRange, this.displaceRange);
    const angle = this.vel.heading() + this.wanderTheta;

    const targetX = circleCenter.x + this.wanderRadius * Math.cos(angle);
    const targetY = circleCenter.y + this.wanderRadius * Math.sin(angle);
    return this.seek(createVector(targetX, targetY));
  }

  applyBehaviors() {
    const wanderForce = this.wander();
    this.applyForce(wanderForce);
  }

  drawPlaneShape(fillCol, strokeCol) {
    push();
    translate(this.pos.x, this.pos.y);
    rotate(this.vel.heading());

    stroke(strokeCol);
    strokeWeight(1.5);
    fill(fillCol);

    // Ailes principales en flèche
    beginShape();
    vertex(this.r * 1.15, 0);
    vertex(this.r * 0.2, -this.r * 0.22);
    vertex(-this.r * 0.35, -this.r * 1.05);
    vertex(-this.r * 0.65, -this.r * 0.95);
    vertex(-this.r * 0.35, -this.r * 0.22);
    vertex(-this.r * 0.95, -this.r * 0.14);
    vertex(-this.r * 1.15, -this.r * 0.48);
    vertex(-this.r * 1.28, -this.r * 0.42);
    vertex(-this.r * 1.05, 0);
    vertex(-this.r * 1.28, this.r * 0.42);
    vertex(-this.r * 1.15, this.r * 0.48);
    vertex(-this.r * 0.95, this.r * 0.14);
    vertex(-this.r * 0.35, this.r * 0.22);
    vertex(-this.r * 0.65, this.r * 0.95);
    vertex(-this.r * 0.35, this.r * 1.05);
    vertex(this.r * 0.2, this.r * 0.22);
    endShape(CLOSE);

    // Verrière du cockpit
    noStroke();
    fill(20, 30, 45, 210);
    ellipse(this.r * 0.38, 0, this.r * 0.55, this.r * 0.24);
    pop();
  }

  show() {
    this.drawPlaneShape(this.bodyColor, this.strokeColor);

    if (Vehicle.debug) {
      this.drawVector(this.pos, this.vel.copy().mult(10));
    }
  }
}
