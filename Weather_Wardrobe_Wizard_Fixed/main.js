import * as THREE from 'three';
import { CONFIG, WEATHER_DATA, AVATARS, CLOTHING, CLOTHING_SEQUENCE, CATEGORY_LABELS } from './config.js';

// Z-depth layer order for correct visual stacking
const LAYER_Z = {
  background: -1,
  avatar: 0,
  bottom: 0.05,
  shoes: 0.06,
  top: 0.10,
  outerwear: 0.15,
  accessory: 0.20
};

// renderOrder ensures correct draw sequence with transparent materials
const RENDER_ORDER = {
  background: 0,
  avatar: 1,
  bottom: 2,
  shoes: 3,
  top: 4,
  outerwear: 5,
  accessory: 6
};

// Game state
const state = {
  scene: 'character-select', // 'character-select', 'weather', 'dressing', 'result'
  selectedAvatar: null,
  currentWeather: null,
  currentCategory: 0, // Index in CLOTHING_SEQUENCE
  selectedClothing: {
    top: null,
    bottom: null,
    shoes: null,
    outerwear: null,
    accessory: null
  },
  clothingMeshes: {} // Store Three.js meshes for each category
};

// Simple click sound using Web Audio API
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

function playClickSound() {
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  oscillator.frequency.value = 800;
  oscillator.type = 'sine';
  
  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
  
  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.1);
}

function playSuccessSound() {
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  oscillator.frequency.setValueAtTime(523, audioContext.currentTime);
  oscillator.frequency.setValueAtTime(659, audioContext.currentTime + 0.1);
  oscillator.frequency.setValueAtTime(784, audioContext.currentTime + 0.2);
  oscillator.type = 'sine';
  
  gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
  
  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.3);
}

// Three.js setup
let scene, camera, renderer;
let avatarMesh, backgroundMesh;
const textureLoader = new THREE.TextureLoader();

function init() {
  // Scene
  scene = new THREE.Scene();
  
  // Camera
  camera = new THREE.OrthographicCamera(
    -1, 1, 1, -1, 0.1, 100
  );
  camera.position.z = 5;
  
  // Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  document.body.appendChild(renderer.domElement);
  
  // Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 1);
  scene.add(ambientLight);
  
  // Resize handler
  window.addEventListener('resize', onResize);
  
  // Start with character select
  showCharacterSelect();
  
  // Render loop
  animate();
}

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}

function onResize() {
  camera.left = -1;
  camera.right = 1;
  camera.top = 1;
  camera.bottom = -1;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

// Clear scene
function clearScene() {
  while (scene.children.length > 0) {
    const object = scene.children[0];
    if (object.geometry) object.geometry.dispose();
    if (object.material) {
      if (object.material.map) object.material.map.dispose();
      object.material.dispose();
    }
    scene.remove(object);
  }
  
  // Re-add lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 1);
  scene.add(ambientLight);
  
  avatarMesh = null;
  backgroundMesh = null;
  state.clothingMeshes = {};
}

// Clear UI
function clearUI() {
  const existing = document.getElementById('ui-container');
  if (existing) existing.remove();
}

// CHARACTER SELECT SCENE
function showCharacterSelect() {
  clearScene();
  clearUI();
  state.scene = 'character-select';
  
  // Set background color
  renderer.setClearColor(0x90EE90);
  
  // Create UI
  const ui = document.createElement('div');
  ui.id = 'ui-container';
  ui.innerHTML = `
    <div class="title">Dress for the Weather!</div>
    <div class="subtitle">Choose your character:</div>
    <div class="character-buttons">
      <button class="char-btn" data-avatar="boy">
        <div class="avatar-preview" style="background-image: url('${AVATARS.boy.url}')"></div>
        <div>Boy</div>
      </button>
      <button class="char-btn" data-avatar="girl">
        <div class="avatar-preview" style="background-image: url('${AVATARS.girl.url}')"></div>
        <div>Girl</div>
      </button>
    </div>
  `;
  document.body.appendChild(ui);
  
  // Add click handlers
  document.querySelectorAll('.char-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      playClickSound();
      state.selectedAvatar = btn.dataset.avatar;
      showWeatherSelect();
    });
  });
}

