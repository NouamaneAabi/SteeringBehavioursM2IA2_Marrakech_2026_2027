let target;
let vehicles = [];
let pickups = [];
let controls;
let hud;
let debugEnabled = false;
let gradientHue = 0;
let score = 0;
let combo = 1;
let comboTimer = 0;
let paused = false;
let boostActive = false;
let scenario = 1;
let stars = [];
let effects = [];
let toastTimer = 0;
const pickupCount = 18;

function setup() {
  createCanvas(windowWidth, windowHeight);
  target = createVector(width / 2, height / 2);
  createControls();
  createHud();
  rebuildVehicles();
  createPickups();
  createStars();
}

function draw() {
  target.set(mouseX, mouseY);
  drawRainbowGradient();

  if (!paused) {
    updateGame();
  }

  drawGame();

  if (paused) {
    drawPauseOverlay();
  }
}

function updateGame() {
  const speedMultiplier = boostActive ? 1.8 : 1;
  const forceMultiplier = boostActive ? 1.25 : 1;

  for (const pickup of pickups) {
    pickup.update();
  }

  for (const star of stars) {
    star.update();
    star.edges();
  }

  for (const effect of effects) {
    effect.update();
  }
  effects = effects.filter((effect) => !effect.isDead());

  for (const vehicle of vehicles) {
    vehicle.maxSpeed = controls.speed.value() * speedMultiplier;
    vehicle.maxForce = controls.maxAcceleration.value() * forceMultiplier;
    if (scenario === 2) {
      applyWanderAndSeek(vehicle);
    } else {
      vehicle.applyBehaviors(target);
    }
    vehicle.update();
    vehicle.edges();
    collectPickups(vehicle);
  }

  if (scenario === 3) {
    updateFleeingTargets();
  }

  if (comboTimer > 0) {
    comboTimer -= 1;
  } else {
    combo = 1;
  }

  updateHud();
}

function drawGame() {
  for (const star of stars) {
    star.show();
  }

  for (const effect of effects) {
    effect.show();
  }

  for (const pickup of pickups) {
    pickup.show();
  }

  for (const vehicle of vehicles) {
    vehicle.show(debugEnabled, boostActive);
  }

  drawBeacon();
  drawVignette();
}

function createControls() {
  const panel = createDiv();
  panel.class('controls-panel');

  const header = createDiv();
  header.class('controls-header');
  header.parent(panel);

  const title = createSpan('STEER // fleet mission');
  title.class('controls-title');
  title.parent(header);

  const toggle = createButton('Masquer');
  toggle.class('accordion-toggle');
  toggle.attribute('aria-expanded', 'true');
  toggle.parent(header);

  const body = createDiv();
  body.class('controls-body');
  body.parent(panel);

  toggle.mousePressed(() => {
    const isVisible = body.elt.style.display !== 'none';
    body.elt.style.display = isVisible ? 'none' : 'grid';
    toggle.html(isVisible ? 'Afficher' : 'Masquer');
    toggle.attribute('aria-expanded', String(!isVisible));
  });

  controls = {
    panel,
    body,
    count: createSliderControl(body, 'Vaisseaux', 1, 200, 20, 1, (value) => {
      controls.count.countValue.html(String(value));
      if (value !== vehicles.length) rebuildVehicles();
    }),
    speed: createSliderControl(body, 'Vitesse max', 0, 20, 4, 0.01),
    maxAcceleration: createSliderControl(body, 'Accélération max', 0, 10, 0.1, 0.01),
    gradientRadius: createSliderControl(body, 'Rayon du champ', 50, 800, 320, 1),
    gradientSpeed: createSliderControl(body, 'Vitesse des couleurs', 0, 2, 0.25, 0.01),
    gradientSaturation: createSliderControl(body, 'Saturation', 0, 100, 85, 1),
    gradientOpacity: createSliderControl(body, 'Opacité', 0, 100, 75, 1)
  };

  const scenarioRow = createDiv();
  scenarioRow.class('control-row scenario-row');
  scenarioRow.parent(body);
  const scenarioLabel = createSpan('Scénario');
  scenarioLabel.class('control-label');
  scenarioLabel.parent(scenarioRow);
  const scenarioSelect = createSelect();
  scenarioSelect.class('scenario-select');
  scenarioSelect.option('1 — Suivre la souris', 1);
  scenarioSelect.option('2 — Explorer puis poursuivre', 2);
  scenarioSelect.option('3 — Cibles en fuite', 3);
  scenarioSelect.selected('1');
  scenarioSelect.parent(scenarioRow);
  scenarioSelect.changed(() => setScenario(Number(scenarioSelect.value())));
  controls.scenarioSelect = scenarioSelect;

  const debugRow = createDiv();
  debugRow.class('control-row debug-row');
  debugRow.parent(body);
  const debugCheckbox = createCheckbox(' Debug (touche D)', debugEnabled);
  debugCheckbox.parent(debugRow);
  debugCheckbox.changed(() => setDebug(debugCheckbox.checked()));
  controls.debugCheckbox = debugCheckbox;
}

