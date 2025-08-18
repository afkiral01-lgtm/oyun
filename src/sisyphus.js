import Phaser from 'phaser';
import { GameTexts, UIStyles, UILayout, TextManager } from './textManager.js';

import sisyphusSheet from './sisyphus_steps_sheet_64x64_4x2.png';
import boulderSheet from './rock.png';
import bgImage from './background.png';
import cloudImage1 from './cloud2.png';
import cloudImage2 from './cloud1.png';
import cloudImage3 from './cloud3.png';
import spacebarSheet from './spacebar_98x21_3.png';
import arrowLeft from './ARROWLEFT.png';
import arrowRight from './ARROWRIGHT.png';

export default class EconomicSisyphus extends Phaser.Scene {
  constructor() {
    super({ key: 'Sisyphus' });
    
    // Core properties
    this.sisyphus = null;
    this.boulder = null;
    this.mountain = null;
    this.worldWidth = 1280;
    this.worldHeight = 768;
    this.mountainPoints = [];

    // Game state machine for game modes
    this.gameMode = 'menu';

    // State for 'regular' and 'race' modes
    this.gamePhase = 'waiting';
    this.pushForce = 0;
    this.rollbackSpeed = 0;
    this.recoveryTimer = 0;
    this.gameStarted = false;

    // State for 'race' mode
    this.raceTimer = 0;
    this.raceFinished = false;
    this.lastKeyPressed = null;
    
    // UI Elements
    this.skyText = null;
    this.racePromptKeys = null;
    this.racePromptTimer = null;
    
    // Arrow animation elements
    this.leftArrow = null;
    this.rightArrow = null;
    this.arrowContainer = null;
    this.arrowAnimationTimer = null;
    this.hintAnimationTimer = null;
    this.currentArrowSide = 'left'; 
    
    // Separate transition flags for different fall types
    this.fallingToRaceMode = false;
    this.fallingFromRaceEnd = false;
    this.inputCooldown = 0;
    
    // Name input UI for high scores
    this.nameInputContainer = null;
    this.nameInputField = null;
    this.nameInputSubmit = null;
    this.pendingScore = null;
    this.isEnteringName = false;
    
    // Text management system
    this.textManager = null;
    
    // Touch control virtual states
    this.virtualKeys = {
      space: { isDown: false, justDown: false, wasDown: false },
      left: { isDown: false, justDown: false, wasDown: false },
      right: { isDown: false, justDown: false, wasDown: false },
      esc: { isDown: false, justDown: false, wasDown: false }
    };
  }

  preload() {
    this.load.spritesheet('sisyphusSheet', sisyphusSheet, { frameWidth: 128, frameHeight: 128 });
    this.load.spritesheet('boulderSheet', boulderSheet, { frameWidth: 64, frameHeight: 64 });
    this.load.image('background', bgImage);
    this.load.image('cloud1', cloudImage1);
    this.load.image('cloud2', cloudImage2);
    this.load.image('cloud3', cloudImage3);
    this.load.spritesheet('spacebar', spacebarSheet, { frameWidth: 98, frameHeight: 21 });
    this.load.spritesheet('arrowLeft', arrowLeft, { frameWidth: 19, frameHeight: 21 });
    this.load.spritesheet('arrowRight', arrowRight, { frameWidth: 19, frameHeight: 21 });
  }

  create() {
    this.cameras.main.setBounds(0, 0, this.worldWidth, this.worldHeight);
    
    // Initialize text management system
    this.textManager = new TextManager(this);
    
    this.createParallaxBackgrounds();
    this.createMountain();
    this.createArrowKeysPlaceholder();
    this.createAnimations();

    this.sisyphus = this.add.sprite(0, 0, 'sisyphusSheet', 0).setOrigin(0.5, 0.8).setScale(0.5);
    this.createBoulder();
    
    this.prepareSteepEndDetector();

    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.leftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
    this.rightKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
    this.escKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);

    // Setup touch controls
    this.setupTouchControls();

    this.createGlobalUI();
    this.createRaceUI();
    this.createRacePrompt();
    this.createArrowUI();
    this.createTopRightUI();

