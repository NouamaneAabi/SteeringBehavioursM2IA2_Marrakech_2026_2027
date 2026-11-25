const DEBUG_HOOKS = false;

const PALETTE = {
  background: '#040714', cyan: '#72e7ff', cyanSoft: '#7adfff', magenta: '#ff4fc3',
  crystal: '#ffe49b', purple: '#8d6bff', danger: '#ff557b',
  snakeHeadHue: 105, snakeTailHue: 188
};

const SNAKE_STYLE = {
  headRadius: 21, firstRingRadius: 16, minRingRadius: 8, ringTaper: 0.08,
  ringSpacing: 23, trailAlpha: 42, trailWeight: 4, glowScale: 3.1,
  headGlowScale: 3.5, scaleMin: 0.92, scaleMax: 1.1, tongueMaxLength: 34,
  tongueSpeed: 0.18, pulseDuration: 520, growthDuration: 360,
  targetOpenSize: 34, targetClosedSize: 17, targetCloseDistance: 125, starCount: 70
};

const DIFFICULTY = {
  facile: { label: 'Facile', orbDensity: 0.85, boostDrain: 0.45, boundaryMode: 'push' },
  normal: { label: 'Normal', orbDensity: 1, boostDrain: 0.70, boundaryMode: 'push' },
  difficile: { label: 'Difficile', orbDensity: 1.10, boostDrain: 0.95, boundaryMode: 'deadly' },
  cauchemar: { label: 'Cauchemar', orbDensity: 1.20, boostDrain: 1.20, boundaryMode: 'deadly' }
};

const WEIGHTS = { pursue: 1, wander: 0.55, separation: 1.4, obstacleAvoidance: 1.25, boundaryAvoidance: 1.1 };

const WORLD = {
  widthFactor: 4, heightFactor: 4, gridSize: 80, boundaryMargin: 110, boundaryDeathMargin: 18,
  boundaryPushForce: 0.9, orbCount: 500, crystalCount: 12, maxDropOrbs: 260,
  orbRespawnDelay: 300, growthEveryOrbs: 4, orbRadius: 5, orbValue: 1,
  boostSpeedMultiplier: 1.6, minimumBoostRings: 6, boostDropCount: 3,
  boostDrainInterval: 1000, cameraSmoothing: 0.12, cameraEdgePadding: 90,
  snakeBaseMaxSpeed: 5, starParallax: 0.018, crystalLifetime: 180000,
  crystalSpawnDelay: 500, mudRadius: 115, mudSlowFactor: 0.62,
  obstacleMinRadius: 14, obstacleMaxRadius: 28, obstacleReferenceSize: 900,
  obstaclePadding: 28, obstacleAvoidanceMargin: 18, obstacleLookAhead: 74,
  predatorHitCooldown: 1400, predatorRecovery: 900, progressionInterval: 30000,
  progressionCap: 1.45, levelNoticeDuration: 1800
};

const ARENA = { backgroundGridAlpha: 20, visibleMargin: 120, minimapPadding: 18 };
const BOOST = { speedMultiplier: 1.6, minimumRings: 6, drainInterval: 1000, dropCount: 3 };
const COMBO_WINDOW = 2500;
const COMBO_MAX = 5;
const SCORE_COUNT_SPEED = 0.22;
const FLOATING_TEXT_DURATION = 1000;

const CRYSTAL_TYPES = {
  normal: { label: 'Normal', weight: 64, points: 10, growth: 1, color: '#ffe49b', hue: 45 },
  gold: { label: 'Doré', weight: 8, points: 50, growth: 2, color: '#fff2a8', hue: 52 },
  blue: { label: 'Bleu', weight: 10, points: 15, growth: 1, color: '#61c8ff', hue: 198, effect: 'slow' },
  red: { label: 'Rouge', weight: 9, points: 15, growth: 1, color: '#ff557b', hue: 348, effect: 'shield' },
  violet: { label: 'Violet', weight: 9, points: 20, growth: 1, color: '#b875ff', hue: 270, effect: 'magnet' }
};
const CRYSTAL_SPECIAL_BOOST = { facile: 0, normal: 0.05, difficile: 0.12, cauchemar: 0.2 };
const POWERUPS = {
  slow: { label: 'RALENTI', icon: '❄', duration: 5000, predatorFactor: 0.45 },
  shield: { label: 'BOUCLIER', icon: '◆', duration: 6000 },
  magnet: { label: 'AIMANT', icon: '✦', duration: 6000, radius: 180, strength: 0.08 }
};

// Conservé pour les étapes B/C, quand les prédateurs deviendront des serpents rivaux.
const PREDATOR_AI = { predictionMaxTime: 0.5, contactRatio: 0.7, chargeWarningDistance: 180, flankerOffset: 110, patrollerRadius: 150, ambushRadius: 190, chargeMultiplier: 1.55, preparationRetreat: 0.7, exhaustDuration: 1500, stunDuration: 1500 };
const DASH = { duration: 400, cooldown: 3000, speedMultiplier: 2, energyMax: 100, energyCost: 45, rechargePerSecond: 28, evadeBonus: 25, nearMissDistance: 70, nearMissBonus: 15, slowMotionDuration: 180, hunterModeDuration: 5000, predatorEatPoints: 100 };
const WAVE = { interval: 30000, noticeDuration: 2200, initialPredators: 1, maxBonusPredators: 3 };
