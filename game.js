// Stardew Valley Runner - Game Logic
class StardewValleyRunner {
    constructor() {
        // Canvas and context
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Game state
        this.gameState = 'start'; // start, playing, paused, gameOver
        this.score = 0;
        this.highScore = localStorage.getItem('stardewRunnerHighScore') || 0;
        this.gameSpeed = 6;
        this.frameCount = 0;
        
        // Character settings
        this.selectedCharacter = 'farmer';
        this.player = {
            x: 100,
            y: 300,
            width: 40,
            height: 40,
            velocityY: 0,
            jumping: false,
            ducking: false,
            groundY: 300,
            jumpForce: -15,
            gravity: 0.8
        };
        
        // Game objects arrays
        this.obstacles = [];
        this.collectibles = [];
        this.clouds = [];
        this.backgroundElements = [];
        
        // Initialize game
        this.init();
        this.setupEventListeners();
        this.createBackgroundElements();
        this.gameLoop();
    }
    
    init() {
        // Update high score display
        document.getElementById('highScore').textContent = this.highScore;
        
        // Initialize background clouds
        for (let i = 0; i < 5; i++) {
            this.clouds.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * 100 + 20,
                width: 60 + Math.random() * 40,
                height: 30 + Math.random() * 20,
                speed: 1 + Math.random() * 2
            });
        }
    }
    
    setupEventListeners() {
        // Button controls
        document.getElementById('jumpBtn').addEventListener('click', () => this.jump());
        document.getElementById('duckBtn').addEventListener('mousedown', () => this.startDuck());
        document.getElementById('duckBtn').addEventListener('mouseup', () => this.stopDuck());
        document.getElementById('duckBtn').addEventListener('mouseleave', () => this.stopDuck());
        document.getElementById('pauseBtn').addEventListener('click', () => this.togglePause());
        
        // Menu buttons
        document.getElementById('startBtn').addEventListener('click', () => this.startGame());
        document.getElementById('restartBtn').addEventListener('click', () => this.restartGame());
        document.getElementById('restartFromPauseBtn').addEventListener('click', () => this.restartGame());
        document.getElementById('resumeBtn').addEventListener('click', () => this.togglePause());
        
        // Character selection
        document.querySelectorAll('.character-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.selectCharacter(e.target.dataset.character));
        });
        
        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            if (this.gameState !== 'playing') return;
            
            switch(e.code) {
                case 'Space':
                    e.preventDefault();
                    this.jump();
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    this.startDuck();
                    break;
                case 'KeyP':
                    this.togglePause();
                    break;
            }
        });
        
        document.addEventListener('keyup', (e) => {
            if (e.code === 'ArrowDown') {
                this.stopDuck();
            }
        });
    }
    
    selectCharacter(character) {
        this.selectedCharacter = character;
        document.querySelectorAll('.character-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-character="${character}"]`).classList.add('active');
    }
    
    createBackgroundElements() {
        // Create background trees, flowers, etc.
        this.backgroundElements = [];
        for (let i = 0; i < 8; i++) {
            this.backgroundElements.push({
                type: Math.random() < 0.5 ? 'tree' : 'flower',
                x: i * 150 + Math.random() * 100,
                y: 320 + Math.random() * 60,
                size: 20 + Math.random() * 30,
                color: this.getRandomColor()
            });
        }
    }
    
    getRandomColor() {
        const colors = ['#228B22', '#32CD32', '#90EE90', '#FFD700', '#FF69B4', '#87CEEB'];
        return colors[Math.floor(Math.random() * colors.length)];
    }
    
    startGame() {
        this.gameState = 'playing';
        this.score = 0;
        this.gameSpeed = 6;
        this.frameCount = 0;
        this.player.y = this.player.groundY;
        this.player.velocityY = 0;
        this.player.jumping = false;
        this.player.ducking = false;
        this.obstacles = [];
        this.collectibles = [];
        
        document.getElementById('gameOverlay').classList.add('hidden');
        document.getElementById('score').textContent = this.score;
    }
    
    restartGame() {
        this.startGame();
        document.getElementById('pauseScreen').classList.add('hidden');
        document.getElementById('gameOverScreen').classList.add('hidden');
    }
    
    togglePause() {
        if (this.gameState === 'playing') {
            this.gameState = 'paused';
            document.getElementById('gameOverlay').classList.remove('hidden');
            document.getElementById('pauseScreen').classList.remove('hidden');
        } else if (this.gameState === 'paused') {
            this.gameState = 'playing';
            document.getElementById('gameOverlay').classList.add('hidden');
            document.getElementById('pauseScreen').classList.add('hidden');
        }
    }
    
    jump() {
        if (this.gameState !== 'playing') return;
        if (!this.player.jumping && !this.player.ducking) {
            this.player.velocityY = this.player.jumpForce;
            this.player.jumping = true;
        }
    }
    
    startDuck() {
        if (this.gameState !== 'playing') return;
        if (!this.player.jumping) {
            this.player.ducking = true;
            this.player.height = 20;
            this.player.y = this.player.groundY + 20;
        }
    }
    
    stopDuck() {
        this.player.ducking = false;
        this.player.height = 40;
        this.player.y = this.player.groundY;
    }
    
    update() {
        if (this.gameState !== 'playing') return;
        
        this.frameCount++;
        
        // Update player physics
        this.updatePlayer();
        
        // Spawn obstacles and collectibles
        this.spawnGameObjects();
        
        // Update game objects
        this.updateObstacles();
        this.updateCollectibles();
        this.updateClouds();
        this.updateBackgroundElements();
        
        // Check collisions
        this.checkCollisions();
        
        // Update game speed and score
        this.gameSpeed += 0.005;
        this.score += 1;
        document.getElementById('score').textContent = Math.floor(this.score);
    }
    
    updatePlayer() {
        // Apply gravity
        this.player.velocityY += this.player.gravity;
        this.player.y += this.player.velocityY;
        
        // Ground collision
        if (this.player.y >= this.player.groundY) {
            this.player.y = this.player.groundY;
            this.player.velocityY = 0;
            this.player.jumping = false;
        }
    }
    
    spawnGameObjects() {
        // Spawn obstacles
        if (this.frameCount % Math.max(60 - Math.floor(this.gameSpeed), 30) === 0) {
            this.spawnObstacle();
        }
        
        // Spawn collectibles
        if (this.frameCount % 180 === 0) {
            this.spawnCollectible();
        }
    }
    
    spawnObstacle() {
        const obstacleTypes = ['rock', 'crow', 'branch'];
        const type = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];
        
        let obstacle = {
            type: type,
            x: this.canvas.width,
            width: 30,
            height: 30,
            speed: this.gameSpeed
        };
        
        switch(type) {
            case 'rock':
                obstacle.y = 310;
                obstacle.emoji = '🪨';
                break;
            case 'crow':
                obstacle.y = 260;
                obstacle.emoji = '🐦‍⬛';
                obstacle.width = 35;
                obstacle.height = 25;
                break;
            case 'branch':
                obstacle.y = 200;
                obstacle.height = 40;
                obstacle.emoji = '🌳';
                obstacle.width = 25;
                break;
        }
        
        this.obstacles.push(obstacle);
    }
    
    spawnCollectible() {
        this.collectibles.push({
            type: 'star',
            x: this.canvas.width,
            y: 150 + Math.random() * 150,
            width: 25,
            height: 25,
            speed: this.gameSpeed,
            emoji: '⭐',
            value: 50
        });
    }
    
    updateObstacles() {
        this.obstacles = this.obstacles.filter(obstacle => {
            obstacle.x -= obstacle.speed;
            return obstacle.x + obstacle.width > 0;
        });
    }
    
    updateCollectibles() {
        this.collectibles = this.collectibles.filter(collectible => {
            collectible.x -= collectible.speed;
            return collectible.x + collectible.width > 0;
        });
    }
    
    updateClouds() {
        this.clouds.forEach(cloud => {
            cloud.x -= cloud.speed;
            if (cloud.x + cloud.width < 0) {
                cloud.x = this.canvas.width;
                cloud.y = Math.random() * 100 + 20;
            }
        });
    }
    
    updateBackgroundElements() {
        this.backgroundElements.forEach(element => {
            element.x -= this.gameSpeed * 0.5;
            if (element.x + element.size < 0) {
                element.x = this.canvas.width + Math.random() * 100;
                element.type = Math.random() < 0.5 ? 'tree' : 'flower';
                element.color = this.getRandomColor();
            }
        });
    }
    
    checkCollisions() {
        // Check obstacle collisions
        this.obstacles.forEach((obstacle, index) => {
            if (this.isColliding(this.player, obstacle)) {
                this.gameOver();
            }
        });
        
        // Check collectible collisions
        this.collectibles.forEach((collectible, index) => {
            if (this.isColliding(this.player, collectible)) {
                this.score += collectible.value;
                this.collectibles.splice(index, 1);
            }
        });
    }
    
    isColliding(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }
    
    gameOver() {
        this.gameState = 'gameOver';
        
        // Update high score
        const finalScore = Math.floor(this.score);
        if (finalScore > this.highScore) {
            this.highScore = finalScore;
            localStorage.setItem('stardewRunnerHighScore', this.highScore);
            document.getElementById('highScore').textContent = this.highScore;
            document.getElementById('newRecordMsg').classList.remove('hidden');
        } else {
            document.getElementById('newRecordMsg').classList.add('hidden');
        }
        
        document.getElementById('finalScore').textContent = finalScore;
        document.getElementById('gameOverlay').classList.remove('hidden');
        document.getElementById('gameOverScreen').classList.remove('hidden');
    }
    
    render() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw background
        this.drawBackground();
        
        // Draw background elements
        this.drawBackgroundElements();
        
        // Draw clouds
        this.drawClouds();
        
        // Draw game objects
        this.drawPlayer();
        this.drawObstacles();
        this.drawCollectibles();
        
        // Draw ground
        this.drawGround();
    }
    
    drawBackground() {
        // Sky gradient
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#87CEEB');
        gradient.addColorStop(0.7, '#98FB98');
        gradient.addColorStop(1, '#228B22');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    drawClouds() {
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        this.clouds.forEach(cloud => {
            this.ctx.beginPath();
            this.ctx.arc(cloud.x, cloud.y, cloud.width / 3, 0, Math.PI * 2);
            this.ctx.arc(cloud.x + cloud.width / 3, cloud.y, cloud.width / 2.5, 0, Math.PI * 2);
            this.ctx.arc(cloud.x + cloud.width / 1.5, cloud.y, cloud.width / 3, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }
    
    drawBackgroundElements() {
        this.backgroundElements.forEach(element => {
            this.ctx.font = `${element.size}px Arial`;
            this.ctx.textAlign = 'center';
            
            if (element.type === 'tree') {
                this.ctx.fillText('🌳', element.x, element.y);
            } else {
                const flowers = ['🌸', '🌺', '🌻', '🌷', '🌹'];
                const flower = flowers[Math.floor(Math.random() * flowers.length)];
                this.ctx.fillText(flower, element.x, element.y);
            }
        });
    }
    
    drawPlayer() {
        this.ctx.font = '40px Arial';
        this.ctx.textAlign = 'center';
        
        const emoji = this.selectedCharacter === 'farmer' ? '👨‍🌾' : '👩‍🌾';
        
        if (this.player.ducking) {
            // Draw ducking animation
            this.ctx.save();
            this.ctx.scale(1, 0.5);
            this.ctx.fillText(emoji, this.player.x + this.player.width / 2, (this.player.y + this.player.height) * 2);
            this.ctx.restore();
        } else {
            this.ctx.fillText(emoji, this.player.x + this.player.width / 2, this.player.y + this.player.height);
        }
    }
    
    drawObstacles() {
        this.obstacles.forEach(obstacle => {
            this.ctx.font = `${Math.max(obstacle.width, obstacle.height)}px Arial`;
            this.ctx.textAlign = 'center';
            this.ctx.fillText(
                obstacle.emoji,
                obstacle.x + obstacle.width / 2,
                obstacle.y + obstacle.height
            );
        });
    }
    
    drawCollectibles() {
        this.collectibles.forEach(collectible => {
            this.ctx.font = `${collectible.width}px Arial`;
            this.ctx.textAlign = 'center';
            
            // Add sparkle effect
            const sparkle = Math.sin(this.frameCount * 0.1) * 0.2 + 1;
            this.ctx.save();
            this.ctx.scale(sparkle, sparkle);
            this.ctx.fillText(
                collectible.emoji,
                (collectible.x + collectible.width / 2) / sparkle,
                (collectible.y + collectible.height) / sparkle
            );
            this.ctx.restore();
        });
    }
    
    drawGround() {
        // Draw grass ground
        this.ctx.fillStyle = '#228B22';
        this.ctx.fillRect(0, 340, this.canvas.width, 60);
        
        // Draw grass texture
        this.ctx.font = '20px Arial';
        this.ctx.textAlign = 'left';
        for (let i = 0; i < this.canvas.width; i += 30) {
            const grassOffset = (i + this.frameCount) % 60;
            this.ctx.fillText('🌱', i - grassOffset, 365);
        }
    }
    
    gameLoop() {
        this.update();
        this.render();
        requestAnimationFrame(() => this.gameLoop());
    }
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    const game = new StardewValleyRunner();
});

// Add some visual feedback for button presses
document.addEventListener('DOMContentLoaded', () => {
    const buttons = document.querySelectorAll('.control-btn');
    
    buttons.forEach(button => {
        button.addEventListener('mousedown', () => {
            button.style.transform = 'translateY(0)';
        });
        
        button.addEventListener('mouseup', () => {
            button.style.transform = 'translateY(-3px)';
        });
        
        button.addEventListener('mouseleave', () => {
            button.style.transform = 'translateY(-3px)';
        });
    });
});