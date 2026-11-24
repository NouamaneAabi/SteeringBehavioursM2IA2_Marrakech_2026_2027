let vehicles = [];
let imageFusee;
let controls;

const wanderSettings = {
  vehicleCount: 20,
  maxSpeed: 6,
  maxForce: 0.2,
  wanderRadius: 50,
  distanceCercle: 150,
  displaceRange: 0.3,
  pathLength: 15
};

function preload() {
  imageFusee = loadImage("./assets/vehicule.png");
}

function setup() {
  createCanvas(windowWidth, windowHeight);

  controls = createControls();
  setVehicleCount(wanderSettings.vehicleCount);
  applyVehicleSettings();
}

function setVehicleCount(count) {
  while (vehicles.length < count) {
    const v = new Vehicle(random(width), random(height), imageFusee);
    vehicles.push(v);
  }
  vehicles.length = count;
  applyVehicleSettings();
}

function applyVehicleSettings() {
  for (let i = 0; i < vehicles.length; i++) {
    const v = vehicles[i];
    v.maxSpeed = wanderSettings.maxSpeed;
    v.maxForce = wanderSettings.maxForce;
    v.wanderRadius = wanderSettings.wanderRadius;
    v.distanceCercle = wanderSettings.distanceCercle;
    v.displaceRange = wanderSettings.displaceRange;
    v.pathLength = wanderSettings.pathLength;
  }
}

function draw() {
  background(8, 12, 24);

  for (let i = 0; i < vehicles.length; i++) {
    const vehicle = vehicles[i];
    vehicle.applyBehaviors();
    vehicle.update();
    vehicle.edges();
    vehicle.show();
  }
}

function createControls() {
  const panel = createDiv();
  panel.addClass("controls");

  const header = createDiv();
  header.addClass("controls__header");
  header.parent(panel);

  const title = createElement("h1", "Paramètres Wander");
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

  createSliderControl(
    content,
    "Nombre de vaisseaux",
    1,
    100,
    wanderSettings.vehicleCount,
    1,
    (value) => {
      wanderSettings.vehicleCount = value;
      setVehicleCount(value);
    }
  );

  createSliderControl(
    content,
    "Vitesse Max",
    1,
    20,
    wanderSettings.maxSpeed,
    0.5,
    (value) => {
      wanderSettings.maxSpeed = value;
      applyVehicleSettings();
    }
  );

  createSliderControl(
    content,
    "Force Max",
    0.05,
    2,
    wanderSettings.maxForce,
    0.05,
    (value) => {
      wanderSettings.maxForce = value;
      applyVehicleSettings();
    }
  );

  createSliderControl(
    content,
    "Rayon Wander",
    5,
    150,
    wanderSettings.wanderRadius,
    1,
    (value) => {
      wanderSettings.wanderRadius = value;
      applyVehicleSettings();
    }
  );

  createSliderControl(
    content,
    "Distance Wander",
    20,
    300,
    wanderSettings.distanceCercle,
    5,
    (value) => {
      wanderSettings.distanceCercle = value;
      applyVehicleSettings();
    }
  );

  createSliderControl(
    content,
    "Amplitude angle",
    0.05,
    1,
    wanderSettings.displaceRange,
    0.05,
    (value) => {
      wanderSettings.displaceRange = value;
      applyVehicleSettings();
    }
  );

  createSliderControl(
    content,
    "Longueur traînée",
    0,
    60,
    wanderSettings.pathLength,
    1,
    (value) => {
      wanderSettings.pathLength = value;
      applyVehicleSettings();
    }
  );

  const debugCheckbox = createCheckbox("Mode Debug (touche D)", false);
  debugCheckbox.addClass("controls__checkbox");
  debugCheckbox.parent(content);
  debugCheckbox.changed(() => {
    Vehicle.debug = debugCheckbox.checked();
  });

  return { debugCheckbox };
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

function keyPressed() {
  if (key === "d" || key === "D") {
    Vehicle.debug = !Vehicle.debug;
    controls.debugCheckbox.checked(Vehicle.debug);
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
