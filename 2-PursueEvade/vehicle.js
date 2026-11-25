class Vehicle {
  static debug = false;

  constructor(x, y) {
    // position du véhicule
    this.pos = createVector(x, y);
    // vitesse du véhicule
    this.vel = createVector(0, 0);
    // accélération du véhicule
    this.acc = createVector(0, 0);
    // vitesse maximale du véhicule
    this.maxSpeed = 10;
    // force maximale appliquée au véhicule
    this.maxForce = 0.25;
    // rayon du véhicule
    this.r = 16;
  }

  /*
   seek est une méthode qui permet de faire se rapprocher le véhicule de la cible passée en paramètre
   */
    seek(target) {
    // on calcule la direction vers la cible
    // C'est l'ETAPE 1 (action : se diriger vers une cible)
    let force = p5.Vector.sub(target, this.pos);

    // Dessous c'est l'ETAPE 2 : le pilotage (comment on se dirige vers la cible)
    // on limite ce vecteur à la longueur maxSpeed
    force.setMag(this.maxSpeed);
    // on calcule la force à appliquer pour atteindre la cible
    force.sub(this.vel);
    // on limite cette force à la longueur maxForce
    force.limit(this.maxForce);
    // on applique la force au véhicule
    return force;
  }

  // inverse de seek !
  flee(target, distanceDeDetection = Infinity) {
    return this.seek(target.pos, distanceDeDetection).mult(-1);
  }

  /* Poursuite d'un point devant la target !
     cette methode renvoie la force à appliquer au véhicule
  */
  pursue(target) {

    // On dessine le vecteur vitesse de la target
    this.drawVector(target.pos, target.vel.copy().mult(10));

    // TODO
    // 1 - calcul de la position future de la cible
    // on fait une copie de la vitesse de la target
    // (pour ne pas modifier la vitesse de la target)
    let targetAhead = target.vel.copy();

    // et on le multiplie par 10 (10 frames)
    // 2 - prediction dans 10 frames = 10 fois la longueur du vecteur
    // (on multiplie le vecteur vitesse par 10)
    // TODO
    targetAhead.mult(20);

    // 3 - on positionne  la target au bout de ce vecteur
    // (on ajoute ce vecteur à la position de la target)
    // TODO
    targetAhead.add(target.pos);

    // 4 -dessin du point devant la target
    fill("green");
    circle(targetAhead.x, targetAhead.y, 16); 

    // 6 - appel à seek avec ce point comme cible 
    let force = this.seek(targetAhead);

    // n'oubliez pas, on renvoie la force à appliquer au véhicule !
    return force;
  }

  /* inverse de pursue
     cette methode renvoie la force à appliquer au véhicule
  */
  evade(target) {
    // TODO : on inverse la logique de pursue
    let force = this.pursue(target).mult(-1);
    return force;
  }

  /**
   * Calcule le point d'interception parfait par la loi des sinus
   * (avec repli sécurisé pour éviter NaN lorsque les vecteurs sont colinéaires
   * ou lorsque la cible est plus rapide que le poursuiveur).
   */
  computePerfectInterceptionPoint(vehicle) {
    const targetSpeed = vehicle.vel.mag();
    if (targetSpeed < 1e-4 || this.maxSpeed < 1e-4) {
      return vehicle.pos.copy();
    }

    const toMe = p5.Vector.sub(this.pos, vehicle.pos);
    const dist = toMe.mag();
    if (dist < 1e-4) {
      return vehicle.pos.copy();
    }

    const speedRatio = targetSpeed / this.maxSpeed;
    const targetAngle = vehicle.vel.angleBetween(toMe);
    const sinMyAngle = Math.sin(targetAngle) * speedRatio;

    let prediction;
    if (Math.abs(sinMyAngle) < 1) {
      const myAngle = Math.asin(sinMyAngle);
      const denom = Math.sin(PI - myAngle - targetAngle);
      if (Math.abs(denom) > 1e-4) {
        prediction = (dist * Math.sin(myAngle)) / denom;
      } else {
        // Trajectoire colinéaire : estimation linéaire du temps d'interception
        prediction = (dist / (this.maxSpeed + targetSpeed)) * targetSpeed;
      }
    } else {
      // Cible plus rapide que le poursuiveur : anticipation bornée
      prediction = Math.min(dist * 0.75, targetSpeed * 15);
    }

    if (!Number.isFinite(prediction) || prediction < 0) {
      prediction = 0;
    } else {
      prediction = Math.min(prediction, dist * 2);
    }

    const interception = vehicle.vel.copy();
    interception.setMag(prediction);
    interception.add(vehicle.pos);
    return interception;
  }

  /**  Fonction de poursuite parfaite (avec le point devant la
  target qui se rapproche quand le poursuiveur se rapproche)
  */
  pursuePerfect(vehicle, showInterception = true) {
    const interception = this.computePerfectInterceptionPoint(vehicle);

    if (showInterception) {
      push();
      noFill();
      if (Vehicle.debug) {
        stroke(74, 222, 128, 75);
        strokeWeight(1.5);
        line(this.pos.x, this.pos.y, interception.x, interception.y);
      }

      stroke(250, 204, 21, 220);
      strokeWeight(1.5);
      circle(interception.x, interception.y, 14);
      line(interception.x - 9, interception.y, interception.x + 9, interception.y);
      line(interception.x, interception.y - 9, interception.x, interception.y + 9);

      noStroke();
      fill(74, 222, 128);
      circle(interception.x, interception.y, 5);
      pop();
    }

    if (Vehicle.debug) {
      drawArrow(vehicle.pos, p5.Vector.mult(vehicle.vel, 15), "red");
    }

    return this.seek(interception);
  }

  /**
   * Évasion parfaite : force opposée à pursuePerfect(vehicle).
   * Réutilisable par toute sous-classe de Vehicle.
   */
  evadePerfect(vehicle, showInterception = false) {
    return this.pursuePerfect(vehicle, showInterception).mult(-1);
  }


  // applyForce est une méthode qui permet d'appliquer une force au véhicule
  // en fait on additionne le vecteurr force au vecteur accélération
  applyForce(force) {
    this.acc.add(force);
  }

  update() {
    // on ajoute l'accélération à la vitesse. L'accélération est un incrément de vitesse
    // (accélératiion = dérivée de la vitesse)
    this.vel.add(this.acc);
    // on contraint la vitesse à la valeur maxSpeed
    this.vel.limit(this.maxSpeed);
    // on ajoute la vitesse à la position. La vitesse est un incrément de position, 
    // (la vitesse est la dérivée de la position)
    this.pos.add(this.vel);

    // on remet l'accélération à zéro
    this.acc.set(0, 0);
  }

  // On dessine le véhicule
  show() {
    // sauvegarde du contexte graphique (couleur pleine, fil de fer, épaisseur du trait,
    // position et rotation du repère de référence)
    push();
    stroke(255);
    strokeWeight(2);
    fill(255);

    translate(this.pos.x, this.pos.y);
    rotate(this.vel.heading());

    // Dessin d'un véhicule sous la forme d'un triangle
    triangle(-this.r, -this.r / 2, -this.r, this.r / 2, this.r, 0);
    pop();

    if (Vehicle.debug) {
      this.drawVector(this.pos, this.vel.copy().mult(10));
    }
  }

  drawVector(pos, v) {
    push();
    // Dessin du vecteur depuis pos comme origne
    strokeWeight(3);
    stroke("red");
    line(pos.x, pos.y, pos.x + v.x, pos.y + v.y);
    // dessine une petite fleche au bout du vecteur vitesse
    let arrowSize = 5;
    translate(pos.x + v.x , pos.y + v.y);
    rotate(v.heading());
    translate(-arrowSize / 2, 0);
    triangle(0, arrowSize / 2, 0, -arrowSize / 2, arrowSize, 0);
    pop();
  }

  // que fait cette méthode ?
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

// draw an arrow for a vector at a given base position
function drawArrow(base, vec, myColor) {
  push();
  stroke(myColor);
  strokeWeight(3);
  fill(myColor);
  translate(base.x, base.y);
  line(0, 0, vec.x, vec.y);
  rotate(vec.heading());
  let arrowSize = 7;
  translate(vec.mag() - arrowSize, 0);
  triangle(0, arrowSize / 2, 0, -arrowSize / 2, arrowSize, 0);
  pop();
}