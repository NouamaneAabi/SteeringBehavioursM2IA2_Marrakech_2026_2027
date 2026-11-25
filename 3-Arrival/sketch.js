let target, snake, controls, hud, menu, font, game, powerUps;
let foods = [], predators = [], obstacles = [], stars = [];
let arenaWidth = 0, arenaHeight = 0, camera, cameraTarget;
let score = 0, scoreDisplay = 0, crystalCount = 0, orbCountCollected = 0;
let comboCount = 0, comboMultiplier = 1, comboExpiresAt = 0, floatingTexts = [];
let dashEnergy = DASH.energyMax, boostHeld = false, boostLastDrainAt = 0;
let deathAt = 0, frameRateVisible = false, errorLog = [];
let vignetteGradient = null;

const GAME_STATE = { MENU: 'menu', PLAYING: 'playing', PAUSED: 'paused', GAME_OVER: 'gameover' };
const initialRingCount = 8;

function preload() { font = loadFont('./assets/inconsolata.otf'); }

function setup() {
  createCanvas(windowWidth, windowHeight);
  textFont(font);
  setArenaSize();
  camera = createVector(arenaWidth / 2, arenaHeight / 2);
  cameraTarget = createVector(camera.x, camera.y);
  target = createVector(camera.x, camera.y);
  powerUps = new PowerUpManager();
  createStars();
  game = new Game();
  createSnake(initialRingCount);
  createControls();
  createHud();
  createMenu();
  if (DEBUG_HOOKS) {
    window.neonErrors = errorLog;
    window.onerror = (message, source, line, column) => errorLog.push({ message, source, line, column });
    window.neonSerpent = {
      getGame: () => game,
      getSnake: () => snake,
      getFoods: () => foods,
      getPredators: () => predators,
      getPowerUps: () => powerUps,
      setTarget: (x, y) => target.set(x, y),
      triggerDash: () => { boostHeld = true; },
      snapshot: () => ({ state: game.state, score, crystals: crystalCount, rings: snake.ringCount, fps: frameRate(), boost: isBoosting() })
    };
  }
  updateHudVisibility();
}

function setArenaSize() {
  arenaWidth = Math.max(windowWidth * WORLD.widthFactor, windowWidth + WORLD.boundaryMargin * 2);
  arenaHeight = Math.max(windowHeight * WORLD.heightFactor, windowHeight + WORLD.boundaryMargin * 2);
}

function draw() {
  updateTargetFromPointer();
  drawSpaceBackground();
  if (game.state === GAME_STATE.MENU) { drawMenuBackdrop(); return; }
  updateGame();
  drawWorld();
  if (game.state === GAME_STATE.PAUSED) drawStateOverlay('PAUSE', 'P ou Échap pour reprendre');
  if (game.state === GAME_STATE.GAME_OVER) drawDeathOverlay();
}

function updateTargetFromPointer() {
  if (!camera) return;
  target.set(mouseX + camera.x - width / 2, mouseY + camera.y - height / 2);
  target.x = constrain(target.x, 0, arenaWidth);
  target.y = constrain(target.y, 0, arenaHeight);
}

function updateGame() {
  if (game.state !== GAME_STATE.PLAYING) return;
  const boosting = isBoosting();
  const baseSpeed = WORLD.snakeBaseMaxSpeed * (boosting ? BOOST.speedMultiplier : 1);
  snake.head.maxSpeed = baseSpeed;
  snake.head.maxForce = boosting ? 0.38 : 0.28;
  for (const food of foods) food.update();
  powerUps.update();
  powerUps.attractFoods(foods, snake.head);
  snake.update(target, []);
  if (snake.head.boundaryHit && game.difficulty.boundaryMode === 'deadly') {
    killPlayer('BORDURE');
    return;
  }
  if (snake.head.boundaryHit) applyBoundaryPush();
  checkFoodCollisions();
  updateBoostDrain();
  updateCombo();
  updateFloatingTexts();
  score = snake.ringCount + crystalCount;
  updateCamera();
}

function isBoosting() {
  return boostHeld && snake && snake.ringCount > BOOST.minimumRings && game.state === GAME_STATE.PLAYING;
}

