document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');

    // Elementos da UI
    const scoreElement = document.getElementById('score');
    const finalScoreElement = document.getElementById('final-score');
    const pauseBtn = document.getElementById('pause-btn');
    const startMenu = document.getElementById('start-menu');
    const pauseMenu = document.getElementById('pause-menu');
    const gameOverMenu = document.getElementById('game-over-menu');
    const startBtn = document.getElementById('start-btn');
    const resumeBtn = document.getElementById('resume-btn');
    const restartBtnPause = document.getElementById('restart-btn-pause');
    const restartBtnGameOver = document.getElementById('restart-btn-gameover');

    // --- Imagens do Jogo (Base64) ---
    const images = {
        player: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAABeElEQVR42mNgoBAwMjAwMDAxMAKJMDAw+I+YhYlBgoGFgYGBgRGxCiYmBgYGKgYhNhYwMDCQASQSEwuI/QDEDmJjAgMDAwOYgAQG2P+ZmBgZkGIAsrE4+A+Eg21iYGBgYgGyAZkZGRm+IyMj/wuQAf+B2AAYOzt7/8+fP/+fP3/+f/78+f/NmzcfC2oA7gNxCixYwMHBwQGQUbIAgPMEQv4DMQP4+Pj4/+HDhz8DAwM/QJqBgYGBAUgwgCiAzAABIMwAAUgygCiAzL///v0L0ECQAUgNEoA0QASINkAgBgEDAwPD//8/oHDeA/H/AykABkZGRv+BMAmQgQYGBgYWBgYGFzIysgASAycDAwMDYGAzMLAFysjIwMDAsMjEABM7NzcHmF14eLgBwQ0gPjAwMBgYGP4DMQcaGIwMjH8GhgEwN/yHCw8PD1mGhf8ZGBiQASQSEwswMDCQASQSUxkYAAIMAJUgEW5F9Yp3AAAAAElFTkSuQmCC',
        obstacleRock: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAoElEQVR42mNgGAWjAAgA8T8D4nAgFpBGGGhA+v/kP9ADhJ8xqAGdAN0AyH8g/Q/ED4FYD4j9gfgfED+DwTkgdgNiKyCGA+IZIH4LxL5ArAnE3kDsBMT+QGwKxEJArAnEwUD8H4ilgVgKiAOBmAoIlwPxLxArALEQECcC8SogjgLiaCCmAmL5QkQzIF4NxAJAjAXEk4FYGAgAAPsWEZ2NAnkAAAAASUVORK5CYII=',
        obstacleLog: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAkCAYAAADo6zjiAAAAyklEQVR42mNgGAWjgCgg6ADxPz8gTgfiUCC2h6GBCQy6ADJ9/x8S/oBwDggvANkA0X+gDBA+A+IzIH4MxbZAbAbED0D8DIhjgTgYdGkASv8/JP0/AvE/INYDYj8gDgFiRSBWA+IbID4CxOZA7A/EbkCsC8QOQCwMxHpAbALEIkDsBsQuQCwOxEJArAnE0kDsBsQGQFwNiFWAuAYIWwDxNhC3AfEuEB8B4s1AbAaEC0C8C8QbgPgOEHcAcS8QFgKiYSAaBgoGAAD3hRO2L13L3gAAAABJRU5ErkJggg==',
        background: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAUAAAAGACAYAAABSVsc9AAABWElEQVR42u3BAQ0AAADCoPVPbQwfoAAAAAAAAAAAAAD+BwAAAAAAAAAAAACAnwEAAAAAAAAAAAAAQH8DAAAAAAAAAAAAAICfAQAAAAAAAAAAAABA/wMAAAAAAAAAAAAAgJ8BAAAAAAAAAAAAAEB/AwAAAAAAAAAAAACAnwEAAAAAAAAAAAAAQH8DAAAAAAAAAAAAAICfAQAAAAAAAAAAAABA/wMAAAAAAAAAAAAAgJ8BAAAAAAAAAAAAAEB/AwAAAAAAAAAAAACAnwEAAAAAAAAAAAAAQH8DAAAAAAAAAAAAAICfAQAAAAAAAAAAAABA/wMAAAAAAAAAAAAAgJ8BAAAAAAAAAAAAAEB/AwAAAAAAAAAAAACAnwEAAAAAAAAAAAAAQH8DAAAAAAAAAAAAAICfAQAAAAAAAAAAAABA/wMAAAAAAAAAAAAAgJ8BAAAAAAAAAAAAAEB/AwAAAAAAAAAAAACAnwEAAAAAAAAAAAAAQH8DAPgG/qgAAbxABNMAAAAASUVORK5CYII=',
        iconPause: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAHElEQVR42mNgGAWjgD/wDAwMyMDwAFEvEA0DAEDVDAwW+nUEAAAAAElFTkSuQmCC',
        iconResume: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAANklEQVR42mNgGAWjgAwwMjD8B8SFwPy/f//+AxP//xBCB0D+Dxj8BxJtYGBgYGAQRhQMEg0DAGq5G47l8d4GAAAAAElFTkSuQmCC',
        iconRestart: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAABDUlEQVR42mNgoBAwMjAwMDAxMAKJMDAw+I+YhYlBgoGFgYGBgRGxCiYmBgYGKgYhNhYwMDCQASQSEwuI/QDEDmJjAgMDAwOYgAQG2P+ZmBgZkGIAsrE4+A+Eg21iYGBgYgGyAZkZGRm+IyMj/wuQAf+B2AAYOzt7/8+fP/+fP3/+f/78+f/NmzcfC2oA7gNxCixYwMHBwQGQUbIAgPMEQv4DMQP4+Pj4/+HDhz8DAwM/QJqBgYGBAUgwgCiAzAABIMwAAUgygCiAzL///v0L0ECQAUgNEoA0QASINkAgBgEDAwPD//8/oHDeA/H/AykABkZGRv+BMAmQgQYGBgYWBgYGFzIysgASAycDAwMDYGAzMLAFysjIwMDAsMjEABM7NzcHmF14eLgBwQ0gPjAwMBgYGP4DMQcaGIwMjH8GhgEwN/yHCw8PD1mGhf8ZGBiQASQSEwswMDCQASQSUxkYAAIMAJUgEW5F9Yp3AAAAAElFTkSuQmCC'
    };
    const loadedImages = {};

    let gameState = 'loading'; // loading, menu, playing, paused, gameOver
    let animationFrameId;

    // --- Configurações do Jogo ---
    const groundHeight = 80;
    let gameSpeed = 4;
    let score = 0;
    let backgroundX = 0;

    // --- Configurações do Jogador (Junimo) ---
    const player = {
        x: 60,
        y: canvas.height - groundHeight,
        width: 32,
        height: 32,
        dy: 0,
        jumpPower: 16,
        gravity: 0.7,
        isJumping: false,
        draw() {
            ctx.drawImage(loadedImages.player, this.x, this.y - this.height, this.width, this.height);
        },
        update() {
            if (this.isJumping) {
                this.y -= this.dy;
                this.dy -= this.gravity;
                if (this.y >= canvas.height - groundHeight) {
                    this.y = canvas.height - groundHeight;
                    this.isJumping = false;
                    this.dy = 0;
                }
            }
        },
        jump() {
            if (!this.isJumping && gameState === 'playing') {
                this.isJumping = true;
                this.dy = this.jumpPower;
            }
        }
    };

    // --- Configurações dos Obstáculos ---
    let obstacles = [];
    const obstacleTypes = [
        { img: 'obstacleRock', width: 24, height: 24 },
        { img: 'obstacleLog', width: 32, height: 32 }
    ];
    let obstacleTimer = 0;
    let nextObstacleTime = 120;

    function generateObstacle() {
        const type = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];
        obstacles.push({
            img: type.img,
            x: canvas.width,
            width: type.width,
            height: type.height,
            y: canvas.height - groundHeight - type.height,
        });
    }

    function updateObstacles() {
        obstacleTimer++;
        if (obstacleTimer > nextObstacleTime) {
            generateObstacle();
            obstacleTimer = 0;
            nextObstacleTime = Math.floor(Math.random() * (120 - 60 + 1) + 60) / (gameSpeed / 4);
        }
        obstacles.forEach(obs => {
            obs.x -= gameSpeed;
            ctx.drawImage(loadedImages[obs.img], obs.x, obs.y, obs.width, obs.height);
        });
        obstacles = obstacles.filter(obs => obs.x + obs.width > 0);
    }

    // --- Desenho do Cenário ---
    function drawBackground() {
        // Céu
        ctx.fillStyle = '#87CEEB';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Fundo com scroll
        backgroundX -= gameSpeed * 0.5;
        if (backgroundX <= -loadedImages.background.width) {
            backgroundX = 0;
        }
        ctx.drawImage(loadedImages.background, backgroundX, 0, loadedImages.background.width, canvas.height);
        ctx.drawImage(loadedImages.background, backgroundX + loadedImages.background.width, 0, loadedImages.background.width, canvas.height);


        // Chão
        ctx.fillStyle = '#5d9c57';
        ctx.fillRect(0, canvas.height - groundHeight, canvas.width, groundHeight);
        ctx.fillStyle = '#4b2d1a'; // Borda superior do chão
        ctx.fillRect(0, canvas.height - groundHeight, canvas.width, 5);
    }

    // --- Detecção de Colisão ---
    function checkCollision() {
        for (const obs of obstacles) {
            if (
                player.x < obs.x + obs.width &&
                player.x + player.width > obs.x &&
                (player.y - player.height) < obs.y + obs.height &&
                player.y > obs.y
            ) {
                changeState('gameOver');
            }
        }
    }

    // --- Loop Principal ---
    function gameLoop() {
        animationFrameId = requestAnimationFrame(gameLoop);
        
        if (gameState !== 'playing') return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawBackground();
        updateObstacles();

        player.update();
        player.draw();

        checkCollision();

        score++;
        scoreElement.textContent = score;
        if (score > 0 && score % 200 === 0) {
            gameSpeed += 0.2;
        }
    }

    // --- Gerenciador de Estado ---
    function changeState(newState) {
        gameState = newState;
        // Esconde tudo e depois mostra o necessário
        [startMenu, pauseMenu, gameOverMenu, pauseBtn].forEach(el => el.style.display = 'none');

        if (newState === 'menu') {
            startMenu.style.display = 'flex';
        } else if (newState === 'playing') {
            pauseBtn.style.display = 'block';
            gameLoop();
        } else if (newState === 'paused') {
            pauseMenu.style.display = 'flex';
        } else if (newState === 'gameOver') {
            finalScoreElement.textContent = score;
            gameOverMenu.style.display = 'flex';
            cancelAnimationFrame(animationFrameId);
        }
    }

    function startGame() {
        score = 0;
        gameSpeed = 4;
        obstacles = [];
        player.y = canvas.height - groundHeight;
        player.isJumping = false;
        player.dy = 0;
        scoreElement.textContent = score;
        changeState('playing');
    }

    // --- Carregamento e Controles ---
    function preload() {
        let loadedCount = 0;
        const totalImages = Object.keys(images).length;
        
        pauseBtn.style.backgroundImage = `url(${images.iconPause})`;

        for (const key in images) {
            loadedImages[key] = new Image();
            loadedImages[key].src = images[key];
            loadedImages[key].onload = () => {
                loadedCount++;
                if (loadedCount === totalImages) {
                    changeState('menu'); // Inicia no menu principal
                }
            };
        }
    }

    // Event Listeners
    canvas.addEventListener('touchstart', e => { e.preventDefault(); player.jump(); });
    window.addEventListener('keydown', e => { if (e.code === 'Space') player.jump(); });

    startBtn.onclick = startGame;
    restartBtnPause.onclick = startGame;
    restartBtnGameOver.onclick = startGame;

    pauseBtn.onclick = () => {
        if (gameState === 'playing') changeState('paused');
    };
    resumeBtn.onclick = () => {
        if (gameState === 'paused') changeState('playing');
    };

    preload();
});
