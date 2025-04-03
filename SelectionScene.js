// export default class SelectionScene extends Phaser.Scene {
//     constructor() {
//         super({ key: 'SelectionScene' });
//     }

//     create() {
//         // Display fighter selection text
//         this.add.text(this.scale.width / 2, this.scale.height / 2 - 100, 'Choose Your Fighters', {
//             fontSize: '30px',
//             color: '#ffffff'
//         }).setOrigin(0.5);

//         // Here you can display options for selecting fighters (mocking with text)
//         this.add.text(this.scale.width / 2, this.scale.height / 2 - 50, 'Player Fighter: Dad', { fontSize: '20px', color: '#ffffff' }).setOrigin(0.5);
//         this.add.text(this.scale.width / 2, this.scale.height / 2, 'CPU Fighter: Opponent', { fontSize: '20px', color: '#ffffff' }).setOrigin(0.5);

//         // Add "Fight!" button
//         const fightButton = this.add.text(this.scale.width / 2, this.scale.height / 2 + 100, 'Fight!', {
//             fontSize: '30px',
//             color: '#ffffff',
//             backgroundColor: '#000000',
//             padding: { x: 20, y: 10 }
//         }).setOrigin(0.5).setInteractive();

//         // On button click, start GameScene
//         fightButton.on('pointerdown', () => {
//             this.scene.start('GameScene');
//         });
//     }
// }
