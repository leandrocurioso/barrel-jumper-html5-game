import { Scene } from "./scene";

export class HomeScene extends Scene {

  constructor(options = { key: "HomeScene" }) {
    super(options);
  }

  init() {
    super.init();
  }

  preload() {}

  create() {
      this.scene.start("MainScene");
  }

}
