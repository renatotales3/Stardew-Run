document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');

    const scoreElement = document.getElementById('score');
    const finalScoreElement = document.getElementById('final-score');
    const startScreen = document.getElementById('start-screen');
    const gameOverScreen = document.getElementById('game-over-screen');

    // --- Configurações do Jogo ---
    const groundHeight = 50;
    let gameSpeed = 3;
    let score = 0;
    let isGameOver = true;
    let animationFrameId;

    // --- Configurações do Jogador (Junimo) ---
    const player = {
        x: 50,
        y: canvas.height - groundHeight,
        width: 40,
        height: 40,
        dy: 0, // Velocidade vertical
        jumpPower: 15,
        gravity: 0.8,
        isJumping: false,
        draw() {
            // Placeholder: Substitua por uma imagem de um Junimo
            ctx.fillStyle = '#90EE90'; // Verde claro para o Junimo
            ctx.fillRect(this.x, this.y - this.height, this.width, this.height);
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
            if (!this.isJumping) {
                this.isJumping = true;
                this.dy = this.jumpPower;
            }
        }
    };

    // --- Configurações dos Obstáculos ---
    let obstacles = [];
    const obstacleTypes = [
        { width: 30, height: 30, color: '#8B4513' }, // Pedra
        { width: 40, height: 60, color: '#A0522D' }  // Tronco
    ];
    let obstacleTimer = 0;
    let nextObstacleTime = 100; // Tempo inicial para o primeiro obstáculo

    function generateObstacle() {
        const type = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];
        const obstacle = {
            x: canvas.width,
            y: canvas.height - groundHeight - type.height,
            width: type.width,
            height: type.height,
            color: type.color
        };
        obstacles.push(obstacle);
    }

    function updateObstacles() {
        obstacleTimer++;
        if (obstacleTimer > nextObstacleTime) {
            generateObstacle();
            obstacleTimer = 0;
            // Gera obstáculos em intervalos variados
            nextObstacleTime = Math.random() * (150 - 50) + 50 / gameSpeed;
        }

        for (let i = obstacles.length - 1; i >= 0; i--) {
            let obs = obstacles[i];
            obs.x -= gameSpeed;

            // Desenha o obstáculo
            // Placeholder: Substitua por imagens de pedras, troncos, etc.
            ctx.fillStyle = obs.color;
            ctx.fillRect(obs.x, obs.y, obs.width, obs.height);

            // Remove obstáculos que saíram da tela
            if (obs.x + obs.width < 0) {
                obstacles.splice(i, 1);
            }
        }
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
                endGame();
            }
        }
    }

    // --- Desenho do Cenário ---
    function drawBackground() {
        // Céu
        ctx.fillStyle = '#87CEEB';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Chão
        ctx.fillStyle = '#228B22';
        ctx.fillRect(0, canvas.height - groundHeight, canvas.width, groundHeight);
    }
    
    // --- Loop Principal do Jogo ---
    function gameLoop() {
        if (isGameOver) return;
        
        animationFrameId = requestAnimationFrame(gameLoop);

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        drawBackground();

        // Atualiza e desenha elementos
        player.update();
        player.draw();
        updateObstacles();
        
        // Checa colisões
        checkCollision();
        
        // Atualiza pontuação e velocidade
        score++;
        scoreElement.textContent = score;
        if (score % 100 === 0) {
            gameSpeed += 0.2;
        }
    }

    // --- Funções de Controle do Jogo ---
    function startGame() {
        isGameOver = false;
        score = 0;
        gameSpeed = 3;
        obstacles = [];
        player.y = canvas.height - groundHeight;
        
        scoreElement.textContent = score;
        startScreen.style.display = 'none';
        gameOverScreen.style.display = 'none';
        
        gameLoop();
    }

    function endGame() {
        isGameOver = true;
        cancelAnimationFrame(animationFrameId);
        finalScoreElement.textContent = score;
        gameOverScreen.style.display = 'flex';
    }

    // --- Controles (Toque e Teclado) ---
    function handleInput() {
        if (isGameOver) {
             // Começa ou reinicia o jogo
            const isFirstStart = startScreen.style.display !== 'none';
            if (isFirstStart || gameOverScreen.style.display !== 'none') {
                startGame();
            }
        } else {
            // Pula
            player.jump();
        }
    }
    
    // Para celular
    canvas.addEventListener('touchstart', (e) => {
        e.preventDefault(); // Evita comportamento padrão do navegador (zoom, etc)
        handleInput();
    });

    // Para teste no desktop
    window.addEventListener('keydown', (e) => {
        if (e.code === 'Space') {
            e.preventDefault();
            handleInput();
        }
    });
});
