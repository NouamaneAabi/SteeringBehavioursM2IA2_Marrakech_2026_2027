let attackers = [];
let targetPlanes = [];
let battlePlanes = [];
let missiles = [];
let flares = [];
let explosionParticles = [];
let smokePuffs = [];
let controls;
let currentScenario = "scenario1";
let battleWinner = null;

const simulationSettings = {
  attackerCount: 1,
  targetCount: 1,
  battlePlaneCount: 8,
  detectionRadius: 400,
  unlockDelaySec: 5,
  missileSpeedMultiplier: 1.5,
  missileMaxForce: 0.45,
  missileLifeSec: 5,
  maxMissilesPerAttacker: 2,
  targetMissileDetectionRadius: 150,
  targetMissileSafeDistance: 300,
  targetFleeMaxSpeed: 9,
  targetFleeMaxForce: 0.7
};

function setup() {
  createCanvas(windowWidth, windowHeight);

  controls = createControls();
  resetSimulation();
}

function resetSimulation() {
  attackers = [];
  targetPlanes = [];
  battlePlanes = [];
  missiles = [];
  flares = [];
  explosionParticles = [];
  smokePuffs = [];
  battleWinner = null;

  if (currentScenario === "scenario1") {
    setAttackerCount(simulationSettings.attackerCount);
    setTargetCount(simulationSettings.targetCount);
  } else {
    spawnBattleRoyale(simulationSettings.battlePlaneCount);
  }
  applySimulationSettings();
}

function spawnBattleRoyale(count) {
  battlePlanes = [];
  battleWinner = null;
  for (let i = 0; i < count; i++) {
    const angle = (TWO_PI * i) / count;
    const radiusX = Math.min(width, height) * 0.34;
    const x = width * 0.5 + Math.cos(angle) * radiusX + random(-30, 30);
    const y = height * 0.5 + Math.sin(angle) * radiusX + random(-30, 30);
    const plane = new BattlePlane(
      constrain(x, 40, width - 40),
      constrain(y, 40, height - 40),
      i + 1
    );
    applyBattlePlaneSettings(plane);
    battlePlanes.push(plane);
  }
}

function setAttackerCount(count) {
  if (currentScenario !== "scenario1") {
    return;
  }
  while (attackers.length < count) {
    const isFirst = attackers.length === 0 && count === 1;
    const x = isFirst ? width * 0.35 : random(width * 0.1, width * 0.9);
    const y = isFirst ? height * 0.5 : random(height * 0.1, height * 0.9);
    attackers.push(new AttackerPlane(x, y));
  }
  while (attackers.length > count) {
    const removed = attackers.pop();
    removed.clearLock();
  }
  applySimulationSettings();
}

function setTargetCount(count) {
  if (currentScenario !== "scenario1") {
    return;
  }
  while (targetPlanes.length < count) {
    const isFirst = targetPlanes.length === 0 && count === 1;
    const x = isFirst ? width * 0.65 : random(width * 0.1, width * 0.9);
    const y = isFirst ? height * 0.5 : random(height * 0.1, height * 0.9);
    targetPlanes.push(new TargetPlane(x, y));
  }
  while (targetPlanes.length > count) {
    const removed = targetPlanes.pop();
    attackers.forEach((attackerPlane) => {
      if (attackerPlane.lockedTarget === removed) {
        attackerPlane.clearLock();
      }
    });
  }
  applySimulationSettings();
}

function draw() {
  background(8, 12, 24);

  const dtMs = Math.min(typeof deltaTime === "number" ? deltaTime : 16.67, 100);

  if (currentScenario === "scenario1") {
    updateAndDrawScenario1(dtMs);
  } else {
    updateAndDrawBattleRoyale(dtMs);
  }

  // Mise à jour et rendu des explosions d'impact et fumées d'expiration
  updateAndDrawExplosions();
  updateAndDrawSmokePuffs();

  // HUD en haut à gauche
  drawHud();

  if (currentScenario === "scenario2" && battleWinner) {
    drawWinnerBanner(battleWinner);
  }
}

