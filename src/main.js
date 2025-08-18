import Phaser from 'phaser';
import EconomicSisyphus from './sisyphus.js';

// =================================================================
// PHASER GAME CONFIGURATION
// =================================================================

const config = {
  type: Phaser.AUTO,
  parent: 'app',
  backgroundColor: '#0f0f23',
  pixelArt: true,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 1280,
    height: 768
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: [EconomicSisyphus]
};

// =================================================================
// INITIALIZE GAME
// =================================================================

const game = new Phaser.Game(config);

// Export everything for use in other files
export { game, config };