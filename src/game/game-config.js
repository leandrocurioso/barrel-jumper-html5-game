import Phaser from "phaser";
import { BootScene } from "../scene/boot.scene";
import { LoadingScene } from "../scene/loading.scene";
import { HomeScene } from "../scene/home.scene";
import { MainScene } from "../scene/main.scene";

export default {
    width: 360,
    height: 640,
    type: Phaser.AUTO,
    title: "Barrel Jumper",
    parent: "game",
    scene: [
      BootScene,
      LoadingScene,
      HomeScene,
      MainScene
    ],
    pixelArt: false,
    backgroundColor: "#FFFFFF"
};;
