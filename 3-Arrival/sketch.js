let target;
let snake;
let snakeShaderTexture;
let gridShaderLayer;
let texteAnime;
let foods = [];
let cockroachLeader = null;
let cockroachSoldiers = [];
let pendingCockroachRespawns = [];
let cockroachMissiles = [];
let ringHitEffects = [];
let controls;
let fonts = {};
const repulsors = [];

const LEVEL_GRID_COLORS = [
  "#3b82f6", // Niveau 1 : Bleu indigo
  "#ec4899", // Niveau 2 : Magenta
  "#a855f7", // Niveau 3 : Violet
  "#f97316", // Niveau 4 : Orange
  "#14b8a6"  // Niveau 5 : Turquoise
];

const levelState = {
  level: 1,
  goalLength: 36,
  timeRemainingSec: 25,
  elapsedMs: 0,
  introBannerDurationMs: 2000,
  showingScoreText: false,
  customTextOverride: false,
  gameOver: false,
  gameOverReason: ""
};

const snakeSettings = {
  ringCount: 30,
  headMaxSpeed: 8,
  headMaxForce: 0.4,
  ringMaxSpeed: 10,
  ringMaxForce: 2,
  cockroachDetectionRadius: 60
};

const textSettings = {
  text: "Niveau 1",
  fontKey: "inconsolata",
  fleeRadius: 40,
  pointRadius: 3.2,
  color: "#fbbf24"
};

const gridSettings = {
  bgColor: "#070b18",
  gridColor: LEVEL_GRID_COLORS[0],
  gridSpacing: 40,
  lineWidth: 1.5,
  deformRadius: 120,
  deformStrength: 34,
  opacity: 1.0
};

function preload() {
  fonts.inconsolata = loadFont("./assets/inconsolata.otf");
  fonts.arialBold = loadFont("./assets/ArialBold.ttf");
  fonts.courierBold = loadFont("./assets/CourierNewBold.ttf");
  fonts.chalkduster = loadFont("./assets/Chalkduster.ttf");
}

function setup() {
  createCanvas(windowWidth, windowHeight);

  target = createVector(width * 0.5, height * 0.5);
  snakeShaderTexture = new SnakeShaderTexture(192);
  gridShaderLayer = new GridShaderLayer(width, height);
  snake = new Snake(width * 0.5, height * 0.5, snakeSettings.ringCount, snakeShaderTexture);
  texteAnime = new TexteAnime(
    width * 0.5,
    height * 0.5,
    textSettings.text,
    fonts[textSettings.fontKey]
  );

  controls = createControls();
  texteAnime.setFleeRadius(textSettings.fleeRadius);
  texteAnime.setPointRadius(textSettings.pointRadius);
  texteAnime.setColor(textSettings.color);
  applySnakeSettings();
  startLevel(1, true);
}

function getLevelConfig(level) {
  const baseLen = snake ? snake.rings.length : 30;
  const lengthGain = 4 + level * 2; // +6, +8, +10...
  const goalLength = (level === 1 ? 30 : baseLen) + lengthGain;
  const durationSec = Math.max(18, 28 - (level - 1));
  const foodOnScreen = Math.min(10, 4 + level);
  const gridColor = LEVEL_GRID_COLORS[(level - 1) % LEVEL_GRID_COLORS.length];
  return { goalLength, durationSec, foodOnScreen, gridColor };
}

function startLevel(level, resetSnakeLength = false) {
  if (resetSnakeLength) {
    snakeSettings.ringCount = 30;
    snake.setRingCount(30);
    syncRingCountUI();
  }

  const config = getLevelConfig(level);
  levelState.level = level;
  levelState.goalLength = config.goalLength;
  levelState.timeRemainingSec = config.durationSec;
  levelState.elapsedMs = 0;
  levelState.showingScoreText = false;
  levelState.customTextOverride = false;
  levelState.gameOver = false;
  levelState.gameOverReason = "";

  // Texte central : "Niveau N" pendant 2 s, puis mutation vers score / objectif
  updateCenterText(`Niveau ${level}`);

  // Couleur de grille propre au niveau
  gridSettings.gridColor = config.gridColor;
  applyGridSettings();
  if (controls && controls.gridColor) {
    controls.gridColor.picker.value(config.gridColor);
    controls.gridColor.valueDisplay.html(config.gridColor.toUpperCase());
  }

  // Nourriture flottante
  foods = [];
  for (let i = 0; i < config.foodOnScreen; i++) {
    spawnFood();
  }

  // Escadron de cafards (1 leader + formation 4x4 = 16 soldats)
  cockroachMissiles = [];
  ringHitEffects = [];
  pendingCockroachRespawns = [];
  spawnCockroachSquadron();
}

