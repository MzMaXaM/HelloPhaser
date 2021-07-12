let score = 0
let lives = 3
let highScore
let scoreText
let liveText
let highScoreText
let highQuality = false
let muted = false
let gameOver = false
let isWalking = false

const bodySize = (20, 30)
const bodySizehq = (80, 100)

const localKey = 'helloPhaser'
const playerXkey = 350
const playerYkey = 450
const textColour = '#adff2f'

//--------Controls
let touchable = false
let left = false
let right = false
let up = false
let down = false

//--------------------======================--------------------

const config = {
    type: Phaser.AUTO,
    width: 1000,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: false
            },
        },
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    scene: {
        preload: preload,
        create: create,
        update: update
            }
}

var game = new Phaser.Game(config);

//======================================PRELOAD===================================//
function preload (){
    this.load.image('backGround', './assets/sky.png')
    this.load.image('platform', './assets/platform.png')
    this.load.image('ground', './assets/ground.png')//800*128
    this.load.image('star', './assets/star.png')
    this.load.image('bomb', './assets/bomb.png')
    this.load.image('muteBtn', './assets/sound.png')
    this.load.image('restartBtn', './assets/restart.png')
    this.load.image('fScreenBtn', './assets/fullScreen.png')
    this.load.image('arrowBtn', './assets/arrowUp.png')
//------------------------------------
    this.load.atlas('kboom','./assets/kaboom.png',
        './assets/kaboom_atlas.json')
//----if the device size is bigger than 1k we load HQ girl
//------------------------------------------------------------
if(window.screen.width > 1000){
    highQuality = true
    this.load.atlas('cutie','./assets/red_hair_hq.png',
        './assets/red_hair_hq_atlas.json')
} else {
    this.load.atlas('cutie','./assets/cutie_red_hed.png',
        './assets/cutie_red_hed_atlas.json')
}
//--------------Sounds---------------------
    this.load.audio('walkSound', './assets/cute-walk.mp3')
    this.load.audio('audioPickStar', './assets/star.mp3')
    this.load.audio('audioGameOver', './assets/gameOver.mp3')
    this.load.audio('bombCollide', './assets/bomb.mp3')
    this.load.audio('audioHit', './assets/hit.mp3')
}