function createSliderControl(parent, labelText, min, max, value, step, onInput) {
  const row = createDiv();
  row.class('control-row');
  row.parent(parent);

  const label = createSpan(labelText);
  label.class('control-label');
  label.parent(row);

  const slider = createSlider(min, max, value, step);
  slider.class('control-slider');
  slider.parent(row);

  const valueLabel = createSpan(formatControlValue(value, step));
  valueLabel.class('control-value');
  valueLabel.parent(row);

  const updateValue = () => {
    const currentValue = slider.value();
    valueLabel.html(formatControlValue(currentValue, step));
    if (onInput) onInput(currentValue);
  };
  slider.input(updateValue);

  return { slider, value: () => Number(slider.value()), countValue: valueLabel };
}

function formatControlValue(value, step) {
  return step < 1 ? Number(value).toFixed(2) : String(value);
}

function createHud() {
  hud = {};
  hud.root = createDiv();
  hud.root.class('hud');
  hud.root.html('<div class="hud-kicker">MISSION 01 / SEEK</div><div class="hud-title">Guide la flotte vers les cristaux</div>');

  hud.scenario = createDiv('SCÉNARIO 1 · BALISE ACTIVE');
  hud.scenario.class('hud-scenario');
  hud.scenario.parent(hud.root);

  const stats = createDiv();
  stats.class('hud-stats');
  stats.parent(hud.root);

  hud.score = createHudStat(stats, 'SCORE');
  hud.combo = createHudStat(stats, 'COMBO');
  hud.fleet = createHudStat(stats, 'FLOTTE');

  hud.progress = createDiv();
  hud.progress.class('hud-progress');
  hud.progress.parent(hud.root);
  hud.progressBar = createDiv();
  hud.progressBar.class('hud-progress-bar');
  hud.progressBar.parent(hud.progress);

  hud.toast = createDiv();
  hud.toast.class('hud-toast');
  hud.toast.parent(hud.root);

  const help = createDiv('Souris : diriger  ·  ESPACE : boost  ·  P : pause  ·  R : reset');
  help.class('hud-help');
  help.parent(hud.root);
}

function createHudStat(parent, label) {
  const stat = createDiv();
  stat.class('hud-stat');
  stat.parent(parent);
  stat.html(`<span>${label}</span><strong>0</strong>`);
  return stat.elt.querySelector('strong');
}