function updateAndDrawScenario1(dtMs) {
  // Largage des flares, puis déplacement des avions cibles
  targetPlanes.forEach((plane) => {
    const releasedFlares = plane.tryReleaseFlares(missiles, dtMs);
    if (releasedFlares.length > 0) {
      for (let i = 0; i < releasedFlares.length; i++) {
        flares.push(releasedFlares[i]);
      }
    }
    plane.applyBehaviors(missiles);
    plane.update();
    plane.edges();
  });

  // Mise à jour et rendu des flares (durée de vie 3 s)
  updateAndDrawFlares();

  // Déplacement des avions attaquants et gestion des verrous / tirs
  attackers.forEach((attackerPlane) => {
    attackerPlane.applyBehaviors();
    attackerPlane.update();
    attackerPlane.edges();

    const activeMissiles = countActiveMissilesForAttacker(attackerPlane);
    const canFire = activeMissiles < simulationSettings.maxMissilesPerAttacker;
    const fireTarget = attackerPlane.updateLock(targetPlanes, dtMs, canFire);
    if (fireTarget) {
      fireMissileSalvo(attackerPlane, fireTarget);
    }
  });

  // Rendu des avions
  targetPlanes.forEach((plane) => {
    plane.show();
  });
  attackers.forEach((attackerPlane) => {
    attackerPlane.show();
  });

  // Missiles (respawn 1 pour 1 en scénario 1 + ciblage des flares)
  updateAndDrawMissiles(targetPlanes, attackers, true, true);
}

function updateAndDrawFlares() {
  for (let i = flares.length - 1; i >= 0; i--) {
    const flare = flares[i];
    flare.applyBehaviors();
    flare.update();
    flare.edges();
    if (flare.isExpired()) {
      flares.splice(i, 1);
    } else {
      flare.show();
    }
  }
}

function updateAndDrawBattleRoyale(dtMs) {
  // Déplacement et verrouillage de tous les avions du Battle Royale
  battlePlanes.forEach((plane) => {
    plane.applyBehaviors(missiles);
    plane.update();
    plane.edges();

    const activeMissiles = countActiveMissilesForAttacker(plane);
    const canFire = activeMissiles < simulationSettings.maxMissilesPerAttacker;
    const fireTarget = plane.updateLock(battlePlanes, dtMs, canFire);
    if (fireTarget) {
      fireMissileSalvo(plane, fireTarget);
    }
  });

  // Rendu de tous les avions
  battlePlanes.forEach((plane) => {
    plane.show();
  });

  // Missiles (pas de régénération en Battle Royale)
  updateAndDrawMissiles(battlePlanes, battlePlanes, false);

  // Vérification du vainqueur unique
  if (!battleWinner && battlePlanes.length === 1 && simulationSettings.battlePlaneCount >= 2) {
    battleWinner = battlePlanes[0];
    battleWinner.isWinner = true;
    battleWinner.clearLock();
    battleWinner.setLocked(false, null);
  }
}

function countActiveMissilesForAttacker(attackerPlane) {
  let count = 0;
  for (let i = 0; i < missiles.length; i++) {
    if (missiles[i].owner === attackerPlane) {
      count += 1;
    }
  }
  return count;
}

function fireMissileSalvo(attackerPlane, targetPlane) {
  const activeCount = countActiveMissilesForAttacker(attackerPlane);
  const availableSlots = simulationSettings.maxMissilesPerAttacker - activeCount;
  if (availableSlots <= 0) {
    return;
  }

  const heading = attackerPlane.vel.heading();
  const wingOffset = attackerPlane.r * 0.9;
  const sideAngles = [heading + HALF_PI, heading - HALF_PI];
  const missilesToFire = Math.min(2, availableSlots);

  for (let i = 0; i < missilesToFire; i++) {
    const launchAngle = sideAngles[i];
    const spawnX = attackerPlane.pos.x + Math.cos(launchAngle) * wingOffset;
    const spawnY = attackerPlane.pos.y + Math.sin(launchAngle) * wingOffset;
    missiles.push(
      new Missile(
        spawnX,
        spawnY,
        targetPlane,
        simulationSettings.missileSpeedMultiplier,
        attackerPlane.maxSpeed,
        launchAngle,
        simulationSettings.missileMaxForce,
        simulationSettings.missileLifeSec * 1000,
        attackerPlane
      )
    );
  }
}

