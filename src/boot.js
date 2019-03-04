import Phaser from "phaser";
import GameConfig from "./game/game-config";

try {
    
    window.onload = () => {
        const phaserGame = new Phaser.Game(GameConfig);
    };

} catch(err) {
    throw err;
}
