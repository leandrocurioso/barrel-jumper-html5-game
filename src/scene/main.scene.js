import { Scene } from "./scene";

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
    this.barrelSoundPlayed = false;
    this.winningSoundPlayed = false;
  }

  preload() {
    this.load.image("ground", "./assets/image/ground.png");
    this.load.image("platform", "./assets/image/platform.png");
    this.load.image("block", "./assets/image/block.png");
    this.load.image("goal", "./assets/image/gorilla.png");
    this.load.image("barrel", "./assets/image/barrel.png");
    this.load.audio("background", "./assets/audio/background.mp3");
    this.load.audio("walking", "./assets/audio/walking.mp3");
    this.load.audio("burning", "./assets/audio/burning.mp3");
    this.load.audio("jump", "./assets/audio/jump.mp3");
    this.load.audio("barrel", "./assets/audio/barrel.mp3");
    this.load.audio("collision", "./assets/audio/collision.mp3");
    this.load.audio("winning", "./assets/audio/winning.mp3");

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
    this.load.json('levelData', './assets/level/levelData.json');
  }

  create() {
    if (!this.backgroundMusic) {
      this.backgroundMusic = this.sound.add("background", {
        loop: true
      });
    }

    this.walkingSound = this.sound.add("walking");
    this.burningSound = this.sound.add("burning");
    this.barrelSound = this.sound.add("barrel");
    this.jumpSound = this.sound.add("jump");
    this.barrelCollisionSound = this.sound.add("collision");
    this.winningSound = this.sound.add("winning");

    if (!this.backgroundMusic.isPlaying) {
      this.backgroundMusic.play();
    }
    // walking animation
    if (!this.anims.get('walking')) {
      this.anims.create({
        key: 'walking',
        frames: this.anims.generateFrameNames('player', {
          frames: [0, 1, 2]
        }),
        frameRate: 12,
        yoyo: true,
        repeat: -1
      });
    }


    // fire animation
    if (!this.anims.get('burning')) {
      this.anims.create({
        key: 'burning',
        frames: this.anims.generateFrameNames('fire', {
          frames: [0, 1]
        }),
        frameRate: 4,
        repeat: -1
      });
    }

    // Create virtual joystick
    this.createVirtualJoystick();

    // add all level elements
    this.setupLevel();

    // setup barrels
    this.setupBarrels();

    // collision detection
    this.physics.add.collider([this.player, this.goal,  this.barrels], this.platforms);
    
    // overlap
    this.physics.add.overlap(this.player, [this.fires, this.goal,  this.barrels], this.restartGame, null, this);
    
  }

  restartGame(sourceTarget, colliderTarget) {
    if (!this.burningSound.isPlaying && colliderTarget.texture.key === 'fire') {
      this.burningSound.play();
    }

    if (!this.barrelSoundPlayed && !this.barrelCollisionSound.isPlaying && colliderTarget.texture.key === 'barrel') {
      this.barrelCollisionSound.play();
      this.barrelSoundPlayed = true;
    }

    if (!this.winningSoundPlayed && !this.winningSound.isPlaying && colliderTarget.texture.key === 'goal') {
      this.winningSound.play();
      this.winningSoundPlayed = true;
    }

    this.winningSound
    this.cameras.main.fade(600);
    this.cameras.main.on("camerafadeoutcomplete", () => {
      this.scene.restart();
    }, this);
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

    // world bounds
    this.physics.world.bounds.width = this.levelData.world.width;
    this.physics.world.bounds.height = this.levelData.world.height;

    // create all the platforms
    this.platforms = this.physics.add.staticGroup();
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
    this.fires = this.physics.add.group({
      allowGravity: false,
      immovable: true
    });
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

    }

    // player
    this.player = this.add.sprite(this.levelData.player.x, this.levelData.player.y, 'player', 3);
    this.physics.add.existing(this.player);

    // constraint player to the game bounds
    this.player.body.setCollideWorldBounds(true);

    // follow camera
    this.cameras.main.setBounds(0, 0, this.levelData.world.width, this.levelData.world.height);
    this.cameras.main.startFollow(this.player)

    // goal
    this.goal = this.add.sprite(this.levelData.goal.x, this.levelData.goal.y, 'goal');
    this.physics.add.existing(this.goal);
 
  }

  createVirtualJoystick() {
    this.virtualJoyStickPlugin = this.virtualJoyStickPlugin || this.plugins.get('virtual-joystick-plugin');
    this.joyStick = this.virtualJoyStickPlugin.add(
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

  setupBarrels() {
    this.barrels = this.physics.add.group({
      bounceY: 0.1,
      bounceX: 1,
      collideWorldBounds: true
    });
    this.time.addEvent({
      delay: this.levelData.spawner.interval,
      loop: true,
      callbackScope: this,
      callback: () => {
        const barrel = this.barrels.get(this.goal.x, this.goal.y, 'barrel');
        barrel.setActive(true);
        barrel.setVisible(true);
        barrel.body.enable = true;
        this.barrelSound.play();
        barrel.setVelocityX(this.levelData.spawner.spped);

        this.time.addEvent({
          delay: this.levelData.spawner.lifesoan,
          repeat: 0,
          callbackScope: this,
          callback: () => {
            this.barrels.killAndHide(barrel);
            barrel.body.enable = false;
          }
        });

      }
    });

  }

  update() {
    this.isTouchingGround = this.player.body.blocked.down || this.player.body.touching.down;
    this.updateJoystickState();
  }

}
