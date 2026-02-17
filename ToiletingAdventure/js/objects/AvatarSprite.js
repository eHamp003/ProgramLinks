class AvatarSprite extends Phaser.GameObjects.Container {
  /**
   * @param {Phaser.Scene} scene
   * @param {number} x
   * @param {number} y
   * @param {{animal:string, sex:"M"|"F"}} avatar
   * @param {{basePath?:string, scale?:number}} opts
   */
  constructor(scene, x, y, avatar, opts = {}) {
    super(scene, x, y);
    scene.add.existing(this);

    this.scene = scene;
    this.avatar = avatar;
    this.basePath = opts.basePath || `assets/avatars/${avatar.animal.toLowerCase()}_${avatar.sex.toLowerCase()}/`;
    this.setScale(opts.scale ?? 1);

    this.state = {
      pants: "up", // "up" | "down"
      eyes: "open", // "open" | "closed"
      mouth: "neutral", // neutral | smile | urgent | proud
      arms: "down" // down | up
    };

    /** @type {Record<string, Phaser.GameObjects.Image>} */
    this.layers = {};
  }

  static requiredFiles() {
    return [
      "body.png",
      "head.png",               // optional if you combine head+body, but keep for consistency
      "eyes_open.png",
      "eyes_closed.png",
      "mouth_neutral.png",
      "mouth_smile.png",
      "mouth_urgent.png",
      "mouth_proud.png",
      "shirt.png",
      "pants_up.png",
      "pants_down.png",
      "arm_left_down.png",
      "arm_left_up.png",
      "arm_right_down.png",
      "arm_right_up.png",
      "shoes.png"               // optional
    ];
  }

  /**
   * Call after assets are loaded.
   * Builds image layers and adds them to the container.
   */
  build() {
    // Helper to safely create a layer if texture exists
    const addLayer = (key, depth) => {
      if (!this.scene.textures.exists(key)) return null;
      const img = this.scene.add.image(0, 0, key).setOrigin(0.5);
      img.setDepth(depth);
      this.add(img);
      return img;
    };

    // Base (depth order)
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

    // Apply initial visibility
    this.applyState();
    this.startBlinkLoop();
  }

  /** Convert a file path into a Phaser texture key */
  tex(filename) {
    // e.g. "assets/avatars/dog_m/body.png" becomes key "avatar:assets/avatars/dog_m/body.png"
    return `avatar:${this.basePath}${filename}`;
  }

  /** Apply current state to layer visibility */
  applyState() {
    const showOnly = (groupKeys, activeKey) => {
      groupKeys.forEach(k => { if (this.layers[k]) this.layers[k].setVisible(k === activeKey); });
    };

    // Pants
    showOnly(["pants_up", "pants_down"], this.state.pants === "down" ? "pants_down" : "pants_up");

    // Eyes
    showOnly(["eyes_open", "eyes_closed"], this.state.eyes === "closed" ? "eyes_closed" : "eyes_open");

    // Mouth
    showOnly(
      ["mouth_neutral", "mouth_smile", "mouth_urgent", "mouth_proud"],
      `mouth_${this.state.mouth}`
    );

    // Arms
    showOnly(["arm_left_down", "arm_left_up"], this.state.arms === "up" ? "arm_left_up" : "arm_left_down");
    showOnly(["arm_right_down", "arm_right_up"], this.state.arms === "up" ? "arm_right_up" : "arm_right_down");
  }

  setExpression(mode) {
    // mode: neutral | urgent | focused | relieved | proud
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
    // Random blink every 3–6 seconds
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

  // Simple “alive” idle bob
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