function spawnCockroachSquadron() {
  const margin = 90;
  const lx = random(margin, Math.max(margin + 20, width - margin));
  const ly = random(margin, Math.max(margin + 20, height - margin));
  cockroachLeader = new CockroachLeader(lx, ly);
  cockroachLeader.snakeDetectionRadius = snakeSettings.cockroachDetectionRadius;
  cockroachSoldiers = [];

  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 4; col++) {
      const slot = cockroachLeader.getFormationSlot(row, col);
      const soldier = new CockroachSoldier(slot.x, slot.y, row, col);
      soldier.snakeDetectionRadius = snakeSettings.cockroachDetectionRadius;
      cockroachSoldiers.push(soldier);
    }
  }
}

function spawnFood() {
  const margin = 40;
  foods.push(
    new Food(
      random(margin, Math.max(margin + 10, width - margin)),
      random(margin, Math.max(margin + 10, height - margin))
    )
  );
}

function updateCenterText(newText) {
  if (textSettings.text === newText) {
    return;
  }
  textSettings.text = newText;
  texteAnime.setText(newText);
  if (controls && controls.textInput) {
    controls.textInput.value(newText);
  }
}

function syncRingCountUI() {
  snakeSettings.ringCount = snake.rings.length;
  if (controls && controls.ringCount) {
    controls.ringCount.slider.value(snakeSettings.ringCount);
    controls.ringCount.valueDisplay.html(String(snakeSettings.ringCount));
  }
}

function draw() {
  background(gridSettings.bgColor);

  const dtMs = Math.min(typeof deltaTime === "number" ? deltaTime : 16.67, 100);
  const dtSec = dtMs / 1000;

  // 1. Grille déformable semi-transparente en fond d'écran (serpent + cafards + missiles)
  gridShaderLayer.applyBehaviors(
    snake,
    cockroachLeader,
    cockroachSoldiers,
    cockroachMissiles
  );
  gridShaderLayer.update();
  gridShaderLayer.show();

  target.x = mouseX;
  target.y = mouseY;

  // Mutation du texte central après 2 s : "Niveau N" -> "Score: X / Y"
  if (!levelState.gameOver && !levelState.customTextOverride) {
    levelState.elapsedMs += dtMs;
    if (levelState.elapsedMs >= levelState.introBannerDurationMs) {
      levelState.showingScoreText = true;
      updateCenterText(`${snake.rings.length} / ${levelState.goalLength}`);
    }
  }

  // Répulseurs pour le texte : souris + tête du serpent + tous ses anneaux
  repulsors.length = 0;
  repulsors.push(target, snake.head);
  for (let i = 0; i < snake.rings.length; i++) {
    repulsors.push(snake.rings[i]);
  }

  // 2. Texte animé au centre de l'écran ("Niveau N")
  texteAnime.applyBehaviors(repulsors);
  texteAnime.update();
  texteAnime.show();

  // 3. Nourriture flottante
  updateAndDrawFoods();

  // 4. Escadron de cafards (leader + 4x4 soldats)
  updateAndDrawCockroaches(dtMs);

  // 5. Cible visuelle sous le curseur de la souris
  push();
  fill(239, 68, 68, 200);
  noStroke();
  circle(target.x, target.y, 14);
  pop();

  // 6. Texture shader & serpent
  snakeShaderTexture.update();
  snakeShaderTexture.show();

  if (!levelState.gameOver) {
    snake.applyBehaviors(target);
    snake.update();
    checkEdibleCollisions();

    levelState.timeRemainingSec = Math.max(0, levelState.timeRemainingSec - dtSec);
    if (levelState.timeRemainingSec <= 0 && snake.rings.length < levelState.goalLength) {
      levelState.gameOver = true;
      levelState.gameOverReason = `TEMPS ÉCOULÉ AU NIVEAU ${levelState.level}`;
    }
  }
  snake.show();

  // 7. Missiles des cafards & mini animations d'impact
  updateAndDrawCockroachMissiles();
  updateAndDrawRingHitEffects();

  // 8. HUD niveau, longueur et timer
  drawLevelHud();
  if (levelState.gameOver) {
    drawGameOverBanner();
  }
}

