class Vehicle {
  constructor(x, y) {
    // position du véhicule
    this.pos = createVector(x, y);
    // vitesse du véhicule
    this.vel = createVector(0, 0);
    // accélération du véhicule
    this.acc = createVector(0, 0);
    // vitesse maximale du véhicule
    this.maxSpeed = 4;
    // force maximale appliquée au véhicule
    this.maxForce = 0.1;
    // rayon du véhicule
    this.r = 16;
    this.hue = random(205, 260);
  }

  
  applyBehaviors(target) {
    let force = this.seek(target);
    this.applyForce(force);
  }

  // seek est un comportement qui permet de faire se rapprocher le véhicule de 
  // la cible passée en paramètre (un vecteur p5.Vector, par exemple la position de 
  // la souris)
  seek(target) {
 
    // on calcule la direction vers la cible : la vitesse DESIREE
    // C'est l'ETAPE 1 (action : se diriger vers une cible)
    let desiredSpeed = p5.Vector.sub(target, this.pos);

    // Dessous c'est l'ETAPE 2 : le pilotage (comment on se dirige vers la cible)
    // on limite ce vecteur à la longueur maxSpeed
    desiredSpeed.setMag(this.maxSpeed);

    // Si on s'arrête ici, force = desiredSpeed

    // on calcule maintenant LA FORMULE MAGIQUE : force = desiredSpeed - currentSpeed
    let force = p5.Vector.sub(desiredSpeed, this.vel);

    // et on limite cette force à la longueur maxForce
    force.limit(this.maxForce);

    return force;
  }

  // comportement de fuite, inverse de seek
  flee(target) {
    // inverse de seek !
    return this.seek(target).mult(-1);
  }

  // --------------------------------------------
  // LES DEUX METHODES SUIVANTES SONT INCHANGEES QUEL QUE SOIT LE COMPORTEMENT
  // --------------------------------------------
  // applyForce est une méthode qui permet d'appliquer une force au véhicule
  // en fait on additionne le vecteur force au vecteur accélération
  applyForce(force) {
    this.acc.add(force);
  }

  // appelée 60 fois par seconde par la boucle d'animation de p5 (la fonction draw 
  // dans sketch.js)
  update() {
    // on ajoute l'accélération à la vitesse. 
    // L'accélération est un incrément de vitesse
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
  show(debug = false, boosted = false) {
    // sauvegarde du contexte graphique (couleur pleine, fil de fer, 
    // épaisseur du trait, position et rotation du repère de référence)
    push();
    colorMode(HSB, 360, 100, 100, 100);
    noStroke();
    fill(this.hue, 75, 100, 20);
    circle(0, 0, this.r * 2.5);
    stroke(this.hue, 40, 100, 95);
    strokeWeight(2);
    fill(this.hue, 75, 100, 95);

    // on déplace le repère de référence.
    translate(this.pos.x, this.pos.y);
    // et on le tourne. heading() renvoie l'angle du vecteur vitesse 
    // (c'est l'angle du véhicule)
    rotate(this.vel.heading());

    //circle(0, 0, this.r * 2);

    // Dessin d'un véhicule sous la forme d'un triangle. Comme s'il était droit, 
    // avec le 0, 0 en haut à gauche
    triangle(-this.r, -this.r / 2, -this.r, this.r / 2, this.r, 0);

    noStroke();
    fill((this.hue + 35) % 360, 60, 100, 90);
    triangle(-this.r * 0.95, -this.r / 4, -this.r * 0.95, this.r / 4, -this.r * 1.8, 0);
    if (boosted) {
      fill(45, 80, 100, 95);
      triangle(-this.r * 1.8, -this.r / 5, -this.r * 1.8, this.r / 5, -this.r * 3.2, 0);
    }
    pop();
    colorMode(RGB, 255, 255, 255, 255);

    // dessin sous la forme d'une flèche du vecteur vitesse
    if (debug) {
      this.drawVelocityVector();
    }
  }

  drawVelocityVector() {
    push();

    // Dessin du vecteur vitesse
    // Il part du centre du véhicule et va dans la direction du vecteur vitesse
    strokeWeight(3);
    stroke("red");
    line(this.pos.x, this.pos.y, this.pos.x + this.vel.x * 10, this.pos.y + this.vel.y * 10);
    // dessine une petite fleche au bout du vecteur vitesse
    let arrowSize = 5;
    translate(this.pos.x + this.vel.x * 10, this.pos.y + this.vel.y * 10);
    rotate(this.vel.heading());
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
