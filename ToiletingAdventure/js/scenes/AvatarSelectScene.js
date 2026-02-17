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

    // Ensure TTS state matches
    window.TTS.setEnabled(settings.tts);

    this.add.text(width/2, 40, "Choose Your Avatar!", {
      fontSize: "40px",
      fontStyle: "700",
      color: "#ffffff"
    }).setOrigin(0.5);

    this.add.text(width/2, 90, `Bathroom Theme Today: ${bathroom.toUpperCase()}`, {
      fontSize: "22px",
      color: "#c7d2fe"
    }).setOrigin(0.5);

    // Toggles (top-right)
    this.makeToggle(width - 220, 30, "Voice", settings.tts, (v) => {
      settings.tts = v;
      this.regist
