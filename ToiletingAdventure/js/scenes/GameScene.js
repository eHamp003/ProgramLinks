class GameScene extends Phaser.Scene {
  constructor() {
    super("GameScene");
  }

  init(data) {
    this.level = data.level || 1;
  }

  create() {
    const { width, height } = this.scale;

    this.settings = this.registry.get("settings");
    window.TTS.setEnabled(this.settings.tts);

    this.avatar = this.registry.get("avatar") || { animal: "Dog", sex: "M" };
    this.theme = this.registry.get("bathroomTheme") || "home";

    const levelKey = this.level === 2 ? "level2" : "level1";
    this.levelData = this.cache.json.get(levelKey);

    this.stepIndex = 0;
    this.errorCountThisStep = 0;

    // Background theme (placeholder)
    const themeColors = {
      home: 0x0f172a,
      school: 0x1f2937,
      public: 0x111827
    };

    this.add.rectangle(width/2, height/2, width, height, themeColors[this.theme] || 0x0f172a);

    // "Bathroom" placeholder elements
    this.door = this.add.rectangle(160, 260, 180, 340, 0x6b7280).setStrokeStyle(6, 0x111827);
    this.add.text(160, 460, "DOOR", { fontSize: "20px", color: "#ffffff" }).setOrigin(0.5);

    this.toilet = this.add.rectangle(width - 240, 360, 220, 240, 0xe5e7eb).setStrokeStyle(6, 0x111827);
    this.seat = this.add.rectangle(width - 240, 270, 220, 60, 0x94a3b8).setStrokeStyle(6, 0x111827);
    this.add.text(width - 240, 480, "TOILET", { fontSize: "20px", color: "#111827" }).setOrigin(0.5);

    this.sink = this.add.rectangle(width - 240, 140, 220, 130, 0xf8fafc).setStrokeStyle(6, 0x111827);
    this.add.text(width - 240, 140, "SINK", { fontSize: "18px", color: "#111827" }).setOrigin(0.5);

    // Confetti texture + particles
    if (!this.textures.exists("__WHITE__")) {
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      g.fillStyle(0xffffff, 1);
      g.fillRect(0, 0, 2, 2);
      g.generateTexture("__WHITE__", 2, 2);
      g.destroy();
    }

    this.confetti = this.add.particles(0, 0, "__WHITE__", {
      speed: { min: 120, max: 420 },
      angle: { min: 220, max: 320 },
      gravityY: 800,
      lifespan: 1200,
      quantity: 18,
      scale: { start: 0.9, end: 0 },
      emitZone: { type: "random", source: new Phaser.Geom.Rectangle(0, 0, 1, 1) }
    });
    this.confetti.stop();

    // Thought bubble container
    this.bubble = this.add.container(520, 270);
    const bubbleBg = this.add.rectangle(0, 0, 520, 150, 0xf8fafc).setStrokeStyle(5, 0x111827).setOrigin(0.5);
    this.bubbleText = this.add.text(0, 0, "", { fontSize: "24px", color: "#111827", wordWrap: { width: 480 } }).setOrigin(0.5);
    this.bubble.add([bubbleBg, this.bubbleText]);

    // NEW: Layered AvatarSprite (replaces emoji/circle placeholder)
    // NOTE: This assumes you placed AvatarSprite.js in js/objects/ and loaded it in index.html
    if (typeof AvatarSprite !== "undefined") {
      this.avatarSprite = new AvatarSprite(this, 520, 440, this.avatar, { scale: 0.85 });
      this.avatarSprite.build();
      this.avatarSprite.playIdle();
    } else {
      // Fallback if you haven't added AvatarSprite yet
      this.avatarFallback = this.add.text(520, 420, `${this.avatar.animal} (${this.avatar.sex}) 🙂`, {
        fontSize: "28px",
        color: "#ffffff"
      }).setOrigin(0.5);
    }

    // Listen for UI selections
    this.events.on("choice:selected", (choiceId) => this.onChoice(choiceId));

    // Start
    this.playStep();
  }

  playStep() {
    const step = this.levelData.steps[this.stepIndex];
    if (!step) {
      this.finishLevel();
      return;
    }

    this.errorCountThisStep = 0;

    // Update bubble prompt
    this.bubbleText.setText(step.prompt);

    // Avatar expression
    this.setExpression(step.expression || "neutral");

    // Speak prompt
    if (this.settings.tts) window.TTS.speak(step.prompt);

    // Send step choices to UI scene
    this.scene.get("UIScene").events.emit("ui:setChoices", {
      stepId: step.id,
      choices: step.choices,
      choiceText: step.choiceText,
      allowAltCorrect: step.altCorrect || null
    });

    // Special trigger: privacy rule moment
    if (step.triggers && step.triggers.includes("privacy_rule")) {
      this.runPrivacyRuleOverlay();
    }
  }

  onChoice(choiceId) {
    const step = this.levelData.steps[this.stepIndex];
    if (!step) return;

    const correct = step.correct;
    const altCorrect = step.altCorrect || null;

    const isCorrect = choiceId === correct;
    const isAltCorrect = altCorrect && choiceId === altCorrect;

    // Special handling: privacy rule check step
    if (step.id === "privacy_rule_check" && (choiceId === "leave_bathroom" || choiceId === "run_hallway" || choiceId === "show_everyone")) {
      this.playSillyPrivacyBounce();
      return this.handleIncorrect(step);
    }

    if (isCorrect || isAltCorrect) {
      if (isAltCorrect) {
        this.runHelpAnimation(step);
      } else {
        this.runActionAnimation(choiceId, false);
      }
      this.reinforceCorrect(step, isAltCorrect);
    } else {
      this.handleIncorrect(step);
    }
  }

  handleIncorrect(step) {
    this.errorCountThisStep++;

    // Prompt hierarchy: indirect -> highlight -> model preview
    if (this.errorCountThisStep === 1) {
      const msg = "Hmm… what should we do before that?";
      this.bubbleText.setText(msg);
      if (this.settings.tts) window.TTS.speak(msg);
      this.scene.get("UIScene").events.emit("ui:prompt", { type: "indirect" });
    } else if (this.errorCountThisStep === 2) {
      this.scene.get("UIScene").events.emit("ui:prompt", { type: "highlight", correct: step.correct });
      const msg = "Look closely…";
      this.bubbleText.setText(msg);
      if (this.settings.tts) window.TTS.speak(msg);
    } else {
      // Model prompt: quick preview of correct action
      this.scene.get("UIScene").events.emit("ui:prompt", { type: "model", correct: step.correct });
      this.runActionAnimation(step.correct, true);

      const msg = "Let’s try that one!";
      this.bubbleText.setText(msg);
      if (this.settings.tts) window.TTS.speak(msg);
    }
  }

  reinforceCorrect(step, wasHelp) {
    // Confetti + praise
    this.confetti.setPosition(this.scale.width/2, 60);
    this.confetti.emitParticle(70);

    const praise = wasHelp
      ? "Nice asking for help! Now let’s keep going."
      : Phaser.Utils.Array.GetRandom([
        "Great job!",
        "Yes! That’s the right step!",
        "Nice work!",
        "You got it!"
      ]);

    this.bubbleText.setText(praise);
    if (this.settings.tts) window.TTS.speak(praise);

    // Move to next step after a short delay
    this.time.delayedCall(900, () => {
      this.stepIndex++;
      this.playStep();
    });
  }

  finishLevel() {
    const { width, height } = this.scale;

    this.scene.get("UIScene").events.emit("ui:setChoices", null);

    this.confetti.setPosition(width/2, 120);
    this.confetti.emitParticle(160);

    const doneMsg = this.level === 1
      ? "Level 1 complete! You unlocked Level 2!"
      : "Amazing! You finished Level 2!";

    this.bubbleText.setText(doneMsg);
    if (this.settings.tts) window.TTS.speak(doneMsg);

    if (this.level === 1) {
      localStorage.setItem("toileting_l2_unlocked", "true");
      const progress = this.registry.get("progress");
      progress.unlockedL2 = true;
      this.registry.set("progress", progress);
    }

    // Return button
    const btn = this.add.rectangle(width/2, height - 110, 360, 70, 0x22c55e).setInteractive({ useHandCursor: true });
    const txt = this.add.text(width/2, height - 110, "Back to Avatar Select", { fontSize: "22px", color: "#0b1020", fontStyle: "700" }).setOrigin(0.5);

    btn.on("pointerdown", () => {
      this.scene.stop("UIScene");
      this.scene.start("AvatarSelectScene");
    });
  }

  setExpression(mode) {
    if (this.avatarSprite) {
      this.avatarSprite.setExpression(mode);
      return;
    }

    // fallback
    if (this.avatarFallback) {
      const map = {
        neutral: "🙂",
        urgent: "😣",
        focused: "🧐",
        relieved: "😌",
        proud: "😎"
      };
      this.avatarFallback.setText(`${this.avatar.animal} (${this.avatar.sex}) ${map[mode] || "🙂"}`);
    }
  }

  runActionAnimation(choiceId, isModel = false) {
    const fast = isModel ? 350 : 650;

    const bop = () => this.tweens.add({
      targets: this.avatarSprite || this.avatarFallback,
      y: "-=18",
      yoyo: true,
      duration: fast,
      ease: "Sine.easeInOut"
    });

    switch (choiceId) {
      case "go_bathroom":
        this.setExpression("focused");
        bop();
        break;

      case "close_door":
        this.setExpression("focused");
        this.tweens.add({ targets: this.door, angle: 2, yoyo: true, duration: fast });
        bop();
        break;

      case "pants_down":
        this.setExpression("urgent");
        if (this.avatarSprite) this.avatarSprite.setPantsDown(true);
        bop();
        break;

      case "stay_in_bathroom":
        this.setExpression("focused");
        bop();
        break;

      case "seat_down":
        this.setExpression("focused");
        this.tweens.add({ targets: this.seat, y: "+=10", yoyo: true, duration: fast });
        bop();
        break;

      case "sit_down":
        this.setExpression("focused");
        if (this.avatarSprite) {
          this.tweens.add({ targets: this.avatarSprite, scale: 0.82, yoyo: true, duration: fast });
        }
        bop();
        break;

      case "go_potty_pee":
      case "go_potty_poop":
        this.setExpression("relieved");
        bop();
        break;

      case "wipe_front_to_back":
        this.setExpression("focused");
        bop();
        break;

      case "flush":
        this.setExpression("neutral");
        this.tweens.add({ targets: this.toilet, x: "+=6", yoyo: true, duration: fast, repeat: 2 });
        bop();
        break;

      case "wash_hands":
        this.setExpression("focused");
        if (this.avatarSprite) {
          this.avatarSprite.setArmsUp(true);
          this.time.delayedCall(900, () => this.avatarSprite.setArmsUp(false));
        }
        this.tweens.add({ targets: this.sink, scale: 1.02, yoyo: true, duration: fast });
        bop();
        break;

      case "pants_up":
        this.setExpression("proud");
        if (this.avatarSprite) this.avatarSprite.setPantsDown(false);
        bop();
        break;

      case "open_door":
        this.setExpression("proud");
        this.tweens.add({ targets: this.door, angle: -2, yoyo: true, duration: fast });
        bop();
        break;

      default:
        bop();
    }
  }

  runHelpAnimation(step) {
    const msg = "Can you help me, please?";
    this.bubbleText.setText(msg);
    if (this.settings.tts) window.TTS.speak(msg);

    // Quick model of correct step afterward
    this.time.delayedCall(600, () => {
      if (step.correct) this.runActionAnimation(step.correct, false);
    });
  }

  runPrivacyRuleOverlay() {
    const { width } = this.scale;

    const overlay = this.add.container(width/2, 560);
    const bg = this.add.rectangle(0, 0, 820, 90, 0xfef08a).setStrokeStyle(4, 0x111827);
    const txt = this.add.text(0, 0, "Rule: If pants are down, stay INSIDE the bathroom!", {
      fontSize: "24px",
      color: "#111827",
      fontStyle: "800"
    }).setOrigin(0.5);

    overlay.add([bg, txt]);

    this.time.delayedCall(1500, () => overlay.destroy());

    if (this.settings.tts) window.TTS.speak("Rule: If pants are down, stay inside the bathroom.");
  }

  playSillyPrivacyBounce() {
    // Silly “boing” bounce back (non-shaming)
    this.setExpression("urgent");

    const target = this.avatarSprite || this.avatarFallback;

    this.tweens.add({
      targets: target,
      x: "-=30",
      yoyo: true,
      duration: 220,
      repeat: 2,
      ease: "Back.easeOut"
    });

    const msg = "Oops! Pants down means stay in the bathroom!";
    this.bubbleText.setText(msg);
    if (this.settings.tts) window.TTS.speak(msg);
  }
}
