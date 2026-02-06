// ===== AI風ゲーム生成エンジン v4 =====
// 8種類のゲーム + アイテム認識機能 + IIFE でスコープ分離

// アイテム定義（プロンプトから自動認識）
const ITEMS = {
    apple: { 
        keywords: ['りんご', 'リンゴ', '林檎', 'apple'], 
        color: '#ff0000', 
        name: 'リンゴ' 
    },
    star: { 
        keywords: ['星', 'ほし', 'スター', 'star'], 
        color: '#ffff00', 
        name: '星' 
    },
    coin: { 
        keywords: ['コイン', 'こいん', 'coin', 'お金'], 
        color: '#ffd700', 
        name: 'コイン' 
    },
    heart: { 
        keywords: ['ハート', 'はーと', '心', 'heart'], 
        color: '#ff69b4', 
        name: 'ハート' 
    },
    orange: { 
        keywords: ['オレンジ', 'おれんじ', 'みかん', 'orange'], 
        color: '#ff8c00', 
        name: 'オレンジ' 
    },
    grape: { 
        keywords: ['ぶどう', 'ブドウ', '葡萄', 'grape'], 
        color: '#9370db', 
        name: 'ブドウ' 
    },
    diamond: { 
        keywords: ['ダイヤ', 'だいや', 'ダイヤモンド', 'diamond'], 
        color: '#00ffff', 
        name: 'ダイヤ' 
    },
    cherry: { 
        keywords: ['さくらんぼ', 'サクランボ', 'チェリー', 'cherry'], 
        color: '#dc143c', 
        name: 'さくらんぼ' 
    },
    gem: { 
        keywords: ['宝石', 'ジュエル', 'gem', 'jewel'], 
        color: '#ff1493', 
        name: '宝石' 
    }
};

