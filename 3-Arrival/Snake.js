class Snake extends Vehicle {
  constructor(x, y, ringCount = 30) {
    super(x, y);
    this.spacing = SNAKE_STYLE.ringSpacing;
    this.waveAmplitude = 7;
    this.waveFrequency = 0.09;
    this.waveLength = 0.62;
    this.ringCount = 0;
    this.targetRingCount = 0;
    this.nextGrowthFrame = 0;
    this.pulseStartedAt = 0;
    this.head = new SnakeHead(x, y);
    this.rings = [];
    this.path = [];
    this.setRingCount(ringCount);
    this.initializePath();
  }

  initializePath() {
    this.path = [];
    for (let index = 0; index < this.ringCount * 12 + 60; index += 1) {
      this.path.push(createVector(this.head.pos.x - index * this.spacing, this.head.pos.y));
    }
  }

  setRingCount(ringCount) {
    const count = Math.max(1, Math.floor(ringCount));
    const oldRings = this.rings;
    this.rings = [];
    this.ringCount = count;
    this.targetRingCount = count;

    for (let index = 0; index < count; index += 1) {
      const previous = index === 0 ? this.head : this.rings[index - 1];
      const direction = previous.vel.magSq() > 0 ? previous.vel.copy().normalize() : createVector(1, 0);
      const position = previous.pos.copy().sub(direction.mult(this.spacing));
      const ring = oldRings[index] || new SnakeRing(position.x, position.y, index);
      ring.index = index;
      ring.setStyle(index, count);
      ring.pos.set(position.x, position.y);
      ring.vel.set(0, 0);
      this.rings.push(ring);
    }
    if (this.path.length > 0) {
      this.initializePath();
    }
  }

  grow(amount = 1) {
    this.targetRingCount += Math.max(1, Math.floor(amount));
    this.pulseStartedAt = millis();
  }

  addRing() {
    const index = this.rings.length;
    const point = this.getPathPoint((index + 1) * this.spacing);
    const ring = new SnakeRing(point.x, point.y, index);
    ring.setStyle(index, this.targetRingCount);
    ring.pulseStartedAt = this.pulseStartedAt;
    this.rings.push(ring);
    this.ringCount = this.rings.length;
  }
  removeRings(amount = 1) {
    const nextCount = Math.max(0, this.ringCount - Math.max(1, Math.floor(amount)));
    this.rings = this.rings.slice(0, nextCount);
    this.ringCount = this.rings.length;
    this.targetRingCount = this.ringCount;
  }

  update(target, obstacles = []) {
    this.head.boundaryHit = false;
    if (this.ringCount < this.targetRingCount && frameCount >= this.nextGrowthFrame) {
      this.addRing();
      this.nextGrowthFrame = frameCount + 5;
    }
    this.head.follow(target);
    this.head.rayonZoneDeFreinage = game ? game.difficulty.arrivalRadius : 125;
    this.head.applyForce(this.head.avoidObstacles(obstacles).mult(WEIGHTS.obstacleAvoidance));
    this.head.applyForce(this.head.boundaryAvoidance().mult(WEIGHTS.boundaryAvoidance));
    this.head.update();
    this.head.drawSteeringDebug();
    this.keepInside(this.head);
    this.path.unshift(this.head.pos.copy());
    this.path = this.path.slice(0, this.ringCount * 14 + 80);

    for (let index = 0; index < this.rings.length; index += 1) {
      const ring = this.rings[index];
      const distanceBack = (index + 1) * this.spacing;
      const followPoint = this.getPathPoint(distanceBack);
      const tangent = this.getPathTangent(distanceBack);
      const normal = createVector(-tangent.y, tangent.x);
      const wave = sin(frameCount * this.waveFrequency - index * this.waveLength);
      followPoint.add(normal.mult(wave * this.waveAmplitude));
      ring.follow(followPoint);
      ring.pulseStartedAt = this.pulseStartedAt;
      ring.applyForce(ring.avoidObstacles(obstacles).mult(WEIGHTS.obstacleAvoidance));
      ring.update();
      ring.pos.lerp(followPoint, 0.78);
      ring.vel = p5.Vector.sub(followPoint, ring.pos);
      ring.vel.limit(ring.maxSpeed);
      this.keepInside(ring);
    }
  }

  keepInside(vehicle) {
    const margin = vehicle.r + 4;
    const worldWidth = typeof arenaWidth === 'number' ? arenaWidth : width;
    const worldHeight = typeof arenaHeight === 'number' ? arenaHeight : height;
    if (vehicle.pos.x < margin) {
      vehicle.boundaryHit = true;
      vehicle.pos.x = margin;
      vehicle.vel.x = Math.abs(vehicle.vel.x);
    } else if (vehicle.pos.x > worldWidth - margin) {
      vehicle.boundaryHit = true;
      vehicle.pos.x = worldWidth - margin;
      vehicle.vel.x = -Math.abs(vehicle.vel.x);
    }
    if (vehicle.pos.y < margin) {
      vehicle.boundaryHit = true;
      vehicle.pos.y = margin;
      vehicle.vel.y = Math.abs(vehicle.vel.y);
    } else if (vehicle.pos.y > worldHeight - margin) {
      vehicle.boundaryHit = true;
      vehicle.pos.y = worldHeight - margin;
      vehicle.vel.y = -Math.abs(vehicle.vel.y);
    }
  }

  getPathPoint(distanceBack) {
    let travelled = 0;
    for (let index = 1; index < this.path.length; index += 1) {
      const current = this.path[index - 1];
      const previous = this.path[index];
      const segmentLength = p5.Vector.dist(current, previous);
      if (travelled + segmentLength >= distanceBack && segmentLength > 0) {
        const amount = (distanceBack - travelled) / segmentLength;
        return p5.Vector.lerp(current, previous, amount);
      }
      travelled += segmentLength;
    }
    return this.path[this.path.length - 1].copy();
  }

  getPathTangent(distanceBack) {
    const before = this.getPathPoint(Math.max(0, distanceBack - 5));
    const after = this.getPathPoint(distanceBack + 5);
    const tangent = p5.Vector.sub(after, before);
    if (tangent.magSq() === 0) return createVector(1, 0);
    return tangent.normalize();
  }

  show(target = null) {
    push();
    noFill();
    stroke(114, 231, 255, SNAKE_STYLE.trailAlpha);
    strokeWeight(SNAKE_STYLE.trailWeight);
    beginShape();
    vertex(this.head.pos.x, this.head.pos.y);
    for (const ring of this.rings) {
      vertex(ring.pos.x, ring.pos.y);
    }
    endShape();
    if (Vehicle.debug) {
      stroke(255, 230, 130, 100);
      strokeWeight(1);
      for (let index = 0; index < this.rings.length; index += 1) {
        const point = this.getPathPoint((index + 1) * this.spacing);
        circle(point.x, point.y, 5);
      }
    }
    pop();

    for (const ring of this.rings) {
      ring.show();
    }
    this.head.show(target);
  }
}