function updateBoostDrain() {
  if (!isBoosting()) { boostLastDrainAt = millis(); return; }
  const interval = BOOST.drainInterval / game.difficulty.boostDrain;
  if (millis() - boostLastDrainAt < interval) return;
  boostLastDrainAt = millis();
  snake.removeRings(1);
  dropBoostOrbs();
  if (snake.ringCount <= BOOST.minimumRings) boostHeld = false;
}

function dropBoostOrbs() {
  const tail = snake.rings[snake.rings.length - 1] || snake.head;
  for (let count = 0; count < BOOST.dropCount; count += 1) {
    const food = foods.find((item) => item.isOrb && !item.isAvailable());
    if (!food) return;
    food.setOrb(tail.pos.x + random(-18, 18), tail.pos.y + random(-18, 18), WORLD.orbValue);
  }
}

function applyBoundaryPush() {
  const margin = WORLD.boundaryMargin;
  const force = createVector(0, 0);
  if (snake.head.pos.x < margin) force.x += WORLD.boundaryPushForce;
  if (snake.head.pos.x > arenaWidth - margin) force.x -= WORLD.boundaryPushForce;
  if (snake.head.pos.y < margin) force.y += WORLD.boundaryPushForce;
  if (snake.head.pos.y > arenaHeight - margin) force.y -= WORLD.boundaryPushForce;
  if (force.magSq() > 0) snake.head.applyForce(force);
}

function updateCamera() {
  cameraTarget.set(snake.head.pos);
  camera.lerp(cameraTarget, WORLD.cameraSmoothing);
  camera.x = constrain(camera.x, width / 2, arenaWidth - width / 2);
  camera.y = constrain(camera.y, height / 2, arenaHeight - height / 2);
}

function createSnake(ringCount) {
  snake = new Snake(arenaWidth / 2, arenaHeight / 2, ringCount);
}

function createArenaFoods() {
  foods = [];
  const orbTotal = Math.floor(WORLD.orbCount * game.difficulty.orbDensity);
  for (let index = 0; index < orbTotal; index += 1) {
    const food = new Food(random(ARENA.visibleMargin, arenaWidth - ARENA.visibleMargin), random(ARENA.visibleMargin, arenaHeight - ARENA.visibleMargin), 'normal', true);
    food.setOrb(food.pos.x, food.pos.y);
    foods.push(food);
  }
  for (let index = 0; index < WORLD.crystalCount; index += 1) {
    const food = new Food(random(ARENA.visibleMargin, arenaWidth - ARENA.visibleMargin), random(ARENA.visibleMargin, arenaHeight - ARENA.visibleMargin), Food.pickType(game.difficultyKey), false);
    food.setCrystal(food.pos.x, food.pos.y, Food.pickType(game.difficultyKey));
    foods.push(food);
  }
}

function checkFoodCollisions() {
  const collectDistance = snake.head.r + WORLD.orbRadius + 4;
  for (const food of foods) {
    if (!food.isAvailable() || p5.Vector.dist(snake.head.pos, food.pos) > collectDistance) continue;
    collectFood(food);
    food.respawn(snake.head.pos, true);
  }
}

function collectFood(food) {
  const now = millis();
  comboCount = now <= comboExpiresAt ? Math.min(COMBO_MAX, comboCount + 1) : 1;
  comboMultiplier = Math.min(COMBO_MAX, comboCount);
  comboExpiresAt = now + COMBO_WINDOW;
  crystalCount += 1;
  if (food.isOrb) {
    orbCountCollected += 1;
    if (orbCountCollected % WORLD.growthEveryOrbs === 0) snake.grow(1);
  } else {
    snake.grow(food.growth);
    if (food.type.effect) powerUps.activate(food.type.effect);
  }
  score = snake.ringCount + crystalCount;
  addFloatingText(snake.head.pos, '+' + (food.isOrb ? WORLD.orbValue : food.points));
  if (comboMultiplier > 1) addFloatingText(createVector(snake.head.pos.x, snake.head.pos.y - 28), 'COMBO x' + comboMultiplier);
}

