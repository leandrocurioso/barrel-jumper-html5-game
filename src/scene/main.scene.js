import { Scene } from "./scene";
import VirtualJoyStickPlugin from "../plugin/rex-virtual-joystick-plugin";

export class MainScene extends Scene {

  constructor(options = { key: "MainScene" }) {
    super(options);
  }

  init() {
    super.init();
    this.staticXJsPos = this.gameWidthMiddle;
    this.staticYJsPos = this.gameHeightMiddle + (this.gameHeightMiddle / 2) + 20;
    this.playerSpeed = 100;
    this.playerJumpSpeed = -550;
    this.joystickConfig = {
      x: this.staticXJsPos,
      y: this.staticYJsPos,
      enabled: true
    };
    this.jumpDirections = ["up", "upleft", "upright" ]; 
  }

  preload() {
    this.load.image("ground", "./assets/image/ground.png");
    this.load.image("platform", "./assets/image/platform.png");
    this.load.image("block", "./assets/image/block.png");
    this.load.image("goal", "./assets/image/gorilla.png");
    this.load.image("barrel", "./assets/image/barrel.png");
    this.load.audio("background", "./assets/audio/background.mp3", {
      loop: true
    });
    this.load.audio("walking", "./assets/audio/walking.mp3");
    this.load.audio("jump", "./assets/audio/jump.mp3");
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
    this.load.image('base', './assets/image/base.png');
    this.load.image('thumb', './assets/image/thumb.png');
    this.load.plugin('rex-virtual-joystick-plugin"', VirtualJoyStickPlugin, true);
    this.load.json('levelData', './assets/level/levelData.json');

  }

  create() {
    this.backgroundMusic = this.sound.add("background", {
      loop: true
    });
    this.walkingSound = this.sound.add("walking");
    this.jumpSound = this.sound.add("jump");
    this.backgroundMusic.play();
    // walking animation
    this.anims.create({
      key: 'walking',
      frames: this.anims.generateFrameNames('player', {
        frames: [0, 1, 2]
      }),
      frameRate: 12,
      yoyo: true,
      repeat: -1
    });

    // fire animation
    this.anims.create({
      key: 'burning',
      frames: this.anims.generateFrameNames('fire', {
        frames: [0, 1]
      }),
      frameRate: 4,
      repeat: -1
    });

    // world bounds
    this.physics.world.bounds.width = 360;
    this.physics.world.bounds.height = 700;

    this.createVirtualJoystick();

    // add all level elements
    this.setupLevel();

    // collision detection
    this.physics.add.collider(this.player, this.platforms);
    this.physics.add.collider(this.goal, this.platforms);

    // enable cursor keys
    this.input.on('pointerdown', function(pointer) {
      console.log(pointer.x, pointer.y);
    });
  }

  updateJoystickState() {
    let direction = '';
    for (let key in this.cursorKeys) {
        if (this.cursorKeys[key].isDown) {
          direction += key;
        }
    }

    // If no direction if provided then stop 
    // the player animations and exit the method
    if(direction.length === 0) { 
        this.player.body.setVelocityX(0);
        this.player.anims.stop('walking');
        if (this.isTouchingGround) {
          this.player.setFrame(3);
        }
        return;
    }

    // If last cursor direction is different
    //  the stop all player animations
    if (this.lastCursorDirection !== direction) {
      this.player.body.setVelocityX(0);
      this.player.anims.stop('walking');
      if (this.isTouchingGround) {
        this.player.setFrame(3);
      }
    }
    
    // Set the new cursor direction
    this.lastCursorDirection = direction;

    // Handle the player moving
    this.userInput();
    this.handleJump();
}

  userInput() {
    if (this.isTouchingGround && !this.walkingSound.isPlaying) {
      this.walkingSound.play();
    }
    if (this.lastCursorDirection === "left") {
      this.player.body.setVelocityX(-this.playerSpeed);
      this.player.flipX = false;
      if (this.isTouchingGround && !this.player.anims.isPlaying)
        this.player.anims.play('walking');
    } else if (this.lastCursorDirection === "right") {
      this.player.body.setVelocityX(this.playerSpeed);
      this.player.flipX = true;
      if (this.isTouchingGround  && !this.player.anims.isPlaying)
        this.player.anims.play('walking');
    } else {
      this.player.body.setVelocityX(0);
      this.player.anims.stop('walking');
      if (this.isTouchingGround) {
        this.player.setFrame(3);
      }
    }
  }

