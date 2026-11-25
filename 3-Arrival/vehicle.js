class Vehicle {
  static debug = false;

  constructor(x, y) {
    this.pos = createVector(x, y);
    this.vel = createVector(0, 0);
    this.acc = createVector(0, 0);
    this.maxSpeed = 4;
    this.maxForce = 0.2;
    this.r = 16;
    this.rayonZoneDeFreinage = 100;

    // pour comportement wander
    // pour comportement wander
    this.distanceCercle = 150;
    this.wanderRadius = 50;
    this.wanderTheta = -Math.PI / 2;
    this.displaceRange = 0.3;

  }

  // Permet de rester dans les limites d'une zone rectangulaire.
  // Lorsque le vÃ©hicule s'approche d'un bord vertical ou horizontal
  // on calcule la vitesse dÃ©sirÃ©e dans la direction "rÃ©flÃ©chie" par
  // rapport au bord (comme au billard).
  // Par exemple, si le vÃ©hicule s'approche du bord gauche Ã  moins de 
  // 25 pixels (valeur par dÃ©faut de la variable d),
  // on calcule la vitesse dÃ©sirÃ©e en gardant le x du vecteur vitesse
  // et en mettant son y positif. x vaut maxSpeed et y vaut avant une valeur
  // nÃ©gative (puisque le vÃ©hicule va vers la gauche), on lui donne un y positif
  // Ã§a c'est pour la direction Ã  prendre (vitesse dÃ©sirÃ©e). Une fois la direction
  // calculÃ©e on lui donne une norme Ã©gale Ã  maxSpeed, puis on calcule la force
  // normalement : force = vitesseDesiree - vitesseActuelle
  // paramÃ¨tres = un rectangle (bx, by, bw, bh) et une distance d
  boundaries(bx, by, bw, bh, d) {
    let vitesseDesiree = null;

    const xBordGauche = bx + d;
    const xBordDroite = bx + bw - d;
    const yBordHaut = by + d;
    const yBordBas = by + bh - d;

    // si le vÃ©hicule est trop Ã  gauche ou trop Ã  droite
    if (this.pos.x < xBordGauche) {
      // 
      vitesseDesiree = createVector(this.maxSpeed, this.vel.y);
    } else if (this.pos.x > xBordDroite) {
      vitesseDesiree = createVector(-this.maxSpeed, this.vel.y);
    }

    if (this.pos.y < yBordHaut) {
      vitesseDesiree = createVector(this.vel.x, this.maxSpeed);
    } else if (this.pos.y > yBordBas) {
      vitesseDesiree = createVector(this.vel.x, -this.maxSpeed);
    }

    if (vitesseDesiree !== null) {
      vitesseDesiree.setMag(this.maxSpeed);
      const force = p5.Vector.sub(vitesseDesiree, this.vel);
      force.limit(this.maxForce);
      return vitesseDesiree;
    }

    if (Vehicle.debug) {
      // dessin du cadre de la zone
      push();

      noFill();
      stroke("white");
      strokeWeight(2);
      rect(bx, by, bw, bh);

      // et du rectangle intÃ©rieur avec une bordure rouge de d pixels
      stroke("red");
      rect(bx + d, by + d, bw - 2 * d, bh - 2 * d);

      pop();
    }

    // si on est pas prÃ¨s du bord (vitesse dÃ©sirÃ©e nulle), on renvoie un vecteur nul
    return createVector(0, 0);
  }

  
  wander() {
    // point devant le vÃ©hicule, centre du cercle
    let pointDevant = this.vel.copy();
    pointDevant.setMag(this.distanceCercle);
    pointDevant.add(this.pos);

    push();
    if (Vehicle.debug) {
      // on dessine le cercle en rouge
      // on le dessine sous la forme d'une petit cercle rouge
      fill("red");
      noStroke();
      circle(pointDevant.x, pointDevant.y, 8);

      // on dessine le cercle autour
      // Cercle autour du point
      noFill();
      stroke(255);
      circle(pointDevant.x, pointDevant.y, this.wanderRadius * 2);

      // on dessine une ligne qui relie le vaisseau Ã  ce point
      // c'est la ligne blanche en face du vaisseau
      strokeWeight(2);
      // ligne en pointillÃ©s
      stroke(255, 255, 255, 80);
      drawingContext.setLineDash([5, 15]);
      stroke(255, 255, 255, 80);
      line(this.pos.x, this.pos.y, pointDevant.x, pointDevant.y);

    }

    // On va s'occuper de calculer le point vert SUR LE CERCLE
    // il fait un angle wanderTheta avec le centre du cercle
    // l'angle final par rapport Ã  l'axe des X c'est l'angle du vaisseau
    // + cet angle
    let theta = this.wanderTheta + this.vel.heading();
    let pointSurLeCercle = createVector(0, 0);
    pointSurLeCercle.x = this.wanderRadius * cos(theta);
    pointSurLeCercle.y = this.wanderRadius * sin(theta);

    // on rajoute ces distances au point rouge au centre du cercle
    pointSurLeCercle.add(pointDevant);

    if (Vehicle.debug) {
      // on le dessine sous la forme d'un cercle vert
      fill("green");
      noStroke();
      circle(pointSurLeCercle.x, pointSurLeCercle.y, 16);

      // on dessine le vecteur qui va du centre du vaisseau
      // Ã  ce point vert sur le cercle
      stroke("yellow");
      strokeWeight(1);
      // pas en pointillÃ©s mais une ligne pleine
      drawingContext.setLineDash([]);
      line(this.pos.x, this.pos.y, pointSurLeCercle.x, pointSurLeCercle.y);
    }

    // entre chaque image on va dÃ©placer alÃ©atoirement
    // le point vert en changeant un peu son angle...
    this.wanderTheta += random(-this.displaceRange, this.displaceRange);

    // D'aprÃ¨s l'article, la force est Ã©gale au vecteur qui va du
    // centre du vaisseau, Ã  ce point vert. On va aussi la limiter
    // Ã  this.maxForce
    // REMPLACER LA LIGNE SUIVANTE !
    let force = p5.Vector.sub(pointSurLeCercle, this.pos);
    // On met la force Ã  maxForce
    force.setMag(this.maxForce);

    pop();

    // et on la renvoie au cas oÃ¹....
    return force;
  }

  evade(vehicle) {
    let pursuit = this.pursue(vehicle);
    pursuit.mult(-1);
    return pursuit;
  }

  pursue(vehicle) {
    let target = vehicle.pos.copy();
    let prediction = vehicle.vel.copy();
    prediction.mult(10);
    target.add(prediction);
    fill(0, 255, 0);
    circle(target.x, target.y, 16);
    return this.seek(target);
  }

  arrive(target, d=0) {
    // 2nd argument true enables the arrival behavior
    // 3rd argument d is the distance behind the target
    // for "snake" behavior
    return this.seek(target, true, d);
  }

  flee(target) {
    // recopier code de flee de l'exemple prÃ©cÃ©dent
  }

  seek(target, arrival = false, d=0) {
    let valueDesiredSpeed = this.maxSpeed;

    if (arrival) {
      // On dÃ©finit un rayon de 100 pixels autour de la cible
      // si la distance entre le vÃ©hicule courant et la cible
      // est infÃ©rieure Ã  ce rayon, on ralentit le vÃ©hicule
      // desiredSpeed devient inversement proportionnelle Ã  la distance
      // si la distance est petite, force = grande
      // Vous pourrez utiliser la fonction P5 
      // distance = map(valeur, valeurMin, valeurMax, nouvelleValeurMin, nouvelleValeurMax)
      // qui prend une valeur entre valeurMin et valeurMax et la transforme en une valeur
      // entre nouvelleValeurMin et nouvelleValeurMax

      // 1 - dessiner le cercle de rayon 100 autour de la target
      if (Vehicle.debug) {
        push();
        stroke(255, 255, 255);
        noFill();
        circle(target.x, target.y, this.rayonZoneDeFreinage);
        pop();
      }

      // 2 - calcul de la distance entre la cible et le vÃ©hicule
      let distance = p5.Vector.dist(this.pos, target);

      // 3 - si distance < rayon du cercle, alors on modifie desiredSPeed
      // qui devient inversement proportionnelle Ã  la distance.
      // si d = rayon alors desiredSpeed = maxSpeed
      // si d = 0 alors desiredSpeed = 0
      if (distance < this.rayonZoneDeFreinage) {
        valueDesiredSpeed = map(distance, d, this.rayonZoneDeFreinage, 0, this.maxSpeed);
      }
    }

    // Ici on calcule la force Ã  appliquer au vÃ©hicule
    // pour aller vers la cible (avec ou sans arrivÃ©e)
    // un vecteur qui va vers la cible, c'est pour le moment la vitesse dÃ©sirÃ©e
    let desiredSpeed = p5.Vector.sub(target, this.pos);
    desiredSpeed.setMag(valueDesiredSpeed);
   
    // Force = desiredSpeed - currentSpeed
    let force = p5.Vector.sub(desiredSpeed, this.vel);
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
  }

  show() {
    
    stroke(255);
    strokeWeight(2);
    fill(255);
    stroke(0);
    strokeWeight(2);
    push();
    translate(this.pos.x, this.pos.y);
    if(this.vel.mag() > 0.2)
      rotate(this.vel.heading());

    triangle(-this.r, -this.r / 2, -this.r, this.r / 2, this.r, 0);
    pop();
    /*
   push();
   // on dessine le vehicule comme un cercle
   fill("blue");
   stroke("white");
   strokeWeight(2);
   translate(this.pos.x, this.pos.y);
   circle(0, 0, this.r * 2);  
   pop();
   */
  }

  edges() {
    if (this.pos.x > width + this.r) {
      this.pos.x = -this.r;
    } else if (this.pos.x < -this.r) {
      this.pos.x = width + this.r;
    }
    if (this.pos.y > height + this.r) {
      this.pos.y = -this.r;
    } else if (this.pos.y < -this.r) {
      this.pos.y = height + this.r;
    }
  }
}

