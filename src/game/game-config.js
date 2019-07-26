import Phaser from "phaser";
import { MainScene } from "../scene/main.scene";
import VirtualJoyStickPlugin from "../plugin/rex-virtual-joystick-plugin";

export default {
    width: 360,
    height: 640,
    type: Phaser.AUTO,
    title: "Barrel Jumper",
    parent: "game",
    scene: [
      MainScene
    ],
    pixelArt: false,
    backgroundColor: "#000000",
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { y: 1000 },
        debug: false
      }
    },
    plugins: {
      global: [{
          key: 'virtual-joystick-plugin',
          plugin: VirtualJoyStickPlugin,
          start: true
      }]
  }
};;