function updateHud() {
  hud.score.textContent = String(score).padStart(5, '0');
  hud.combo.textContent = `x${combo}`;
  hud.fleet.textContent = `${vehicles.length}/${controls.count.value()}`;
  hud.root.elt.dataset.scenario = String(scenario);
  const scenarioLabels = {
    1: 'SCÉNARIO 1 · BALISE ACTIVE',
    2: 'SCÉNARIO 2 · EXPLORATION',
    3: 'SCÉNARIO 3 · CIBLES EN FUITE'
  };
  hud.scenario.html(scenarioLabels[scenario]);
  hud.progressBar.elt.style.width = `${Math.min(100, (score / 500) * 100)}%`;
  if (toastTimer > 0) {
    toastTimer -= 1;
    hud.toast.removeClass('is-hidden');
  } else {
    hud.toast.addClass('is-hidden');
  }
}

function setScenario(nextScenario) {
  scenario = nextScenario;
  if (controls && controls.scenarioSelect.value() !== String(nextScenario)) {
    controls.scenarioSelect.selected(String(nextScenario));
  }
  for (const vehicle of vehicles) {
    vehicle.nextWanderChange = millis();
  }
  updateHud();
}

function applyWanderAndSeek(vehicle) {
  const visibleTarget = findVisibleTarget(vehicle, 230);
  if (visibleTarget) {
    vehicle.applyBehaviors(visibleTarget.pos);
    vehicle.targetState = 'pursuing';
    return;
  }

  if (!vehicle.wanderDirection || millis() >= vehicle.nextWanderChange) {
    vehicle.wanderDirection = p5.Vector.random2D();
    vehicle.nextWanderChange = millis() + 4000;
  }

  const desiredVelocity = vehicle.wanderDirection.copy().setMag(vehicle.maxSpeed);
  const wanderForce = p5.Vector.sub(desiredVelocity, vehicle.vel);
  wanderForce.limit(vehicle.maxForce);
  vehicle.applyForce(wanderForce);
  vehicle.targetState = 'wandering';
}

function findVisibleTarget(vehicle, visionRadius) {
  let closestTarget = null;
  let closestDistance = visionRadius;
  for (const pickup of pickups) {
    const distance = p5.Vector.dist(vehicle.pos, pickup.pos);
    if (!pickup.collected && distance < closestDistance) {
      closestTarget = pickup;
      closestDistance = distance;
    }
  }
  return closestTarget;
}

function updateFleeingTargets() {
  for (const pickup of pickups) {
    let closestVehicle = null;
    let closestDistance = 220;
    for (const vehicle of vehicles) {
      const distance = p5.Vector.dist(pickup.pos, vehicle.pos);
      if (distance < closestDistance) {
        closestVehicle = vehicle;
        closestDistance = distance;
      }
    }

    pickup.maxSpeed = 3.2;
    pickup.maxForce = 0.18;
    if (closestVehicle) {
      pickup.applyForce(pickup.flee(closestVehicle.pos));
    }
    pickup.move();
    pickup.edges();
  }
}

function createPickups() {
  pickups = [];
  for (let index = 0; index < pickupCount; index += 1) {
    pickups.push(new Pickup(random(70, width - 70), random(150, height - 70), index));
  }
}

function collectPickups(vehicle) {
  for (const pickup of pickups) {
    if (pickup.collected) continue;
    const distance = p5.Vector.dist(vehicle.pos, pickup.pos);
    if (distance < vehicle.r + pickup.r + 4) {
      const collectedPosition = pickup.pos.copy();
      const collectedHue = pickup.hue;
      pickup.collect();
      const points = 10 * combo;
      score += points;
      combo = Math.min(combo + 1, 9);
      comboTimer = 240;
      toastTimer = 90;
      hud.toast.html(`+${points} · COMBO x${combo}`);
      spawnBurst(collectedPosition, collectedHue);
      break;
    }
  }
}

function createStars() {
  stars = [];
  for (let index = 0; index < 110; index += 1) {
    const star = new Particle(random(width), random(height), 195 + random(70), random(0.7, 2.2), Infinity);
    star.vel = createVector(random(-0.03, 0.03), random(0.03, 0.12));
    star.isStar = true;
    stars.push(star);
  }
}