function updateAndDrawMissiles(targetList, attackerList, respawnTarget, useFlares = false) {
  for (let i = missiles.length - 1; i >= 0; i--) {
    const missile = missiles[i];
    const initialTargetIndex = targetList.indexOf(missile.initialTarget);
    if (initialTargetIndex === -1) {
      spawnSmokePuff(missile.pos.x, missile.pos.y, missile.vel);
      missiles.splice(i, 1);
      continue;
    }

    if (useFlares) {
      missile.selectTarget(flares);
    }

    missile.applyBehaviors();
    missile.update();
    missile.edges();

    if (missile.isExpired()) {
      spawnSmokePuff(missile.pos.x, missile.pos.y, missile.vel);
      missiles.splice(i, 1);
      continue;
    }

    if (missile.hasHitTarget()) {
      // Impact sur un flare : le missile et le flare meurent, l'avion cible survit
      if (missile.target instanceof Flare) {
        const flareIndex = flares.indexOf(missile.target);
        if (flareIndex !== -1) {
          flares.splice(flareIndex, 1);
        }
        spawnExplosion(missile.pos.x, missile.pos.y, 14);
        missiles.splice(i, 1);
        continue;
      }

      const hitTarget = targetList[initialTargetIndex];
      spawnExplosion(hitTarget.pos.x, hitTarget.pos.y);

      // Si la cible détruite avait elle-même un verrou (Battle Royale), le libérer
      if (typeof hitTarget.clearLock === "function") {
        hitTarget.clearLock();
      }

      attackerList.forEach((attackerPlane) => {
        if (attackerPlane.lockedTarget === hitTarget) {
          attackerPlane.clearLock();
        }
      });

      targetList.splice(initialTargetIndex, 1);
      missiles.splice(i, 1);

      if (respawnTarget) {
        const respawned = new TargetPlane(
          random(width * 0.1, width * 0.9),
          random(height * 0.1, height * 0.9)
        );
        applyTargetSettings(respawned);
        targetList.push(respawned);
      }
    } else {
      missile.show();
    }
  }
}

function drawHud() {
  push();
  const label =
    currentScenario === "scenario1"
      ? `Attaquants : ${attackers.length} · Cibles : ${targetPlanes.length}`
      : `Battle Royale · Survivants : ${battlePlanes.length}`;
  textSize(15);
  textStyle(BOLD);
  textAlign(LEFT, CENTER);

  const paddingX = 14;
  const boxHeight = 34;
  const boxWidth = textWidth(label) + paddingX * 2;
  const boxX = 12;
  const boxY = 12;

  fill(15, 15, 25, 210);
  stroke(255, 255, 255, 100);
  strokeWeight(1);
  rect(boxX, boxY, boxWidth, boxHeight, 8);

  noStroke();
  fill(255);
  text(label, boxX + paddingX, boxY + boxHeight / 2);
  pop();
}

function drawWinnerBanner(winner) {
  push();
  const titleText = `VAINQUEUR : AVION #${winner.id}`;
  const subText = "Cliquez sur « Relancer la simulation » pour une nouvelle partie";

  textSize(24);
  textStyle(BOLD);
  const titleW = textWidth(titleText);

  textSize(13);
  textStyle(NORMAL);
  const subW = textWidth(subText);

  const boxWidth = Math.max(titleW, subW) + 48;
  const boxHeight = 76;
  const boxX = (width - boxWidth) * 0.5;
  const boxY = 64;

  fill(15, 20, 35, 225);
  stroke(250, 204, 21, 220);
  strokeWeight(2);
  rect(boxX, boxY, boxWidth, boxHeight, 12);

  noStroke();
  textAlign(CENTER, CENTER);
  fill(250, 204, 21);
  textSize(24);
  textStyle(BOLD);
  text(titleText, width * 0.5, boxY + 28);

  fill(226, 232, 240);
  textSize(13);
  textStyle(NORMAL);
  text(subText, width * 0.5, boxY + 56);
  pop();
}

function spawnExplosion(x, y, particleCount = 32) {
  for (let i = 0; i < particleCount; i++) {
    explosionParticles.push(new ExplosionParticle(x, y));
  }
}

function updateAndDrawExplosions() {
  for (let i = explosionParticles.length - 1; i >= 0; i--) {
    const particle = explosionParticles[i];
    particle.applyBehaviors();
    particle.update();
    if (particle.isFinished()) {
      explosionParticles.splice(i, 1);
    } else {
      particle.show();
    }
  }
}

function spawnSmokePuff(x, y, baseVel = null, puffCount = 14) {
  for (let i = 0; i < puffCount; i++) {
    smokePuffs.push(new SmokePuff(x, y, baseVel));
  }
}

function updateAndDrawSmokePuffs() {
  for (let i = smokePuffs.length - 1; i >= 0; i--) {
    const puff = smokePuffs[i];
    puff.applyBehaviors();
    puff.update();
    if (puff.isFinished()) {
      smokePuffs.splice(i, 1);
    } else {
      puff.show();
    }
  }
}

