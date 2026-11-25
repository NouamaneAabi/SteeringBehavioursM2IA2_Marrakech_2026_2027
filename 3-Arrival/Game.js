class Game {
  constructor() {
    this.state = GAME_STATE.MENU;
    this.difficultyKey = 'normal';
    this.difficulty = DIFFICULTY.normal;
    this.bestScore = Number(localStorage.getItem('neon-serpent-best-score') || 0);
    this.survivalStartedAt = 0;
    this.finalLength = 0;
    this.finalCrystals = 0;
    this.finalKills = 0;
  }

  start(difficultyKey = 'normal') {
    this.difficultyKey = DIFFICULTY[difficultyKey] ? difficultyKey : 'normal';
    this.difficulty = DIFFICULTY[this.difficultyKey];
    this.state = GAME_STATE.PLAYING;
    score = 0;
    crystalCount = 0;
    orbCountCollected = 0;
    comboCount = 0;
    comboMultiplier = 1;
    comboExpiresAt = 0;
    floatingTexts = [];
    boostHeld = false;
    boostLastDrainAt = millis();
    dashEnergy = DASH.energyMax;
    powerUps.reset();
    camera.set(arenaWidth / 2, arenaHeight / 2);
    createSnake(initialRingCount);
    createArenaFoods();
    this.survivalStartedAt = millis();
    hideMenu();
    updateHudVisibility();
  }

  finishDeath() {
    this.finalLength = snake.ringCount;
    this.finalCrystals = crystalCount;
    this.finalKills = 0;
    score = this.finalLength + this.finalCrystals;
    if (score > this.bestScore) {
      this.bestScore = score;
      localStorage.setItem('neon-serpent-best-score', String(score));
    }
    this.state = GAME_STATE.GAME_OVER;
    boostHeld = false;
    updateHudVisibility();
  }

  survivalSeconds() {
    const end = this.state === GAME_STATE.GAME_OVER ? deathAt : millis();
    return Math.max(0, (end - this.survivalStartedAt) / 1000);
  }

  togglePause() {
    if (this.state === GAME_STATE.PLAYING) this.state = GAME_STATE.PAUSED;
    else if (this.state === GAME_STATE.PAUSED) this.state = GAME_STATE.PLAYING;
    updateHudVisibility();
  }

  resetToMenu() {
    this.state = GAME_STATE.MENU;
    boostHeld = false;
    hideHud();
    showMenu();
  }
}
