class Food extends Vehicle {
  constructor(x, y, typeKey = 'normal', isOrb = false) {
    super(x, y);
    this.phase = random(TWO_PI);
    this.isOrb = isOrb;
    this.availableAt = 0;
    this.spawnedAt = millis();
    this.setType(typeKey);
  }

  setType(typeKey) {
    this.typeKey = CRYSTAL_TYPES[typeKey] ? typeKey : 'normal';
    this.type = CRYSTAL_TYPES[this.typeKey];
    this.growth = this.type.growth;
    this.points = this.type.points;
    this.r = this.isOrb ? WORLD.orbRadius : this.typeKey === 'gold' ? 12 : 10;
  }

  setOrb(x, y, value = WORLD.orbValue) {
    this.isOrb = true;
    this.value = value;
    this.pos.set(x, y);
    this.availableAt = millis();
    this.phase = random(TWO_PI);
    this.setType('normal');
  }

  setCrystal(x, y, typeKey = 'normal') {
    this.isOrb = false;
    this.pos.set(x, y);
    this.availableAt = millis();
    this.phase = random(TWO_PI);
    this.setType(typeKey);
  }

  update() {
    this.phase += this.isOrb ? 0.045 : 0.07;
  }

  respawn(forbiddenPosition = null, withCooldown = true) {
    const margin = ARENA.visibleMargin;
    let attempts = 0;
    do {
      this.pos.set(random(margin, arenaWidth - margin), random(margin, arenaHeight - margin));
      attempts += 1;
    } while (forbiddenPosition && p5.Vector.dist(this.pos, forbiddenPosition) < 180 && attempts < 80);
    this.availableAt = millis() + (withCooldown ? WORLD.orbRespawnDelay : 0);
    this.phase = random(TWO_PI);
  }

  isAvailable() { return millis() >= this.availableAt; }

  applyMagnet(targetPosition, strength) {
    this.pos.lerp(targetPosition, strength);
  }

  show() {
    if (!this.isAvailable()) return;
    const pulse = 1 + sin(this.phase) * (this.isOrb ? 0.12 : 0.16);
    const size = this.r * pulse;
    push();
    translate(this.pos.x, this.pos.y);
    colorMode(HSB, 360, 100, 100, 100);
    noStroke();
    fill(this.isOrb ? 45 : this.type.hue, 80, 100, this.isOrb ? 20 : 16);
    circle(0, 0, size * (this.isOrb ? 3.2 : 4.4));
    fill(this.isOrb ? 45 : this.type.hue, 78, 100, 100);
    if (this.isOrb) {
      circle(0, 0, size * 1.7);
      fill(255, 245, 215, 150);
      circle(-size * 0.3, -size * 0.3, size * 0.45);
    } else {
      stroke(this.type.hue, 65, 100, 92);
      strokeWeight(1.4);
      noFill();
      circle(0, 0, size * 2.5);
      fill(this.type.hue, 78, 100, 100);
      if (this.typeKey === 'violet') {
        circle(0, 0, size * 1.4);
        noFill(); stroke(280, 30, 100, 90);
        arc(0, 0, size * 2.4, size * 2.4, this.phase, this.phase + PI * 1.45);
      } else if (this.typeKey === 'blue') {
        rotate(QUARTER_PI); rectMode(CENTER); rect(0, 0, size * 1.5, size * 1.5, 3);
      } else if (this.typeKey === 'red') {
        beginShape(); vertex(0, -size * 1.25); vertex(size * 1.05, -size * 0.35); vertex(size * 0.7, size * 1.05); vertex(-size * 0.7, size * 1.05); vertex(-size * 1.05, -size * 0.35); endShape(CLOSE);
      } else {
        rotate(QUARTER_PI + this.phase * 0.2);
        beginShape(); vertex(0, -size * 1.2); vertex(size * 0.86, 0); vertex(0, size * 1.2); vertex(-size * 0.86, 0); endShape(CLOSE);
      }
      fill(255, 245, 215, 95); noStroke(); circle(-size * 0.28, -size * 0.3, 3);
    }
    pop();
    colorMode(RGB, 255, 255, 255, 255);
  }

  static pickType(difficultyKey) {
    const boost = CRYSTAL_SPECIAL_BOOST[difficultyKey] || 0;
    const entries = Object.entries(CRYSTAL_TYPES);
    let total = 0;
    for (const [key, type] of entries) total += key === 'normal' ? type.weight - boost * 100 : type.weight + boost * 25;
    let roll = random(total);
    for (const [key, type] of entries) {
      const weight = key === 'normal' ? type.weight - boost * 100 : type.weight + boost * 25;
      roll -= weight;
      if (roll <= 0) return key;
    }
    return 'normal';
  }
}
