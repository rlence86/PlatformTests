//this game will have only 1 state
var GameState = {
  init: function() {
    //Adapt to screen size
    this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    this.scale.pageAlignHorizontally = true;
    this.scale.pageAlignVertically = true;

    //Activate physics and gravity
    this.game.physics.startSystem(Phaser.Physics.P2);
    this.game.physics.arcade.gravity.y = 1000;

    //Set wordl dimensions
    this.game.world.setBounds(0,0,2000,700);

    //Activate cursors
    this.cursors = this.game.input.keyboard.createCursorKeys();

    //Game constant
    this.RUNNING_SPEED = 180;
    this.JUMPING_SPEED = 550;
  },
  //load the game assets before the game starts
  preload: function() {
    this.load.image('background', 'assets/images/background.png');
    this.load.image('player', 'assets/images/player.png');
    this.load.image('floor', 'assets/images/floor.png');
    this.load.image('arrowButton', 'assets/images/arrowButton.png');    
    this.load.image('actionButton', 'assets/images/actionButton.png');
    this.load.image('small', 'assets/images/platform_small.png');
    this.load.image('medium', 'assets/images/platform_medium.png');
    this.load.image('large', 'assets/images/platform_large.png');
    this.load.text('level', 'assets/data/level.json');
  },
  //executed after everything is loaded
  create: function() {
    //parse the file
    this.levelData = JSON.parse(this.game.cache.getText('level'));
      
    //initialize backgrounds
    var background = this.game.add.sprite(0, 0, 'background');
    background.inputEnabled = true;
    background.events.onInputDown.add(function(sprite,event){
      console.log(event.worldX);
      console.log(event.worldY);
    }, this);
    background.fixedToCamera = true;
    
    
    //initialize floors
    this.floors = this.add.group();
    this.floors.enableBody = true;
    this.levelData.floorData.forEach(function(element){
      this.floors.create(element.x, 620, 'floor');
    }, this);

    this.floors.setAll('body.allowGravity', false);
    this.floors.setAll('body.immovable', true);
      
    //initialize platforms
    this.platforms = this.add.group();
    this.platforms.enableBody = true;
    this.levelData.platformData.forEach(function(element){
        var platform = this.platforms.create(element.x, element.y, element.size);
        platform.angle += element.rotation;
    }, this);
    
    this.platforms.setAll('body.allowGravity', false);
    this.platforms.setAll('body.immovable', true);

    //Adding player with collision and gravity
    this.player = this.game.add.sprite(120, 500, 'player');
    this.player.anchor.setTo(0.5);
    this.game.physics.arcade.enable(this.player);
    this.player.body.collideWorldBounds = true;
    //Add custom params to player
    this.player.customParams = {};
    //Add camera following
    this.game.camera.follow(this.player);

    this.createOnscreenControls();
  },
  //this is executed multiple times per second
  update: function() {
    //Detect collisions
    this.game.physics.arcade.collide(this.player, this.floors);
    this.game.physics.arcade.collide(this.player, this.platforms);
      
    //Detect falling death
    if(this.player.y > 669){
        this.killPlayer();
    }

    //Detect controls
    if(this.cursors.left.isDown || this.player.customParams.isMovingLeft) {
      this.player.body.velocity.x = -this.RUNNING_SPEED;
    }
    else if(this.cursors.right.isDown || this.player.customParams.isMovingRight) {
      this.player.body.velocity.x = this.RUNNING_SPEED;
    }
    else {
      this.player.body.velocity.x = 0;
    }

    if((this.cursors.up.isDown || this.player.customParams.mustJump) && this.player.body.touching.down) {
      this.player.body.velocity.y = -this.JUMPING_SPEED;
      this.player.customParams.mustJump = false;
    }
  },
  createOnscreenControls: function(){
    //Add sprites
    this.leftArrow = this.add.button(20, 300, 'arrowButton');
    this.rightArrow = this.add.button(110, 300, 'arrowButton');
    this.actionButton = this.add.button(540, 300, 'actionButton');
    //Change controls alpha  
    this.leftArrow.alpha = 0.5;
    this.rightArrow.alpha = 0.5;
    this.actionButton.alpha = 0.5;
    //Make fixed to camera
    this.leftArrow.fixedToCamera = true;
    this.rightArrow.fixedToCamera = true;
    this.actionButton.fixedToCamera = true;
    //Detecting jumps
    this.actionButton.events.onInputDown.add(function(){
      this.player.customParams.mustJump = true;
    }, this);
    this.actionButton.events.onInputUp.add(function(){
      this.player.customParams.mustJump = false;
    }, this);
    //left
    this.leftArrow.events.onInputDown.add(function(){
      this.player.customParams.isMovingLeft = true;
    }, this);
    this.leftArrow.events.onInputUp.add(function(){
      this.player.customParams.isMovingLeft = false;
    }, this);
    this.leftArrow.events.onInputOver.add(function(){
      this.player.customParams.isMovingLeft = true;
    }, this);
    this.leftArrow.events.onInputOut.add(function(){
      this.player.customParams.isMovingLeft = false;
    }, this);
    //right
    this.rightArrow.events.onInputDown.add(function(){
      this.player.customParams.isMovingRight = true;
    }, this);
    this.rightArrow.events.onInputUp.add(function(){
      this.player.customParams.isMovingRight = false;
    }, this);
    this.rightArrow.events.onInputOver.add(function(){
      this.player.customParams.isMovingRight = true;
    }, this);
    this.rightArrow.events.onInputOut.add(function(){
      this.player.customParams.isMovingRight = false;
    }, this);
  },
  killPlayer: function() {
    console.log('auch!');
    game.state.start('GameState');
  }
};

//initiate the Phaser framework
var game = new Phaser.Game(640, 360, Phaser.AUTO);

game.state.add('GameState', GameState);
game.state.start('GameState');