// ゲームテンプレート定義
const GAME_TEMPLATES = {
    avoid: {
        name: '避けゲー',
        keywords: ['避ける', 'よける', '逃げる', 'dodge', 'avoid', '走る', 'ランゲーム'],
        template: `
(function() {
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let player = { x: 375, y: 500, width: 50, height: 50, speed: 7 };
let obstacles = [];
let score = 0;
let gameOver = false;

const keys = {};
document.addEventListener('keydown', (e) => keys[e.key] = true);
document.addEventListener('keyup', (e) => keys[e.key] = false);

function createObstacle() {
    obstacles.push({
        x: Math.random() * (canvas.width - 40),
        y: -50,
        width: 40,
        height: 40,
        speed: {{SPEED}}
    });
}

const obstacleInterval = setInterval(createObstacle, {{SPAWN_RATE}});

function gameLoop() {
    if (gameOver) {
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'white';
        ctx.font = '40px Arial';
        ctx.fillText('Game Over!', 250, 250);
        ctx.font = '30px Arial';
        ctx.fillText('Score: ' + score, 280, 300);
        ctx.fillText('Press R to Restart', 220, 350);
        clearInterval(obstacleInterval);
        return;
    }

    ctx.fillStyle = '{{BACKGROUND}}';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (keys['ArrowLeft'] && player.x > 0) player.x -= player.speed;
    if (keys['ArrowRight'] && player.x < canvas.width - player.width) player.x += player.speed;

    ctx.fillStyle = '{{PLAYER_COLOR}}';
    ctx.fillRect(player.x, player.y, player.width, player.height);

    obstacles.forEach((obs, index) => {
        obs.y += obs.speed;
        ctx.fillStyle = '{{OBSTACLE_COLOR}}';
        ctx.fillRect(obs.x, obs.y, obs.width, obs.height);

        if (obs.x < player.x + player.width &&
            obs.x + obs.width > player.x &&
            obs.y < player.y + player.height &&
            obs.y + obs.height > player.y) {
            gameOver = true;
        }

        if (obs.y > canvas.height) {
            obstacles.splice(index, 1);
            score++;
        }
    });

    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.fillText('Score: ' + score, 10, 30);

    requestAnimationFrame(gameLoop);
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'r' && gameOver) {
        obstacles = [];
        score = 0;
        gameOver = false;
        player.x = 375;
        gameLoop();
    }
});

gameLoop();
})();
`
    },
    
    catch: {
        name: 'キャッチゲー',
        keywords: ['キャッチ', '取る', '集める', '拾う', 'catch', 'collect'],
        template: `
(function() {
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let player = { x: 375, y: 500, width: 50, height: 50, speed: 7 };
let items = [];
let score = 0;
let gameOver = false;
let timeLeft = 30;

const keys = {};
document.addEventListener('keydown', (e) => keys[e.key] = true);
document.addEventListener('keyup', (e) => keys[e.key] = false);

function createItem() {
    if (!gameOver) {
        items.push({
            x: Math.random() * (canvas.width - 30),
            y: -30,
            width: 30,
            height: 30,
            speed: {{SPEED}}
        });
    }
}

const itemInterval = setInterval(createItem, {{SPAWN_RATE}});

const timerInterval = setInterval(() => {
    if (!gameOver) {
        timeLeft--;
        if (timeLeft <= 0) {
            gameOver = true;
            clearInterval(itemInterval);
            clearInterval(timerInterval);
        }
    }
}, 1000);

function gameLoop() {
    ctx.fillStyle = '{{BACKGROUND}}';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (gameOver) {
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'white';
        ctx.font = '40px Arial';
        ctx.fillText('Time Up!', 280, 250);
        ctx.font = '30px Arial';
        ctx.fillText('Score: ' + score, 280, 300);
        ctx.fillText('Press R to Restart', 220, 350);
        return requestAnimationFrame(gameLoop);
    }

    if (keys['ArrowLeft'] && player.x > 0) player.x -= player.speed;
    if (keys['ArrowRight'] && player.x < canvas.width - player.width) player.x += player.speed;

    ctx.fillStyle = '{{PLAYER_COLOR}}';
    ctx.fillRect(player.x, player.y, player.width, player.height);

    items.forEach((item, index) => {
        item.y += item.speed;
        
        ctx.fillStyle = '{{ITEM_COLOR}}';
        ctx.beginPath();
        ctx.arc(item.x + 15, item.y + 15, 15, 0, Math.PI * 2);
        ctx.fill();

        if (item.x < player.x + player.width &&
            item.x + item.width > player.x &&
            item.y < player.y + player.height &&
            item.y + item.height > player.y) {
            items.splice(index, 1);
            score++;
        }

        if (item.y > canvas.height) {
            items.splice(index, 1);
        }
    });

    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.fillText('{{ITEM_NAME}}をキャッチ！', 10, 30);
    ctx.fillText('Score: ' + score, 10, 60);
    ctx.fillText('Time: ' + timeLeft + 's', 10, 90);

    requestAnimationFrame(gameLoop);
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'r' && gameOver) {
        items = [];
        score = 0;
        timeLeft = 30;
        gameOver = false;
        player.x = 375;
        gameLoop();
    }
});

gameLoop();
})();
`
    },
    
    shoot: {
        name: 'シューティング',
        keywords: ['撃つ', 'シュート', '攻撃', '倒す', 'shoot', 'attack'],
        template: `
(function() {
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let player = { x: 375, y: 500, width: 50, height: 50, speed: 7 };
let bullets = [];
let enemies = [];
let score = 0;
let gameOver = false;

const keys = {};
document.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    if (e.key === ' ' && !gameOver) {
        bullets.push({ x: player.x + 20, y: player.y, width: 5, height: 15, speed: 10 });
    }
});
document.addEventListener('keyup', (e) => keys[e.key] = false);

function createEnemy() {
    if (!gameOver) {
        enemies.push({
            x: Math.random() * (canvas.width - 40),
            y: -50,
            width: 40,
            height: 40,
            speed: {{SPEED}}
        });
    }
}

const enemyInterval = setInterval(createEnemy, {{SPAWN_RATE}});

function gameLoop() {
    ctx.fillStyle = '{{BACKGROUND}}';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (gameOver) {
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'white';
        ctx.font = '40px Arial';
        ctx.fillText('Game Over!', 250, 250);
        ctx.font = '30px Arial';
        ctx.fillText('Score: ' + score, 280, 300);
        ctx.fillText('Press R to Restart', 220, 350);
        clearInterval(enemyInterval);
        return requestAnimationFrame(gameLoop);
    }

    if (keys['ArrowLeft'] && player.x > 0) player.x -= player.speed;
    if (keys['ArrowRight'] && player.x < canvas.width - player.width) player.x += player.speed;

    ctx.fillStyle = '{{PLAYER_COLOR}}';
    ctx.fillRect(player.x, player.y, player.width, player.height);

    bullets.forEach((bullet, bIndex) => {
        bullet.y -= bullet.speed;
        ctx.fillStyle = 'yellow';
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
        
        if (bullet.y < 0) bullets.splice(bIndex, 1);
    });

    enemies.forEach((enemy, eIndex) => {
        enemy.y += enemy.speed;
        ctx.fillStyle = '{{ENEMY_COLOR}}';
        ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);

        bullets.forEach((bullet, bIndex) => {
            if (bullet.x < enemy.x + enemy.width &&
                bullet.x + bullet.width > enemy.x &&
                bullet.y < enemy.y + enemy.height &&
                bullet.y + bullet.height > enemy.y) {
                enemies.splice(eIndex, 1);
                bullets.splice(bIndex, 1);
                score++;
            }
        });

        if (enemy.x < player.x + player.width &&
            enemy.x + enemy.width > player.x &&
            enemy.y < player.y + player.height &&
            enemy.y + enemy.height > player.y) {
            gameOver = true;
        }

        if (enemy.y > canvas.height) enemies.splice(eIndex, 1);
    });

    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.fillText('Score: ' + score, 10, 30);
    ctx.fillText('Space to Shoot', 10, 60);

    requestAnimationFrame(gameLoop);
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'r' && gameOver) {
        bullets = [];
        enemies = [];
        score = 0;
        gameOver = false;
        player.x = 375;
        gameLoop();
    }
});

gameLoop();
})();
`
    },

    memory: {
        name: '神経衰弱',
        keywords: ['神経衰弱', '記憶', 'メモリー', 'memory', 'カード', 'めくる'],
        template: `
(function() {
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const cardWidth = 80;
const cardHeight = 100;
const cols = 4;
const rows = 3;
const cards = [];
let flippedCards = [];
let matchedPairs = 0;
let moves = 0;
let gameWon = false;

// カードの絵柄（色とアイテム）
const symbols = ['🍎', '⭐', '💎', '❤️', '🍊', '🌙'];
const colors = ['#ff0000', '#ffff00', '#00ffff', '#ff69b4', '#ff8c00', '#9370db'];

// カードを初期化
for (let i = 0; i < symbols.length; i++) {
    cards.push({ symbol: symbols[i], color: colors[i], matched: false });
    cards.push({ symbol: symbols[i], color: colors[i], matched: false });
}

// シャッフル
cards.sort(() => Math.random() - 0.5);

// カードの位置を設定
cards.forEach((card, index) => {
    card.x = (index % cols) * (cardWidth + 20) + 120;
    card.y = Math.floor(index / cols) * (cardHeight + 20) + 100;
    card.flipped = false;
});

// マウスクリック
canvas.addEventListener('click', (e) => {
    if (gameWon || flippedCards.length >= 2) return;
    
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    cards.forEach(card => {
        if (!card.flipped && !card.matched &&
            mouseX > card.x && mouseX < card.x + cardWidth &&
            mouseY > card.y && mouseY < card.y + cardHeight) {
            card.flipped = true;
            flippedCards.push(card);
            
            if (flippedCards.length === 2) {
                moves++;
                setTimeout(checkMatch, 800);
            }
        }
    });
});

function checkMatch() {
    if (flippedCards[0].symbol === flippedCards[1].symbol) {
        flippedCards[0].matched = true;
        flippedCards[1].matched = true;
        matchedPairs++;
        
        if (matchedPairs === symbols.length) {
            gameWon = true;
        }
    } else {
        flippedCards[0].flipped = false;
        flippedCards[1].flipped = false;
    }
    flippedCards = [];
}

function draw() {
    ctx.fillStyle = '{{BACKGROUND}}';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // カード描画
    cards.forEach(card => {
        if (card.flipped || card.matched) {
            ctx.fillStyle = card.color;
            ctx.fillRect(card.x, card.y, cardWidth, cardHeight);
            ctx.fillStyle = 'white';
            ctx.font = '40px Arial';
            ctx.fillText(card.symbol, card.x + 20, card.y + 65);
        } else {
            ctx.fillStyle = '#4a5568';
            ctx.fillRect(card.x, card.y, cardWidth, cardHeight);
            ctx.fillStyle = '#718096';
            ctx.fillRect(card.x + 5, card.y + 5, cardWidth - 10, cardHeight - 10);
        }
    });
    
    // スコア表示
    ctx.fillStyle = 'white';
    ctx.font = '24px Arial';
    ctx.fillText('Moves: ' + moves, 20, 40);
    ctx.fillText('Pairs: ' + matchedPairs + '/' + symbols.length, 20, 70);
    
    if (gameWon) {
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'white';
        ctx.font = '40px Arial';
        ctx.fillText('クリア！', 320, 250);
        ctx.font = '30px Arial';
        ctx.fillText('Moves: ' + moves, 300, 300);
        ctx.fillText('Press R to Restart', 220, 350);
    }
    
    requestAnimationFrame(draw);
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'r' && gameWon) {
        location.reload();
    }
});

draw();
})();
`
    },

    breakout: {
        name: 'ブロック崩し',
        keywords: ['ブロック崩し', 'ブロック', 'breakout', 'パドル', 'ボール'],
        template: `
(function() {
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const paddle = { x: 350, y: 550, width: 100, height: 15, speed: 8 };
const ball = { x: 400, y: 300, radius: 8, dx: 4, dy: -4 };
const bricks = [];
let score = 0;
let gameOver = false;
let gameWon = false;

const brickRows = 5;
const brickCols = 8;
const brickWidth = 80;
const brickHeight = 30;
const brickPadding = 10;
const brickOffsetTop = 60;
const brickOffsetLeft = 60;

// ブロックの色
const brickColors = ['#ff0000', '#ff8c00', '#ffff00', '#00ff00', '#0000ff'];

// ブロック初期化
for (let row = 0; row < brickRows; row++) {
    bricks[row] = [];
    for (let col = 0; col < brickCols; col++) {
        bricks[row][col] = {
            x: col * (brickWidth + brickPadding) + brickOffsetLeft,
            y: row * (brickHeight + brickPadding) + brickOffsetTop,
            status: 1,
            color: brickColors[row]
        };
    }
}

const keys = {};
document.addEventListener('keydown', (e) => keys[e.key] = true);
document.addEventListener('keyup', (e) => keys[e.key] = false);

function drawBall() {
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.closePath();
}

function drawPaddle() {
    ctx.fillStyle = '{{PLAYER_COLOR}}';
    ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
}

function drawBricks() {
    for (let row = 0; row < brickRows; row++) {
        for (let col = 0; col < brickCols; col++) {
            const brick = bricks[row][col];
            if (brick.status === 1) {
                ctx.fillStyle = brick.color;
                ctx.fillRect(brick.x, brick.y, brickWidth, brickHeight);
            }
        }
    }
}

function collisionDetection() {
    for (let row = 0; row < brickRows; row++) {
        for (let col = 0; col < brickCols; col++) {
            const brick = bricks[row][col];
            if (brick.status === 1) {
                if (ball.x > brick.x && ball.x < brick.x + brickWidth &&
                    ball.y > brick.y && ball.y < brick.y + brickHeight) {
                    ball.dy = -ball.dy;
                    brick.status = 0;
                    score++;
                    
                    if (score === brickRows * brickCols) {
                        gameWon = true;
                    }
                }
            }
        }
    }
}

function gameLoop() {
    ctx.fillStyle = '{{BACKGROUND}}';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    if (gameOver) {
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'white';
        ctx.font = '40px Arial';
        ctx.fillText('Game Over!', 250, 300);
        ctx.fillText('Press R to Restart', 220, 350);
        return;
    }
    
    if (gameWon) {
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'white';
        ctx.font = '40px Arial';
        ctx.fillText('クリア！', 320, 300);
        ctx.fillText('Press R to Restart', 220, 350);
        return;
    }
    
    drawBricks();
    drawBall();
    drawPaddle();
    collisionDetection();
    
    // パドル移動
    if (keys['ArrowLeft'] && paddle.x > 0) paddle.x -= paddle.speed;
    if (keys['ArrowRight'] && paddle.x < canvas.width - paddle.width) paddle.x += paddle.speed;
    
    // ボール移動
    ball.x += ball.dx;
    ball.y += ball.dy;
    
    // 壁との衝突
    if (ball.x + ball.radius > canvas.width || ball.x - ball.radius < 0) {
        ball.dx = -ball.dx;
    }
    if (ball.y - ball.radius < 0) {
        ball.dy = -ball.dy;
    }
    
    // パドルとの衝突
    if (ball.y + ball.radius > paddle.y &&
        ball.x > paddle.x && ball.x < paddle.x + paddle.width) {
        ball.dy = -ball.dy;
    }
    
    // 落下判定
    if (ball.y + ball.radius > canvas.height) {
        gameOver = true;
    }
    
    // スコア表示
    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.fillText('Score: ' + score, 10, 30);
    
    requestAnimationFrame(gameLoop);
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'r' && (gameOver || gameWon)) {
        location.reload();
    }
});

gameLoop();
})();
`
    },

    puzzle: {
        name: 'スライドパズル',
        keywords: ['パズル', 'スライド', '並べ替え', 'puzzle', 'sliding'],
        template: `
(function() {
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const tileSize = 120;
const gridSize = 3;
const tiles = [];
let emptyPos = { row: 2, col: 2 };
let moves = 0;
let gameWon = false;

// タイルの初期配置
for (let row = 0; row < gridSize; row++) {
    tiles[row] = [];
    for (let col = 0; col < gridSize; col++) {
        const num = row * gridSize + col + 1;
        tiles[row][col] = num === 9 ? 0 : num;
    }
}

// シャッフル
for (let i = 0; i < 100; i++) {
    const moves = [];
    if (emptyPos.row > 0) moves.push({ row: -1, col: 0 });
    if (emptyPos.row < gridSize - 1) moves.push({ row: 1, col: 0 });
    if (emptyPos.col > 0) moves.push({ row: 0, col: -1 });
    if (emptyPos.col < gridSize - 1) moves.push({ row: 0, col: 1 });
    
    const move = moves[Math.floor(Math.random() * moves.length)];
    const newRow = emptyPos.row + move.row;
    const newCol = emptyPos.col + move.col;
    
    tiles[emptyPos.row][emptyPos.col] = tiles[newRow][newCol];
    tiles[newRow][newCol] = 0;
    emptyPos = { row: newRow, col: newCol };
}

canvas.addEventListener('click', (e) => {
    if (gameWon) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const col = Math.floor((x - 160) / tileSize);
    const row = Math.floor((y - 120) / tileSize);
    
    if (row >= 0 && row < gridSize && col >= 0 && col < gridSize) {
        // 隣接チェック
        if ((Math.abs(row - emptyPos.row) === 1 && col === emptyPos.col) ||
            (Math.abs(col - emptyPos.col) === 1 && row === emptyPos.row)) {
            tiles[emptyPos.row][emptyPos.col] = tiles[row][col];
            tiles[row][col] = 0;
            emptyPos = { row, col };
            moves++;
            
            checkWin();
        }
    }
});

function checkWin() {
    let correct = true;
    for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
            const expected = row * gridSize + col + 1;
            if (row === 2 && col === 2) {
                if (tiles[row][col] !== 0) correct = false;
            } else {
                if (tiles[row][col] !== expected) correct = false;
            }
        }
    }
    if (correct) gameWon = true;
}

function draw() {
    ctx.fillStyle = '{{BACKGROUND}}';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // タイル描画
    for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
            const num = tiles[row][col];
            if (num !== 0) {
                const x = col * tileSize + 160;
                const y = row * tileSize + 120;
                
                ctx.fillStyle = '{{PLAYER_COLOR}}';
                ctx.fillRect(x, y, tileSize - 5, tileSize - 5);
                
                ctx.fillStyle = 'white';
                ctx.font = '48px Arial';
                ctx.fillText(num.toString(), x + 40, y + 75);
            }
        }
    }
    
    // スコア表示
    ctx.fillStyle = 'white';
    ctx.font = '24px Arial';
    ctx.fillText('Moves: ' + moves, 20, 40);
    
    if (gameWon) {
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'white';
        ctx.font = '40px Arial';
        ctx.fillText('クリア！', 320, 250);
        ctx.font = '30px Arial';
        ctx.fillText('Moves: ' + moves, 300, 300);
        ctx.fillText('Press R to Restart', 220, 350);
    }
    
    requestAnimationFrame(draw);
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'r' && gameWon) {
        location.reload();
    }
});

draw();
})();
`
    },

    clicker: {
        name: 'クリッカーゲーム',
        keywords: ['クリック', 'クリッカー', 'タップ', '連打', 'clicker', 'tap'],
        template: `
(function() {
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let score = 0;
let clickPower = 1;
let autoClickers = 0;
let timeLeft = 30;
let gameOver = false;

const targetX = 400;
const targetY = 300;
const targetRadius = 60;

// アイテムの色
const itemColor = '{{ITEM_COLOR}}';

canvas.addEventListener('click', (e) => {
    if (gameOver) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const dist = Math.sqrt((x - targetX) ** 2 + (y - targetY) ** 2);
    if (dist < targetRadius) {
        score += clickPower;
    }
    
    // アップグレード購入
    if (x > 50 && x < 250 && y > 450 && y < 500 && score >= 10) {
        score -= 10;
        clickPower++;
    }
    
    if (x > 300 && x < 500 && y > 450 && y < 500 && score >= 50) {
        score -= 50;
        autoClickers++;
    }
});

// オートクリック
setInterval(() => {
    if (!gameOver) {
        score += autoClickers;
    }
}, 1000);

// タイマー
const timerInterval = setInterval(() => {
    if (!gameOver) {
        timeLeft--;
        if (timeLeft <= 0) {
            gameOver = true;
            clearInterval(timerInterval);
        }
    }
}, 1000);

function draw() {
    ctx.fillStyle = '{{BACKGROUND}}';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    if (gameOver) {
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'white';
        ctx.font = '40px Arial';
        ctx.fillText('Time Up!', 280, 250);
        ctx.font = '30px Arial';
        ctx.fillText('Score: ' + score, 300, 300);
        ctx.fillText('Press R to Restart', 220, 350);
        return requestAnimationFrame(draw);
    }
    
    // ターゲット描画
    ctx.beginPath();
    ctx.arc(targetX, targetY, targetRadius, 0, Math.PI * 2);
    ctx.fillStyle = itemColor;
    ctx.fill();
    
    // スコア表示
    ctx.fillStyle = 'white';
    ctx.font = '48px Arial';
    ctx.fillText(score.toString(), targetX - 30, targetY + 15);
    
    // UI表示
    ctx.font = '24px Arial';
    ctx.fillText('Time: ' + timeLeft + 's', 20, 40);
    ctx.fillText('Power: ' + clickPower, 20, 70);
    ctx.fillText('Auto: ' + autoClickers + '/s', 20, 100);
    
    // アップグレードボタン
    ctx.fillStyle = '#4a5568';
    ctx.fillRect(50, 450, 200, 50);
    ctx.fillRect(300, 450, 200, 50);
    
    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.fillText('Power +1 (10)', 70, 480);
    ctx.fillText('Auto +1 (50)', 320, 480);
    
    requestAnimationFrame(draw);
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'r' && gameOver) {
        location.reload();
    }
});

draw();
})();
`
    },

    jump: {
        name: 'ジャンプゲーム',
        keywords: ['ジャンプ', '飛ぶ', 'タイミング', 'jump', 'flappy'],
        template: `
(function() {
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const player = { x: 100, y: 300, width: 40, height: 40, velocity: 0, gravity: 0.6, jump: -12 };
const obstacles = [];
let score = 0;
let gameOver = false;
let frameCount = 0;

document.addEventListener('keydown', (e) => {
    if (e.key === ' ' && !gameOver) {
        player.velocity = player.jump;
    }
    if (e.key === 'r' && gameOver) {
        location.reload();
    }
});

canvas.addEventListener('click', () => {
    if (!gameOver) {
        player.velocity = player.jump;
    }
});

function createObstacle() {
    const gap = 200;
    const minHeight = 50;
    const maxHeight = 300;
    const topHeight = Math.random() * (maxHeight - minHeight) + minHeight;
    
    obstacles.push({
        x: canvas.width,
        topHeight: topHeight,
        bottomY: topHeight + gap,
        width: 60,
        passed: false
    });
}

function gameLoop() {
    ctx.fillStyle = '{{BACKGROUND}}';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    if (gameOver) {
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'white';
        ctx.font = '40px Arial';
        ctx.fillText('Game Over!', 250, 250);
        ctx.font = '30px Arial';
        ctx.fillText('Score: ' + score, 300, 300);
        ctx.fillText('Press R to Restart', 220, 350);
        return;
    }
    
    // プレイヤー更新
    player.velocity += player.gravity;
    player.y += player.velocity;
    
    // 地面と天井の衝突
    if (player.y + player.height > canvas.height || player.y < 0) {
        gameOver = true;
    }
    
    // プレイヤー描画
    ctx.fillStyle = '{{PLAYER_COLOR}}';
    ctx.fillRect(player.x, player.y, player.width, player.height);
    
    // 障害物生成
    frameCount++;
    if (frameCount % 90 === 0) {
        createObstacle();
    }
    
    // 障害物更新・描画
    obstacles.forEach((obs, index) => {
        obs.x -= 3;
        
        // 上の障害物
        ctx.fillStyle = '{{OBSTACLE_COLOR}}';
        ctx.fillRect(obs.x, 0, obs.width, obs.topHeight);
        
        // 下の障害物
        ctx.fillRect(obs.x, obs.bottomY, obs.width, canvas.height - obs.bottomY);
        
        // 衝突判定
        if (player.x + player.width > obs.x && player.x < obs.x + obs.width) {
            if (player.y < obs.topHeight || player.y + player.height > obs.bottomY) {
                gameOver = true;
            }
        }
        
        // スコア加算
        if (!obs.passed && obs.x + obs.width < player.x) {
            obs.passed = true;
            score++;
        }
        
        // 画面外の削除
        if (obs.x + obs.width < 0) {
            obstacles.splice(index, 1);
        }
    });
    
    // スコア表示
    ctx.fillStyle = 'white';
    ctx.font = '32px Arial';
    ctx.fillText('Score: ' + score, 20, 40);
    
    requestAnimationFrame(gameLoop);
}

gameLoop();
})();
`
    }
};

