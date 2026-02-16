class BootScene extends Phaser.Scene {
  constructor() {
    super("BootScene");
  }

  preload() {
    // Data-driven steps (Level 1 + Level 2)
    this.load.json("level1", "data/toileting_level1.json");
    this.load.json("level2", "data/toileting_level2.json");

    // Later: load real assets here (avatars, bathrooms, UI, sounds, etc.)
  }

  create() {
    // Initialize global state
    const unlockedL2 = localStorage.getItem("toileting_l2_unlocked") === "true";

    this.registry.set("settings", {
      tts: true,
      sfx: true
    });

    this.registry.set("progress", {
      unlockedL2
    });

    this.scene.start("AvatarSelectScene");
  }
}
