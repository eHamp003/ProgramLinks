class AvatarSprite extends Phaser.GameObjects.Container {
  constructor(scene, x, y, avatar, opts = {}) {
    super(scene, x, y);
    scene.add.existing(this);

    this.scene = scene;
    this.avatar = avatar;
    this.basePath = opts.basePath || `assets/avatars/${avatar.animal.toLowerCase()}_${avatar.sex.toLowerCase()}/`;
    this.setScale(opts.scale ?? 1);

    this.state = {
      pants: "up",
      eyes: "open",
      mouth: "neutral",
      arms: "down"
    };

    this.layers = {};
  }

  static requiredFiles() {
    return [
      "body.png",
      "head.png",
      "eyes_open.png",
      "eyes_closed.png",
      "mouth_neutral.png",
      "mouth_smile.png",
      "mouth_urgent.png",
      "mouth_proud.png",
      "shirt.png",
      "pants_up.png",
      "pants_down.png",
  
    ];
  }

  build() {
    const addLayer = (key, depth) => {
      if (!this.scene.textures.exists(key)) return null;
      const img = this.scene.add.image(0, 0, key).setOrigin(0.5);
      img.setDepth(depth);
      this.add(img);
      return img;
    };

    this.layers.body = addLayer(this.tex("body.png"), 10);
    this.layers.shoes = addLayer(this.tex("shoes.png"), 15);

    this.layers.pants_up = addLayer(this.tex("pants_up.png"), 20);
    this.layers.pants_down = addLayer(this.tex("pants_down.png"), 20);

    this.layers.shirt = addLayer(this.tex("shirt.png"), 30);

    this.layers.arm_left_down = addLayer(this.tex("arm_left_down.png"), 40);
    this.layers.arm_left_up = addLayer(this.tex("arm_left_up.png"), 40);

    this.layers.arm_right_down = addLayer(this.tex("arm_right_down.png"), 41);
    this.layers.arm_right_up = addLayer(this.tex("arm_right_up.png"), 41);

    this.layers.head = addLayer(this.tex("head.png"), 50);

    this.layers.eyes_open = addLayer(this.tex("eyes_open.png"), 60);
    this.layers.eyes_closed = addLayer(this.tex("eyes_closed.png"), 60);

    this.layers.mouth_neutral = addLayer(this.tex("mouth_neutral.png"), 70);
    this.layers.mouth_smile = addLayer(this.tex("mouth_smile.png"), 70);
    this.layers.mouth_urgent = addLayer(this.tex("mouth_urgent.png"), 70);
    this.layers.mouth_proud = addLayer(this.tex("mouth_proud.png"), 70);

    this.applyState();
    this.startBlinkLoop();
  }

  tex(filename) {
    return `avatar:${this.basePath}${filename}`;
  }

  applyState() {
    const showOnly = (keys, active) => {
      keys.forEach(k => { if (this.layers[k]) this.layers[k].setVisible(k === active); });
    };

    showOnly(["pants_up", "pants_down"], this.state.pants === "down" ? "pants_down" : "pants_up");
    showOnly(["eyes_open", "eyes_closed"], this.state.eyes === "closed" ? "eyes_closed" : "eyes_open");
    showOnly(["mouth_neutral", "mouth_smile", "mouth_urgent", "mouth_proud"], `mouth_${this.state.mouth}`);

    showOnly(["arm_left_down", "arm_left_up"], this.state.arms === "up" ? "arm_left_up" : "arm_left_down");
    showOnly(["arm_right_down", "arm_right_up"], this.state.arms === "up" ? "arm_right_up" : "arm_right_down");
  }

  setExpression(mode) {
    if (mode === "neutral") this.state.mouth = "neutral";
    if (mode === "urgent") this.state.mouth = "urgent";
    if (mode === "focused") this.state.mouth = "neutral";
    if (mode === "relieved") this.state.mouth = "smile";
    if (mode === "proud") this.state.mouth = "proud";
    this.applyState();
  }

  setPantsDown(isDown) {
    this.state.pants = isDown ? "down" : "up";
    this.applyState();
  }

  setArmsUp(isUp) {
    this.state.arms = isUp ? "up" : "down";
    this.applyState();
  }

  startBlinkLoop() {
    this._blinkTimer?.remove(false);

    this._blinkTimer = this.scene.time.addEvent({
      delay: Phaser.Math.Between(3000, 6000),
      loop: true,
      callback: () => {
        this.state.eyes = "closed";
        this.applyState();
        this.scene.time.delayedCall(120, () => {
          this.state.eyes = "open";
          this.applyState();
        });
      }
    });
  }

  playIdle() {
    this.scene.tweens.add({
      targets: this,
      y: this.y - 6,
      yoyo: true,
      repeat: -1,
      duration: 1400,
      ease: "Sine.easeInOut"
    });
  }
}
