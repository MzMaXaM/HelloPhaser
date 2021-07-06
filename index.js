let score = 0
let lives = 3
let scoreText
let liveText
let gameOver = false
let isWalking= false
const textColour = '#ADFF2F'
const config = {
    type: Phaser.AUTO,
    width: 1000,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 400 },
            debug: false
            },
        },
    scene: {
        preload: preload,
        create: create,
        update: update
            }
}

var game = new Phaser.Game(config);

function preload (){
    this.load.image('backGround', './assets/sky.png')
    this.load.image('platform', './assets/platform.png')
    this.load.image('ground', './assets/ground.png')//800*128
    this.load.image('star', './assets/star.png')
    this.load.image('bomb', './assets/bomb.png')
    this.load.image('restartBtn', './assets/restart.png')
    this.load.atlas('cutie','./assets/cutie_red_hed.png',
        './assets/cutie_red_hed_atlas.json')


    this.load.audio('walkSound', './assets/cute-walk.mp3')
    this.load.audio('pickStar', './assets/star.mp3')
    this.load.audio('bombCollide', './assets/bomb.mp3')
}

function create (){
    this.add.image(500, 300, 'backGround')
    platforms = this.physics.add.staticGroup()
    platforms.create(500, 565, 'ground')
    platforms.create(750, 400, 'platform')
    platforms.create(200, 285, 'platform')
    platforms.create(800, 225, 'platform')

    walkSound = this.sound.add('walkSound',{
        mute: false,
        volume: 0.5,
        rate: 0.7,
        loop: true
    })
    pickStar = this.sound.add('pickStar',{
        mute: false,
        volume: 1,
        rate: 1.8,
        loop: false
    })
    bombCollide = this.sound.add('bombCollide',{
        mute: false,
        volume: 2.5,
        rate: 1.5,
        loop: false
    })

    restartBtn = this.add.image(800, 565, 'restartBtn')
    restartBtn.alpha = 0
    restartBtn.setInteractive()
    restartBtn.on('pointerdown', restartGame)
    
    player = this.physics.add.sprite(150, 450, 'cutie')
    player.setBounce(0.3)
    player.setDepth(1)
    player.setBodySize(20, 40)
    player.setCollideWorldBounds(true)


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


    this.physics.add.collider(player, platforms)

    cursors = this.input.keyboard.createCursorKeys()
    stars = this.physics.add.group({
        key: 'star',
        repeat: 12,
        setXY: { x: 70, y: 0, stepX: 70 }
        })
    stars.children.iterate(function (child) {
        child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.6))
        })
    this.physics.add.collider(stars, platforms)
    this.physics.add.overlap(player, stars, collectStar, null, this)
    scoreText = this.add.text(400, 540, 'Score: 0', {
            fontFamily: 'Viaoda Libre, cursive',
            fontSize: '48px', color: textColour})
    liveText = this.add.text(150, 540, 'Lives: 3', {
            fontFamily: 'Viaoda Libre, cursive',
            fontSize: '48px', color: textColour})
    bombs = this.physics.add.group()
    this.physics.add.collider(bombs, platforms)
    this.physics.add.collider(player, bombs, hitBomb, null, this)

    }
function update (){
    if (gameOver){
        player.setVelocityX(0)
        restartBtn.alpha = 1
        restartBtn.angle-=2
        walkSound.stop()
        isWalking=false
        return
    }
    if (cursors.left.isDown){
        player.setVelocityX(-180)
        if (player.body.touching.down&&!isWalking){
            walkSound.play()
            isWalking=true}
        if (player.body.touching.down){player.anims.play('walk', true)}
        player.setFlipX(true)
        player.setBodySize(20, 40)
        } else if (cursors.right.isDown){
        player.setVelocityX(180)
        if (player.body.touching.down&&!isWalking){
            walkSound.play()
            isWalking=true}
        if (player.body.touching.down){player.anims.play('walk', true)}
        player.setFlipX(false)
        } else{
            walkSound.stop()
            isWalking=false
            player.setVelocityX(0)
            player.body.touching.down?player.anims.play('idle', true):player.anims.play('jump', false)
        }

    if (cursors.up.isDown && player.body.touching.down){
        walkSound.stop()
        isWalking=false
        player.anims.play('jump', false)
        player.setVelocityY(-320)
        }else if (cursors.down.isDown ){
        player.setVelocityY(450)
        }
    if (player.y >= 580){
        checkPlayerLife(-1)
        if (lives > 0) {player.setVelocityY(-450)}
        }
    }

function restartGame(){
    player.x=150
    player.y=450
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
    pickStar.play()
    score ++
    scoreText.setText('Score: ' + score)
    if (stars.countActive(true) === 0){
        stars.children.iterate(function (child) {
            child.enableBody(true, child.x, 0, true, true)
        })
        var x = (player.x < 500) ? Phaser.Math.Between(600, 700) : Phaser.Math.Between(100, 400)
        var bomb = bombs.create(x, 16, 'bomb')
        bomb.setBounce(1)
        bomb.setCollideWorldBounds(true)
        bomb.setVelocity(Phaser.Math.Between(150, 200), 20)
        }
    }

function checkPlayerLife(setLife){
    lives = lives + setLife
    liveText.setText('Lives: ' + lives)
    if (lives == 0){
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
    bomb.disableBody(true, true)
    bombCollide.play()
    checkPlayerLife(-1)
    }
    