//=================================CREATE===========================================//
function create (){
    //-------------check the localStorage ------------------
    // if there is no localstore with our key
    // then we will create one
    if(!localStorage.getItem(localKey)) {
        localStorage.setItem(localKey, 0)
      } else {
          //if there is one then well use it ;)
        highScore = localStorage.getItem(localKey)
      }

      //-----------change the cursor... just for fun
    this.input.setDefaultCursor('url(assets/arrow.png), pointer')

//------------creating platforms---------------------------
    this.add.image(500, 300, 'backGround')
    platforms = this.physics.add.staticGroup()
    platforms.create(500, 565, 'ground')
    platforms.create(750, 400, 'platform')
    platforms.create(200, 285, 'platform')
    platforms.create(800, 225, 'platform')

//--------------------sounds----------------------------
    audioHit = this.sound.add('audioHit',{
        mute: false,
        volume: 0.5,
        rate: 0.7,
        loop: false
    })
    walkSound = this.sound.add('walkSound',{
        mute: false,
        volume: 0.5,
        rate: 1.5,
        loop: true
    })
    audioGameOver = this.sound.add('audioGameOver',{
        mute: false,
        volume: 0.8,
        rate: 2,
        loop: false
    })
    audioPickStar = this.sound.add('audioPickStar',{
        mute: false,
        volume: 0.8,
        rate: 2,
        loop: false
    })
    bombCollide = this.sound.add('bombCollide',{
        mute: false,
        volume: 5,
        rate: 1.5,
        loop: false
    })


//-------------------------Buttons----------------------------
    restartBtn = this.add.image(800, 565, 'restartBtn')
    restartBtn.alpha = 0
    restartBtn.setInteractive({ cursor: 'url(assets/hand.png), pointer' })
    restartBtn.on('pointerdown', restartGame)

    fullScrBtn = this.add.image(930, 30, 'fScreenBtn')
    fullScrBtn.alpha = 0.4
    fullScrBtn.setInteractive({ cursor: 'url(assets/hand.png), pointer' })
    fullScrBtn.on('pointerup', setFullScreen)

    soundBtn = this.add.image(730, 565, 'muteBtn')
    soundBtn.alpha = 0.6
    soundBtn.setInteractive({ cursor: 'url(assets/hand.png), pointer' })
    soundBtn.on('pointerdown', muteGame)
    //=====================================================================
                //Arrow Buttons will show up only if its a touchable device
                //otherwise player can use keyboard arrows
    if (game.device.input.touch){
        touchable=true
        game.scene.game.input.addPointer(3)

        leftBtn = this.add.image(40, 500, 'arrowBtn')
        leftBtn.alpha = 0.6
        leftBtn.angle = -90
        leftBtn.setInteractive({ cursor: 'url(assets/hand.png), pointer' })
        leftBtn.on('pointerdown', ()=>left=true)
        leftBtn.on('pointerup', ()=>left=false)

        rightBtn = this.add.image(100, 560, 'arrowBtn')
        rightBtn.alpha = 0.6
        rightBtn.angle = 90
        rightBtn.setInteractive({ cursor: 'url(assets/hand.png), pointer' })
        rightBtn.on('pointerdown', ()=>right=true)
        rightBtn.on('pointerup', ()=>right=false)

        upBtn = this.add.image(960, 500, 'arrowBtn')
        upBtn.alpha = 0.6
        // upBtn.angle = 0
        upBtn.setInteractive({ cursor: 'url(assets/hand.png), pointer' })
        upBtn.on('pointerdown', ()=>up=true)
        upBtn.on('pointerup', ()=>up=false)

        downBtn = this.add.image(900, 560, 'arrowBtn')
        downBtn.alpha = 0.6
        downBtn.angle = 180
        downBtn.setInteractive({ cursor: 'url(assets/hand.png), pointer' })
        downBtn.on('pointerdown', ()=>down=true)
        downBtn.on('pointerup', ()=>down=false)
    }else{
            // keyboard imputs
        cursors = this.input.keyboard.createCursorKeys()
        console.log(this.input.keyboard.key)
    }
    //----------------player------------------------
    player = this.physics.add.sprite(playerXkey, playerYkey, 'cutie')
    highQuality ? player.scale = 0.3 : player.scale = 1.5
    player.setBounce(0.3)
    player.setGravityY(350)
    player.setDepth(1)
    player.setCollideWorldBounds(true)

    // player animations
    if (highQuality){
        this.anims.create({
            key: "idle",
            frameRate: 24,
            frames: this.anims.generateFrameNames("cutie", {
                prefix: "idle_(",
                suffix: ")",
                start: 1,
                end: 16,
                zeroPad: 1,
                repeat: -1
            })
        })
        this.anims.create({
            key: "walk",
            frameRate: 24,
            frames: this.anims.generateFrameNames("cutie", {
                prefix: "walk_(",
                suffix: ")",
                start: 1,
                end: 19,
                zeroPad: 1,
                repeat: -1
            })
        })
        this.anims.create({
            key: "dead",
            frameRate: 12,
            frames: this.anims.generateFrameNames("cutie", {
                prefix: "dead_(",
                suffix: ")",
                start: 1,
                end: 30,
                zeroPad: 1
            })
        })
        this.anims.create({
            key: "jump",
            frameRate: 12,
            frames: this.anims.generateFrameNames("cutie", {
                prefix: "jump_(",
                suffix: ")",
                start: 1,
                end: 29,
                zeroPad: 1
            })
        })
    }else{
    this.anims.create({
        key: "idle",
        frameRate: 7,
        frames: this.anims.generateFrameNames("cutie", {
            prefix: "idle",
            start: 1,
            end: 8,
            zeroPad: 1,
            repeat: -1
        })
    })
    this.anims.create({
        key: "walk",
        frameRate: 10,
        frames: this.anims.generateFrameNames("cutie", {
            prefix: "walk",
            start: 1,
            end: 10,
            zeroPad: 1,
            repeat: -1
        })
    })
    this.anims.create({
        key: "dead",
        frameRate: 7,
        frames: this.anims.generateFrameNames("cutie", {
            prefix: "dead",
            start: 1,
            end: 14,
            zeroPad: 1
        })
    })
    this.anims.create({
        key: "jump",
        frameRate: 7,
        frames: this.anims.generateFrameNames("cutie", {
            prefix: "jump",
            start: 1,
            end: 15,
            zeroPad: 1
        })
    })
}

    this.physics.add.collider(player, platforms)


    //creating the stars
    stars = this.physics.add.group({
        key: 'star',
        repeat: 12,
        setXY: { x: 70, y: 0, stepX: 70 }
        })
    stars.children.iterate(function (child) {
        child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.6))
        child.setBodySize(20, 40, false)
        })
    this.physics.add.collider(stars, platforms)
    this.physics.add.overlap(player, stars, collectStar, null, this)

    //  creating Gui text
    highScoreText = this.add.text(550, 540, ('HI: ' + highScore), {
        fontFamily: 'Viaoda Libre, cursive',
        fontSize: '40px', color: textColour})
    scoreText = this.add.text(330, 540, ('Score: '+ score), {
            fontFamily: 'Viaoda Libre, cursive',
            fontSize: '40px', color: textColour})
    liveText = this.add.text(150, 540, ('Lives: '+ lives), {
            fontFamily: 'Viaoda Libre, cursive',
            fontSize: '40px', color: textColour})

    //---------------------------------------
    // creating the bombs
    bombs = this.physics.add.group()
    this.physics.add.collider(bombs, platforms)
    this.physics.add.collider(player, bombs, hitBomb, null, this)
    this.anims.create({
        key: "kboom",
        frameRate: 8,
        frames: this.anims.generateFrameNames("kboom", {
            start: 4,
            end: 9,
            zeroPad: 1
        })
    })
}