function createControls() {
  const panel = createDiv();
  panel.addClass("controls");

  const header = createDiv();
  header.addClass("controls__header");
  header.parent(panel);

  const title = createElement("h1", "Paramètres radar & missiles");
  title.parent(header);

  const toggleButton = createButton("Masquer");
  toggleButton.addClass("controls__toggle");
  toggleButton.attribute("aria-expanded", "true");
  toggleButton.parent(header);

  const content = createDiv();
  content.addClass("controls__content");
  content.parent(panel);

  toggleButton.mousePressed(() => {
    const isOpen = !panel.elt.classList.toggle("controls--collapsed");
    toggleButton.html(isOpen ? "Masquer" : "Afficher");
    toggleButton.attribute("aria-expanded", String(isOpen));
  });

  const scenarioRow = createDiv();
  scenarioRow.addClass("controls__row controls__row--select");
  scenarioRow.parent(content);

  const scenarioLabel = createElement("label", "Scénario");
  scenarioLabel.parent(scenarioRow);

  const scenarioSelect = createSelect();
  scenarioSelect.addClass("controls__select");
  scenarioSelect.option("Scénario 1 : Attaquants vs Cibles", "scenario1");
  scenarioSelect.option("Scénario 2 : Battle Royale", "scenario2");
  scenarioSelect.selected(currentScenario);
  scenarioSelect.parent(scenarioRow);
  scenarioSelect.changed(() => {
    currentScenario = scenarioSelect.value();
    resetSimulation();
  });

  const attackerCount = createSliderControl(
    content,
    "Nombre d'attaquants (Scén. 1)",
    1,
    15,
    simulationSettings.attackerCount,
    1,
    (value) => {
      simulationSettings.attackerCount = value;
      setAttackerCount(value);
    }
  );

  const targetCount = createSliderControl(
    content,
    "Nombre de cibles (Scén. 1)",
    1,
    20,
    simulationSettings.targetCount,
    1,
    (value) => {
      simulationSettings.targetCount = value;
      setTargetCount(value);
    }
  );

  const battlePlaneCount = createSliderControl(
    content,
    "Avions (Battle Royale)",
    2,
    20,
    simulationSettings.battlePlaneCount,
    1,
    (value) => {
      simulationSettings.battlePlaneCount = value;
      if (currentScenario === "scenario2") {
        resetSimulation();
      }
    }
  );

  const detectionRadius = createSliderControl(
    content,
    "Rayon de détection",
    50,
    600,
    simulationSettings.detectionRadius,
    1,
    (value) => {
      simulationSettings.detectionRadius = value;
      applySimulationSettings();
    }
  );

  const unlockDelay = createSliderControl(
    content,
    "Temps de délock (s)",
    0.5,
    15,
    simulationSettings.unlockDelaySec,
    0.5,
    (value) => {
      simulationSettings.unlockDelaySec = value;
      applySimulationSettings();
    }
  );

  const missileSpeed = createSliderControl(
    content,
    "Vitesse missile (× avion)",
    1,
    4,
    simulationSettings.missileSpeedMultiplier,
    0.1,
    (value) => {
      simulationSettings.missileSpeedMultiplier = value;
      applySimulationSettings();
    }
  );

  const missileForce = createSliderControl(
    content,
    "Accélération max missile",
    0.05,
    3,
    simulationSettings.missileMaxForce,
    0.05,
    (value) => {
      simulationSettings.missileMaxForce = value;
      applySimulationSettings();
    }
  );

  const missileLife = createSliderControl(
    content,
    "Durée de vie missile (s)",
    1,
    15,
    simulationSettings.missileLifeSec,
    0.5,
    (value) => {
      simulationSettings.missileLifeSec = value;
      applySimulationSettings();
    }
  );

  const maxMissilesPerAttacker = createSliderControl(
    content,
    "Missiles max / attaquant",
    1,
    10,
    simulationSettings.maxMissilesPerAttacker,
    1,
    (value) => {
      simulationSettings.maxMissilesPerAttacker = value;
    }
  );

  const targetFleeTitle = createElement("h2", "Fuite des cibles (missiles)");
  targetFleeTitle.addClass("controls__section-title");
  targetFleeTitle.parent(content);

  const targetMissileDetect = createSliderControl(
    content,
    "Rayon détection missiles",
    50,
    400,
    simulationSettings.targetMissileDetectionRadius,
    1,
    (value) => {
      simulationSettings.targetMissileDetectionRadius = value;
      applySimulationSettings();
    }
  );

  const targetMissileSafe = createSliderControl(
    content,
    "Distance sécurité missiles",
    100,
    600,
    simulationSettings.targetMissileSafeDistance,
    1,
    (value) => {
      simulationSettings.targetMissileSafeDistance = value;
      applySimulationSettings();
    }
  );

  const targetFleeSpeed = createSliderControl(
    content,
    "Vitesse max fuite cible",
    5,
    20,
    simulationSettings.targetFleeMaxSpeed,
    0.1,
    (value) => {
      simulationSettings.targetFleeMaxSpeed = value;
      applySimulationSettings();
    }
  );

  const targetFleeForce = createSliderControl(
    content,
    "Accél. max fuite cible",
    0.1,
    3,
    simulationSettings.targetFleeMaxForce,
    0.05,
    (value) => {
      simulationSettings.targetFleeMaxForce = value;
      applySimulationSettings();
    }
  );

  const debugCheckbox = createCheckbox("Debug (touche D)", false);
  debugCheckbox.addClass("controls__checkbox");
  debugCheckbox.parent(content);
  debugCheckbox.changed(() => {
    Vehicle.debug = debugCheckbox.checked();
  });

  const resetButton = createButton("Relancer la simulation");
  resetButton.addClass("controls__toggle");
  resetButton.parent(content);
  resetButton.mousePressed(() => {
    resetSimulation();
  });

  return {
    scenarioSelect,
    attackerCount: { slider: attackerCount.slider },
    targetCount: { slider: targetCount.slider },
    battlePlaneCount: { slider: battlePlaneCount.slider },
    detectionRadius: { slider: detectionRadius.slider },
    unlockDelay: { slider: unlockDelay.slider },
    missileSpeed: { slider: missileSpeed.slider },
    missileForce: { slider: missileForce.slider },
    missileLife: { slider: missileLife.slider },
    maxMissilesPerAttacker: { slider: maxMissilesPerAttacker.slider },
    debugCheckbox,
    resetButton
  };
}

