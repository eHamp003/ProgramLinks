class UIScene extends Phaser.Scene {
  constructor() {
    super("UIScene");
  }

  create() {
    const { width, height } = this.scale;
    this.settings = this.registry.get("settings");

    // Panel background
    this.panel = this.add.container(width/2, height - 95);

    const bg = this.add.rectangle(0, 0, width - 40, 170, 0x111827, 0.95)
      .setStrokeStyle(4, 0x334155, 1);

    this.panel.add(bg);

    // Choice buttons (3)
    this.choiceButtons = [];
    const positions = [-360, 0, 360];

    for (let i = 0; i < 3; i++) {
      const btn = this.makeChoiceButton(positions[i], 0);
      this.choiceButtons.push(btn);
      this.panel.add(btn.container);
    }

    // Receive choices
    this.events.on("ui:setChoices", (payload) => {
      if (!payload) {
        this.choiceButtons.forEach(b => b.container.setVisible(false));
        return;
      }

      const { choices, choiceText } = payload;
      for (let i = 0; i < 3; i++) {
        const id = choices[i];
        const label = choiceText[id] || id;
        this.choiceButtons[i].set(id, label);
        this.choiceButtons[i].container.setVisible(true);
      }
    });

    // Prompt events
    this.events.on("ui:prompt", (p) => {
      if (!p) return;
      if (p.type === "highlight") {
        this.highlightCorrect(p.correct);
      } else if (p.type === "model") {
        // A subtle flash to indicate “watch”
        this.flashCorrect(p.correct);
      } else {
        this.clearHighlights();
      }
    });

    // Top bar quick controls (in-game)
    this.topBar = this.add.container(width/2, 30);
    const topBg = this.add.rectangle(0, 0, width - 40, 52, 0x111827, 0.85).setStrokeStyle(2, 0x334155);

    const voiceTxt = this.add.text(-width/2 + 70, 0, "Voice", { fontSize: "16px", color: "#ffffff" }).setOrigin(0.5);
    const voiceBtn = this.add.rectangle(-width/2 + 130, 0, 70, 30, this.settings.tts ? 0x22c55e : 0x64748b)
      .setInteractive({ useHandCursor: true });
    const voiceBtnTxt = this.add.text(-width/2 + 130, 0, this.settings.tts ? "ON" : "OFF", { fontSize: "14px", color: "#0b1020", fontStyle: "800" }).setOrigin(0.5);

    voiceBtn.on("pointerdown", () => {
      this.settings.tts = !this.settings.tts;
      this.registry.set("settings", this.settings);
      window.TTS.setEnabled(this.settings.tts);
      voiceBtn.fillColor = this.settings.tts ? 0x22c55e : 0x64748b;
      voiceBtnTxt.setText(this.settings.tts ? "ON" : "OFF");
      if (this.settings.tts) window.TTS.speak("Voice on!");
    });

    const exitBtn = this.add.rectangle(width/2 - 120, 0, 130, 30, 0xf97316).setInteractive({ useHandCursor: true });
    const exitTxt = this.add.text(width/2 - 120, 0, "Exit", { fontSize: "14px", color: "#0b1020", fontStyle: "900" }).setOrigin(0.5);

    exitBtn.on("pointerdown", () => {
      this.scene.stop("UIScene");
      this.scene.get("GameScene").scene.start("AvatarSelectScene");
    });

    this.topBar.add([topBg, voiceTxt, voiceBtn, voiceBtnTxt, exitBtn, exitTxt]);
  }

  makeChoiceButton(x, y) {
    const container = this.add.container(x, y);

    const card = this.add.rectangle(0, 0, 320, 120, 0x1f2937, 1)
      .setStrokeStyle(4, 0x334155, 1)
      .setInteractive({ useHandCursor: true });

    // “GIF tile” placeholder (animated icon box)
    const iconBox = this.add.rectangle(-110, 0, 80, 80, 0x0b1020, 1).setStrokeStyle(3, 0x334155);
    const icon = this.add.text(-110, 0, "🎬", { fontSize: "34px" }).setOrigin(0.5);

    const label = this.add.text(40, 0, "", {
      fontSize: "20px",
      color: "#ffffff",
      fontStyle: "800",
      wordWrap: { width: 220 }
    }).setOrigin(0.5);

    container.add([card, iconBox, icon, label]);

    const state = { id: null, label: "" };

    const set = (id, text) => {
      state.id = id;
      state.label = text;
      label.setText(text);

      // Tiny tile animation so it feels “alive”
      this.tweens.add({
        targets: icon,
        angle: 6,
        yoyo: true,
        duration: 420,
        ease: "Sine.easeInOut"
      });
    };

    card.on("pointerdown", () => {
      this.clearHighlights();
      this.scene.get("GameScene").events.emit("choice:selected", state.id);
    });

    card.on("pointerover", () => card.setStrokeStyle(4, 0x60a5fa, 1));
    card.on("pointerout", () => card.setStrokeStyle(4, 0x334155, 1));

    return {
      container,
      set,
      getId: () => state.id,
      setHighlight: (on) => card.setStrokeStyle(6, on ? 0xfbbf24 : 0x334155, 1),
      flash: () => {
        this.tweens.add({
          targets: card,
          alpha: 0.6,
          yoyo: true,
          duration: 140,
          repeat: 3
        });
      }
    };
  }

  clearHighlights() {
    this.choiceButtons.forEach(b => b.setHighlight(false));
  }

  highlightCorrect(correctId) {
    this.clearHighlights();
    const match = this.choiceButtons.find(b => b.getId() === correctId);
    if (match) match.setHighlight(true);
  }

  flashCorrect(correctId) {
    const match = this.choiceButtons.find(b => b.getId() === correctId);
    if (match) match.flash();
  }
}
