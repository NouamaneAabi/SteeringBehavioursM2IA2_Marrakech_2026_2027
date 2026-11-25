class Obstacle extends Vehicle {
  constructor(x, y, radius) {
    super(x, y);
    this.r = radius;
    this.phase = random(TWO_PI);
    this.vertices = [];
    this.highlightIndex = floor(random(8));
    const sides = 8;
    for (let index = 0; index < sides; index += 1) {
      const angle = (TWO_PI * index) / sides;
      const variation = random(0.86, 1.1);
      this.vertices.push(createVector(cos(angle) * radius * variation, sin(angle) * radius * variation));
    }
  }

  show() {
    push();
    translate(this.pos.x, this.pos.y);

    noStroke();
    fill(10, 18, 38, 34);
    circle(3, 5, this.r * 2.35);

    const gradient = drawingContext.createRadialGradient(-this.r * 0.35, -this.r * 0.45, 1, 0, 0, this.r * 1.35);
    gradient.addColorStop(0, 'rgba(77, 126, 180, 0.95)');
    gradient.addColorStop(0.65, 'rgba(28, 52, 86, 0.98)');
    gradient.addColorStop(1, 'rgba(10, 20, 42, 1)');
    drawingContext.fillStyle = gradient;
    beginShape();
    for (const point of this.vertices) vertex(point.x, point.y);
    endShape(CLOSE);

    stroke(PALETTE.rockEdge);
    strokeWeight(1.2);
    noFill();
    beginShape();
    for (const point of this.vertices) vertex(point.x, point.y);
    endShape(CLOSE);

    stroke(PALETTE.cyan);
    strokeWeight(2);
    const edge = this.vertices[this.highlightIndex % this.vertices.length];
    const next = this.vertices[(this.highlightIndex + 1) % this.vertices.length];
    line(edge.x, edge.y, next.x, next.y);

    noStroke();
    fill(114, 231, 255, 90);
    circle(-this.r * 0.28, -this.r * 0.32, max(2, this.r * 0.16));
    pop();

    if (Vehicle.debug) {
      push();
      noFill();
      stroke(255, 150, 50, 130);
      circle(this.pos.x, this.pos.y, (this.r + WORLD.obstacleAvoidanceMargin) * 2);
      pop();
    }
  }
}