function createSliderControl(parent, labelText, min, max, initial, step, onInput) {
  const row = createDiv();
  row.addClass("controls__row");
  row.parent(parent);

  const label = createElement("label", labelText);
  label.parent(row);

  const slider = createSlider(min, max, initial, step);
  slider.parent(row);

  const valueDisplay = createSpan(formatControlValue(initial, step));
  valueDisplay.addClass("controls__value");
  valueDisplay.parent(row);

  slider.input(() => {
    const value = Number(slider.value());
    valueDisplay.html(formatControlValue(value, step));
    onInput(value);
  });

  return { slider, valueDisplay };
}

function formatControlValue(value, step) {
  if (step < 0.1) {
    return Number(value).toFixed(2);
  }
  return step < 1 ? Number(value).toFixed(1) : String(value);
}

function applyTargetSettings(plane) {
  plane.missileDetectionRadius = simulationSettings.targetMissileDetectionRadius;
  plane.missileSafeDistance = simulationSettings.targetMissileSafeDistance;
  plane.fleeMaxSpeed = simulationSettings.targetFleeMaxSpeed;
  plane.fleeMaxForce = simulationSettings.targetFleeMaxForce;
}

function applyBattlePlaneSettings(plane) {
  plane.detectionRadius = simulationSettings.detectionRadius;
  plane.unlockDelayMs = simulationSettings.unlockDelaySec * 1000;
  applyTargetSettings(plane);
}

function applySimulationSettings() {
  attackers.forEach((attackerPlane) => {
    attackerPlane.detectionRadius = simulationSettings.detectionRadius;
    attackerPlane.unlockDelayMs = simulationSettings.unlockDelaySec * 1000;
  });
  targetPlanes.forEach((plane) => {
    applyTargetSettings(plane);
  });
  battlePlanes.forEach((plane) => {
    applyBattlePlaneSettings(plane);
  });
  missiles.forEach((missile) => {
    missile.setSpeedMultiplier(simulationSettings.missileSpeedMultiplier);
    missile.maxForce = simulationSettings.missileMaxForce;
    missile.maxLifeMs = simulationSettings.missileLifeSec * 1000;
  });
}

function keyPressed() {
  if (key === "d" || key === "D") {
    Vehicle.debug = !Vehicle.debug;
    controls.debugCheckbox.checked(Vehicle.debug);
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
