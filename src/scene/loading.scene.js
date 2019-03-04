import { Scene } from "./scene";

export class LoadingScene extends Scene {

  constructor(options = { key: "LoadingScene" }) {
    super(options);
  }

  init() {
    super.init();
  }

  preload() {

    const progressBarBgWidth = 150;
    const progressBarBgHeight = 30;
    this.progressBarBg = this.add.graphics();
    this.progressBarBg.setPosition(this.gameWidthMiddle - progressBarBgWidth / 2, this.gameHeightMiddle - progressBarBgHeight / 2);
    this.progressBarBg.fillStyle(0xF5F5F5, 1);
    this.progressBarBg.fillRect(0, 0, progressBarBgWidth, progressBarBgHeight);

    this.progressBar = this.add.graphics();
    this.progressBar.setPosition(this.gameWidthMiddle - progressBarBgWidth / 2, this.gameHeightMiddle - progressBarBgHeight / 2);

    this.load.on("progress", percentage => {
      this.progressBar.clear();
      this.progressBar.fillStyle((0x9AD98D), 1);
      this.progressBar.fillRect(0, 0, percentage * progressBarBgWidth, progressBarBgHeight);
    }, this);

    this.load.image("barrel", "./assets/image/barrel.png");
    this.load.image("block", "./assets/image/block.png");
    this.load.image("gorilla", "./assets/image/gorilla.png");
    this.load.image("ground", "./assets/image/ground.png");
    this.load.image("platform", "./assets/image/platform.png");
  }

  create() {
    this.loadingText = this.add.text(this.gameWidthMiddle, this.gameHeightMiddle - 50, "Loading", {
      fontFamily: "Arial",
      fontSize: 40,
      fill: "#CCCCCC"
    });
    this.loadingText.setStroke("green", 4);
    this.loadingText.setOrigin(0.5);
    const scene = this.scene;
    setTimeout(() => {
      scene.start("HomeScene");
    }, 2000);
  }

}
