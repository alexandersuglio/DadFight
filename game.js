document.addEventListener("DOMContentLoaded", () => {

const tvScreen = document.querySelector(".tv-screen");

// to run in terminal run 'python3 -m http.server 8083' or any other port name

let playerA = localStorage.getItem('selectPlayerA');
let playerB = localStorage.getItem('selectPlayerB');
let venue = localStorage.getItem('selectedVenue');

console.log("Player 1: ", playerA);
console.log("Player CPU: ", playerB);
console.log("Venue picked: ", venue);

let players = ['Fox News Dad', 'MSNBC Dad'];
let player1Text = '';
let player2Text = '';

let dingPlayed = false;
let fightPlayed = false;

// Phaser game configuration and code goes here
const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 400,

    // scale: {
    //         mode: Phaser.Scale.RESIZE, // Makes the game responsive
    //         autoCenter: Phaser.Scale.CENTER_BOTH // Centers game in the container
    //         },
    // width: document.querySelector(".tv-screen").clientWidth, // Match TV screen width
    // height: document.querySelector(".tv-screen").clientHeight, // Match TV screen height
    // parent: document.querySelector(".tv-screen"),

    //#a9a9a9
    backgroundColor: '#1b1523',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

const game = new Phaser.Game(config);

// Game variables
let player1, player2;
let player1Health = 100,
    player2Health = 100;
let player1HealthBar, player2HealthBar;
let gameOverText;
let gamePaused = false;

let isRetreating = false; // Tracks if player 2 is in retreat

let opponentAttackDelay = 0; // Delay for opponent's next attack
let hitsInARow = 0; // Tracks consecutive hits on opponent
const retreatDistance = 50; // Distance for retreat
const attackDistance = 70; // Smaller distance for attack range
const retreatThreshold = 3; // Hits before retreating
const regenInterval = 50; // Time in frames to start health regeneration (faster)
const regenAmount = 2; // Health points regenerated each interval (faster)
let regenTimer = 0; // Timer for health regeneration
const pushBackDistance = 30; // Distance to push back on hit
const pushBackYDistance = 20; // Y distance to push back on push


let player2State = "marching"; // Start player2 in idle state
//let player2State = "standing";
let player2HealthLow = false;

let gameStartDelay = 3000; // 3 seconds in milliseconds
let gameStartTime = 0; // Track when the timer starts
let gameStarted = false; // Flag to know when game has started


let countdownText; // Text for displaying "3, 2, 1, Fight!"
let countdownValue = 3; // Initial countdown value
let countdownActive = true; // Flag to disable movement during countdown

let roundText;
let round = 1;

let player1Score = 0;
let player2Score = 0;


function startGame() {
    // Begin the countdown at the start
    gameStartTime = this.time.now;
    gameStarted = false;

    //beginRound();
}

function preload() {

    if (playerA === "dad1" && playerB == 'dad2') {

        player1Text = players[0];
        player2Text = players[1];

        this.load.spritesheet('dad1', './assets/new_assets/Fox_Dad.png', { frameWidth: 192, frameHeight: 192 });
        this.load.spritesheet('dad2', './assets/new_assets/MSNBC_Dad.png', { frameWidth: 192, frameHeight: 192 });

    } else if (playerA === "dad2" && playerB == 'dad1') {

        player1Text = players[1];
        player2Text = players[0];

        this.load.spritesheet('dad2', './assets/new_assets/Fox_Dad.png', { frameWidth: 192, frameHeight: 192 });
        this.load.spritesheet('dad1', './assets/new_assets/MSNBC_Dad.png', { frameWidth: 192, frameHeight: 192 });

    } else if (playerA === "dad1" && playerB == 'dad1') {

        playerB = 'dad2';

        player1Text = players[0];
        player2Text = players[0];

        this.load.spritesheet('dad1', './assets/new_assets/Fox_Dad.png', { frameWidth: 192, frameHeight: 192 });
        this.load.spritesheet('dad2', './assets/new_assets/Fox_Dad.png', { frameWidth: 192, frameHeight: 192 });

    } else if (playerA === "dad2" && playerB == 'dad2') {

        playerB = 'dad1';

        player1Text = players[1];
        player2Text = players[1];

        this.load.spritesheet('dad1', './assets/new_assets/MSNBC_Dad.png', { frameWidth: 192, frameHeight: 192 });
        this.load.spritesheet('dad2', './assets/new_assets/MSNBC_Dad.png', { frameWidth: 192, frameHeight: 192 });

    }
        
        // venue choices
        this.load.image('background1', './assets/venues/GoodOnes/HomeDepot.png');
        this.load.image('background2', './assets/venues/GoodOnes/FarmersMarket.png');
        this.load.image('background3', './assets/venues/GoodOnes/HOAExpo.png');
        this.load.image('background4', './assets/venues/GoodOnes/HighSchoolReunion.png'); 


        this.load.audio('punchSound', './assets/sounds/punch.mp3');  
        this.load.audio('punchWhoosh', './assets/sounds/punchWhoosh.mp3');  
        this.load.audio('dingDing', './assets/sounds/boxingbellround.mp3');  
        this.load.audio('fight', './assets/sounds/fight.mp3'); 
        this.load.audio('epic', './assets/sounds/epic.mp3');  
        this.load.audio('police', './assets/sounds/police.mp3');  

        // this.load.spritesheet('dad1', './assets/new_assets/Fox_Dad.png', { frameWidth: 192, frameHeight: 192 });
        // this.load.spritesheet('dad2', './assets/new_Assets/MSNBC_Dad.png', { frameWidth: 192, frameHeight: 192 });

}

function updateRoundText() {

    // if (round > 2)
    // {
    //   roundText.setText(`Final Round: ${round} `); // Update the round text  
    // }

    roundText.setText(`Round ${round}`); // Update the round text
}

function create() {

    if (venue == "VenueA")
    {
        this.add.image(800 / 2, 400 / 2, 'background1');
    }
    else if (venue == "VenueB")
    {
        this.add.image(800 / 2, 400 / 2, 'background2');
    }
    else if (venue == "VenueC")
    {
        this.add.image(800 / 2, 400 / 2, 'background3');
    }
    else if (venue == "VenueD")
    {
        this.add.image(800 / 2, 400 / 2, 'background4');
    }

    roundText = this.add.text(this.cameras.main.width / 2, 60, `Round ${round}`, {
        fontSize: '20px',
        fill: '#ffffff',
        shadow: {
        offsetX: 2,
        offsetY: 2,
        color: '#000000',
        blur: 4,
        stroke: true,
        fill: true
    }
    }).setOrigin(0.5, 0);

    // PLAYER 1

    // player1 starts and ends animations
    this.anims.create({
        key: 'player1-start-left',
        frames: this.anims.generateFrameNumbers('dad1', { start: 22, end: 23 }),
        repeat: -1
    });

    this.anims.create({
        key: 'player1-start-right',
        frames: this.anims.generateFrameNumbers('dad1', { start: 0, end: 1 }),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'player1-end-left',
        frames: this.anims.generateFrameNumbers('dad1', { start: 22, end: 23 }),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'player1-end-right',
        frames: this.anims.generateFrameNumbers('dad1', { start: 0, end: 1 }),
        frameRate: 10,
        repeat: -1
    });

    // player1 directional
    this.anims.create({
        key: 'player1-walk-left',
        frames: this.anims.generateFrameNumbers('dad1', { start: 4, end: 7 }), // Frames for left walk
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'player1-walk-right',
        frames: this.anims.generateFrameNumbers('dad1', { start: 26, end: 29 }), // Frames for right walk
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'player1-idle-left',
        frames: this.anims.generateFrameNumbers('dad1', { start: 2, end: 3 }), // Frames for right walk
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'player1-idle-right',
        frames: this.anims.generateFrameNumbers('dad1', { start: 24, end: 25 }), // Frames for right walk
        frameRate: 10,
        repeat: -1
    });

    // player1 KOs
    this.anims.create({
        key: 'player1-KO-left-start',
        frames: [{ key: 'dad1', frame: 16 },
            { key: 'dad1', frame: 17 },
            { key: 'dad1', frame: 18 }
        ],
        frameRate: 10,
        repeat: 0
    });

    this.anims.create({
        key: 'player1-KO-left-loop',
        frames: [
            { key: 'dad1', frame: 19 },
            { key: 'dad1', frame: 20 },
            { key: 'dad1', frame: 21 }
        ],
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'player1-KO-right-start',
        frames: [{ key: 'dad1', frame: 38 },
            { key: 'dad1', frame: 39 },
            { key: 'dad1', frame: 40 }
        ],
        frameRate: 10,
        repeat: 0
    });

    this.anims.create({
        key: 'player1-KO-right-loop',
        frames: [
            { key: 'dad1', frame: 41 },
            { key: 'dad1', frame: 42 },
            { key: 'dad1', frame: 43 }
        ],
        frameRate: 10,
        repeat: -1
    });

    // player1 hurts
    this.anims.create({
        key: 'player1-left-hurt',
        frames: [{ key: 'dad1', frame: 14 },
            { key: 'dad1', frame: 15 }
        ],
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'player1-right-hurt',
        frames: [
            { key: 'dad1', frame: 36 },
            { key: 'dad1', frame: 37 }
        ],
        frameRate: 10,
        repeat: -1
    });

    // player1 punches
    this.anims.create({
        key: 'player1-left-punchA',
        frames: [
            { key: 'dad1', frame: 8 },
            { key: 'dad1', frame: 9 },
            { key: 'dad1', frame: 10 },
            { key: 'dad1', frame: 8 }
        ],
        frameRate: 10,
        repeat: 0
    });

    this.anims.create({
        key: 'player1-right-punchA',
        frames: [
            { key: 'dad1', frame: 31 },
            { key: 'dad1', frame: 32 },
            { key: 'dad1', frame: 33 },
            { key: 'dad1', frame: 31 }
        ],
        frameRate: 10,
        repeat: 0
    });


    // PLAYER 2

    // player2 starts and ends animations
    this.anims.create({
        key: 'player2-start-left',
        frames: this.anims.generateFrameNumbers('dad2', { start: 22, end: 23 }),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'player2-start-right',
        frames: this.anims.generateFrameNumbers('dad2', { start: 0, end: 1 }),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'player2-end-left',
        frames: this.anims.generateFrameNumbers('dad2', { start: 22, end: 23 }),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'player2-end-right',
        frames: this.anims.generateFrameNumbers('dad2', { start: 0, end: 1 }),
        frameRate: 10,
        repeat: -1
    });

    // player2 directional
    this.anims.create({
        key: 'player2-walk-left',
        frames: this.anims.generateFrameNumbers('dad2', { start: 4, end: 7 }), // Frames for left walk
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'player2-walk-right',
        frames: this.anims.generateFrameNumbers('dad2', { start: 26, end: 29 }), // Frames for right walk
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'player2-idle-left',
        frames: this.anims.generateFrameNumbers('dad1', { start: 2, end: 3 }), // Frames for right walk
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'player2-idle-right',
        frames: this.anims.generateFrameNumbers('dad1', { start: 24, end: 25 }), // Frames for right walk
        frameRate: 10,
        repeat: -1
    });

    // player2 KOs
    this.anims.create({
        key: 'player2-KO-left-start',
        frames: [{ key: 'dad2', frame: 16 },
            { key: 'dad2', frame: 17 },
            { key: 'dad2', frame: 18 }
        ],
        frameRate: 10,
        repeat: 0
    });

    this.anims.create({
        key: 'player2-KO-left-loop',
        frames: [
            { key: 'dad2', frame: 19 },
            { key: 'dad2', frame: 20 },
            { key: 'dad2', frame: 21 }
        ],
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'player2-KO-right-start',
        frames: [{ key: 'dad2', frame: 38 },
            { key: 'dad2', frame: 39 },
            { key: 'dad2', frame: 40 }
        ],
        frameRate: 10,
        repeat: 0
    });

    this.anims.create({
        key: 'player2-KO-right-loop',
        frames: [
            { key: 'dad2', frame: 41 },
            { key: 'dad2', frame: 42 },
            { key: 'dad2', frame: 43 }
        ],
        frameRate: 10,
        repeat: -1
    });

    // player2 hurts
    this.anims.create({
        key: 'player2-left-hurt',
        frames: [{ key: 'dad2', frame: 14 },
            { key: 'dad2', frame: 15 }
        ],
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'player2-right-hurt',
        frames: [
            { key: 'dad2', frame: 36 },
            { key: 'dad2', frame: 37 }
        ],
        frameRate: 10,
        repeat: -1
    });

    // player2 punches
    this.anims.create({
        key: 'player2-left-punchA',
        frames: [
            { key: 'dad2', frame: 8 },
            { key: 'dad2', frame: 9 },
            { key: 'dad2', frame: 10 },
            { key: 'dad2', frame: 8 }
        ],
        frameRate: 10,
        repeat: 0
    });

    this.anims.create({
        key: 'player2-right-punchA',
        frames: [
            { key: 'dad2', frame: 31 },
            { key: 'dad2', frame: 32 },
            { key: 'dad2', frame: 33 },
            { key: 'dad2', frame: 31 }
        ],
        frameRate: 10,
        repeat: 0
    });

    this.anims.create({
        key: 'player2-left-begin',
        frames: [
            { key: 'dad2', frame: 2 },
            { key: 'dad2', frame: 3 },
        ],
        frameRate: 10,
        repeat: 0
    });

    this.anims.create({
        key: 'player2-right-begin',
        frames: [
            { key: 'dad2', frame: 24 },
            { key: 'dad2', frame: 25 },
        ],
        frameRate: 10,
        repeat: 0
    });

    player1 = this.physics.add.sprite(150, 300, 'dad1');
    player2 = this.physics.add.sprite(650, 300, 'dad2');

    player1.lastDirection = 'right';
    player2.lastDirection = 'left';

    player1HealthBackground = this.add.rectangle(100, 50, 100, 20, 0x808080).setOrigin(0, 0);
    player2HealthBackground = this.add.rectangle(600, 50, 100, 20, 0x808080).setOrigin(0, 0);

    // Set up health bars
    player1HealthBar = this.add.rectangle(100, 50, player1Health, 20, 0x00ff00).setOrigin(0, 0);
    player2HealthBar = this.add.rectangle(600, 50, player2Health, 20, 0x00ff00).setOrigin(0, 0);

    // player1 text
    this.add.text(100, 80, player1Text, { fontSize: '16px', fill: '#ffffff', shadow: {
        offsetX: 2,
        offsetY: 2,
        color: '#000000',
        blur: 4,
        stroke: true,
        fill: true
    } }).setOrigin(0, 0);

    // player2 text
    this.add.text(600, 80, player2Text, { fontSize: '16px', fill: '#ffffff', shadow: {
        offsetX: 2,
        offsetY: 2,
        color: '#000000',
        blur: 4,
        stroke: true,
        fill: true
    } }).setOrigin(0, 0);

    // Input keys for player actions
    this.cursors = this.input.keyboard.createCursorKeys();
    this.keys = this.input.keyboard.addKeys({
        R: Phaser.Input.Keyboard.KeyCodes.R, // Reset key
        P: Phaser.Input.Keyboard.KeyCodes.P, // Push key
        Enter: Phaser.Input.Keyboard.KeyCodes.ENTER,
        Escape: Phaser.Input.Keyboard.KeyCodes.ESC
    });

    // Game over text (hidden at the start)
    gameText = this.add.text(0, 0, '', { fontSize: '20px', fill: '#ffffff', shadow: {
        offsetX: 2,
        offsetY: 2,
        color: '#000000',
        blur: 4,
        stroke: true,
        fill: true
    } });

    // Center the text over the game area
    gameText.setOrigin(0.5); // Sets the origin point to the center
    gameText.setPosition(this.cameras.main.width / 2, this.cameras.main.height / 2);

    this.physics.add.collider(player1, player2);
}

// Function to update health bar color based on current health
function updateHealthBarColor(healthBar, health) {
    
    const percentage = health / 100; // Health percentage (0 to 1)

    // Store the original width before changing color
    const originalWidth = healthBar.width;

    // If health is 0 or less (game over), make the health bar red
    if (health <= 0) {

        healthBar.setFillStyle(0xFF0000); // Red color for health 0 or below

    } else {
        // Check if health is greater than 10% (0.1)
        if (percentage > 0.1) {

            healthBar.setFillStyle(0x00FF00); // Green for >10% health

        } else {

            // Gradual color change from green to red as health decreases
            const redValue = Math.floor((1 - percentage) * 255); // More red as health decreases
            const greenValue = Math.floor(percentage * 255); // Less green as health decreases
            healthBar.setFillStyle(Phaser.Display.Color.GetColor(redValue, greenValue, 0)); // Red to green gradient
        }
    }

    // Reapply the original width to prevent resizing
    healthBar.width = originalWidth;
}

function updatePlayerHealth(healthBar, health) {
    healthBar.width = health; // Adjust health bar width based on current health
    updateHealthBarColor(healthBar, health); // Update color based on health
}


function test(){
    console.log("dad fight!!!!");
}


function beginRound1(scene) {
    // Set players to idle animations
    player1.anims.play('player1-idle-left', true);
    player2.anims.play('player2-idle-right', true);

    // Stop all movement
    player1.setVelocity(0, 0);
    player2.setVelocity(0, 0);
    player1.setAcceleration(0, 0);
    player2.setAcceleration(0, 0);

    // Disable input so players can't move
    scene.input.keyboard.enabled = false;

    console.log("3... 2... 1... Fight!");

    // After 3 seconds, re-enable movement
    scene.time.delayedCall(3000, () => {
        scene.input.keyboard.enabled = true;  // Allow movement
        console.log("Fight!");
    });
}





function update() {

    //test();

    //resetRound();
    //beginRound1(this);

    //this.sound.play('dingDing');

    if (!dingPlayed) {
        this.sound.play("dingDing"); // Play sound once
        dingPlayed = true; // Prevent it from playing again
    }

    if (!fightPlayed){
        this.sound.play("fight");
        fightPlayed = true;
    }

    if (gamePaused) {

        // If "R" is pressed, reset the round (only if no one has won two rounds)
        if (Phaser.Input.Keyboard.JustDown(this.keys.R) && player1Score < 2 && player2Score < 2) {

            resetRound(this);

        }
        // If "ENTER" is pressed, restart the entire game (only after someone has won two rounds)
        else if (Phaser.Input.Keyboard.JustDown(this.keys.Enter) && (player1Score >= 2 || player2Score >= 2)) {
            
            // this restarts game within the chosen rounds
            //gameBegin();

            // send to homescreen now
            redirectToMain();
        }

        return;
    }


    // Detect movement to the left
    if (this.cursors.left.isDown) {
        player1.x -= 2; // Move player to the left

        // Reset hurt state on movement
        player1.isHurt = false;

        // Play walk-left animation if not punching or hurt
        if (!player1.anims.isPlaying || (player1.anims.currentAnim.key !== 'player1-left-punchA' && !player1.isHurt)) {
            player1.anims.play('player1-walk-left', true); // Play walking animation to the left
        }
        player1.lastDirection = 'left'; // Set last direction to left

    } else if (this.cursors.right.isDown) {
        player1.x += 2; // Move player to the right

        // Reset hurt state on movement
        player1.isHurt = false;

        // Play walk-right animation if not punching or hurt
        if (!player1.anims.isPlaying || (player1.anims.currentAnim.key !== 'player1-right-punchA' && !player1.isHurt)) {
            player1.anims.play('player1-walk-right', true); // Play walking animation to the right
        }
        player1.lastDirection = 'right'; // Set last direction to right

    } else {

        // No keys pressed, stop movement
        player1.setVelocityX(0);

        // Only play idle animation if not punching and not hurt
        if (!player1.anims.isPlaying || (!player1.isHurt && player1.anims.currentAnim.key !== 'player1-left-punchA' && player1.anims.currentAnim.key !== 'player1-right-punchA')) {

            // Play idle-left if the last direction was left and not hurt
            if (player1.lastDirection === 'left' && !player1.isHurt) {
                player1.anims.play('player1-idle-left', true);
            }
            // Play idle-right if the last direction was right and not hurt
            else if (player1.lastDirection === 'right' && !player1.isHurt) {
                player1.anims.play('player1-idle-right', true);
            }
        }
    }


    // Reset isHurt when the hurt animation completes
    player1.on('animationcomplete', function(animation) {
        if (animation.key.includes('hurt')) {
            player1.isHurt = false; // Reset hurt state after hurt animation completes
        }
    });

    // Handle punch input (space bar)
    if (Phaser.Input.Keyboard.JustDown(this.cursors.space)) {

        // If the player is facing left, play the left punch animation
        if (player1.lastDirection === 'left') {
            
            this.sound.play('punchWhoosh', { volume: 1, rate: 1, detune: Phaser.Math.Between(-50, 50) });
            player1.anims.play('player1-left-punchA', false); // Play left punch animation
            punch(player1, player2, 10);
        }

        // If the player is facing right, play the right punch animation
        else if (player1.lastDirection === 'right') {
            
            this.sound.play('punchWhoosh', { volume: 1, rate: 1, detune: Phaser.Math.Between(-50, 50) });
            player1.anims.play('player1-right-punchA', false); // Play right punch animation
            punch(player1, player2, 10);
        }

        hitsInARow++; // Increase punch streak
    } else {
        hitsInARow = 0; // Reset streak if no punch is thrown
    }


    // Constrain player 1 within the game screen bounds
    player1.x = Phaser.Math.Clamp(player1.x, 0, config.width);
    player2.x = Phaser.Math.Clamp(player2.x, 0, config.width);

    // Update cooldowns
    opponentAttackDelay = Math.max(0, opponentAttackDelay - 1);

    // Update health regeneration timer
    regenTimer++;
    if (regenTimer >= regenInterval) {
        regenerateHealth();
        regenTimer = 0; // Reset timer after regeneration
    }

    // still working on 
    // Opponent AI behavior based on state
    switch (player2State) {

        // needs work
        case "standing":

            //player1.anims.play('player1-idle-left', true);
            player2.anims.play('player2-idle-left', true);

            break;

        case "marching":
            marchingTowards(player2, player1, 1.5); // Adjust speed for marching
            if (Phaser.Math.Distance.Between(player2.x, player2.y, player1.x, player1.y) < attackDistance) {
                player2State = "attacking"; // Switch to attacking state
            }
            break;

        case "attacking":
            if (Phaser.Math.Distance.Between(player2.x, player2.y, player1.x, player1.y) < attackDistance && opponentAttackDelay === 0) {
                
                // makes player2 punch sound
                //this.sound.play('punchSound');
                attack(player2, player1, 10); // Attack player 1
                opponentAttackDelay = Phaser.Math.Between(20, 50); // Random delay for next attack (20 to 50 frames)
            } else if (Phaser.Math.Distance.Between(player2.x, player2.y, player1.x, player1.y) >= attackDistance) {
                player2State = "marching"; // Return to marching if out of range
            }
            break;

        // needs work
        case "retreat":
            
            if (Phaser.Math.Distance.Between(player2.x, player2.y, player1.x, player1.y) >= attackDistance) {
                player2State = "marching"; // Return to marching after retreating
                isRetreating = false; // Reset retreating state
            }
            break;
    }

    // update health bars
    player1HealthBar.width = player1Health;
    player2HealthBar.width = player2Health;

    updateHealthBarColor(player1HealthBar, player1Health);
    updateHealthBarColor(player2HealthBar, player2Health);

    // end game condition for player1
    if (player1Health <= 0) {
        player2Score++;
        if (player1.lastDirection === 'left') {
            player1.play('player1-KO-left-start');
            player1.on('animationcomplete-player1-KO-left-start', () => {
                player1.play('player1-KO-left-loop');
                player2.play('player2-end-left');
            });
        }

        if (player1.lastDirection === 'right') {
            player1.play('player1-KO-right-start');
            player1.on('animationcomplete-player1-KO-right-start', () => {
                player1.play('player1-KO-right-loop');
                player2.play('player2-end-right');
            });
        }

        if (player2Score >= 2) {
            gameOver(this, player2Text + ' wins! Press ENTER to fight again');
        
        } else {
            endRound(this, player2Text + ` Wins Round ${round}! Press R to continue`);
        }
    }

    // end game condition for player2
    if (player2Health <= 0) {
        player1Score++;
        if (player2.lastDirection === 'left') {
            player2.play('player2-KO-left-start');
            player2.on('animationcomplete-player2-KO-left-start', () => {
                player2.play('player2-KO-left-loop');
                player1.play('player1-end-left');
            });
        }

        if (player2.lastDirection === 'right') {
            player2.play('player2-KO-right-start');
            player2.on('animationcomplete-player2-KO-right-start', () => {
                player2.play('player2-KO-right-loop');
                player1.play('player1-end-right');
            });
        }

        if (player1Score >= 2) {
            gameOver(this, player1Text + ' wins! Press ENTER to fight again');

        } else {
            endRound(this, 
                player1Text + ` Wins Round ${round}! Press R to continue`);
        }
    }

}


// player2 marches
function marchingTowards(attacker, target, speed) {

    if (attacker.x > target.x) {
        attacker.x -= speed;
        attacker.anims.play('player2-walk-left', true);
        attacker.lastDirection = 'left';


    } else if (attacker.x < target.x) {
        attacker.x += speed;
        attacker.anims.play('player2-walk-right', true);
        attacker.lastDirection = 'right';

    } else {
        attacker.setVelocityX(0);
        // Play idle animation based on last direction
        if (attacker.lastDirection === 'left') {
            attacker.anims.play('player2-idle-left', true);
        } else {
            attacker.anims.play('player2-idle-right', true);
        }
    }
}

// player2 attacks
function attack(attacker, target, damage) {
    if (Phaser.Math.Distance.Between(attacker.x, attacker.y, target.x, target.y) < attackDistance) {
        punch(attacker, target, damage);
    }
}

// still needs work
// player2 retreats
function retreat(player, target, speed) {
    // Move away from the target
    let dx = player.x - target.x;
    let dy = player.y - target.y;
    let distance = Math.sqrt(dx * dx + dy * dy);

    // Normalize direction and apply velocity
    if (distance > 0) {
        player.x += (dx / distance) * speed; // Move away
    }
    isRetreating = true; // Set retreating flag
}


// player1 and player2 shared punch logic
function punch(attacker, defender, damage) {

    if (Phaser.Math.Distance.Between(attacker.x, attacker.y, defender.x, defender.y) < attackDistance) {

        let scene = attacker.scene;

        // Play punch sound from the scene
        //scene.sound.play('punchSound');

        if (defender === player1) {

            player1.isHurt = true;

            // Check if player1 is facing left and has been hit
            if (player1.lastDirection === 'left') {

                player2.anims.play('player2-right-punchA', true);
                scene.sound.play('punchWhoosh', { volume: 1, rate: 1, detune: Phaser.Math.Between(-50, 50) });

                // Check if hurt animation is not playing and then play it
                if (!player1.anims.isPlaying || player1.anims.currentAnim.key !== 'player1-left-hurt') {
                    
                    scene.sound.play('punchSound', { volume: 1, rate: 1, detune: Phaser.Math.Between(-50, 50) });
                    player1.anims.play('player1-left-hurt', true);
                }
            }

            // Check if player1 is facing right and has been hit
            if (player1.lastDirection === 'right') {
                
                player2.anims.play('player2-left-punchA', true);
                scene.sound.play('punchWhoosh', { volume: 1, rate: 1, detune: Phaser.Math.Between(-50, 50) });


                // Check if hurt animation is not playing and then play it
                if (!player1.anims.isPlaying || player1.anims.currentAnim.key !== 'player1-right-hurt') {
                    
                    scene.sound.play('punchSound', { volume: 1, rate: 1, detune: Phaser.Math.Between(-50, 50) });
                    player1.anims.play('player1-right-hurt', true);

                }
            }

            // reduce health for player 1
            player1Health -= damage;
            updatePlayerHealth(player1HealthBar, player1Health);

            // player1.on('animationcomplete', function(animation) {
            //     if (animation.key.includes('hurt')) {
            //         player1.isHurt = false; // Reset hurt state after animation completes
            //     }
            // });

        } else if (defender === player2) {

            // Check if player2 is facing right and has been hit
            if (player1.lastDirection === 'right') {

                scene.sound.play('punchSound', { volume: 1, rate: 1, detune: Phaser.Math.Between(-50, 50) });
                player2.anims.play('player2-left-hurt', true);

            }

            // Check if player2 is facing left and has been hit
            if (player1.lastDirection === 'left') {
                
                scene.sound.play('punchSound', { volume: 1, rate: 1, detune: Phaser.Math.Between(-50, 50) });
                player2.anims.play('player2-right-hurt', true);
            }

            // Reduce health for player 2
            player2Health -= damage;
            updatePlayerHealth(player2HealthBar, player2Health);
        }
    }
}


// health comes back
function regenerateHealth() {
    if (player1Health < 100) {
        player1Health += regenAmount;
        updatePlayerHealth(player1HealthBar, player1Health);
    }
    if (player2Health < 100) {
        player2Health += regenAmount;
        updatePlayerHealth(player2HealthBar, player2Health);

    }
}


function beginRound()
{
    // player1.anims.play('player1-idle-left', true);
    // player2.anims.play('player2-idle-right', true);
    // player1.x += 1000;
    // player2.x += 0;

    // console.log("is this working?");
}

// round is over
function endRound(scene, message) {
    
    scene.sound.play("epic");
    gamePaused = true;
    gameText.setText(message);
}

//  new round starts
function resetRound(scene) {

    //beginRound();

    // player1.setVelocityX(400);
    // player2.setVelocityX(400);

//dingPlayed = false;
    scene.sound.play("dingDing");
    scene.sound.play("fight");


    resetPlayer1Animation(player1);
    resetPlayer2Animation(player2);
    player1Health = 100;
    player2Health = 100;
    player1HealthBar.width = player1Health;
    player2HealthBar.width = player2Health;
    gameText.setText('');
    player1.setPosition(150, 300);
    player2.setPosition(650, 300);
    gamePaused = false;
    hitsInARow = 0; // Reset hits in a row

  
    // player2State = "marching"; // Reset opponent's state
            
    round++;
    updateRoundText(); // Update the text display
}

function gameOver(scene, message) {
    scene.sound.play("epic");
    scene.sound.play("police");
    gamePaused = true;
    gameText.setText(message);
}

// new code to redirect player to main menu
function redirectToMain()
{
    window.location.href = 'index.html';
}

// this was old code to reset game directly after round
function gameBegin() {

    resetPlayer1Animation(player1);
    resetPlayer2Animation(player2);
    player1Health = 100;
    player2Health = 100;
    player1HealthBar.width = player1Health;
    player2HealthBar.width = player2Health;
    gameText.setText('');
    player1.setPosition(150, 300);
    player2.setPosition(650, 300);
    gamePaused = false;
    hitsInARow = 0; // Reset hits in a row
    player2State = "marching"; // Reset opponent's state

    round = 1;
    updateRoundText();

    player1Score = 0;
    player2Score = 0;
}


// this seems to work for now just keep it
function resetPlayer1Animation(player) {
    
    // Stop any active animation (including dead)
    player.anims.stop();

    player.anims.play('player1-idle-right', true);

}

function resetPlayer2Animation(player) {
    
    // Stop any active animation (including dead)
    player.anims.stop();

    // Reset to the correct default animation (e.g., idle)
    if (player.lastDirection === 'left') {
        player.anims.play('player2-idle-left', true); // Idle animation for player facing left
    } else if (player.lastDirection === 'right') {
        player.anims.play('player2-idle-right', true); // Idle animation for player facing right
    }
}

});