function spawnBurst(position, hue) {
  for (let index = 0; index < 14; index += 1) {
    const particle = new Particle(position.x, position.y, hue + random(-20, 20), random(1.5, 3.5), random(35, 70));
    particle.vel = p5.Vector.random2D().mult(random(1, 4));
    effects.push(particle);
  }
}

function rebuildVehicles() {
  const count = controls ? controls.count.value() : 20;
  vehicles = [];
  for (let index = 0; index < count; index += 1) {
    const vehicle = new Vehicle(random(width), random(height));
    vehicle.vel = p5.Vector.random2D().mult(random(0.5, 2));
    vehicle.hue = (index * 18 + random(-8, 8) + 205) % 360;
    vehicles.push(vehicle);
  }
  if (hud) updateHud();
}

function drawBeacon() {
  push();
  noFill();
  stroke(190, 220, 255, 180);
  strokeWeight(1.5);
  const pulse = 30 + sin(frameCount * 0.08) * 5;
  circle(target.x, target.y, pulse);
  circle(target.x, target.y, pulse * 0.55);
  stroke(255, 255, 255, 220);
  line(target.x - 14, target.y, target.x + 14, target.y);
  line(target.x, target.y - 14, target.x, target.y + 14);
  pop();
}

function drawVignette() {
  const vignette = drawingContext.createRadialGradient(width / 2, height / 2, height * 0.2, width / 2, height / 2, height * 0.85);
  vignette.addColorStop(0, 'rgba(0, 0, 0, 0)');
  vignette.addColorStop(1, 'rgba(0, 0, 18, 0.48)');
  drawingContext.save();
  drawingContext.fillStyle = vignette;
  drawingContext.fillRect(0, 0, width, height);
  drawingContext.restore();
}

function drawRainbowGradient() {
  background(5, 8, 18);
  gradientHue = (gradientHue + controls.gradientSpeed.value()) % 360;

  const radius = controls.gradientRadius.value();
  const saturation = controls.gradientSaturation.value();
  const opacity = controls.gradientOpacity.value() / 100;
  const gradient = drawingContext.createRadialGradient(target.x, target.y, 0, target.x, target.y, radius);

  colorMode(HSB, 360, 100, 100, 100);
  for (let index = 0; index <= 12; index += 1) {
    const hue = (gradientHue + index * 30) % 360;
    const brightness = 100 - index * 5;
    const alpha = opacity * (1 - index / 13);
    gradient.addColorStop(index / 12, color(hue, saturation, brightness, alpha * 100).toString());
  }
  colorMode(RGB, 255, 255, 255, 255);

  drawingContext.save();
  drawingContext.fillStyle = gradient;
  drawingContext.fillRect(0, 0, width, height);
  drawingContext.restore();
}

function drawPauseOverlay() {
  push();
  fill(5, 8, 18, 150);
  rect(0, 0, width, height);
  textAlign(CENTER, CENTER);
  fill(255);
  textSize(32);
  text('PAUSE', width / 2, height / 2 - 20);
  textSize(14);
  fill(185, 205, 255);
  text('Appuie sur P pour reprendre', width / 2, height / 2 + 24);
  pop();
}

function resetGame() {
  score = 0;
  combo = 1;
  comboTimer = 0;
  createPickups();
  rebuildVehicles();
  effects = [];
  toastTimer = 0;
  updateHud();
}

function setDebug(enabled) {
  debugEnabled = enabled;
  if (controls && controls.debugCheckbox.checked() !== enabled) {
    controls.debugCheckbox.checked(enabled);
  }
}

function keyPressed() {
  if (key === 'd' || key === 'D') setDebug(!debugEnabled);
  if (key === 'p' || key === 'P') paused = !paused;
  if (key === 'r' || key === 'R') resetGame();
  if (key === ' ') boostActive = true;
  return false;
}

function keyReleased() {
  if (key === ' ') boostActive = false;
  return false;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