function updateAndDrawFoods() {
  for (let i = 0; i < foods.length; i++) {
    foods[i].applyBehaviors();
    foods[i].update();
    foods[i].edges();
    foods[i].show();
  }
}

function updateAndDrawCockroaches(dtMs) {
  // Réapparition des cafards mangés au bout de 5 secondes (position aléatoire -> arrive sur formation)
  for (let i = pendingCockroachRespawns.length - 1; i >= 0; i--) {
    pendingCockroachRespawns[i].remainingMs -= dtMs;
    if (pendingCockroachRespawns[i].remainingMs <= 0) {
      const item = pendingCockroachRespawns[i];
      pendingCockroachRespawns.splice(i, 1);

      const margin = 40;
      const rx = random(margin, Math.max(margin + 10, width - margin));
      const ry = random(margin, Math.max(margin + 10, height - margin));

      if (!cockroachLeader) {
        cockroachLeader = new CockroachLeader(rx, ry);
        cockroachLeader.snakeDetectionRadius = snakeSettings.cockroachDetectionRadius;
      } else {
        const soldier = new CockroachSoldier(rx, ry, item.row, item.col);
        soldier.snakeDetectionRadius = snakeSettings.cockroachDetectionRadius;
        cockroachSoldiers.push(soldier);
      }
    }
  }

  if (!levelState.gameOver) {
    if (cockroachLeader) {
      const fireOrder = cockroachLeader.updateTimingAndCheckFireOrder(dtMs);
      cockroachLeader.applyBehaviors(snake.head);
      cockroachLeader.update();
      cockroachLeader.edges();

      if (fireOrder && snake.rings.length > 0) {
        for (let i = 0; i < cockroachSoldiers.length; i++) {
          const soldier = cockroachSoldiers[i];
          const targetRing = snake.rings[Math.floor(random(snake.rings.length))];
          cockroachMissiles.push(
            new CockroachMissile(soldier.pos.x, soldier.pos.y, targetRing)
          );
        }
      }
    }

    for (let i = 0; i < cockroachSoldiers.length; i++) {
      const soldier = cockroachSoldiers[i];
      soldier.applyBehaviors(cockroachLeader, snake.head);
      soldier.update();
    }
  }

  for (let i = 0; i < cockroachSoldiers.length; i++) {
    cockroachSoldiers[i].show();
  }
  if (cockroachLeader) {
    cockroachLeader.show();
  }
}

function updateAndDrawCockroachMissiles() {
  for (let i = cockroachMissiles.length - 1; i >= 0; i--) {
    const missile = cockroachMissiles[i];
    if (missile.isExpired()) {
      cockroachMissiles.splice(i, 1);
      continue;
    }

    if (!levelState.gameOver) {
      if (!missile.targetRing || !snake.rings.includes(missile.targetRing)) {
        if (snake.rings.length > 0) {
          missile.targetRing = snake.rings[Math.floor(random(snake.rings.length))];
        }
      }
      missile.applyBehaviors();
      missile.update();

      // Collision avec la tête du serpent -> mort immédiate du serpent
      const hdx = missile.pos.x - snake.head.pos.x;
      const hdy = missile.pos.y - snake.head.pos.y;
      const headHitR = missile.r + snake.head.r * 0.85;
      if (hdx * hdx + hdy * hdy <= headHitR * headHitR) {
        spawnRingHitEffect(snake.head.pos.x, snake.head.pos.y, 26);
        cockroachMissiles.splice(i, 1);
        levelState.gameOver = true;
        levelState.gameOverReason = `SERPENT TOUCHÉ À LA TÊTE (NIVEAU ${levelState.level})`;
        continue;
      }

      // Collision avec un anneau du serpent -> perte de l'anneau + mini animation
      let hitRing = false;
      for (let rIdx = 0; rIdx < snake.rings.length; rIdx++) {
        const ring = snake.rings[rIdx];
        const rdx = missile.pos.x - ring.pos.x;
        const rdy = missile.pos.y - ring.pos.y;
        const ringHitR = missile.r + ring.r;
        if (rdx * rdx + rdy * rdy <= ringHitR * ringHitR) {
          spawnRingHitEffect(ring.pos.x, ring.pos.y, 12);
          snake.removeRingAt(rIdx);
          syncRingCountUI();
          cockroachMissiles.splice(i, 1);
          hitRing = true;
          if (snake.rings.length === 0) {
            levelState.gameOver = true;
            levelState.gameOverReason = `PLUS AUCUN ANNEAU (NIVEAU ${levelState.level})`;
          }
          break;
        }
      }

      if (hitRing) {
        continue;
      }
    }

    missile.show();
  }
}

