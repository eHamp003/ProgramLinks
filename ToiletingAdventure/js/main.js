(() => {
  const WIDTH = 1280;
  const HEIGHT = 720;

  const config = {
    type: Phaser.AUTO,
    parent: "game",
    width: WIDTH,
    height: HEIGHT,
    backgroundColor: "#0b1020",
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    physics: {
      default: "arcade",
      arcade: { debug: false }
    },
    scene: [
      BootScene,
      AvatarSelectScene,
      GameScene,
      UIScene
    ]
  };

  window.__GAME__ = new Phaser.Game(config);
})();