    this.startRegularMode();
  }
  
  // =================================================================
  // MASTER UPDATE LOOP
  // =================================================================
  update(_, delta) {
    const dt = delta / 1000;
    
    // Update virtual key states for touch controls
    this.updateVirtualKeys();
    
    // ESC tuşu kontrolü
    if (this.isKeyJustDown('esc')) {
      this.handleEscKey();
    }
    
    if (this.gameMode !== 'credits') {
        this.bg_mid1.tilePositionX += 0.05;
        this.bg_mid2.tilePositionX += 0.1;
        this.bg_mid3.tilePositionX += 0.15;
    }

    switch(this.gameMode) {
        case 'regular': this.updateRegularMode(dt); break;
        case 'race': this.updateRaceMode(dt); break;
        case 'credits': this.updateCreditsMode(dt); break;
    }
  }

  // =================================================================
  // TOUCH CONTROL SYSTEM
  // =================================================================
  
  setupTouchControls() {
    // Create invisible touch zones
    // Left side of screen = LEFT arrow
    const leftZone = this.add.zone(0, 0, this.worldWidth * 0.4, this.worldHeight)
      .setOrigin(0, 0)
      .setInteractive()
      .setScrollFactor(0);
    
    // Right side of screen = RIGHT arrow  
    const rightZone = this.add.zone(this.worldWidth * 0.6, 0, this.worldWidth * 0.4, this.worldHeight)
      .setOrigin(0, 0)
      .setInteractive()
      .setScrollFactor(0);
    
    // Center area = SPACE (for regular mode pushing)
    const spaceZone = this.add.zone(this.worldWidth * 0.2, this.worldHeight * 0.3, this.worldWidth * 0.6, this.worldHeight * 0.4)
      .setOrigin(0, 0)
      .setInteractive()
      .setScrollFactor(0);
    
    // Top-left corner = ESC
    const escZone = this.add.zone(0, 0, 100, 100)
      .setOrigin(0, 0)
      .setInteractive()
      .setScrollFactor(0);

    // Touch event handlers
    leftZone.on('pointerdown', () => this.setVirtualKey('left', true));
    leftZone.on('pointerup', () => this.setVirtualKey('left', false));
    leftZone.on('pointerout', () => this.setVirtualKey('left', false));

    rightZone.on('pointerdown', () => this.setVirtualKey('right', true));
    rightZone.on('pointerup', () => this.setVirtualKey('right', false));
    rightZone.on('pointerout', () => this.setVirtualKey('right', false));

    spaceZone.on('pointerdown', () => this.setVirtualKey('space', true));
    spaceZone.on('pointerup', () => this.setVirtualKey('space', false));
    spaceZone.on('pointerout', () => this.setVirtualKey('space', false));

    escZone.on('pointerdown', () => {
      this.setVirtualKey('esc', true);
      // ESC is typically a single press, so immediately release
      this.time.delayedCall(100, () => this.setVirtualKey('esc', false));
    });
  }

  setVirtualKey(key, isDown) {
    this.virtualKeys[key].isDown = isDown;
  }

  updateVirtualKeys() {
    // Update justDown states by comparing current and previous frame
    Object.keys(this.virtualKeys).forEach(key => {
      const vKey = this.virtualKeys[key];
      vKey.justDown = vKey.isDown && !vKey.wasDown;
      vKey.wasDown = vKey.isDown;
    });
  }

  // Helper methods to check virtual keys (combines keyboard and touch)
  isKeyDown(key) {
    switch(key) {
      case 'space': return this.spaceKey.isDown || this.virtualKeys.space.isDown;
      case 'left': return this.leftKey.isDown || this.virtualKeys.left.isDown;
      case 'right': return this.rightKey.isDown || this.virtualKeys.right.isDown;
      case 'esc': return this.escKey.isDown || this.virtualKeys.esc.isDown;
      default: return false;
    }
  }

  isKeyJustDown(key) {
    switch(key) {
      case 'space': return Phaser.Input.Keyboard.JustDown(this.spaceKey) || this.virtualKeys.space.justDown;
      case 'left': return Phaser.Input.Keyboard.JustDown(this.leftKey) || this.virtualKeys.left.justDown;
      case 'right': return Phaser.Input.Keyboard.JustDown(this.rightKey) || this.virtualKeys.right.justDown;
      case 'esc': return Phaser.Input.Keyboard.JustDown(this.escKey) || this.virtualKeys.esc.justDown;
      default: return false;
    }
  }

  // =================================================================
  // ESC tuşu işleme
  handleEscKey() {
    if (this.gameMode === 'regular') {
      // Normal moddan credits'e geç
      this.startCreditsMode();
    } else if (this.gameMode === 'race') {
      // Yarış modundan normal moda geç (düşürerek)
      this.exitRaceMode();
    }
    // Credits modundaysa hiçbir şey yapma (zaten geri dönüş butonu var)
  }

  // Yarış modundan çıkış
  exitRaceMode() {
    // Yarış durumunu sonlandır
    this.raceFinished = true;
    this.stopArrowSpamAnimation();
    
    // Karakteri düşür ve normal moda geç
    this.gamePhase = 'falling';
    this.rollbackSpeed = 160;
    this.boulder.velocityX = -160;
    this.fallingFromRaceEnd = true;
    
    // Race UI'ı gizle
    this.raceUI.forEach(item => item.setVisible(false));
    
    // Geçici mesaj göster
    this.textManager.showTemporaryRaceMessage(this.skyText, "Yarıştan çıkılıyor...", 2000);
  }

  // =================================================================
  // MODE INITIALIZERS
  // =================================================================
  
  startRegularMode() {
    this.gameMode = 'regular';
    this.resetPlayerState(); 
    
    this.fallingToRaceMode = false;
    this.fallingFromRaceEnd = false;
    
    // Dağ ve sky elementlerini tekrar göster
    if (this.mountain) this.mountain.setVisible(true);
    this.skyPanel.setVisible(true);
    this.skyText.setVisible(true);
    this.quitButton.setVisible(true);
    this.spaceBarSprite.setVisible(false);
    
    this.raceUI.forEach(item => item.setVisible(false));
    
    this.stopArrowSpamAnimation();
    
    this.gameStarted = true;
    this.gamePhase = 'pushing';
    
    // Normal moda geçerken yarış modunu kapat ve pun döngüsünü başlat
    this.textManager.setRaceMode(false);
    this.textManager.startPunCycle(this.skyText);

    if (this.racePromptTimer) this.racePromptTimer.remove();
    this.racePromptTimer = this.time.addEvent({
        delay: Phaser.Math.Between(15000, 25000),
        callback: this.showRacePrompt,
        callbackScope: this,
        loop: true
    });

    this.time.addEvent({
        delay: Phaser.Math.Between(10000, 20000),
        callback: this.showArrowHint,
        callbackScope: this,
        loop: true
    });

    this.cameras.main.pan(this.sisyphus.x, this.sisyphus.y - 100, 2000, 'Sine.easeInOut');
  }
  
  startRaceMode() {
    this.gameMode = 'race';
    this.resetPlayerState();
    
    // Yarış modunu aktif et ve pun döngüsünü durdur
    this.textManager.setRaceMode(true);
    
    this.skyPanel.setVisible(true);
    this.skyText.setVisible(true).setText(GameTexts.messages.raceStart);
    this.raceUI.forEach(item => item.setVisible(true));
    this.leaderboard = JSON.parse(localStorage.getItem('sisyphusRaceScores')) || [];
    this.updateLeaderboardDisplay();

    this.startArrowSpamAnimation();

    this.cameras.main.pan(this.sisyphus.x, this.sisyphus.y - 100, 2000, 'Sine.easeInOut');
  }