function spawnRingHitEffect(x, y, count = 12) {
  for (let i = 0; i < count; i++) {
    ringHitEffects.push(new RingHitEffect(x, y));
  }
}

function updateAndDrawRingHitEffects() {
  for (let i = ringHitEffects.length - 1; i >= 0; i--) {
    const fx = ringHitEffects[i];
    fx.applyBehaviors();
    fx.update();
    if (fx.isFinished()) {
      ringHitEffects.splice(i, 1);
    } else {
      fx.show();
    }
  }
}

function checkEdibleCollisions() {
  const hx = snake.head.pos.x;
  const hy = snake.head.pos.y;
  const hr = snake.head.r;

  // 1. Manger la nourriture flottante (+3 anneaux : objectif principal)
  for (let i = foods.length - 1; i >= 0; i--) {
    const food = foods[i];
    const dx = food.pos.x - hx;
    const dy = food.pos.y - hy;
    const eatR = hr + food.r;
    if (dx * dx + dy * dy <= eatR * eatR) {
      spawnRingHitEffect(food.pos.x, food.pos.y, 10);
      foods.splice(i, 1);
      snake.grow(3);
      syncRingCountUI();
      spawnFood();
    }
  }

  // 2. Manger les cafards soldats (+1 anneau, réapparition au bout de 5 s)
  for (let i = cockroachSoldiers.length - 1; i >= 0; i--) {
    const soldier = cockroachSoldiers[i];
    const dx = soldier.pos.x - hx;
    const dy = soldier.pos.y - hy;
    const eatR = hr + soldier.r;
    if (dx * dx + dy * dy <= eatR * eatR) {
      spawnRingHitEffect(soldier.pos.x, soldier.pos.y, 8);
      pendingCockroachRespawns.push({
        remainingMs: 5000,
        row: soldier.row,
        col: soldier.col
      });
      cockroachSoldiers.splice(i, 1);
      snake.grow(1);
      syncRingCountUI();
    }
  }

  // 3. Manger le leader cafard (+1 anneau, un soldat est promu leader, réapparition du soldat dans 5 s)
  if (cockroachLeader) {
    const dx = cockroachLeader.pos.x - hx;
    const dy = cockroachLeader.pos.y - hy;
    const eatR = hr + cockroachLeader.r;
    if (dx * dx + dy * dy <= eatR * eatR) {
      spawnRingHitEffect(cockroachLeader.pos.x, cockroachLeader.pos.y, 14);
      snake.grow(1);
      syncRingCountUI();

      if (cockroachSoldiers.length > 0) {
        const promoted = cockroachSoldiers.shift();
        const newLeader = new CockroachLeader(promoted.pos.x, promoted.pos.y);
        newLeader.snakeDetectionRadius = snakeSettings.cockroachDetectionRadius;
        newLeader.heading = promoted.heading;
        newLeader.moveDirectionAngle = promoted.heading;
        newLeader.vel.set(
          Math.cos(newLeader.moveDirectionAngle) * newLeader.maxSpeed,
          Math.sin(newLeader.moveDirectionAngle) * newLeader.maxSpeed
        );
        cockroachLeader = newLeader;
        pendingCockroachRespawns.push({
          remainingMs: 5000,
          row: promoted.row,
          col: promoted.col
        });
      } else {
        cockroachLeader = null;
        pendingCockroachRespawns.push({
          remainingMs: 5000,
          row: 0,
          col: 0
        });
      }
    }
  }

  // Vérifier si l'objectif de longueur du niveau est atteint
  if (snake.rings.length >= levelState.goalLength) {
    startLevel(levelState.level + 1, false);
  }
}