function killPlayer(reason) {
  if (game.state !== GAME_STATE.PLAYING) return;
  const dropCount = Math.min(snake.ringCount * 2, WORLD.maxDropOrbs);
  const source = [snake.head, ...snake.rings];
  for (let index = 0; index < dropCount; index += 1) {
    const origin = source[index % source.length].pos;
    const food = foods.find((item) => item.isOrb && !item.isAvailable());
    if (!food) break;
    food.setOrb(origin.x + random(-32, 32), origin.y + random(-32, 32), Math.max(1, Math.floor(snake.ringCount / 10)));
  }
  deathAt = millis();
  addFloatingText(snake.head.pos, reason);
  game.finishDeath();
}

function updateCombo() {
  if (comboExpiresAt && millis() > comboExpiresAt) { comboCount = 0; comboMultiplier = 1; comboExpiresAt = 0; }
}
function addFloatingText(position, value) { floatingTexts.push({ x: position.x, y: position.y, value, createdAt: millis() }); }
function updateFloatingTexts() { const now = millis(); floatingTexts = floatingTexts.filter((item) => now - item.createdAt < FLOATING_TEXT_DURATION); }

function drawWorld() {
  push();
  translate(width / 2 - camera.x, height / 2 - camera.y);
  stroke(114, 231, 255, 70); noFill(); rect(0, 0, arenaWidth, arenaHeight);
  const left = camera.x - width / 2 - ARENA.visibleMargin;
  const right = camera.x + width / 2 + ARENA.visibleMargin;
  const top = camera.y - height / 2 - ARENA.visibleMargin;
  const bottom = camera.y + height / 2 + ARENA.visibleMargin;
  for (const food of foods) {
    if (food.pos.x >= left && food.pos.x <= right && food.pos.y >= top && food.pos.y <= bottom) food.show();
  }
  snake.show(target);
  drawFloatingTexts();
  drawTarget();
  pop();
  drawHudValues();
}

function drawSpaceBackground() {
  background(PALETTE.background);
  push();
  stroke(100, 160, 255, ARENA.backgroundGridAlpha); strokeWeight(1);
  const offsetX = -((camera ? camera.x : 0) % WORLD.gridSize);
  const offsetY = -((camera ? camera.y : 0) % WORLD.gridSize);
  for (let x = offsetX; x < width; x += WORLD.gridSize) line(x, 0, x, height);
  for (let y = offsetY; y < height; y += WORLD.gridSize) line(0, y, width, y);
  for (const star of stars) { noStroke(); fill(150, 210, 255, star.alpha); circle(star.x - (camera ? camera.x * SNAKE_STYLE.starParallax : 0), star.y, star.size); }
  pop();
  if (!vignetteGradient || vignetteGradient.width !== width || vignetteGradient.height !== height) {
    vignetteGradient = { width, height, value: drawingContext.createRadialGradient(width / 2, height / 2, min(width, height) * 0.25, width / 2, height / 2, max(width, height) * 0.72) };
    vignetteGradient.value.addColorStop(0, 'rgba(0,0,0,0)'); vignetteGradient.value.addColorStop(1, 'rgba(0,0,8,0.62)');
  }
  drawingContext.save(); drawingContext.fillStyle = vignetteGradient.value; drawingContext.fillRect(0, 0, width, height); drawingContext.restore();
}

function drawTarget() {
  const x = target.x, y = target.y, distance = p5.Vector.dist(snake.head.pos, target);
  const closeAmount = 1 - constrain(distance / SNAKE_STYLE.targetCloseDistance, 0, 1);
  const size = lerp(SNAKE_STYLE.targetOpenSize, SNAKE_STYLE.targetClosedSize, closeAmount);
  push(); noFill(); stroke(PALETTE.crystal); strokeWeight(1.5 + closeAmount);
  circle(x, y, size + sin(frameCount * 0.08) * 4); circle(x, y, size * 0.45);
  line(x - size * 0.6, y, x + size * 0.6, y); line(x, y - size * 0.6, x, y + size * 0.6); pop();
}

function drawFloatingTexts() {
  const now = millis(); push(); textAlign(CENTER, CENTER); textSize(16); textStyle(BOLD);
  for (const item of floatingTexts) { const progress = constrain((now - item.createdAt) / FLOATING_TEXT_DURATION, 0, 1); fill(255, 228, 155, 230 * (1 - progress)); text(item.value, item.x, item.y - progress * 35); }
  pop();
}