// 色とテーマのパターン
const THEMES = {
    space: { background: '#000033', player: '#00ffff', obstacle: '#ff0000', item: '#ffff00', enemy: '#ff00ff' },
    ocean: { background: '#0066cc', player: '#ffaa00', obstacle: '#333333', item: '#ffff00', enemy: '#cc0000' },
    forest: { background: '#228b22', player: '#8b4513', obstacle: '#666666', item: '#ff6347', enemy: '#4b0082' },
    sunset: { background: '#ff6347', player: '#ffd700', obstacle: '#8b0000', item: '#00ff00', enemy: '#191970' },
    night: { background: '#191970', player: '#ffffff', obstacle: '#696969', item: '#ffd700', enemy: '#dc143c' }
};

// 難易度設定
const DIFFICULTY = {
    easy: { speed: 2, spawnRate: 2000 },
    normal: { speed: 4, spawnRate: 1500 },
    hard: { speed: 6, spawnRate: 1000 }
};

// プロンプトからアイテムを認識
function detectItem(prompt) {
    prompt = prompt.toLowerCase();
    
    for (const [key, item] of Object.entries(ITEMS)) {
        if (item.keywords.some(keyword => prompt.includes(keyword))) {
            return { key: key, color: item.color, name: item.name };
        }
    }
    
    return { key: 'star', color: ITEMS.star.color, name: ITEMS.star.name };
}

