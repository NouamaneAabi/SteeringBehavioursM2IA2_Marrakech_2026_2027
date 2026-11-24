class Vehicle {
  static debug = false;

  constructor(x, y, image) {
    this.pos = createVector(x, y);
    this.vel = p5.Vector.random2D();
    this.maxSpeed = 6;
    this.vel.setMag(this.maxSpeed * 0.6);
    this.acc = createVector(0, 0);
    this.maxForce = 0.2;
    this.r = 32;

    // Sprite image du véhicule
    this.image = image;

    // Paramètres du comportement Wander (Craig Reynolds, GDC 1999)
    this.distanceCercle = 150;
    this.wanderRadius = 50;
    this.wanderTheta = random(TWO_PI);
    this.displaceRange = 0.3;

    // Traînée derrière les véhicules
    this.path = [];
    this.pathLength = 15;
    this.pathSpacingInFrames = 4;

    // Dernière force calculée (pour affichage debug)
    this.lastSteeringForce = createVector(0, 0);
  }

  applyBehaviors() {
    const wanderForce = this.wander();
    this.lastSteeringForce.set(wanderForce.x, wanderForce.y);
    this.applyForce(wanderForce);
  }

  wander() {
    // 1. Centre du cercle projeté à distanceCercle devant le vaisseau
    const forward = this.vel.magSq() > 1e-4
      ? this.vel.copy().normalize()
      : createVector(1, 0);
    const pointDevant = p5.Vector.mult(forward, this.distanceCercle).add(this.pos);

    // 2. Point cible sur le cercle de rayon wanderRadius
    const heading = this.vel.magSq() > 1e-4 ? this.vel.heading() : 0;
    const theta = this.wanderTheta + heading;
    const pointSurLeCercle = createVector(
      pointDevant.x + this.wanderRadius * Math.cos(theta),
      pointDevant.y + this.wanderRadius * Math.sin(theta)
    );

    // 3. Perturbation aléatoire bornée de l'angle pour la frame suivante
    this.wanderTheta += random(-this.displaceRange, this.displaceRange);

    // 4. Force de steering directe : vecteur du vaisseau vers le point sur le cercle, borné par maxForce
    const force = p5.Vector.sub(pointSurLeCercle, this.pos);
    force.limit(this.maxForce);

    if (Vehicle.debug) {
      this.drawWanderDebug(pointDevant, pointSurLeCercle, force);
    }

    return force;
  }

  drawWanderDebug(pointDevant, pointSurLeCercle, steeringForce) {
    push();

    // Ligne pointillée de distance vers le centre du cercle
    stroke(255, 255, 255, 110);
    strokeWeight(1.5);
    drawingContext.setLineDash([5, 8]);
    line(this.pos.x, this.pos.y, pointDevant.x, pointDevant.y);
    drawingContext.setLineDash([]);

    // Cercle de Wander
    noFill();
    stroke(255, 255, 255, 180);
    strokeWeight(1.5);
    circle(pointDevant.x, pointDevant.y, this.wanderRadius * 2);

    // Centre du cercle (rouge)
    noStroke();
    fill(239, 68, 68);
    circle(pointDevant.x, pointDevant.y, 8);

    // Rayon interne du cercle vers le point cible
    stroke(148, 163, 184, 180);
    strokeWeight(1);
    line(pointDevant.x, pointDevant.y, pointSurLeCercle.x, pointSurLeCercle.y);

    // Vecteur direction désirée (vaisseau -> point sur le cercle)
    stroke(250, 204, 21, 180);
    strokeWeight(1.5);
    line(this.pos.x, this.pos.y, pointSurLeCercle.x, pointSurLeCercle.y);

    // Point cible sur le cercle (vert)
    noStroke();
    fill(34, 197, 94);
    circle(pointSurLeCercle.x, pointSurLeCercle.y, 12);

    // Vecteur vitesse (cyan)
    this.drawArrow(this.pos, p5.Vector.mult(this.vel, 10), color(56, 189, 248));

    // Vecteur force de steering résultante (orange)
    this.drawArrow(this.pos, p5.Vector.mult(steeringForce, 180), color(251, 146, 60));

    pop();
  }

  drawArrow(base, vec, col) {
    if (vec.magSq() < 1e-3) {
      return;
    }
    push();
    stroke(col);
    strokeWeight(2.5);
    fill(col);
    translate(base.x, base.y);
    line(0, 0, vec.x, vec.y);
    rotate(vec.heading());
    const arrowSize = 6;
    translate(vec.mag() - arrowSize, 0);
    triangle(0, arrowSize * 0.5, 0, -arrowSize * 0.5, arrowSize, 0);
    pop();
  }

  evade(vehicle) {
    return this.pursue(vehicle).mult(-1);
  }

  pursue(vehicle) {
    const target = vehicle.pos.copy();
    const prediction = vehicle.vel.copy().mult(10);
    target.add(prediction);
    return this.seek(target);
  }

  arrive(target) {
    return this.seek(target, true);
  }

  flee(target) {
    return this.seek(target).mult(-1);
  }

  seek(target, arrival = false) {
    const force = p5.Vector.sub(target, this.pos);
    let desiredSpeed = this.maxSpeed;
    if (arrival) {
      const slowRadius = 100;
      const distance = force.mag();
      if (distance < slowRadius) {
        desiredSpeed = map(distance, 0, slowRadius, 0, this.maxSpeed);
      }
    }
    force.setMag(desiredSpeed);
    force.sub(this.vel);
    force.limit(this.maxForce);
    return force;
  }

  applyForce(force) {
    this.acc.add(force);
  }

  update() {
    this.vel.add(this.acc);
    this.vel.limit(this.maxSpeed);
    this.pos.add(this.vel);
    this.acc.set(0, 0);

    if (this.pathLength <= 0) {
      this.path.length = 0;
      return;
    }

    if (frameCount % this.pathSpacingInFrames === 0) {
      this.path.push(this.pos.copy());
    }
    while (this.path.length > this.pathLength) {
      this.path.shift();
    }
  }

  show() {
    // Traînée dégradée derrière le vaisseau
    if (this.path.length > 1) {
      push();
      const startColor = color(56, 189, 248);
      const endColor = color(239, 68, 68);
      for (let i = 0; i < this.path.length; i++) {
        const p = this.path[i];
        const t = i / (this.path.length - 1);
        const col = lerpColor(endColor, startColor, t);
        col.setAlpha(40 + t * 180);
        noStroke();
        fill(col);
        circle(p.x, p.y, 2.5 + t * 3.5);
      }
      pop();
    }

    // Sprite du vaisseau
    push();
    translate(this.pos.x, this.pos.y);
    rotate(this.vel.heading() - PI / 2);
    imageMode(CENTER);
    image(this.image, 0, 0, this.r * 2, this.r * 2);
    pop();
  }

  edges() {
    let wrapped = false;
    if (this.pos.x > width + this.r) {
      this.pos.x = -this.r;
      wrapped = true;
    } else if (this.pos.x < -this.r) {
      this.pos.x = width + this.r;
      wrapped = true;
    }
    if (this.pos.y > height + this.r) {
      this.pos.y = -this.r;
      wrapped = true;
    } else if (this.pos.y < -this.r) {
      this.pos.y = height + this.r;
      wrapped = true;
    }
    if (wrapped) {
      this.path.length = 0;
    }
  }
}