startCreditsMode() {
  this.textManager.stopPunCycle();
  if (this.racePromptTimer) this.racePromptTimer.remove();
  if (this.quitButton) this.quitButton.setVisible(false);
  if (this.racePromptKeys) this.racePromptKeys.setVisible(false);

  // EKLENECEK KODLAR BURADA
  if (this.skyText) this.skyText.setVisible(false);
  if (this.skyPanel) this.skyPanel.setVisible(false);
  // KOD SONU

  this.stopArrowSpamAnimation();

  this.gameMode = 'credits';
  this.sisyphus.setVisible(true);
  this.boulder.setVisible(false);
  
  this.sisyphus.setPosition(this.worldWidth / 2, -100).setScale(0.5);
  this.sisyphus.play('falling');
  this.sisyphus.rotation = Phaser.Math.DegToRad(-45);
  
  const creditsContent = this.textManager.getCredits();
  this.creditsText = this.add.text(this.worldWidth/2, this.worldHeight + 50, creditsContent, UIStyles.credits).setOrigin(0.5, 0).setScrollFactor(0);
  
  const backButton = this.add.text(this.worldWidth/2, this.worldHeight - 40, GameTexts.messages.backToGrind, UIStyles.backButton).setOrigin(0.5).setPadding(10).setInteractive({useHandCursor:true}).setScrollFactor(0);
  backButton.on('pointerdown', () => this.scene.restart());
}

  // =================================================================
  // MODE-SPECIFIC UPDATE LOGIC
  // =================================================================

  updateRegularMode(dt) {
    if (!this.gameStarted) return;
    
    if (this.inputCooldown > 0) {
        this.inputCooldown -= dt;
    }
    
    if ((this.isKeyJustDown('left') || this.isKeyJustDown('right')) 
        && this.gamePhase === 'pushing' 
        && this.inputCooldown <= 0) {
        this.gamePhase = 'falling';
        this.rollbackSpeed = 160;
        this.boulder.velocityX = -160;
        this.fallingToRaceMode = true;
        return;
    }
    
    switch (this.gamePhase) {
      case 'pushing': this.handlePushing(dt); break;
      case 'rolling': this.handleRolling(dt); break;
      case 'falling': this.handleFalling(dt); break;
      case 'fallen': this.handleFallen(dt); break;
      case 'recovering': this.handleRecovering(dt); break;
    }
    this.updatePositions(dt);
    this.updateBoulderRotation(dt);
  }

  updateRaceMode(dt) {
    if (this.raceFinished && this.gamePhase !== 'falling' && this.gamePhase !== 'fallen' && this.gamePhase !== 'recovering') {
        this.boulder.velocityX *= 0.95;
        this.updatePositions(dt);
        return;
    }
    
    if (this.isKeyDown('left') || this.isKeyDown('right')) {
        this.lastKeyPressTime = this.time.now;
        
        // If the spam animation is running, stop it because the user is active.
        if (this.arrowAnimationTimer) {
            this.arrowAnimationTimer.remove();
            this.arrowAnimationTimer = null;
            
            // Keep arrows visible for real-time feedback
            if (this.arrowContainer) {
                this.arrowContainer.setVisible(true);
            }
        }
    }
    
    if (this.raceStarted && !this.raceFinished && this.leftArrow && this.rightArrow && !this.arrowAnimationTimer) {
        this.leftArrow.setFrame(this.isKeyDown('left') ? 1 : 0).setAlpha(this.isKeyDown('left') ? 1 : 0.7).setScale(this.isKeyDown('left') ? 3.2 : 3);
        this.rightArrow.setFrame(this.isKeyDown('right') ? 1 : 0).setAlpha(this.isKeyDown('right') ? 1 : 0.7).setScale(this.isKeyDown('right') ? 3.2 : 3);
    }
    
    if (!this.raceStarted && this.gamePhase !== 'fallen' && 
        (this.isKeyJustDown('left') || this.isKeyJustDown('right'))) {
        this.raceStarted = true;
        this.gamePhase = 'pushing';
        this.skyText.setText(GameTexts.messages.raceActive);
        this.lastKeyPressTime = this.time.now;
        
        if (this.arrowAnimationTimer) {
            this.arrowAnimationTimer.remove();
            this.arrowAnimationTimer = null;
        }
        
        if (this.arrowContainer) {
            this.arrowContainer.setVisible(true);
        }
        
        this.startInactivityCheck();
    }
    
    if(this.raceStarted && !this.raceFinished) {
        this.raceTimer += dt * 1000;
        this.timerText.setText(this.textManager.formatTimer(this.raceTimer));
    }

    switch (this.gamePhase) {
        case 'waiting': 
            this.sisyphus.play('idle', true);
            if (!this.arrowAnimationTimer) {
                this.startArrowSpamAnimation();
            }
            break;
        case 'pushing': this.handleRacePushing(dt); break;
        case 'falling': this.handleFalling(dt); break;
        case 'fallen': this.handleRaceFallen(dt); break;
        case 'recovering': this.handleRecovering(dt); break;
        case 'finished': 
            this.sisyphus.play('idle', true);
            this.stopArrowSpamAnimation();
            break;
    }
    this.updatePositions(dt);
    this.updateBoulderRotation(dt);
  }

  updateCreditsMode(dt) {
      this.bg_far.tilePositionX += 0.5;
      if(this.sisyphus.y > this.worldHeight + 100) this.sisyphus.y = -100;
      else this.sisyphus.y += 2;
      this.creditsText.y -= 0.5;
  }

  // =================================================================
  // ARROW KEYS PLACEHOLDER CREATION
  // =================================================================
  createArrowKeysPlaceholder() {
    const graphics = this.make.graphics({ x: 0, y: 0 }, false);
    const frameWidth = 128;
    const frameHeight = 64;
    const arrowWidth = 30;
    const arrowHeight = 22;

    graphics.fillStyle(0xffffff, 1);
    graphics.slice(0, 0, frameWidth, frameHeight, 0, 0, 0, 0, 0);
    graphics.fillTriangle(44, frameHeight / 2, 44 + arrowWidth, (frameHeight/2) - arrowHeight, 44 + arrowWidth, (frameHeight/2) + arrowHeight);
    
    graphics.fillStyle(0xffffff, 0.7);
    graphics.fillTriangle(40, frameHeight / 2, 40 + arrowWidth, (frameHeight/2) - arrowHeight, 40 + arrowWidth, (frameHeight/2) + arrowHeight);
    graphics.fillTriangle(frameWidth - 40, frameHeight / 2, frameWidth - 40 - arrowWidth, (frameHeight/2) - arrowHeight, frameWidth - 40 - arrowWidth, (frameHeight/2) + arrowHeight);
    
    graphics.fillStyle(0xffffff, 1);
    graphics.fillTriangle(frameWidth - 44, frameHeight / 2, frameWidth - 44 - arrowWidth, (frameHeight/2) - arrowHeight, frameWidth - 44 - arrowWidth, (frameHeight/2) + arrowHeight);

    graphics.generateTexture('arrowKeys', frameWidth, frameHeight);
    graphics.destroy();
  }

  // =================================================================
  // CORE GAME LOGIC
  // =================================================================

  updatePositions(dt) {
    if ((this.gameMode === 'regular' || this.gameMode === 'race') && (this.gamePhase !== 'recovering' || this.recoveryTimer > 1)) {
      const targetX = this.boulder.x + (this.boulder.velocityX * dt);
      this.boulder.x = Phaser.Math.Clamp(targetX, 120, this.worldWidth - 80);
      const boulderGroundInfo = this.getGroundInfo(this.boulder.x);
      const boulderTargetY = boulderGroundInfo.y - 25;
      this.boulder.y = Phaser.Math.Linear(this.boulder.y, boulderTargetY, 0.98);
      if (this.gamePhase !== 'fallen' && this.gamePhase !== 'waiting') {
        this.boulder.velocityX *= (0.985 - (dt * 0.25));
        if (Math.abs(this.boulder.velocityX) < 0.5) this.boulder.velocityX = 0;
      }
    }
    if ((this.gameMode === 'regular' || this.gameMode === 'race') && this.gamePhase !== 'recovering') {
      const desiredOffset = 60;
      const boulderGroundInfo = this.getGroundInfo(this.boulder.x);
      const slopeAbs = Math.abs(boulderGroundInfo.angle);
      const slopeFactor = Phaser.Math.Clamp(1 - (slopeAbs / (Math.PI / 3)), 0.5, 1);
      const effectiveOffset = desiredOffset * slopeFactor;
      const velComp = Phaser.Math.Clamp(-this.boulder.velocityX, -60, 60) * 0.15;
      const desiredSisyphusX = this.boulder.x - effectiveOffset + velComp;
      const maxGap = 70; const minDistance = 30;
      const clampedSX = Phaser.Math.Clamp(desiredSisyphusX, this.boulder.x - maxGap, this.boulder.x - minDistance);
      const sisyphusGroundInfo = this.getGroundInfo(clampedSX);
      const targetSX = clampedSX;
      let targetSY = sisyphusGroundInfo.y;
      if (this.gamePhase === 'fallen') targetSY += 5;
      const baseLerp = 0.92; const speed = Math.abs(this.boulder.velocityX);
      const speedBoost = Phaser.Math.Clamp(speed / 100, 0, 0.06);
      const slopeBoost = Phaser.Math.Clamp(slopeAbs / (Math.PI / 4), 0, 0.06);
      const posLerp = Phaser.Math.Clamp(baseLerp + speedBoost + slopeBoost, 0.92, 0.98);
      this.sisyphus.x = Phaser.Math.Linear(this.sisyphus.x, targetSX, posLerp);
      this.sisyphus.y = Phaser.Math.Linear(this.sisyphus.y, targetSY, posLerp);
      const rotationMultiplier = 0.8; const maxRotation = Math.PI / 6;
      let targetRotation = sisyphusGroundInfo.angle * rotationMultiplier;
      targetRotation = Phaser.Math.Clamp(targetRotation, -maxRotation, maxRotation);
      this.sisyphus.rotation = Phaser.Math.Angle.RotateTo(this.sisyphus.rotation, targetRotation, 0.1);
    } else if ((this.gameMode === 'regular' || this.gameMode === 'race') && this.recoveryTimer <= 1) {
      const sisyphusGroundInfo = this.getGroundInfo(this.sisyphus.x);
      this.sisyphus.y = Phaser.Math.Linear(this.sisyphus.y, sisyphusGroundInfo.y, 0.85);
      const rotationMultiplier = 0.6;
      const targetRotation = sisyphusGroundInfo.angle * rotationMultiplier;
      this.sisyphus.rotation = Phaser.Math.Angle.RotateTo(this.sisyphus.rotation, targetRotation, 0.08);
    }
  }

  handlePushing(dt) {
    const currentHeight = this.worldHeight - this.boulder.y; 
    const heightProgress = currentHeight / 600;
    
    const pushEfficiency = Math.max(0.3, 1 - (heightProgress * 0.7));
    this.pushForce = Math.min(this.pushForce + (60 * dt * pushEfficiency), 40);

    if (heightProgress > 0.8) {
        this.sisyphus.play('push_struggle', true);
    } else if (heightProgress > 0.4) {
        this.sisyphus.play('push_active', true);
    } else {
        this.sisyphus.play('push_start', true);
    }
    
    this.boulder.velocityX = this.pushForce;
    
    if (this.boulder.x >= this.lastSteepTriggerX) { 
        this.gamePhase = 'falling'; this.rollbackSpeed = 20; return; 
    }
    
    if (currentHeight > 580 && this.boulder.velocityX < 8) { 
        this.gamePhase = 'rolling'; this.rollbackSpeed = 0; 
    }

    const gi = this.getGroundInfo(this.boulder.x); 
    const upslopeFactor = Math.max(0, -Math.sin(gi.angle));
    const gravityForce = (15 + (heightProgress * 25)) * upslopeFactor;
    if (gravityForce > 0) {
        this.boulder.velocityX = Math.max(this.boulder.velocityX - dt * gravityForce, -160);
    }
  }

  handleRacePushing(dt) {
    let pushed = false;
    if (this.isKeyJustDown('left') && this.lastKeyPressed !== 'left') {
        this.lastKeyPressed = 'left'; pushed = true;
    } else if (this.isKeyJustDown('right') && this.lastKeyPressed !== 'right') {
        this.lastKeyPressed = 'right'; pushed = true;
    }
    if(pushed) {
         this.sisyphus.anims.play('push_race_step', true); 
         const heightProgress = (this.worldHeight - this.boulder.y) / 600;
         const pushEfficiency = Math.max(0.4, 1 - (heightProgress * 0.6));
         this.pushForce = Math.min(this.pushForce + 15 * pushEfficiency, 55);
    } else {
         if (this.sisyphus.anims.currentAnim.key === 'push_race_step' && this.sisyphus.anims.isPlaying) { /* let it finish */ } 
         else { this.sisyphus.play('idle', true); }
         this.pushForce = Math.max(this.pushForce - dt * 45, 0);
    }
    this.boulder.velocityX = this.pushForce;
    
    const finishLine = this.worldWidth - 100;
    if (this.boulder.x >= finishLine) { 
        this.handleRaceWin(); 
        return; 
    }
    
    const gi = this.getGroundInfo(this.boulder.x); 
    const upslopeFactor = Math.max(0, -Math.sin(gi.angle));
    const gravityForce = (20 + (this.boulder.y / this.worldHeight * 30)) * upslopeFactor;
    if (gravityForce > 0) this.boulder.velocityX = Math.max(this.boulder.velocityX - dt * gravityForce, -160);
  }

  handleRolling(dt) { this.sisyphus.play('idle', true); this.rollbackSpeed += dt * 60; this.boulder.velocityX = -Math.min(this.rollbackSpeed, 140); if (this.boulder.x >= this.lastSteepTriggerX - 10) this.gamePhase = 'falling'; else if (this.rollbackSpeed > 40) this.gamePhase = 'falling'; }
  
  handleFalling(dt) { 
    this.sisyphus.play('falling', true); 
    this.rollbackSpeed += dt * 24; 
    this.boulder.velocityX = -Math.min(this.rollbackSpeed, 160); 
    
    if (this.boulder.x <= 140) { 
        this.gamePhase = 'fallen'; 
        this.recoveryTimer = 0; 
        this.boulder.velocityX = 0;
        
        if (this.fallingToRaceMode) {
            this.skyText.setText(GameTexts.messages.raceGetReady);
        } else if (this.fallingFromRaceEnd) {
            this.skyText.setText(GameTexts.messages.backToGrind);
        } else if (this.gameMode === 'race' && !this.raceStarted) {
            this.skyText.setText(GameTexts.messages.raceStart);
        }
    } 
  }
  
  handleFallen(dt) { 
    this.sisyphus.play('fallen', true); 
    this.recoveryTimer += dt;
    
    if (this.fallingToRaceMode && this.recoveryTimer > 2.0) {
        this.fallingToRaceMode = false;
        
        this.gameMode = 'race';
        this.gamePhase = 'recovering';
        this.raceStarted = false;
        this.raceTimer = 0;
        this.raceFinished = false;
        this.recoveryTimer = 0;
        
        this.skyText.setText(GameTexts.messages.raceStart);
        this.raceUI.forEach(item => item.setVisible(true));
        this.leaderboard = JSON.parse(localStorage.getItem('sisyphusRaceScores')) || [];
        this.updateLeaderboardDisplay();
        
        this.textManager.stopPunCycle();
        if (this.racePromptTimer) this.racePromptTimer.remove();
        this.quitButton.setVisible(false);
        if (this.racePromptKeys) this.racePromptKeys.setVisible(false);
        return;
    }
    
    if (this.fallingFromRaceEnd && this.recoveryTimer > 1.5) {
        this.fallingFromRaceEnd = false;
        
        this.inputCooldown = 3.0;
        this.startRegularMode();
        this.gamePhase = 'pushing';
        this.pushForce = 0;
        this.recoveryTimer = 0;
        return;
    }
    
    if (!this.fallingToRaceMode && !this.fallingFromRaceEnd && this.recoveryTimer > 1.5) {
        this.gamePhase = 'recovering';
        this.recoveryTimer = 0;
    }
  }

  handleRaceFallen(dt) { 
    this.sisyphus.play('fallen', true); 
    this.recoveryTimer += dt;
    
    if (this.fallingFromRaceEnd && this.recoveryTimer > 1.5) {
        this.fallingFromRaceEnd = false;
        
        this.inputCooldown = 3.0;
        this.startRegularMode();
        this.gamePhase = 'pushing';
        this.pushForce = 0;
        this.recoveryTimer = 0;
        return;
    }
    
    if (!this.fallingFromRaceEnd && this.recoveryTimer > 1.5) {
        this.gamePhase = 'recovering';
        this.recoveryTimer = 0;
    }
  }

  handleRecovering(dt) { 
    this.recoveryTimer += dt; 
    
    if (this.recoveryTimer < 1) { 
        this.sisyphus.play('recovering', true); 
    } else { 
        if (this.gameMode === 'race' && !this.raceStarted) {
            this.sisyphus.play('idle', true);
            this.gamePhase = 'waiting';
        } else {
            this.sisyphus.play('walking', true); 
            const targetX = this.boulder.x - 60; 
            if (Math.abs(this.sisyphus.x - targetX) > 5) {
                this.sisyphus.x += 30 * dt; 
            } else { 
                this.gamePhase = 'pushing'; 
                this.pushForce = 0; 
            } 
        }
    } 
  }
  
  updateBoulderRotation(dt) { if (!this.boulder || !this.boulder.anims) return; const speed = Math.abs(this.boulder.velocityX); const spinThreshold = 2.5; if (speed > spinThreshold) { const newTimeScale = Phaser.Math.Clamp(speed / 60, 0.3, 2.0); this.boulder.anims.timeScale = newTimeScale; if (!this.boulder.anims.isPlaying || this.boulder.anims.currentAnim?.key !== 'boulder_spin') { this.boulder.anims.play('boulder_spin'); } } else { if (this.boulder.anims.isPlaying) this.boulder.anims.stop(); this.boulder.setFrame(0); } }

  createRacePrompt() {
    this.racePromptKeys = this.add.sprite(this.worldWidth / 2, this.worldHeight - 50, 'arrowKeys')
        .setOrigin(0.5, 1)
        .setScrollFactor(0)
        .setDepth(10000)
        .setInteractive({ useHandCursor: true })
        .setVisible(false);

    this.racePromptKeys.on('pointerdown', this.initiateRaceTransition, this);
    this.racePromptKeys.on('pointerover', () => this.racePromptKeys.setScale(1.1));
    this.racePromptKeys.on('pointerout', () => this.racePromptKeys.setScale(1.0));
  }
  
  showRacePrompt() {
      if (this.gameMode !== 'regular' || this.gamePhase !== 'pushing') return;
      if (!this.racePromptKeys || !this.racePromptKeys.scene) return;
      
      this.racePromptKeys.setVisible(false);
      
      try {
        if (this.racePromptKeys.anims && this.anims.exists('arrow_keys_pulse')) {
          this.racePromptKeys.play('arrow_keys_pulse');
        }
      } catch (error) {
        // Animation not found, skipping
      }
      
      this.time.delayedCall(7000, () => {
          if (this.racePromptKeys && this.racePromptKeys.scene) {
            this.racePromptKeys.setVisible(false);
            try {
              this.racePromptKeys.stop();
            } catch (error) {
              // Ignore animation stop errors
            }
          }
      }, [], this);
  }

  initiateRaceTransition() {
      if (this.gameMode !== 'regular') return;

      if (this.punTimer) this.punTimer.remove();
      if (this.racePromptTimer) this.racePromptTimer.remove();
      
      this.racePromptKeys.destroy();
      this.quitButton.setVisible(false);
      this.skyText.setText("Yarışa hazır ol!");

      // Dağ ve sky elementlerini gizle
      if (this.mountain) this.mountain.setVisible(false);
      if (this.skyPanel) this.skyPanel.setVisible(false);
      if (this.skyText) this.skyText.setVisible(false);

      this.raceUI.forEach(item => item.setVisible(true));
      this.leaderboard = JSON.parse(localStorage.getItem('sisyphusRaceScores')) || [];
      this.updateLeaderboardDisplay();

      this.gameMode = 'race';
      this.gamePhase = 'falling';
      this.rollbackSpeed = 160;
      this.boulder.velocityX = -160;
  }

  handleRaceWin() { 
    this.raceFinished = true; 
    this.gamePhase = 'finished'; 
    const finalTime = parseFloat((this.raceTimer / 1000).toFixed(2)); 
    
    let isTopScore = this.leaderboard.length < 3 || this.leaderboard.some(score => finalTime < score.time); 
    
    if(isTopScore) { 
        this.pendingScore = { time: finalTime };
        this.isEnteringName = true;
        this.skyText.setText(GameTexts.messages.raceNewRecord(finalTime)); 
        this.createNameInputUI();
        
        this.time.delayedCall(1000, () => {
            this.raceUI.forEach(item => item.setVisible(false));
            
            this.gamePhase = 'falling';
            this.rollbackSpeed = 160;
            this.boulder.velocityX = -160;
            this.fallingFromRaceEnd = true;
        });
    } else {
        this.skyText.setText(GameTexts.messages.raceFinished(finalTime)); 
        
        this.time.delayedCall(1000, () => {
            this.raceUI.forEach(item => item.setVisible(false));
            
            this.gamePhase = 'falling';
            this.rollbackSpeed = 160;
            this.boulder.velocityX = -160;
            this.fallingFromRaceEnd = true;
        });
    }
  }

  createNameInputUI() {
    this.nameInputContainer = this.add.container(this.worldWidth / 2, this.worldHeight / 2)
      .setScrollFactor(0)
      .setDepth(20000);

    const panelStyle = UIStyles.nameInputPanel;
    const panel = this.add.graphics()
      .fillStyle(panelStyle.fillColor, panelStyle.fillAlpha)
      .lineStyle(panelStyle.lineWidth, panelStyle.lineColor, panelStyle.lineAlpha)
      .fillRoundedRect(-UILayout.nameInput.width/2, -UILayout.nameInput.height/2, UILayout.nameInput.width, UILayout.nameInput.height, panelStyle.cornerRadius)
      .strokeRoundedRect(-UILayout.nameInput.width/2, -UILayout.nameInput.height/2, UILayout.nameInput.width, UILayout.nameInput.height, panelStyle.cornerRadius);

    const titleText = this.add.text(0, -60, GameTexts.messages.nameInputTitle, UIStyles.nameInput.title).setOrigin(0.5);

    const inputBgStyle = UIStyles.inputFieldBg;
    const inputBg = this.add.graphics()
      .fillStyle(inputBgStyle.fillColor, inputBgStyle.fillAlpha)
      .lineStyle(inputBgStyle.lineWidth, inputBgStyle.lineColor, inputBgStyle.lineAlpha)
      .fillRoundedRect(-UILayout.nameInput.fieldWidth/2, -UILayout.nameInput.fieldHeight/2, UILayout.nameInput.fieldWidth, UILayout.nameInput.fieldHeight, inputBgStyle.cornerRadius)
      .strokeRoundedRect(-UILayout.nameInput.fieldWidth/2, -UILayout.nameInput.fieldHeight/2, UILayout.nameInput.fieldWidth, UILayout.nameInput.fieldHeight, inputBgStyle.cornerRadius);

    this.nameInputField = this.add.text(0, 0, '', UIStyles.nameInput.field).setOrigin(0.5);

    const instructionText = this.add.text(0, 25, GameTexts.messages.nameInputInstructions, UIStyles.nameInput.instructions).setOrigin(0.5);

    this.nameInputSubmit = this.add.text(0, 60, GameTexts.messages.nameInputSubmit, UIStyles.nameInput.submit).setOrigin(0.5)
      .setPadding(8, 4)
      .setInteractive({ useHandCursor: true });

    this.nameInputSubmit.on('pointerdown', () => this.submitName());
    this.nameInputSubmit.on('pointerover', () => 
      this.nameInputSubmit.setBackgroundColor('#666666'));
    this.nameInputSubmit.on('pointerout', () => 
      this.nameInputSubmit.setBackgroundColor('#444444'));

    this.nameInputContainer.add([panel, titleText, inputBg, this.nameInputField, instructionText, this.nameInputSubmit]);

    this.input.keyboard.off('keydown', this.handleNameInput, this);
    this.input.keyboard.on('keydown', this.handleNameInput, this);
  }

  handleNameInput(event) {
    if (!this.isEnteringName || !this.nameInputField) return;

    const currentText = this.nameInputField.text;
    
    if (event.keyCode === Phaser.Input.Keyboard.KeyCodes.BACKSPACE) {
      this.nameInputField.setText(currentText.slice(0, -1));
    } else if (event.keyCode === Phaser.Input.Keyboard.KeyCodes.ENTER) {
      this.submitName();
    } else if (currentText.length < 3) {
      if ((event.keyCode >= 65 && event.keyCode <= 90) ||
          (event.keyCode >= 48 && event.keyCode <= 57)) {
        this.nameInputField.setText(currentText + event.key.toUpperCase());
      }
    }
  }

  submitName() {
    if (!this.pendingScore) return;

    const playerName = this.nameInputField.text || "YOU";
    
    this.leaderboard.push({
      name: playerName.substring(0, 3).toUpperCase(), 
      time: this.pendingScore.time
    });
    this.leaderboard.sort((a, b) => a.time - b.time);
    if (this.leaderboard.length > 3) this.leaderboard.pop();
    
    localStorage.setItem('sisyphusRaceScores', JSON.stringify(this.leaderboard));
    
    this.cleanupNameInput();
    this.pendingScore = null;
    this.isEnteringName = false;
    
    this.skyText.setText(GameTexts.messages.raceScoreSaved);
  }

  cleanupNameInput() {
    if (this.nameInputContainer) {
      this.nameInputContainer.destroy();
      this.nameInputContainer = null;
      this.nameInputField = null;
      this.nameInputSubmit = null;
    }
    
    this.input.keyboard.off('keydown', this.handleNameInput, this);
  }

  // =================================================================
  // ARROW ANIMATION SYSTEM
  // =================================================================
  
  createArrowUI() {
    this.arrowContainer = this.add.container(this.worldWidth / 2, this.worldHeight - 150)
      .setScrollFactor(0)
      .setDepth(10000)
      .setVisible(false);

    this.leftArrow = this.add.sprite(-40, 0, 'arrowLeft', 0).setScale(3).setAlpha(0.7);
    this.rightArrow = this.add.sprite(40, 0, 'arrowRight', 0).setScale(3).setAlpha(0.7);
    this.arrowContainer.add([this.leftArrow, this.rightArrow]);
    
    this.lastKeyPressTime = 0;
    this.inactivityCheckTimer = null;
  }

  startArrowSpamAnimation(delayMs = 200) {
    if (!this.arrowContainer) return;
    
    if (this.arrowAnimationTimer) {
      this.arrowAnimationTimer.remove();
      this.arrowAnimationTimer = null;
    }
    
    this.arrowContainer.setVisible(true);
    this.currentArrowSide = 'left';
    
    this.arrowAnimationTimer = this.time.addEvent({
      delay: delayMs,
      loop: true,
      callback: () => {
        this.animateArrowPress();
      }
    });
  }

  stopArrowSpamAnimation() {
    if (this.arrowAnimationTimer) {
      this.arrowAnimationTimer.remove();
      this.arrowAnimationTimer = null;
    }
    
    if (this.hintAnimationTimer) {
      this.hintAnimationTimer.remove();
      this.hintAnimationTimer = null;
    }
    
    if (this.arrowContainer) {
      this.arrowContainer.setVisible(false);
    }
    
    if (this.leftArrow && this.rightArrow) {
      this.leftArrow.setAlpha(0.7).setScale(3).setFrame(0);
      this.rightArrow.setAlpha(0.7).setScale(3).setFrame(0);
    }
    
    if (this.inactivityCheckTimer) {
      this.inactivityCheckTimer.remove();
      this.inactivityCheckTimer = null;
    }
  }

  animateArrowPress() {
    if (!this.leftArrow || !this.rightArrow) return;
    
    this.leftArrow.setAlpha(0.7).setScale(3).setFrame(0);
    this.rightArrow.setAlpha(0.7).setScale(3).setFrame(0);
    
    const currentArrow = this.currentArrowSide === 'left' ? this.leftArrow : this.rightArrow;
    
    currentArrow.setFrame(1);
    
    this.tweens.add({
      targets: currentArrow,
      scaleX: 3.5,
      scaleY: 3.5,
      alpha: 1,
      duration: 100,
      ease: 'Power2',
      yoyo: true,
      onComplete: () => {
        currentArrow.setAlpha(0.9).setScale(3.2).setFrame(0);
      }
    });
    
    this.currentArrowSide = this.currentArrowSide === 'left' ? 'right' : 'left';
  }

  showArrowHint() {
    if (this.gameMode !== 'regular' || !this.arrowContainer) return;
    
    // Geçici yarış mesajını göster (pun döngüsünü bozmadan)
    this.textManager.showTemporaryRaceMessage(this.skyText, GameTexts.messages.arrowHint, 3000);
    
    this.arrowContainer.setVisible(true);
    this.arrowContainer.setAlpha(0.8);
    
    this.startArrowHintAnimation();
    
    this.time.delayedCall(3000, () => {
      this.stopArrowHintAnimation();
      this.arrowContainer.setVisible(false);
    });
  }

  startArrowHintAnimation() {
    this.currentArrowSide = 'left';
    
    if (this.hintAnimationTimer) {
      this.hintAnimationTimer.remove();
    }
    
    this.hintAnimationTimer = this.time.addEvent({
      delay: 400,
      loop: true,
      callback: () => {
        this.animateArrowHint();
      }
    });
  }

  stopArrowHintAnimation() {
    if (this.hintAnimationTimer) {
      this.hintAnimationTimer.remove();
      this.hintAnimationTimer = null;
    }
    
    if (this.leftArrow && this.rightArrow) {
      this.leftArrow.setAlpha(0.7).setScale(3).setFrame(0);
      this.rightArrow.setAlpha(0.7).setScale(3).setFrame(0);
    }
  }

  animateArrowHint() {
    if (!this.leftArrow || !this.rightArrow) return;
    
    this.leftArrow.setAlpha(0.6).setScale(3).setFrame(0);
    this.rightArrow.setAlpha(0.6).setScale(3).setFrame(0);
    
    const currentArrow = this.currentArrowSide === 'left' ? this.leftArrow : this.rightArrow;
    
    currentArrow.setFrame(1);
    
    this.tweens.add({
      targets: currentArrow,
      scaleX: 3.4,
      scaleY: 3.4,
      alpha: 1,
      duration: 200,
      ease: 'Sine.easeInOut',
      yoyo: true,
      onComplete: () => {
        currentArrow.setAlpha(0.8).setScale(3.1).setFrame(0);
      }
    });
    
    this.currentArrowSide = this.currentArrowSide === 'left' ? 'right' : 'left';
  }

  startInactivityCheck() {
    if (this.inactivityCheckTimer) {
      this.inactivityCheckTimer.remove();
    }
    
    this.inactivityCheckTimer = this.time.addEvent({
      delay: 1000,
      loop: true,
      callback: () => {
        if (this.gameMode === 'race' && this.raceStarted && !this.raceFinished) {
          const timeSinceLastKey = this.time.now - this.lastKeyPressTime;
          
          // If user has been inactive for 5 seconds, trigger a fall back to regular mode
          if (timeSinceLastKey > 5000) {
            this.skyText.setText("Çok yavaş! Rutineye dönüş...");
            
            this.stopArrowSpamAnimation();
            
            // Trigger fall back
            this.gamePhase = 'falling';
            this.rollbackSpeed = 160;
            this.boulder.velocityX = -160;
            this.fallingFromRaceEnd = true;
            this.raceFinished = true; // Mark race as over
            return;
          }
          
          // If user has been inactive for 3 seconds and the animation isn't already running, show it.
          if (timeSinceLastKey > 3000) {
            if (!this.arrowAnimationTimer) {
              this.startArrowSpamAnimation(400);
            }
          }
        }
      }
    });
  }

  // =================================================================
  // UI & HELPER METHODS
  // =================================================================
  
  createTopRightUI() {
    this.quitButton = this.add.text(this.worldWidth - UILayout.quitButton.x, UILayout.quitButton.y, GameTexts.messages.quitButton, UIStyles.button)
        .setOrigin(1, 0)
        .setPadding(UILayout.quitButton.padding.x, UILayout.quitButton.padding.y, UILayout.quitButton.padding.x, UILayout.quitButton.padding.y)
        .setScrollFactor(0)
        .setDepth(10000)
        .setInteractive({ useHandCursor: true });
    
        this.quitButton.on('pointerdown', () => this.startCreditsMode());
        this.quitButton.on('pointerover', () => this.quitButton.setBackgroundColor('rgba(255,0,0,0.5)'));
        this.quitButton.on('pointerout', () => this.quitButton.setBackgroundColor('rgba(0,0,0,0.5)'));
      }
    
      createGlobalUI() {
        const layout = UILayout.skyPanel;
        const panelWidth = this.worldWidth - layout.margin * 2; 
        const panelHeight = layout.height;
        const panelStyle = UIStyles.skyPanel;
        
        this.skyPanel = this.add.graphics().setScrollFactor(0).setDepth(9997);
        this.skyPanel.fillStyle(panelStyle.fillColor, panelStyle.fillAlpha); 
        this.skyPanel.lineStyle(panelStyle.lineWidth, panelStyle.lineColor, panelStyle.lineAlpha);
        this.skyPanel.fillRoundedRect(layout.margin, 42, panelWidth, panelHeight, panelStyle.cornerRadius);
        this.skyPanel.strokeRoundedRect(layout.margin, 42, panelWidth, panelHeight, panelStyle.cornerRadius);
        
        const skyTextStyle = { ...UIStyles.skyText, wordWrap: { width: panelWidth - 40 } };
        this.skyText = this.add.text(this.worldWidth / 2, 90, "", skyTextStyle).setOrigin(0.5).setScrollFactor(0).setDepth(9998);
        this.spaceBarSprite = this.add.sprite(this.worldWidth / 2, this.worldHeight - 24, 'spacebar', 0).setOrigin(0.5, 1).setScrollFactor(0).setDepth(9999).setScale(3).setAlpha(0.9);
      }
    
      createRaceUI() {
        this.timerText = this.add.text(this.worldWidth - UILayout.raceTimer.x, this.worldHeight - UILayout.raceTimer.y - 110, 'Süre: 0.00', UIStyles.raceUI).setOrigin(1,0).setScrollFactor(0).setDepth(10000);
        this.leaderboardText = this.add.text(this.worldWidth - UILayout.leaderboard.x, this.worldHeight - UILayout.leaderboard.y, GameTexts.messages.leaderboardTitle, UIStyles.raceUI).setOrigin(1,0).setScrollFactor(0).setDepth(10000);
        this.raceUI = [this.timerText, this.leaderboardText];
        
        this.raceUI.forEach(item => item.setVisible(false));
      }
      
      updateLeaderboardDisplay() { 
        this.leaderboardText.setText(this.textManager.formatLeaderboard(this.leaderboard));
      }
      
      resetPlayerState() { 
        this.gamePhase = 'waiting'; 
        this.gameStarted = false; 
        this.raceStarted = false; 
        this.raceFinished = false; 
        this.raceTimer = 0; 
        this.pushForce = 0; 
        const startX = 100; 
        const startGroundInfo = this.getGroundInfo(startX); 
        this.sisyphus.setPosition(startX, startGroundInfo.y - 64).setVisible(true).play('idle'); 
        this.boulder.setPosition(120, this.getGroundInfo(120).y - 25).setVisible(true); 
        this.boulder.velocityX = 0; 
      }
      createAnimations() { 
        this.anims.create({ key: 'push_start', frames: this.anims.generateFrameNumbers('sisyphusSheet', { frames: [0, 1, 2] }), frameRate: 2, repeat: 0 }); 
        this.anims.create({ key: 'push_active', frames: this.anims.generateFrameNumbers('sisyphusSheet', { frames: [1, 2, 3, 4, 5, 2] }), frameRate: 4, repeat: 1 }); 
        this.anims.create({ key: 'push_race_step', frames: this.anims.generateFrameNumbers('sisyphusSheet', { frames: [1, 2, 3, 4] }), frameRate: 8, repeat: 0 }); 
        this.anims.create({ key: 'push_struggle', frames: this.anims.generateFrameNumbers('sisyphusSheet', { frames: [0, 1, 2] }), frameRate: 5, repeat: -1 }); 
        this.anims.create({ key: 'idle', frames: this.anims.generateFrameNumbers('sisyphusSheet', { frames: [2] }), frameRate: 4, repeat: -1 }); 
        this.anims.create({ key: 'falling', frames: this.anims.generateFrameNumbers('sisyphusSheet', { frames: [15, 16, 17, 18, 19, 16, 17, 18, 19, 15] }), frameRate: 6, repeat: -1 }); 
        this.anims.create({ key: 'fallen', frames: this.anims.generateFrameNumbers('sisyphusSheet', { frames: [20, 21, 22] }), frameRate: 1, repeat: -1 }); 
        this.anims.create({ key: 'recovering', frames: this.anims.generateFrameNumbers('sisyphusSheet', { frames: [3, 2] }), frameRate: 3, repeat: 2 }); 
        this.anims.create({ key: 'walking', frames: this.anims.generateFrameNumbers('sisyphusSheet', { frames: [2, 1] }), frameRate: 4, repeat: -1 }); 
        this.anims.create({ key: 'boulder_spin', frames: this.anims.generateFrameNumbers('boulderSheet', { start: 0, end: 3 }), frameRate: 8, repeat: -1 }); 
        
        this.anims.create({ key: 'arrow_left_press', frames: this.anims.generateFrameNumbers('arrowLeft', { frames: [0, 1, 0] }), frameRate: 15, repeat: 0 });
        this.anims.create({ key: 'arrow_right_press', frames: this.anims.generateFrameNumbers('arrowRight', { frames: [0, 1, 0] }), frameRate: 15, repeat: 0 });
      }
      createParallaxBackgrounds() { this.bg_far = this.add.image(0, 0, 'background').setOrigin(0, 0).setDisplaySize(this.worldWidth, this.worldHeight).setScrollFactor(0).setDepth(-10); this.bg_mid1 = this.add.tileSprite(8, this.worldHeight - 300, this.worldWidth, 1000, 'cloud1').setOrigin(0, 1).setScrollFactor(0).setDepth(-9).setAlpha(0.5).setScale(3); this.bg_mid2 = this.add.tileSprite(0, this.worldHeight - 10, this.worldWidth, 300, 'cloud2').setOrigin(0, 1).setScrollFactor(0).setDepth(-8).setAlpha(0.7).setScale(3); this.bg_mid3 = this.add.tileSprite(0, this.worldHeight - 50, this.worldWidth, 2000, 'cloud3').setOrigin(0, 1).setScrollFactor(0).setDepth(-7).setAlpha(0.8).setScale(8); this.bg_close = this.add.graphics().fillStyle(0x2c2c4c, 0.5).fillEllipse(this.worldWidth / 2, this.worldHeight - 50, this.worldWidth, 200).setScrollFactor(0).setDepth(-6); }
      createMountain() { 
        this.mountain = this.add.graphics().fillStyle(0x3c3c5c).lineStyle(2, 0x646496); 
        this.mountainPoints = []; 
        for (let x = 0; x <= this.worldWidth; x += 5) 
          this.mountainPoints.push({ x, y: this.worldHeight - this.getMountainHeight(x) }); 
        this.mountain.beginPath().moveTo(0, this.worldHeight); 
        this.mountainPoints.forEach(p => this.mountain.lineTo(p.x, p.y)); 
        this.mountain.lineTo(this.worldWidth, this.worldHeight).closePath().fillPath().strokePath().setDepth(0); 
      }
      getMountainHeight(x) { if (x < 150) return 50; const p = (x - 150) / (this.worldWidth - 150); return 50 + (p * 550) + Math.sin(p * Math.PI * 4) * 40 + Math.cos(p * Math.PI * 1.5) * 20; }
      getGroundInfo(x) { x = Phaser.Math.Clamp(x, 0, this.worldWidth); let L = this.mountainPoints[0], R = this.mountainPoints[1]; for (let i = 0; i < this.mountainPoints.length - 1; i++) { if (x >= this.mountainPoints[i].x && x <= this.mountainPoints[i + 1].x) { L = this.mountainPoints[i]; R = this.mountainPoints[i + 1]; break; } } const t = (x - L.x) / (R.x - L.x); const y = Phaser.Math.Linear(L.y, R.y, t); const angle = Math.atan2(R.y - L.y, R.x - L.x); return { y, angle }; }
      createBoulder() { const gi = this.getGroundInfo(120); this.boulder = this.add.sprite(120, gi.y - 25, 'boulderSheet', 0).setOrigin(0.5, 0.5); this.boulder.setFrame(0); if (this.boulder.anims) this.boulder.anims.pause(); this.boulder.velocityX = 0; }
      prepareSteepEndDetector() { const points = this.mountainPoints; let lastSteepX = null; for (let i = 0; i < points.length - 1; i++) { if (points[i].x < (this.worldWidth * 0.75)) continue; const slope = (points[i+1].y - points[i].y) / (points[i+1].x - points[i].x); if (slope > 0.5) lastSteepX = points[i + 1].x; } this.lastSteepTriggerX = lastSteepX ?? (this.worldWidth - 140); }
    }