//==============================================UPDATE=======================================//
function update (){
    if (gameOver){
        if (touchable){
            leftBtn.alpha = 0
            rightBtn.alpha = 0
            upBtn.alpha = 0
            downBtn.alpha = 0
        }
        player.setVelocityX(0)
        restartBtn.alpha = 1
        restartBtn.angle-=2
        walkSound.stop()
        isWalking=false
        return
    }
    
    //fixing the player colider
    highQuality?player.setBodySize(bodySizehq) : player.setBodySize(bodySize)

    if (!touchable){
        if (cursors.left.isDown) {left=true}
        if (cursors.left.isUp) {left=false}
        if (cursors.right.isDown) {right=true}
        if (cursors.right.isUp) {right=false}

        if (cursors.up.isDown) {up=true}
        if (cursors.up.isUp) {up=false}
        if (cursors.down.isDown) {down=true}
        if (cursors.down.isUp) {down=false}
    }

    left ? leftArrow():
        right ? rightArrow():
            walkStop()

    if (up && player.body.touching.down){upArrow()}
    if (down && !player.body.touching.down){downArrow()}

    if (touchable){
        left?leftBtn.alpha = 1:leftBtn.alpha = 0.6
        right?rightBtn.alpha = 1:rightBtn.alpha = 0.6
        up?upBtn.alpha = 1:upBtn.alpha = 0.6
        down?downBtn.alpha = 1:downBtn.alpha = 0.6
    }
    
    if (player.y >= 565){
        audioHit.play()
        checkPlayerLife(-1)
        if (lives > 0) {
            player.x=playerXkey
            player.y=playerYkey
        }
    }
}
//===========================================================================================//
//--------------------------Control Functions---------------------------------------------//
function leftArrow(){
    player.setVelocityX(-180)
    if (player.body.touching.down && !isWalking){
        walkSound.play()
        isWalking=true}
    if (player.body.touching.down){player.anims.play('walk', true)}
    player.setFlipX(true)
}
function rightArrow(){
    player.setVelocityX(180)
    if (player.body.touching.down && !isWalking){
        walkSound.play()
        isWalking=true}
    if (player.body.touching.down){player.anims.play('walk', true)}
    player.setFlipX(false)
}
function downArrow(){
    player.setVelocityY(480)
}
function upArrow(){
    walkSound.stop()
    isWalking=false
    player.anims.play('jump', false)
    player.setVelocityY(-430)
}
function walkStop(){
    walkSound.stop()
    isWalking=false
    player.setVelocityX(0)
    player.body.touching.down?
        player.anims.play('idle', true):
            player.anims.play('jump', false)
}
//---------------------------Other Functions------------------------------------------//
function muteGame(){
    muted?(
        soundBtn.alpha = 0.5,
        walkSound.mute=false,
        pickStar.mute=false,
        pickStar.mute=false,
        bombCollide.mute=false,
        muted=false):(
        soundBtn.alpha = 1,
        walkSound.mute=true,
        pickStar.mute=true,
        pickStar.mute=true,
        bombCollide.mute=true,
        muted=true)
}