class Target extends Vehicle {
  constructor(x, y) {
    super(x, y);
    this.vel = p5.Vector.random2D();
    this.vel.mult(5);
  }

  show() {
    stroke(255);
    strokeWeight(2);
    fill("#F063A4");
    push();
    translate(this.pos.x, this.pos.y);
    circle(0, 0, this.r * 2);
    pop();
  }
}

/*
 * Extensions de steering utilisÃ©es par lâ€™Ã©tape 2.
 * Elles restent sur Vehicle afin que serpent, prÃ©dateurs et obstacles
 * partagent les mÃªmes rÃ¨gles de dÃ©placement.
 */
Vehicle.prototype.pursue = function (vehicle, prediction = 12) {
  this.predictedPosition = vehicle.pos.copy();
  if (vehicle.vel.magSq() > 0) this.predictedPosition.add(vehicle.vel.copy().setMag(prediction));
  return this.seek(this.predictedPosition);
};

Vehicle.prototype.separation = function (vehicles, desiredDistance = 90) {
  const force = createVector(0, 0);
  let neighbours = 0;
  for (const other of vehicles) {
    if (other === this) continue;
    const distance = p5.Vector.dist(this.pos, other.pos);
    if (distance > 0 && distance < desiredDistance) {
      const away = p5.Vector.sub(this.pos, other.pos);
      away.setMag(1 / distance);
      force.add(away);
      neighbours += 1;
    }
  }
  if (neighbours === 0) return force;
  force.div(neighbours);
  force.setMag(this.maxSpeed);
  force.sub(this.vel);
  force.limit(this.maxForce);
  this.separationForce = force.copy();
  return force;
};

