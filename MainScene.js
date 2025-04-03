// // MainScreen.js
// class MainScreen extends Phaser.Scene {
//     constructor() {
//         super({ key: 'MainScreen' });
//     }

//     preload() {
//         Preload any assets for the title screen here if needed
//     }

//     create() {
//         // Display the game title
//         this.add.text(320, 150, 'My Awesome Game', { fontSize: '32px', fill: '#fff' });

//         // Create a 'Fight' button
//         let fightButton = this.add.text(350, 250, 'Fight', { fontSize: '24px', fill: '#fff' });
        
//         // Make the 'Fight' button interactive
//         fightButton.setInteractive();

//         // Start the game scene when the button is clicked
//         fightButton.on('pointerdown', () => {
//             this.scene.start('GameScene'); // This will transition to game.js
//         });
//     }
// }