// WEATHER SELECT SCENE
function showWeatherSelect() {
  clearScene();
  clearUI();
  state.scene = 'weather';
  
  // Randomly pick a weather
  const weathers = Object.keys(WEATHER_DATA);
  state.currentWeather = weathers[Math.floor(Math.random() * weathers.length)];
  const weatherData = WEATHER_DATA[state.currentWeather];
  
  // Set background
  renderer.setClearColor(new THREE.Color(weatherData.color));
  
  // Load weather background
  const bgTexture = textureLoader.load(weatherData.background);
  const bgGeometry = new THREE.PlaneGeometry(2, 2);
  const bgMaterial = new THREE.MeshBasicMaterial({ map: bgTexture });
  backgroundMesh = new THREE.Mesh(bgGeometry, bgMaterial);
  backgroundMesh.position.z = LAYER_Z.background;
  scene.add(backgroundMesh);
  
  // Create UI
  const ui = document.createElement('div');
  ui.id = 'ui-container';
  ui.innerHTML = `
    <div class="weather-title">${state.currentWeather}!</div>
    <div class="speech-bubble">${weatherData.speech}</div>
    <button class="next-btn">Start Dressing!</button>
  `;
  document.body.appendChild(ui);
  
  document.querySelector('.next-btn').addEventListener('click', () => {
    playClickSound();
    startDressing();
  });
}

// DRESSING SCENE
function startDressing() {
  clearUI();
  state.scene = 'dressing';
  state.currentCategory = 0;
  
  // Load avatar
  const avatarUrl = AVATARS[state.selectedAvatar].url;
  const avatarTexture = textureLoader.load(avatarUrl);
  const avatarGeometry = new THREE.PlaneGeometry(0.8, 1.2);
  const avatarMaterial = new THREE.MeshBasicMaterial({ 
    map: avatarTexture, 
    transparent: true,
    depthTest: false
  });
  avatarMesh = new THREE.Mesh(avatarGeometry, avatarMaterial);
  avatarMesh.position.set(0, 0, LAYER_Z.avatar);
  avatarMesh.renderOrder = RENDER_ORDER.avatar;
  scene.add(avatarMesh);
  
  showCurrentCategory();
}

function showCurrentCategory() {
  clearUI();
  
  const categoryKey = CLOTHING_SEQUENCE[state.currentCategory];
  const items = CLOTHING[categoryKey];
  
  // Create UI
  const ui = document.createElement('div');
  ui.id = 'ui-container';
  ui.innerHTML = `
    <div class="category-title">Choose ${CATEGORY_LABELS[categoryKey]}</div>
    <div class="progress">${state.currentCategory + 1} of ${CLOTHING_SEQUENCE.length}</div>
    <div class="clothing-options">
      ${items.map((item, index) => `
        <button class="clothing-btn" data-index="${index}">
          ${item.url ? `<img src="${item.url}" alt="${item.name}">` : '<div class="none-text">None</div>'}
          <div class="item-name">${item.name}</div>
        </button>
      `).join('')}
    </div>
  `;
  document.body.appendChild(ui);
  
  // Add click handlers
  document.querySelectorAll('.clothing-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      playClickSound();
      const index = parseInt(btn.dataset.index);
      selectClothing(categoryKey, index);
    });
  });
}

