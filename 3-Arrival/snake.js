class Snake extends Vehicle {
  constructor(x, y, ringCount = 30, shaderTexture = null) {
    super(x, y);

    this.headRadius = 22;
    this.tailRadius = 4;

    this.head = new SnakeHead(x, y, this.headRadius);
    this.rings = [];

    this.ringMaxSpeed = 10;
    this.ringMaxForce = 2;

    this.shaderTexture = shaderTexture;
    this.scalesPattern = this.createScalesPattern();
    this.setRingCount(ringCount);
  }

  createScalesPattern() {
    // Texture procédurale d'écailles pré-calculée une seule fois hors écran
    const tile = createGraphics(36, 36);
    tile.clear();
    tile.noFill();

    const w = tile.width;
    const h = tile.height;
    const cols = 2;
    const rows = 2;
    const cellW = w / cols;
    const cellH = h / rows;

    for (let row = 0; row <= rows; row++) {
      const offsetX = (row % 2) * (cellW * 0.5);
      for (let col = -1; col <= cols; col++) {
        const cx = col * cellW + offsetX;
        const cy = row * cellH;

        tile.fill(20, 184, 166, 75);
        tile.stroke(167, 243, 208, 125);
        tile.strokeWeight(1.2);
        tile.arc(cx, cy, cellW * 1.05, cellH * 1.15, 0, PI, CHORD);

        tile.noFill();
        tile.stroke(15, 118, 110, 95);
        tile.strokeWeight(1);
        tile.arc(cx, cy, cellW * 0.72, cellH * 0.78, 0.15, PI - 0.15);
      }
    }

    return drawingContext.createPattern(tile.elt, "repeat");
  }

  setRingCount(count) {
    const targetCount = Math.max(1, Math.floor(count));

    while (this.rings.length < targetCount) {
      const previous = this.rings.length === 0
        ? this.head
        : this.rings[this.rings.length - 1];
      const ring = new SnakeRing(previous.pos.x - 16, previous.pos.y, this.tailRadius);
      ring.maxSpeed = this.ringMaxSpeed;
      ring.maxForce = this.ringMaxForce;
      ring.heading = previous.heading;
      this.rings.push(ring);
    }

    if (this.rings.length > targetCount) {
      this.rings.length = targetCount;
    }

    this.updateRingRadii();
  }

  grow(amount = 1) {
    this.setRingCount(this.rings.length + amount);
  }

  removeRingAt(index) {
    if (index < 0 || index >= this.rings.length) {
      return false;
    }
    this.rings.splice(index, 1);
    this.updateRingRadii();
    return true;
  }

  updateRingRadii() {
    const total = this.rings.length;
    for (let i = 0; i < total; i++) {
      const t = (i + 1) / total;
      this.rings[i].r = lerp(this.headRadius * 0.9, this.tailRadius, t);
    }
  }

  setHeadParams(maxSpeed, maxForce) {
    this.head.maxSpeed = maxSpeed;
    this.head.maxForce = maxForce;
  }

  setRingParams(maxSpeed, maxForce) {
    this.ringMaxSpeed = maxSpeed;
    this.ringMaxForce = maxForce;
    for (let i = 0; i < this.rings.length; i++) {
      this.rings[i].maxSpeed = maxSpeed;
      this.rings[i].maxForce = maxForce;
    }
  }

  applyBehaviors(target) {
    // Mise à jour séquentielle : chaque maillon suit la position à jour du maillon précédent
    this.head.applyBehaviors(target);
    this.head.update();

    for (let i = 0; i < this.rings.length; i++) {
      const leader = i === 0 ? this.head : this.rings[i - 1];
      const ring = this.rings[i];
      const gap = (leader.r + ring.r) * 0.7;
      ring.applyBehaviors(leader, gap);
      ring.update();
    }
  }

  update() {
    this.pos.set(this.head.pos.x, this.head.pos.y);
  }

  buildSmoothBodyContour() {
    const nodes = [this.head, ...this.rings];
    const count = nodes.length;
    if (count < 2) {
      return null;
    }

    const leftPts = [];
    const rightPts = [];

    for (let i = 0; i < count; i++) {
      const curr = nodes[i];
      let tx = 0;
      let ty = 0;

      if (i === 0) {
        tx = curr.pos.x - nodes[1].pos.x;
        ty = curr.pos.y - nodes[1].pos.y;
      } else if (i === count - 1) {
        tx = nodes[i - 1].pos.x - curr.pos.x;
        ty = nodes[i - 1].pos.y - curr.pos.y;
      } else {
        tx = nodes[i - 1].pos.x - nodes[i + 1].pos.x;
        ty = nodes[i - 1].pos.y - nodes[i + 1].pos.y;
      }

      const len = Math.hypot(tx, ty);
      if (len > 1e-4) {
        tx /= len;
        ty /= len;
      } else {
        const angle = typeof curr.heading === "number" ? curr.heading : 0;
        tx = Math.cos(angle);
        ty = Math.sin(angle);
      }

      const nx = -ty;
      const ny = tx;
      leftPts.push({ x: curr.pos.x + nx * curr.r, y: curr.pos.y + ny * curr.r });
      rightPts.push({ x: curr.pos.x - nx * curr.r, y: curr.pos.y - ny * curr.r });
    }

    // Contour fermé dans le sens horaire : tête -> flanc gauche -> queue -> flanc droit
    const outline = [...leftPts];
    for (let i = rightPts.length - 1; i >= 0; i--) {
      outline.push(rightPts[i]);
    }
    return outline;
  }

  traceSmoothClosedPath(ctx, points) {
    const n = points.length;
    if (n < 3) {
      return;
    }

    const firstMidX = (points[n - 1].x + points[0].x) * 0.5;
    const firstMidY = (points[n - 1].y + points[0].y) * 0.5;

    ctx.beginPath();
    ctx.moveTo(firstMidX, firstMidY);
    for (let i = 0; i < n; i++) {
      const curr = points[i];
      const next = points[(i + 1) % n];
      const midX = (curr.x + next.x) * 0.5;
      const midY = (curr.y + next.y) * 0.5;
      ctx.quadraticCurveTo(curr.x, curr.y, midX, midY);
    }
    ctx.closePath();
  }

  drawBodySurface() {
    const outline = this.buildSmoothBodyContour();
    if (!outline) {
      return;
    }

    const ctx = drawingContext;
    push();
    ctx.save();

    this.traceSmoothClosedPath(ctx, outline);

    // Remplissage semi-transparent du corps
    ctx.fillStyle = "rgba(13, 148, 136, 0.35)";
    ctx.fill();

    // Application du shader animé (ou motif d'écailles en repli) à l'intérieur du contour
    const patternSource = this.shaderTexture ? this.shaderTexture.getCanvasElement() : null;
    const fillPattern = patternSource
      ? ctx.createPattern(patternSource, "repeat")
      : this.scalesPattern;

    if (fillPattern) {
      ctx.save();
      ctx.clip();
      ctx.fillStyle = fillPattern;
      ctx.fillRect(0, 0, width, height);
      ctx.restore();
    }

    // Contour lisse semi-transparent
    ctx.strokeStyle = "rgba(167, 243, 208, 0.72)";
    ctx.lineWidth = 2;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.stroke();

    ctx.restore();
    pop();
  }

  drawConnectorLines() {
    push();
    stroke(255, 255, 255, 70);
    strokeWeight(1.5);

    let prev = this.head;
    for (let i = 0; i < this.rings.length; i++) {
      const current = this.rings[i];
      line(prev.pos.x, prev.pos.y, current.pos.x, current.pos.y);
      prev = current;
    }
    pop();
  }

  show() {
    // 1. Squelette semi-transparent (lignes + anneaux) visible en transparence
    this.drawConnectorLines();
    for (let i = this.rings.length - 1; i >= 0; i--) {
      this.rings[i].show();
    }

    // 2. Enveloppe lisse semi-transparente avec texture d'écailles
    this.drawBodySurface();

    // 3. Tête au premier plan
    this.head.show();
  }
}