function drawLevelHud() {
  push();
  const timeText = levelState.timeRemainingSec.toFixed(1);
  const label = `Niveau ${levelState.level} · Longueur : ${snake.rings.length} / ${levelState.goalLength} · Temps : ${timeText}s`;
  textSize(15);
  textStyle(BOLD);
  textAlign(LEFT, CENTER);

  const paddingX = 14;
  const boxHeight = 36;
  const boxWidth = textWidth(label) + paddingX * 2;
  const boxX = 12;
  const boxY = 12;

  fill(15, 15, 25, 215);
  stroke(
    levelState.timeRemainingSec <= 5 ? color(239, 68, 68, 220) : color(255, 255, 255, 110)
  );
  strokeWeight(1.5);
  rect(boxX, boxY, boxWidth, boxHeight, 8);

  noStroke();
  fill(levelState.timeRemainingSec <= 5 ? color(254, 202, 202) : color(255));
  text(label, boxX + paddingX, boxY + boxHeight / 2);
  pop();
}

function drawGameOverBanner() {
  push();
  const titleText = levelState.gameOverReason || `FIN DE PARTIE AU NIVEAU ${levelState.level}`;
  const subText = "Appuyez sur Entrée ou cliquez sur « Rejouer (Niveau 1) »";

  textSize(22);
  textStyle(BOLD);
  const titleW = textWidth(titleText);

  textSize(14);
  textStyle(NORMAL);
  const subW = textWidth(subText);

  const boxWidth = Math.max(titleW, subW) + 52;
  const boxHeight = 82;
  const boxX = (width - boxWidth) * 0.5;
  const boxY = 68;

  fill(15, 20, 35, 230);
  stroke(239, 68, 68, 220);
  strokeWeight(2);
  rect(boxX, boxY, boxWidth, boxHeight, 12);

  noStroke();
  textAlign(CENTER, CENTER);
  fill(248, 113, 113);
  textSize(22);
  textStyle(BOLD);
  text(titleText, width * 0.5, boxY + 28);

  fill(226, 232, 240);
  textSize(14);
  textStyle(NORMAL);
  text(subText, width * 0.5, boxY + 58);
  pop();
}

