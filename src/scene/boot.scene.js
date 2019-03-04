import { Scene } from "./scene";

export class BootScene extends Scene {

  constructor(options = { key: "BootScene" }) {
    super(options);
  }

  init() {
    super.init();
  }

  preload() {}

  create() {
    this.scene.start("LoadingScene");
  }

}