function createStars() { stars = []; for (let index = 0; index < SNAKE_STYLE.starCount; index += 1) stars.push({ x: random(width), y: random(height), size: random(0.7, 2.2), alpha: random(35, 130) }); }

function createControls() {
  const panel = createDiv(); panel.class('controls-panel');
  const title = createSpan('ARENA // SURVIVAL'); title.class('controls-title'); title.parent(panel);
  const slider = createSliderControl(panel, 'Anneaux départ', 1, 100, initialRingCount, 1, 0);
  const wave = createSliderControl(panel, 'Ondulation', 0, 18, 7, 0.1, 1);
  const frequency = createSliderControl(panel, 'Fréquence', 0.02, 0.18, 0.09, 0.01, 2);
  const debug = createCheckbox(' Debug (D)', Vehicle.debug); debug.class('debug-checkbox'); debug.parent(panel); debug.changed(() => Vehicle.debug = debug.checked());
  controls = { panel, slider, wave, frequency, debug };
}
function createSliderControl(parent, labelText, minValue, maxValue, initial, step, decimals) {
  const row = createDiv(); row.class('control-row'); row.parent(parent); const label = createSpan(labelText); label.class('control-label'); label.parent(row);
  const slider = createSlider(minValue, maxValue, initial, step); slider.class('ring-slider'); slider.parent(row); const value = createSpan(Number(initial).toFixed(decimals)); value.class('control-value'); value.parent(row);
  slider.input(() => value.html(Number(slider.value()).toFixed(decimals))); return { slider, value };
}

function createHud() {
  hud = createDiv(); hud.class('hud'); hud.html('<div class="hud-kicker">SLITHER ARENA / 01</div><div class="hud-title">NEON SERPENT</div>');
  hud.status = createDiv('SURVIS. GRANDIS. DOMINE.'); hud.status.class('hud-status'); hud.status.parent(hud);
  const stats = createDiv(); stats.class('hud-stats'); stats.parent(hud);
  hud.rings = createDiv('<span>LONGUEUR</span><strong>8</strong>'); hud.rings.class('hud-stat'); hud.rings.parent(stats); hud.ringValue = hud.rings.elt.querySelector('strong');
  hud.crystals = createDiv('<span>OR nécessaire</span><strong>0</strong>'); hud.crystals.class('hud-stat'); hud.crystals.parent(stats); hud.crystalValue = hud.crystals.elt.querySelector('strong');
  hud.score = createDiv('<span>SCORE</span><strong>8</strong>'); hud.score.class('hud-stat hud-score'); hud.score.parent(stats); hud.scoreValue = hud.score.elt.querySelector('strong');
  hud.combo = createDiv('<span>COMBO x1</span><div class="combo-track"><i></i></div>'); hud.combo.class('hud-combo'); hud.combo.parent(hud); hud.comboLabel = hud.combo.elt.querySelector('span'); hud.comboFill = hud.combo.elt.querySelector('i');
  hud.boost = createDiv('<span>BOOST · ESPACE / CLIC</span><div class="combo-track"><i></i></div>'); hud.boost.class('hud-combo'); hud.boost.parent(hud); hud.boostFill = hud.boost.elt.querySelector('i');
  hud.fps = createDiv(''); hud.fps.class('hud-fps'); hud.fps.parent(hud);
  hud.help = createDiv('Espace/clic : boost · P/Échap : pause · D : debug · F : FPS · R : rejouer'); hud.help.class('hud-help'); hud.help.parent(hud);
}

