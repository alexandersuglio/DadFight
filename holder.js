//holder

// Phaser game configuration and code goes here
const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 400,
    backgroundColor: '#a9a9a9',
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
let player1Health = 100, player2Health = 100;
let player1HealthBar, player2HealthBar;
let gameOverText;
let gamePaused = false;
let player2State = "marching"; // Starting state
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

function preload() {
    this.load.spritesheet('dude', 'https://labs.phaser.io/assets/sprites/dude.png', { frameWidth: 32, frameHeight: 48 });
    this.load.spritesheet('robot', 'https://labs.phaser.io/assets/sprites/robot.png', { frameWidth: 32, frameHeight: 32 });
}

function create() {
    player1 = this.physics.add.sprite(150, 300, 'dude');
    player2 = this.physics.add.sprite(650, 300, 'robot');

    // Set up health bars
    player1HealthBar = this.add.rectangle(100, 50, player1Health, 20, 0x00ff00).setOrigin(0, 0);
    player2HealthBar = this.add.rectangle(600, 50, player2Health, 20, 0xff0000).setOrigin(0, 0);

    // Input keys for player actions
    this.cursors = this.input.keyboard.createCursorKeys();
    this.keys = this.input.keyboard.addKeys({
        // A: Phaser.Input.Keyboard.KeyCodes.A,
        // D: Phaser.Input.Keyboard.KeyCodes.D,
        K: Phaser.Input.Keyboard.KeyCodes.K,  // Opponent punch
        R: Phaser.Input.Keyboard.KeyCodes.R,  // Reset key
        P: Phaser.Input.Keyboard.KeyCodes.P   // Push key
    });

    // Game over text (hidden at the start)
    gameOverText = this.add.text(200, 200, '', { fontSize: '32px', fill: '#ffffff' });
}

function update() {
    if (gamePaused) {
        if (Phaser.Input.Keyboard.JustDown(this.keys.R)) {
            resetGame();
        }
        return;
    }

    // Player 1 movement constrained to screen bounds
    if (this.cursors.left.isDown) {
        player1.x -= 2;
    } else if (this.cursors.right.isDown) {
        player1.x += 2;
    }

    // Constrain player 1 within the game screen bounds
    player1.x = Phaser.Math.Clamp(player1.x, 0, config.width);

    // Update cooldowns
    opponentAttackDelay = Math.max(0, opponentAttackDelay - 1);

    // Update health regeneration timer
    regenTimer++;
    if (regenTimer >= regenInterval) {
        regenerateHealth();
        regenTimer = 0; // Reset timer after regeneration
    }

    // Opponent AI behavior based on state
    switch (player2State) {
        case "marching":
            marchingTowards(player2, player1, 1.5); // Adjust speed for marching
            if (Phaser.Math.Distance.Between(player2.x, player2.y, player1.x, player1.y) < attackDistance) {
                player2State = "attacking"; // Switch to attacking state
            }
            break;

        case "attacking":
            if (Phaser.Math.Distance.Between(player2.x, player2.y, player1.x, player1.y) < attackDistance && opponentAttackDelay === 0) {
                attack(player2, player1, 10); // Attack player 1
                opponentAttackDelay = Phaser.Math.Between(20, 50); // Random delay for next attack (20 to 50 frames)
            } else if (Phaser.Math.Distance.Between(player2.x, player2.y, player1.x, player1.y) >= attackDistance) {
                player2State = "marching"; // Return to marching if out of range
            }
            break;

        case "retreat":
            retreat(player2, player1, 2);
            if (Phaser.Math.Distance.Between(player2.x, player2.y, player1.x, player1.y) >= attackDistance) {
                player2State = "marching"; // Return to marching after retreating
                isRetreating = false; // Reset retreating state
            }
            break;
    }

    // Check for player 1 attacks
    if (Phaser.Input.Keyboard.JustDown(this.cursors.space)) {
        punch(player1, player2, 10);
        hitsInARow++; // Increment hits in a row
        if (hitsInARow >= retreatThreshold) {
            isRetreating = true; // Set retreating state if hit threshold is reached
            player2State = "retreat"; // Transition to retreat state
        }
    } else {
        hitsInARow = 0; // Reset hits in a row if no punch is thrown
    }

    // Check for push action
    if (Phaser.Input.Keyboard.JustDown(this.keys.P)) {
        push(player1, player2);
    }

    // Opponent attacks logic
    if (Phaser.Input.Keyboard.JustDown(this.keys.K)) {
        punch(player2, player1, 10);
        hitsInARow = 0; // Reset hits in a row if opponent hits
        if (Phaser.Math.Distance.Between(player2.x, player2.y, player1.x, player1.y) < attackDistance) {
            player2State = "attacking"; // Stay in attacking state if he hits
        }
    }

    // Update health bars
    player1HealthBar.width = player1Health;
    player2HealthBar.width = player2Health;

    // End game condition
    if (player1Health <= 0) {
        endGame('Player 2 Wins! Press R to Restart');
    }
    if (player2Health <= 0) {
        endGame('Player 1 Wins! Press R to Restart');
    }
}

function punch(attacker, defender, damage) {
    if (Phaser.Math.Distance.Between(attacker.x, attacker.y, defender.x, defender.y) < attackDistance) {
        if (defender === player1) {
            player1Health -= damage;
            defender.x -= pushBackDistance; // Push player 1 back on hit
        } else {
            player2Health -= damage;
            attacker.x += pushBackDistance; // Push player 2 back on hit
        }
    }
}

function marchingTowards(attacker, target, speed) {
    if (attacker.x > target.x) {
        attacker.x -= speed;
    } else if (attacker.x < target.x) {
        attacker.x += speed;
    }
}

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

function push(attacker, defender) {
    if (Phaser.Math.Distance.Between(attacker.x, attacker.y, defender.x, defender.y) < attackDistance) {
        defender.x -= pushBackDistance; // Push defender back on x axis
    }
}

function attack(attacker, target, damage) {
    if (Phaser.Math.Distance.Between(attacker.x, attacker.y, target.x, target.y) < attackDistance) {
        punch(attacker, target, damage);
    }
}

function regenerateHealth() {
    if (player1Health < 100) {
        player1Health += regenAmount;
    }
    if (player2Health < 100) {
        player2Health += regenAmount;
    }
}

function endGame(message) {
    gamePaused = true;
    gameOverText.setText(message);
}

function resetGame() {
    player1Health = 100;
    player2Health = 100;
    player1HealthBar.width = player1Health;
    player2HealthBar.width = player2Health;
    gameOverText.setText('');
    gamePaused = false;
    player2State = "marching"; // Reset opponent state
    isRetreating = false; // Reset retreating state
    hitsInARow = 0; // Reset hits in a row
}