function createControls() {
  const panel = createDiv();
  panel.addClass("controls");

  const header = createDiv();
  header.addClass("controls__header");
  header.parent(panel);

  const title = createElement("h1", "Paramètres 3-Arrival");
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

  const restartButton = createButton("Rejouer (Niveau 1)");
  restartButton.addClass("controls__toggle");
  restartButton.parent(content);
  restartButton.mousePressed(() => {
    startLevel(1, true);
  });

  // --- Section Texte animé ---
  const textTitle = createElement("h2", "Texte animé");
  textTitle.addClass("controls__section-title");
  textTitle.parent(content);

  const textRow = createDiv();
  textRow.addClass("controls__row controls__row--field");
  textRow.parent(content);

  const textLabel = createElement("label", "Texte");
  textLabel.parent(textRow);

  const textInput = createInput(textSettings.text);
  textInput.addClass("controls__input");
  textInput.parent(textRow);
  textInput.input(() => {
    levelState.customTextOverride = true;
    textSettings.text = textInput.value();
    texteAnime.setText(textSettings.text);
  });

  const fontRow = createDiv();
  fontRow.addClass("controls__row controls__row--field");
  fontRow.parent(content);

  const fontLabel = createElement("label", "Police");
  fontLabel.parent(fontRow);

  const fontSelect = createSelect();
  fontSelect.addClass("controls__select");
  fontSelect.option("Inconsolata", "inconsolata");
  fontSelect.option("Arial Bold", "arialBold");
  fontSelect.option("Courier New Bold", "courierBold");
  fontSelect.option("Chalkduster", "chalkduster");
  fontSelect.selected(textSettings.fontKey);
  fontSelect.parent(fontRow);
  fontSelect.changed(() => {
    textSettings.fontKey = fontSelect.value();
    texteAnime.setFont(fonts[textSettings.fontKey]);
  });

  const textFleeRadius = createSliderControl(
    content,
    "Rayon répulsion texte",
    10,
    200,
    textSettings.fleeRadius,
    1,
    (value) => {
      textSettings.fleeRadius = value;
      texteAnime.setFleeRadius(value);
    }
  );

  createSliderControl(
    content,
    "Taille des points",
    1.5,
    8,
    textSettings.pointRadius,
    0.5,
    (value) => {
      textSettings.pointRadius = value;
      texteAnime.setPointRadius(value);
    }
  );

  createColorControl(content, "Couleur du texte", textSettings.color, (value) => {
    textSettings.color = value;
    texteAnime.setColor(value);
  });

  // --- Section Shader du serpent ---
  const snakeShaderTitle = createElement("h2", "Shader du serpent");
  snakeShaderTitle.addClass("controls__section-title");
  snakeShaderTitle.parent(content);

  const shaderRow = createDiv();
  shaderRow.addClass("controls__row controls__row--field");
  shaderRow.parent(content);

  const shaderLabel = createElement("label", "Shader corps");
  shaderLabel.parent(shaderRow);

  const shaderSelect = createSelect();
  shaderSelect.addClass("controls__select");
  Object.keys(SnakeShaderTexture.PRESETS).forEach((key) => {
    shaderSelect.option(SnakeShaderTexture.PRESETS[key].label, key);
  });
  shaderSelect.selected(snakeShaderTexture.activePresetKey);
  shaderSelect.parent(shaderRow);

  const shaderParamsContainer = createDiv();
  shaderParamsContainer.addClass("controls__subgrid");
  shaderParamsContainer.parent(content);

  const rebuildShaderParamsUI = () => {
    shaderParamsContainer.html("");
    const preset = snakeShaderTexture.getActivePreset();
    preset.params.forEach((param) => {
      createSliderControl(
        shaderParamsContainer,
        param.label,
        param.min,
        param.max,
        snakeShaderTexture.params[param.key] ?? param.initial,
        param.step,
        (value) => {
          snakeShaderTexture.setParam(param.key, value);
        }
      );
    });
  };

  shaderSelect.changed(() => {
    snakeShaderTexture.setPreset(shaderSelect.value());
    rebuildShaderParamsUI();
  });
  rebuildShaderParamsUI();

  // --- Section Grille déformable (Shader) ---
  const gridTitle = createElement("h2", "Grille déformable (Shader)");
  gridTitle.addClass("controls__section-title");
  gridTitle.parent(content);

  createColorControl(content, "Couleur du fond", gridSettings.bgColor, (value) => {
    gridSettings.bgColor = value;
  });

  const gridColorControl = createColorControl(
    content,
    "Couleur des mailles",
    gridSettings.gridColor,
    (value) => {
      gridSettings.gridColor = value;
      applyGridSettings();
    }
  );

  createSliderControl(
    content,
    "Espacement grille",
    16,
    100,
    gridSettings.gridSpacing,
    1,
    (value) => {
      gridSettings.gridSpacing = value;
      applyGridSettings();
    }
  );

  createSliderControl(
    content,
    "Rayon déformation",
    30,
    300,
    gridSettings.deformRadius,
    1,
    (value) => {
      gridSettings.deformRadius = value;
      applyGridSettings();
    }
  );

  createSliderControl(
    content,
    "Force déformation",
    0,
    100,
    gridSettings.deformStrength,
    1,
    (value) => {
      gridSettings.deformStrength = value;
      applyGridSettings();
    }
  );

  createSliderControl(
    content,
    "Opacité grille",
    0,
    1,
    gridSettings.opacity,
    0.05,
    (value) => {
      gridSettings.opacity = value;
      applyGridSettings();
    }
  );

  createSliderControl(
    content,
    "Épaisseur grille",
    0.5,
    5,
    gridSettings.lineWidth,
    0.25,
    (value) => {
      gridSettings.lineWidth = value;
      applyGridSettings();
    }
  );

  // --- Section Serpent (Arrival) ---
  const snakeTitle = createElement("h2", "Serpent (Arrival)");
  snakeTitle.addClass("controls__section-title");
  snakeTitle.parent(content);

  const ringCount = createSliderControl(
    content,
    "Nombre d'anneaux",
    1,
    150,
    snakeSettings.ringCount,
    1,
    (value) => {
      snakeSettings.ringCount = value;
      snake.setRingCount(value);
    }
  );

  const headMaxSpeed = createSliderControl(
    content,
    "Vitesse max tête",
    1,
    20,
    snakeSettings.headMaxSpeed,
    0.5,
    (value) => {
      snakeSettings.headMaxSpeed = value;
      applySnakeSettings();
    }
  );

  const headMaxForce = createSliderControl(
    content,
    "Accélération max tête",
    0.05,
    2,
    snakeSettings.headMaxForce,
    0.05,
    (value) => {
      snakeSettings.headMaxForce = value;
      applySnakeSettings();
    }
  );

  const ringMaxSpeed = createSliderControl(
    content,
    "Vitesse max anneaux",
    1,
    25,
    snakeSettings.ringMaxSpeed,
    0.5,
    (value) => {
      snakeSettings.ringMaxSpeed = value;
      applySnakeSettings();
    }
  );

  const ringMaxForce = createSliderControl(
    content,
    "Accélération max anneaux",
    0.05,
    3,
    snakeSettings.ringMaxForce,
    0.05,
    (value) => {
      snakeSettings.ringMaxForce = value;
      applySnakeSettings();
    }
  );

  // --- Section Cafards ---
  const cockroachTitle = createElement("h2", "Cafards (Leader Following)");
  cockroachTitle.addClass("controls__section-title");
  cockroachTitle.parent(content);

  createSliderControl(
    content,
    "Rayon détection cafards",
    20,
    200,
    snakeSettings.cockroachDetectionRadius,
    1,
    (value) => {
      snakeSettings.cockroachDetectionRadius = value;
      applyCockroachSettings();
    }
  );

  const debugCheckbox = createCheckbox("Debug (touche D)", false);
  debugCheckbox.addClass("controls__checkbox");
  debugCheckbox.parent(content);
  debugCheckbox.changed(() => {
    Vehicle.debug = debugCheckbox.checked();
  });

  return {
    textInput,
    fontSelect,
    shaderSelect,
    gridColor: gridColorControl,
    textFleeRadius: { slider: textFleeRadius.slider },
    ringCount,
    headMaxSpeed: { slider: headMaxSpeed.slider },
    headMaxForce: { slider: headMaxForce.slider },
    ringMaxSpeed: { slider: ringMaxSpeed.slider },
    ringMaxForce: { slider: ringMaxForce.slider },
    debugCheckbox
  };
}