function createMenu() {
  menu = createDiv(); menu.class('menu-screen'); const card = createDiv(); card.class('menu-card'); card.parent(menu);
  const kicker = createDiv('SLITHER ARENA / 01'); kicker.class('menu-kicker'); kicker.parent(card);
  const title = createDiv('NEON SERPENT'); title.class('menu-title'); title.parent(card);
  const subtitle = createDiv('Survis. Mange. Deviens le plus long.'); subtitle.class('menu-subtitle'); subtitle.parent(card);
  const label = createDiv('DIFFICULTÉ'); label.class('menu-label'); label.parent(card);
  const select = createSelect(); select.class('difficulty-select'); select.option('Facile', 'facile'); select.option('Normal', 'normal'); select.option('Difficile', 'difficile'); select.option('Cauchemar', 'cauchemar'); select.selected('normal'); select.parent(card);
  const play = createButton('JOUER'); play.class('play-button'); play.parent(card); play.mousePressed(() => game.start(select.value()));
  const best = createDiv('Meilleur score : ' + game.bestScore); best.class('menu-best'); best.parent(card); menu.difficultySelect = select;
  const commands = createDiv('La longueur est ton score. Une bordure mortelle apparaît en Difficile.'); commands.class('menu-commands'); commands.parent(card);
}
function showMenu() { menu.show(); }
function hideMenu() { menu.hide(); }
function hideHud() { hud.hide(); controls.panel.hide(); }
function updateHudVisibility() { if (game.state === GAME_STATE.MENU) hideHud(); else { hud.show(); controls.panel.show(); } }
function drawHudValues() {
  scoreDisplay = lerp(scoreDisplay, score, SCORE_COUNT_SPEED); hud.ringValue.textContent = String(snake.ringCount); hud.crystalValue.textContent = String(crystalCount); hud.scoreValue.textContent = String(Math.round(scoreDisplay)).padStart(3, '0');
  const remaining = comboExpiresAt ? max(0, comboExpiresAt - millis()) : 0; hud.comboLabel.textContent = 'COMBO x' + comboMultiplier; hud.comboFill.style.width = (remaining / COMBO_WINDOW * 100) + '%'; hud.boostFill.style.width = (snake.ringCount / Math.max(1, snake.targetRingCount) * 100) + '%';
  hud.status.html((isBoosting() ? 'BOOST ACTIF · ' : '') + 'Longueur : ' + snake.ringCount + ' · Cristaux : ' + crystalCount); hud.fps.html(frameRateVisible ? 'FPS ' + frameRate().toFixed(0) : '');
}
function drawMenuBackdrop() { push(); noStroke(); fill(80, 220, 255, 18); circle(width * 0.5, height * 0.52, min(width, height) * 0.55); pop(); }
function drawStateOverlay(title, message) { push(); fill(3, 6, 20, 190); rect(0, 0, width, height); textAlign(CENTER, CENTER); fill(112, 232, 255); textSize(min(38, width * 0.08)); text(title, width / 2, height / 2 - 28); fill(230, 240, 255); textSize(16); text(message, width / 2, height / 2 + 28); pop(); }
function drawDeathOverlay() { drawStateOverlay('SERPENT ÉLIMINÉ', 'Longueur ' + game.finalLength + ' · Score ' + score + ' · R pour rejouer · Échap pour le menu'); }

function keyPressed() {
  if (key === 'd' || key === 'D') { Vehicle.debug = !Vehicle.debug; controls.debug.checked(Vehicle.debug); }
  if (key === 'f' || key === 'F') frameRateVisible = !frameRateVisible;
  if (key === 'p' || key === 'P' || keyCode === ESCAPE) { if (game.state === GAME_STATE.PLAYING || game.state === GAME_STATE.PAUSED) game.togglePause(); else if (game.state === GAME_STATE.GAME_OVER) game.resetToMenu(); }
  if (key === 'r' || key === 'R') if (game.state === GAME_STATE.GAME_OVER || game.state === GAME_STATE.PAUSED) game.start(game.difficultyKey);
  if (keyCode === 32) { boostHeld = true; return false; }
}
function keyReleased() { if (keyCode === 32) boostHeld = false; }
function mousePressed() { if (game.state === GAME_STATE.PAUSED) game.togglePause(); else if (game.state === GAME_STATE.PLAYING) boostHeld = true; }
function mouseReleased() { boostHeld = false; }
function windowResized() { resizeCanvas(windowWidth, windowHeight); setArenaSize(); vignetteGradient = null; createStars(); camera.x = constrain(camera.x, width / 2, arenaWidth - width / 2); camera.y = constrain(camera.y, height / 2, arenaHeight - height / 2); }
