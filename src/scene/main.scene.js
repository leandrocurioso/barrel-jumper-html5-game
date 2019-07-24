import { Scene } from "./scene";

export class MainScene extends Scene {

  constructor(options = { key: "MainScene" }) {
    super(options);
  }

  init() {
    super.init();
    this.playerSpeed = 100;
    this.playerJumpSpeed = -600;

  }

  preload() {
    this.load.image("ground", "./assets/image/ground.png");
    this.load.image("platform", "./assets/image/platform.png");
    this.load.image("block", "./assets/image/block.png");
    this.load.image("goal", "./assets/image/gorilla.png");
    this.load.image("barrel", "./assets/image/barrel.png");

    this.load.spritesheet("player", "./assets/image/player_spritesheet.png", {
        frameWidth: 28,
        frameHeight: 30,
        margin: 1,
        spacing: 1
    });

    this.load.spritesheet("fire", "./assets/image/fire_spritesheet.png", {
      frameWidth: 20,
      frameHeight: 21,
      margin: 1,
      spacing: 1
  });

  }

  create() {
    this.platforms = this.add.group(); 

    const ground = this.add.sprite(this.gameWidthMiddle, 604, 'ground');
    this.physics.add.existing(ground, true);
    this.platforms.add(ground);
    const platform = this.add.tileSprite(this.gameWidthMiddle, 500, (4 * 36), (1 * 30), 'block');
    this.physics.add.existing(platform, true);
    this.platforms.add(platform);

    this.player = this.add.sprite(this.gameWidthMiddle, 400, 'player', 3);
    this.physics.add.existing(this.player);

    this.anims.create({
      key: 'walking',
      frames: this.anims.generateFrameNames('player', {
        frames: [
          0, 1, 2
        ]
      }),
      yoyo: true,
      frameRate: 8,
      repeat: -1
    });
    this.physics.add.collider(this.player, this.platforms);

    this.cursors = this.input.keyboard.createCursorKeys();

  }

  userInput() {
    if (this.cursors.left.isDown) {
      this.player.body.setVelocityX(-this.playerSpeed);
      this.player.flipX = false;
      if (!this.player.anims.isPlaying)
        this.player.anims.play('walking');
    } else if (this.cursors.right.isDown) {
      this.player.body.setVelocityX(this.playerSpeed);
      this.player.flipX = true;
      if (!this.player.anims.isPlaying)
        this.player.anims.play('walking');
    }else {
      this.player.body.setVelocityX(0);
      this.player.anims.stop('walking');
      this.player.setFrame(3);
    }
  }

  update() {
    this.userInput();
  }

}
