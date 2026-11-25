class PowerUpManager {
  constructor() {
    this.active = new Map();
  }

  reset() {
    this.active.clear();
  }

  activate(type) {
    const config = POWERUPS[type];
    if (!config) return;
    const now = millis();
    this.active.set(type, { type, startedAt: now, expiresAt: now + config.duration });
  }

  update() {
    const now = millis();
    for (const [type, effect] of this.active) {
      if (now >= effect.expiresAt) this.active.delete(type);
    }
  }

  isActive(type) {
    return this.active.has(type);
  }

  remaining(type) {
    const effect = this.active.get(type);
    return effect ? Math.max(0, effect.expiresAt - millis()) : 0;
  }

  applyToPredators(predatorList) {
    const factor = this.isActive('slow') ? POWERUPS.slow.predatorFactor : 1;
    for (const predator of predatorList) predator.setSlowFactor(factor);
  }

  attractFoods(foodList, head) {
    if (!this.isActive('magnet')) return;
    const config = POWERUPS.magnet;
    for (const food of foodList) {
      if (p5.Vector.dist(food.pos, head.pos) < config.radius) food.applyMagnet(head.pos, config.strength);
    }
  }

  renderHud(container) {
    if (!container) return;
    container.html('');
    for (const [type] of this.active) {
      const config = POWERUPS[type];
      const item = createDiv();
      item.class('powerup-item');
      item.html('<span>' + config.icon + ' ' + config.label + '</span><i></i>');
      item.parent(container);
      const fill = item.elt.querySelector('i');
      fill.style.width = (this.remaining(type) / config.duration * 100) + '%';
    }
  }
}