Vehicle.prototype.avoidObstacles = function (obstacles, lookAhead = WORLD.obstacleLookAhead) {
  const force = createVector(0, 0);
  const direction = this.vel.magSq() > 0 ? this.vel.copy().normalize() : createVector(1, 0);
  const ahead = this.pos.copy().add(direction.mult(WORLD.obstacleLookAhead));
  this.avoidanceRadius = 0;

  for (const obstacle of obstacles) {
    const offset = p5.Vector.sub(ahead, obstacle.pos);
    const safeDistance = obstacle.r + this.r + WORLD.obstacleAvoidanceMargin;
    if (offset.mag() < safeDistance) {
      const strength = map(offset.mag(), 0, safeDistance, this.maxForce * 2.5, 0);
      offset.normalize().mult(strength);
      force.add(offset);
      this.avoidanceRadius = max(this.avoidanceRadius, safeDistance);
    }
  }

  force.limit(this.maxForce * 2.5);
  this.avoidanceForce = force.copy();
  return force;
};

Vehicle.prototype.boundaryAvoidance = function (margin = WORLD.boundaryMargin) {
  const force = createVector(0, 0);
  if (this.pos.x < margin) force.x += map(this.pos.x, 0, margin, this.maxForce * 2, 0);
  if (this.pos.x > width - margin) force.x -= map(width - this.pos.x, 0, margin, this.maxForce * 2, 0);
  if (this.pos.y < margin) force.y += map(this.pos.y, 0, margin, this.maxForce * 2, 0);
  if (this.pos.y > height - margin) force.y -= map(height - this.pos.y, 0, margin, this.maxForce * 2, 0);
  force.limit(this.maxForce * 2);
  this.boundaryForce = force.copy();
  return force;
};

Vehicle.prototype.drawSteeringDebug = function (detectionRadius = 0) {
  if (!Vehicle.debug) return;
  push();
  strokeWeight(2);
  stroke(255, 80, 80, 210);
  line(this.pos.x, this.pos.y, this.pos.x + this.vel.x * 16, this.pos.y + this.vel.y * 16);
  stroke(255, 220, 100, 210);
  line(this.pos.x, this.pos.y, this.pos.x + this.acc.x * 90, this.pos.y + this.acc.y * 90);
  if (detectionRadius > 0) {
    noFill();
    stroke(255, 70, 150, 120);
    circle(this.pos.x, this.pos.y, detectionRadius * 2);
  }
  if (this.predictedPosition) {
    stroke(120, 255, 160, 220);
    line(this.pos.x, this.pos.y, this.predictedPosition.x, this.predictedPosition.y);
    fill(120, 255, 160);
    noStroke();
    circle(this.predictedPosition.x, this.predictedPosition.y, 7);
  }
  if (this.avoidanceRadius > 0) {
    noFill();
    stroke(255, 150, 50, 140);
    circle(this.pos.x, this.pos.y, this.avoidanceRadius * 2);
  }
  pop();
};