function createColorControl(parent, labelText, initialHex, onInput) {
  const row = createDiv();
  row.addClass("controls__row controls__row--color");
  row.parent(parent);

  const label = createElement("label", labelText);
  label.parent(row);

  const picker = createColorPicker(initialHex);
  picker.addClass("controls__color");
  picker.parent(row);

  const valueDisplay = createSpan(initialHex.toUpperCase());
  valueDisplay.addClass("controls__value");
  valueDisplay.parent(row);

  picker.input(() => {
    const val = picker.value();
    valueDisplay.html(val.toUpperCase());
    onInput(val);
  });

  return { picker, valueDisplay };
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
  if (step < 0.05) {
    return Number(value).toFixed(2);
  }
  if (step < 0.1) {
    return Number(value).toFixed(2);
  }
  return step < 1 ? Number(value).toFixed(1) : String(value);
}

function applySnakeSettings() {
  snake.setHeadParams(snakeSettings.headMaxSpeed, snakeSettings.headMaxForce);
  snake.setRingParams(snakeSettings.ringMaxSpeed, snakeSettings.ringMaxForce);
}

function applyCockroachSettings() {
  if (cockroachLeader) {
    cockroachLeader.snakeDetectionRadius = snakeSettings.cockroachDetectionRadius;
  }
  for (let i = 0; i < cockroachSoldiers.length; i++) {
    cockroachSoldiers[i].snakeDetectionRadius = snakeSettings.cockroachDetectionRadius;
  }
}

function applyGridSettings() {
  gridShaderLayer.setGridColor(gridSettings.gridColor);
  gridShaderLayer.gridSpacing = gridSettings.gridSpacing;
  gridShaderLayer.lineWidth = gridSettings.lineWidth;
  gridShaderLayer.deformRadius = gridSettings.deformRadius;
  gridShaderLayer.deformStrength = gridSettings.deformStrength;
  gridShaderLayer.opacity = gridSettings.opacity;
}

function keyPressed() {
  const activeTag = document.activeElement ? document.activeElement.tagName : "";
  if (activeTag === "INPUT" || activeTag === "TEXTAREA" || activeTag === "SELECT") {
    return;
  }

  if (levelState.gameOver && keyCode === ENTER) {
    startLevel(1, true);
    return;
  }

  if (key === "d" || key === "D") {
    Vehicle.debug = !Vehicle.debug;
    controls.debugCheckbox.checked(Vehicle.debug);
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  if (gridShaderLayer) {
    gridShaderLayer.resize(width, height);
  }
  if (texteAnime) {
    texteAnime.setPosition(width * 0.5, height * 0.5);
  }
}
