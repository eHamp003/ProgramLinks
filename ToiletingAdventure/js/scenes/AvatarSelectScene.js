class AvatarSelectScene extends Phaser.Scene {
  constructor() {
    super("AvatarSelectScene");
  }

  create() {
    const { width, height } = this.scale;

    // Random bathroom each playthrough
    const bathrooms = ["home", "school", "public"];
    const bathroom = Phaser.Utils.Array.GetRandom(bathrooms);
    this.registry.set("bathroomTheme", bathroom);

    const settings = this.registry.get("settings");
    const progress = this.registry.get("progress");

    this.add.text(width/2, 40, "Choose Your Avatar!", {
      fontSize: "40px",
      fontStyle: "700",
      color: "#ffffff"
    }).setOrigin(0.5);

    this.add.text(width/2, 90, `Bathroom Theme Today: ${bathroom.toUpperCase()}`, {
      fontSize: "22px",
      color: "#c7d2fe"
    }).setOrigin(0.5);

    // Toggles
    const ttsBtn = this.makeToggle(width - 220, 30, "Voice", settings.tts, (v) => {
      settings.tts = v;
      this.registry.set("settings", settings);
      window.TTS.setEnabled(v);
      if (v) window.TTS.speak("Voice on!");
    });

    const sfxBtn = this.makeToggle(width - 110, 30, "SFX", settings.sfx, (v) => {
      settings.sfx = v;
      this.registry.set("settings", settings);
      // Hook SFX later (we still toggle state now)
    });

    // 6 animals
    const animals = ["Dog", "Cat", "Bunny", "Fox", "Panda", "Turtle"];
    const sexes = ["M", "F"];

    const cardW = 180;
    const cardH = 130;
    const gapX = 30;
    const gapY = 24;

    const startX = width/2 - (3*cardW + 2*gapX)/2 + cardW/2;
    const startY = 170;

    let idx = 0;

    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 3; c++) {
        if (idx >= animals.length * sexes.length) break;

        const animal = animals[Math.floor(idx / 2)];
        const sex = sexes[idx % 2];

        const x = startX + c * (cardW + gapX);
        const y = startY + r * (cardH + gapY);

        const container = this.add.container(x, y);

        const bg = this.add.rectangle(0, 0, cardW, cardH, 0x111827, 1)
          .setStrokeStyle(3, 0x334155, 1)
          .setInteractive({ useHandCursor: true });

        const label = this.add.text(0, -10, `${animal}`, { fontSize: "22px", color: "#ffffff" }).setOrigin(0.5);
        const sub = this.add.text(0, 26, sex === "M" ? "Boy" : "Girl", { fontSize: "18px", color: "#93c5fd" }).setOrigin(0.5);

        // Cute “emoji face” placeholder
        const face = this.add.text(0, -45, "🙂", { fontSize: "40px" }).setOrigin(0.5);

        container.add([bg, face, label, sub]);

        bg.on("pointerdown", () => {
          this.registry.set("avatar", { animal, sex });
          if (settings.tts) window.TTS.speak(`You picked ${animal}. Let's go!`);
          this.scene.start("GameScene", { level: 1 });
          this.scene.launch("UIScene");
        });

        bg.on("pointerover", () => {
          bg.setStrokeStyle(3, 0x60a5fa, 1);
          if (settings.tts) window.TTS.speak(`${animal}. ${sex === "M" ? "Boy" : "Girl"}.`);
        });
        bg.on("pointerout", () => bg.setStrokeStyle(3, 0x334155, 1));

        idx++;
      }
    }

    // Level buttons
    const l1 = this.makeLevelButton(width/2 - 160, height - 90, "Play Level 1 (Pee)", () => {
      this.scene.start("GameScene", { level: 1 });
      this.scene.launch("UIScene");
    });

    const l2Locked = !progress.unlockedL2;
    const l2Text = l2Locked ? "Level 2 Locked" : "Play Level 2 (Poop)";
    const l2 = this.makeLevelButton(width/2 + 160, height - 90, l2Text, () => {
      if (l2Locked) {
        if (settings.tts) window.TTS.speak("Finish level one to unlock level two.");
        return;
      }
      this.scene.start("GameScene", { level: 2 });
      this.scene.launch("UIScene");
    }, l2Locked);

    // Helper text
    this.add.text(width/2, height - 30,
      "Tip: After wrong answers, the game will help you with hints!",
      { fontSize: "18px", color: "#a5b4fc" }
    ).setOrigin(0.5);
  }

  makeToggle(x, y, label, initial, onChange) {
    const container = this.add.container(x, y);

    const bg = this.add.rectangle(0, 0, 90, 44, 0x111827, 1)
      .setStrokeStyle(2, 0x334155, 1)
      .setOrigin(0, 0)
      .setInteractive({ useHandCursor: true });

    const txt = this.add.text(45, 11, label, { fontSize: "14px", color: "#ffffff" }).setOrigin(0.5, 0);

    const pill = this.add.rectangle(60, 28, 44, 18, initial ? 0x22c55e : 0x64748b, 1);
    const dot = this.add.circle(initial ? 72 : 48, 28, 7, 0xffffff, 1);

    container.add([bg, txt, pill, dot]);

    let state = initial;

    const refresh = () => {
      pill.fillColor = state ? 0x22c55e : 0x64748b;
      dot.x = state ? 72 : 48;
    };

    bg.on("pointerdown", () => {
      state = !state;
      refresh();
      onChange(state);
    });

    return container;
  }

  makeLevelButton(x, y, label, onClick, disabled = false) {
    const container = this.add.container(x, y);
    const w = 290, h = 64;

    const bg = this.add.rectangle(0, 0, w, h, disabled ? 0x334155 : 0x1d4ed8, 1)
      .setStrokeStyle(3, 0x0b1020, 1)
      .setInteractive({ useHandCursor: true });

    const txt = this.add.text(0, 0, label, { fontSize: "18px", color: "#ffffff", fontStyle: "700" }).setOrigin(0.5);

    container.add([bg, txt]);

    bg.on("pointerdown", () => {
      if (disabled) return;
      onClick();
    });

    return container;
  }
}