// プロンプトを解析してゲームを生成
function generateGame(prompt) {
    const originalPrompt = prompt;
    prompt = prompt.toLowerCase();
    
    // ゲームタイプを判定
    let gameType = 'avoid';
    for (const [type, template] of Object.entries(GAME_TEMPLATES)) {
        if (template.keywords.some(keyword => prompt.includes(keyword))) {
            gameType = type;
            break;
        }
    }
    
    // テーマを判定
    let theme = 'space';
    if (prompt.includes('海') || prompt.includes('ocean')) theme = 'ocean';
    else if (prompt.includes('森') || prompt.includes('forest')) theme = 'forest';
    else if (prompt.includes('夕焼け') || prompt.includes('sunset')) theme = 'sunset';
    else if (prompt.includes('夜') || prompt.includes('night')) theme = 'night';
    
    // 難易度を判定
    let difficulty = 'normal';
    if (prompt.includes('簡単') || prompt.includes('easy') || prompt.includes('ゆっくり')) difficulty = 'easy';
    else if (prompt.includes('難しい') || prompt.includes('hard') || prompt.includes('速い')) difficulty = 'hard';
    
    // アイテムを認識
    const detectedItem = detectItem(prompt);
    
    // テンプレートを取得
    let code = GAME_TEMPLATES[gameType].template;
    const colors = THEMES[theme];
    const settings = DIFFICULTY[difficulty];
    
    // 変数を置換
    code = code.replace(/{{BACKGROUND}}/g, colors.background);
    code = code.replace(/{{PLAYER_COLOR}}/g, colors.player);
    code = code.replace(/{{OBSTACLE_COLOR}}/g, colors.obstacle);
    code = code.replace(/{{ITEM_COLOR}}/g, detectedItem.color);
    code = code.replace(/{{ITEM_NAME}}/g, detectedItem.name);
    code = code.replace(/{{ENEMY_COLOR}}/g, colors.enemy);
    code = code.replace(/{{SPEED}}/g, settings.speed);
    code = code.replace(/{{SPAWN_RATE}}/g, settings.spawnRate);
    
    return {
        code: code,
        type: GAME_TEMPLATES[gameType].name,
        theme: theme,
        difficulty: difficulty,
        item: detectedItem.name
    };
}

// エクスポート
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { generateGame };
}