  handleJump() {
    if(!this.isTouchingGround) return;
    if (this.jumpDirections.indexOf(this.lastCursorDirection) !== -1) {
      this.player.body.setVelocityY(this.playerJumpSpeed);
      this.jumpSound.play();
      this.player.anims.stop('walking');
      this.player.setFrame(2);
    }
  }

  setupLevel() {  
    // load json data
    this.levelData = this.cache.json.get('levelData');

    // create all the platforms
    this.platforms = this.add.group();
    for (let i = 0; i < this.levelData.platforms.length; i++) {
      let curr = this.levelData.platforms[i];

      let newObj;

      // create object
      if(curr.numTiles == 1) {
        // create sprite
        newObj = this.add.sprite(curr.x, curr.y, curr.key).setOrigin(0);
      }
      else {
        // create tilesprite
        let width = this.textures.get(curr.key).get(0).width;
        let height = this.textures.get(curr.key).get(0).height;
        newObj = this.add.tileSprite(curr.x, curr.y, curr.numTiles * width , height ,curr.key).setOrigin(0);
      }
      newObj.setDepth(-1);

      // enable physics
      this.physics.add.existing(newObj, true);

      // add to the group
      this.platforms.add(newObj);
    }

    // create all the fire
    this.fires = this.add.group();
    for (let i = 0; i < this.levelData.fires.length; i++) {
      let curr = this.levelData.fires[i];

      let newObj = this.add.sprite(curr.x, curr.y, 'fire').setOrigin(0);

      // enable physics
      this.physics.add.existing(newObj);
      newObj.body.allowGravity = false;
      newObj.body.immovable = true;

      // play burning animation
      newObj.anims.play('burning');

      // add to the group
      this.fires.add(newObj);

      // this is for level creation
      newObj.setInteractive();
      this.input.setDraggable(newObj);
    }

    // for level creation
    this.input.on('drag', function(pointer, gameObject, dragX, dragY){
      gameObject.x = dragX;
      gameObject.y = dragY;
      console.log(dragX, dragY);
    });

    // player
    this.player = this.add.sprite(this.levelData.player.x, this.levelData.player.y, 'player', 3);
    this.physics.add.existing(this.player);

    // constraint player to the game bounds
    this.player.body.setCollideWorldBounds(true);

    // goal
    this.goal = this.add.sprite(this.levelData.goal.x, this.levelData.goal.y, 'goal');
    this.physics.add.existing(this.goal);

    this.load.image('base', './assets/image/base.png');
    this.load.image('thumb', './assets/image/thumb.png');
    this.load.plugin('rex-virtual-joystick-plugin"', VirtualJoyStickPlugin, true);

  }

  createVirtualJoystick() {
    this.joyStick = this.plugins.get('rex-virtual-joystick-plugin"').add(
        this,
        Object.assign({}, this.joystickConfig, {
            radius: 32,
            base: this.add.image(0, 0, 'base').setDisplaySize(110, 110),
            thumb: this.add.image(0, 0, 'thumb').setDisplaySize(48, 48)
        })
    ).on('update', this.updateJoystickState, this);
    this.cursorKeys = this.joyStick.createCursorKeys();

    // Listener event to reposition virtual joystick
    // whatever place you click in game area
    this.input.on('pointerdown', pointer => {
        this.joyStick.x = pointer.x;
        this.joyStick.y = pointer.y;
        this.joyStick.base.x = pointer.x;
        this.joyStick.base.y = pointer.y;
        this.joyStick.thumb.x = pointer.x;
        this.joyStick.thumb.y = pointer.y;
    });

    // Listener event to return virtual 
    // joystick to its original position
    this.input.on('pointerup', pointer => {
        this.joyStick.x = this.staticXJsPos;
        this.joyStick.y = this.staticYJsPos;
        this.joyStick.base.x = this.staticXJsPos;
        this.joyStick.base.y = this.staticYJsPos;
        this.joyStick.thumb.x = this.staticXJsPos;
        this.joyStick.thumb.y = this.staticYJsPos;
    });
  }

  update() {
    this.isTouchingGround = this.player.body.blocked.down || this.player.body.touching.down;
    this.updateJoystickState();
  }

}
