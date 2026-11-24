class TexteAnime extends Vehicle {
  constructor(x, y, text = "Marrakech EMSI", font = null) {
    super(x, y);

    this.text = text;
    this.font = font;
    this.fragments = [];
    this.sampleFactor = 0.14;
    this.fleeRadius = 40;
    this.pointRadius = 3.2;
    this.pointColor = "#fbbf24";

    this.rebuildFragments();
  }

  setFleeRadius(radius) {
    this.fleeRadius = radius;
    for (let i = 0; i < this.fragments.length; i++) {
      this.fragments[i].fleeRadius = radius;
    }
  }

  setPointRadius(radius) {
    this.pointRadius = radius;
    for (let i = 0; i < this.fragments.length; i++) {
      this.fragments[i].r = radius;
    }
  }

  setColor(col) {
    this.pointColor = col;
    for (let i = 0; i < this.fragments.length; i++) {
      this.fragments[i].setColor(col);
    }
  }

  setPosition(x, y) {
    this.pos.set(x, y);
    this.rebuildFragments();
  }

  setText(newText) {
    const cleaned = typeof newText === "string" ? newText : "";
    if (cleaned === this.text) {
      return;
    }
    this.text = cleaned;
    this.rebuildFragments();
  }

  setFont(newFont) {
    if (!newFont || newFont === this.font) {
      return;
    }
    this.font = newFont;
    this.rebuildFragments();
  }

  computePoints() {
    if (!this.font || !this.text || this.text.trim().length === 0) {
      return [];
    }

    const charCount = Math.max(4, this.text.length);
    const fontSize = constrain((width * 0.78) / (charCount * 0.62), 42, 130);
    const bounds = this.font.textBounds(this.text, 0, 0, fontSize);
    const startX = this.pos.x - (bounds.x + bounds.w * 0.5);
    const startY = this.pos.y - (bounds.y + bounds.h * 0.5);

    return this.font.textToPoints(this.text, startX, startY, fontSize, {
      sampleFactor: this.sampleFactor,
      simplifyThreshold: 0
    });
  }

  rebuildFragments() {
    const points = this.computePoints();
    const targetCount = points.length;
    const existingCount = this.fragments.length;

    // Réutiliser les fragments existants et faire naître les nouveaux depuis les points existants
    // (jamais depuis les bords de l'écran lors des mutations de texte)
    for (let i = 0; i < targetCount; i++) {
      const pt = points[i];
      if (i < existingCount) {
        this.fragments[i].setTarget(pt.x, pt.y);
      } else {
        const spawnX = existingCount > 0
          ? this.fragments[i % existingCount].pos.x + random(-4, 4)
          : this.pos.x + random(-40, 40);
        const spawnY = existingCount > 0
          ? this.fragments[i % existingCount].pos.y + random(-4, 4)
          : this.pos.y + random(-20, 20);

        const fragment = new TextFragment(
          spawnX,
          spawnY,
          pt.x,
          pt.y,
          this.pointRadius,
          this.pointColor
        );
        fragment.fleeRadius = this.fleeRadius;
        this.fragments.push(fragment);
      }
    }

    if (this.fragments.length > targetCount) {
      this.fragments.length = targetCount;
    }
  }

  applyBehaviors(repulsors = []) {
    for (let i = 0; i < this.fragments.length; i++) {
      this.fragments[i].applyBehaviors(repulsors);
    }
  }

  update() {
    for (let i = 0; i < this.fragments.length; i++) {
      this.fragments[i].update();
    }
  }

  show() {
    for (let i = 0; i < this.fragments.length; i++) {
      this.fragments[i].show();
    }
  }
}