function restartGame(){
    player.x=playerXkey
    player.y=playerYkey
    restartBtn.alpha = 0
    score = 0
    scoreText.setText('Score: ' + score)
    lives = 3
    liveText.setText('Lives: ' + lives)
    gameOver = false
    if (stars.countActive(true) === 0){
        stars.children.iterate(function (child) {
            child.enableBody(true, child.x, 0, true, true)
        })
    }
}

function collectStar (player, star){
    star.disableBody(true, true)
    audioPickStar.play()
    score ++
    scoreText.setText('Score: ' + score)
    if(highScore<score){
        highScore=score
        highScoreText.setText('HI: '+ highScore)
    }
    if (stars.countActive(true) === 0){
        stars.children.iterate(function (child) {
            child.enableBody(true, child.x, 0, true, true)
        })
        var x = (player.x < 500) ? Phaser.Math.Between(600, 700) : Phaser.Math.Between(100, 400)
        var bomb = bombs.create(x, 16, 'bomb')
        bomb.setBounce(1)
        bomb.body.setCircle(6)
        bomb.setCollideWorldBounds(true)
        bomb.setVelocity(Phaser.Math.Between(150, 200), 20)
    }
}

function checkPlayerLife(setLife){
    lives = lives + setLife
    liveText.setText('Lives: ' + lives)
    if (lives<0){lives=0}
    if (lives == 0){
        audioGameOver.play()
        if (highScore>localStorage.getItem('helloPhaser')){
        localStorage.setItem('helloPhaser', highScore)}
        this.player.anims.play('dead',false)
        gameOver = true
        if (stars.countActive(true) > 0){
            stars.children.iterate(function (child) {
                child.disableBody(true, true)
            })
        }
        if (bombs.countActive(true) > 0){
            bombs.children.iterate(function (child) {
                child.disableBody(true, true)
            })
        }
    }
}

function hitBomb (player, bomb){
    bomb.setVelocityX(0)
    bomb.setVelocityY(-300)
    bomb.anims.play('kboom', false)
    bombCollide.play()
    this.time.addEvent({
        delay: 500,
        callback: ()=>{
            bomb.disableBody(true, true)
            checkPlayerLife(-1)
        },
        loop: false
    })
}

function setFullScreen(){
    if (game.scale.isFullscreen)
    {
        fullScrBtn.alpha = 0.4
        game.scale.stopFullscreen()
    }
    else
    {
        fullScrBtn.alpha = 0.7
        game.scale.startFullscreen()
    }
}