function selectClothing(category, index) {
  const item = CLOTHING[category][index];
  state.selectedClothing[category] = item;
  
  // Add visual feedback - highlight selected button
  document.querySelectorAll('.clothing-btn').forEach(btn => {
    btn.style.opacity = '0.5';
  });
  const selectedBtn = document.querySelector(`[data-index="${index}"]`);
  selectedBtn.style.opacity = '1';
  selectedBtn.style.transform = 'scale(1.1)';
  
  // Remove old mesh for this category if it exists
  if (state.clothingMeshes[category]) {
    scene.remove(state.clothingMeshes[category]);
    state.clothingMeshes[category].geometry.dispose();
    state.clothingMeshes[category].material.map?.dispose();
    state.clothingMeshes[category].material.dispose();
    delete state.clothingMeshes[category];
  }
  
  // Add new clothing mesh if not "None"
  if (item.url) {
    const texture = textureLoader.load(item.url);
    const geometry = new THREE.PlaneGeometry(item.scale, item.scale);
    const material = new THREE.MeshBasicMaterial({ 
      map: texture, 
      transparent: true,
      depthTest: false
    });
    const mesh = new THREE.Mesh(geometry, material);
    
    // Position relative to avatar — use category-specific z for correct layering
    const xOffset = item.xOffset || 0;
    const yOffset = item.yOffset || 0;
    const zLayer = LAYER_Z[category] || 0.1;
    mesh.position.set(xOffset, yOffset, zLayer);
    mesh.renderOrder = RENDER_ORDER[category] || 4;
    
    scene.add(mesh);
    state.clothingMeshes[category] = mesh;
  }
  
  // Move to next category or show result
  state.currentCategory++;
  if (state.currentCategory < CLOTHING_SEQUENCE.length) {
    setTimeout(() => showCurrentCategory(), 400);
  } else {
    setTimeout(() => showResult(), 600);
  }
}

// RESULT SCENE
function showResult() {
  clearUI();
  state.scene = 'result';
  
  // Play success sound
  playSuccessSound();
  
  // Check which items are correct
  const results = [];
  let correctCount = 0;
  
  CLOTHING_SEQUENCE.forEach(category => {
    const selected = state.selectedClothing[category];
    const isCorrect = selected && selected.good.includes(state.currentWeather);
    if (isCorrect) correctCount++;
    results.push({ category, selected, isCorrect });
  });
  
  // Generate feedback
  let feedback = '';
  let praise = '';
  
  if (correctCount === CLOTHING_SEQUENCE.length) {
    feedback = "Perfect! You're all dressed up for the weather! 🌟";
    praise = "Amazing job!";
  } else if (correctCount >= 3) {
    feedback = "Great job! You're mostly ready for the weather! 😊";
    praise = "Good work!";
    
    // Gentle corrections
    const wrong = results.filter(r => !r.isCorrect);
    if (wrong.length > 0) {
      feedback += `<br><br>Hmm, but maybe try different ${wrong.map(w => CATEGORY_LABELS[w.category].toLowerCase()).join(' and ')} for ${state.currentWeather} weather.`;
    }
  } else {
    feedback = "Good try! Let's think about what we wear when it's " + state.currentWeather.toLowerCase() + "! 🤔";
    praise = "You can do it!";
    
    // Helpful hints
    const wrong = results.filter(r => !r.isCorrect);
    if (state.currentWeather === 'Rainy') {
      feedback += `<br><br>When it rains, we need a raincoat and rain boots to stay dry!`;
    } else if (state.currentWeather === 'Snowy' || state.currentWeather === 'Cold') {
      feedback += `<br><br>When it's cold, we need warm clothes like a coat and hat!`;
    } else if (state.currentWeather === 'Very Hot' || state.currentWeather === 'Hot') {
      feedback += `<br><br>When it's hot, we wear light clothes like shorts and t-shirts!`;
    }
  }
  
  // Create UI
  const ui = document.createElement('div');
  ui.id = 'ui-container';
  ui.innerHTML = `
    <div class="result-title">${praise}</div>
    <div class="result-feedback">${feedback}</div>
    <div class="result-buttons">
      <button class="play-again-btn">Play Again!</button>
    </div>
  `;
  document.body.appendChild(ui);
  
  document.querySelector('.play-again-btn').addEventListener('click', () => {
    playClickSound();
    // Reset state
    state.currentCategory = 0;
    state.selectedClothing = {
      top: null,
      bottom: null,
      shoes: null,
      outerwear: null,
      accessory: null
    };
    showCharacterSelect();
  });
}

// Start the game
init();
