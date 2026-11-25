// Bot de test externe : ne pas charger dans le jeu.
const BOT_CONFIG = {
  fleeDistance: 150,
  dashDistance: 200,
  averageReactionMinMs: 300,
  averageReactionMaxMs: 400,
  goodReactionMinMs: 150,
  goodReactionMaxMs: 250,
  averageDashChance: 0.60,
  goodDashChance: 0.90,
  targetLead: 80,
};

class SimulatedPlayerBot {
  constructor(profile = 'average', randomSource = Math.random) {
    this.profile = profile;
    this.randomSource = randomSource;
    this.reactionMinMs = profile === 'good' ? BOT_CONFIG.goodReactionMinMs : BOT_CONFIG.averageReactionMinMs;
    this.reactionMaxMs = profile === 'good' ? BOT_CONFIG.goodReactionMaxMs : BOT_CONFIG.averageReactionMaxMs;
    this.dashChance = profile === 'good' ? BOT_CONFIG.goodDashChance : BOT_CONFIG.averageDashChance;
    this.nextDashAt = 0;
    this.pendingThreatAt = 0;
    this.pendingPredator = null;
    this.dashes = 0;
  }

  nearestFood(api) {
    const head = api.getSnake().head;
    return api.getFoods().reduce((nearest, food) => {
      if (typeof food.isAvailable === 'function' && !food.isAvailable()) return nearest;
      if (!nearest || p5.Vector.dist(food.pos, head.pos) < p5.Vector.dist(nearest.pos, head.pos)) return food;
      return nearest;
    }, null);
  }

  nearestThreat(api) {
    const head = api.getSnake().head;
    return api.getPredators().reduce((nearest, predator) => {
      if (predator.eatenUntil && predator.eatenUntil > millis()) return nearest;
      if (!nearest || p5.Vector.dist(predator.pos, head.pos) < p5.Vector.dist(nearest.pos, head.pos)) return predator;
      return nearest;
    }, null);
  }

  tick(api) {
    const head = api.getSnake().head;
    const threat = this.nearestThreat(api);
    const food = this.nearestFood(api);
    let destination = food ? food.pos.copy() : head.pos.copy();

    if (threat) {
      const distance = p5.Vector.dist(threat.pos, head.pos);
      if (distance < BOT_CONFIG.fleeDistance) {
        const away = p5.Vector.sub(head.pos, threat.pos);
        if (away.magSq() > 0) destination = head.pos.copy().add(away.setMag(BOT_CONFIG.targetLead));
      }
      const attackVisible = threat.state === 'prepare' || threat.state === 'charge';
      if (attackVisible && distance < BOT_CONFIG.dashDistance) {
        if (!this.pendingPredator || this.pendingPredator !== threat) {
          this.pendingPredator = threat;
          this.pendingThreatAt = millis() + this.reactionMinMs + this.randomSource() * (this.reactionMaxMs - this.reactionMinMs);
        }
        if (threat.state === 'charge' && millis() >= this.pendingThreatAt && millis() >= this.nextDashAt && this.randomSource() <= this.dashChance) {
          api.triggerDash();
          this.dashes += 1;
          this.nextDashAt = millis() + DASH.cooldown;
          this.pendingPredator = null;
        }
      } else if (threat.state !== 'charge') {
        this.pendingPredator = null;
      }
    }
    api.setTarget(destination.x, destination.y);
  }
}

if (typeof globalThis !== 'undefined') globalThis.SimulatedPlayerBot = SimulatedPlayerBot;
