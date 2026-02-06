// ===== AI風ゲーム生成エンジン =====

// ゲームテンプレート定義
const GAME_TEMPLATES = {
    avoid: {
        name: '避けゲー',
        keywords: ['避ける', 'よける', '逃げる', 'dodge', 'avoid'],
        template: `
// 避けゲー
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let player = { x: 375, y: 500, width: 50, height: 50, speed: 7 };
let obstacles = [];
let score = 0;
let gameOver = false;

// キー入力
const keys = {};
document.addEventListener('keydown', (e) => keys[e.key] = true);
document.addEventListener('keyup', (e) => keys[e.key] = false);

// 障害物生成
function createObstacle() {
    obstacles.push({
        x: Math.random() * (canvas.width - 40),
        y: -50,
        width: 40,
        height: 40,
        speed: {{SPEED}}
    });
}

setInterval(createObstacle, {{SPAWN_RATE}});

// ゲームループ
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
        return;
    }

    // 背景
    ctx.fillStyle = '{{BACKGROUND}}';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // プレイヤー移動
    if (keys['ArrowLeft'] && player.x > 0) player.x -= player.speed;
    if (keys['ArrowRight'] && player.x < canvas.width - player.width) player.x += player.speed;

    // プレイヤー描画
    ctx.fillStyle = '{{PLAYER_COLOR}}';
    ctx.fillRect(player.x, player.y, player.width, player.height);

    // 障害物更新
    obstacles.forEach((obs, index) => {
        obs.y += obs.speed;
        
        // 障害物描画
        ctx.fillStyle = '{{OBSTACLE_COLOR}}';
        ctx.fillRect(obs.x, obs.y, obs.width, obs.height);

        // 衝突判定
        if (obs.x < player.x + player.width &&
            obs.x + obs.width > player.x &&
            obs.y < player.y + player.height &&
            obs.y + obs.height > player.y) {
            gameOver = true;
        }

        // 画面外に出たら削除＆スコア加算
        if (obs.y > canvas.height) {
            obstacles.splice(index, 1);
            score++;
        }
    });

    // スコア表示
    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.fillText('Score: ' + score, 10, 30);

    requestAnimationFrame(gameLoop);
}

// リスタート
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
`
    },
    
    catch: {
        name: 'キャッチゲー',
        keywords: ['キャッチ', '取る', '集める', '拾う', 'catch', 'collect'],
        template: `
// キャッチゲー
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let player = { x: 375, y: 500, width: 50, height: 50, speed: 7 };
let items = [];
let score = 0;
let gameOver = false;
let timeLeft = 30;

// キー入力
const keys = {};
document.addEventListener('keydown', (e) => keys[e.key] = true);
document.addEventListener('keyup', (e) => keys[e.key] = false);

// アイテム生成
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

setInterval(createItem, {{SPAWN_RATE}});

// タイマー
setInterval(() => {
    if (!gameOver) {
        timeLeft--;
        if (timeLeft <= 0) gameOver = true;
    }
}, 1000);

// ゲームループ
function gameLoop() {
    // 背景
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

    // プレイヤー移動
    if (keys['ArrowLeft'] && player.x > 0) player.x -= player.speed;
    if (keys['ArrowRight'] && player.x < canvas.width - player.width) player.x += player.speed;

    // プレイヤー描画
    ctx.fillStyle = '{{PLAYER_COLOR}}';
    ctx.fillRect(player.x, player.y, player.width, player.height);

    // アイテム更新
    items.forEach((item, index) => {
        item.y += item.speed;
        
        // アイテム描画
        ctx.fillStyle = '{{ITEM_COLOR}}';
        ctx.fillRect(item.x, item.y, item.width, item.height);

        // キャッチ判定
        if (item.x < player.x + player.width &&
            item.x + item.width > player.x &&
            item.y < player.y + player.height &&
            item.y + item.height > player.y) {
            items.splice(index, 1);
            score++;
        }

        // 画面外に出たら削除
        if (item.y > canvas.height) {
            items.splice(index, 1);
        }
    });

    // UI表示
    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.fillText('Score: ' + score, 10, 30);
    ctx.fillText('Time: ' + timeLeft + 's', 10, 60);

    requestAnimationFrame(gameLoop);
}

// リスタート
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
`
    },
    
    shoot: {
        name: 'シューティング',
        keywords: ['撃つ', 'シュート', '攻撃', '倒す', 'shoot', 'attack'],
        template: `
// シューティングゲーム
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let player = { x: 375, y: 500, width: 50, height: 50, speed: 7 };
let bullets = [];
let enemies = [];
let score = 0;
let gameOver = false;

// キー入力
const keys = {};
document.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    if (e.key === ' ' && !gameOver) {
        bullets.push({ x: player.x + 20, y: player.y, width: 5, height: 15, speed: 10 });
    }
});
document.addEventListener('keyup', (e) => keys[e.key] = false);

// 敵生成
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

setInterval(createEnemy, {{SPAWN_RATE}});

// ゲームループ
function gameLoop() {
    // 背景
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
        return requestAnimationFrame(gameLoop);
    }

    // プレイヤー移動
    if (keys['ArrowLeft'] && player.x > 0) player.x -= player.speed;
    if (keys['ArrowRight'] && player.x < canvas.width - player.width) player.x += player.speed;

    // プレイヤー描画
    ctx.fillStyle = '{{PLAYER_COLOR}}';
    ctx.fillRect(player.x, player.y, player.width, player.height);

    // 弾丸更新
    bullets.forEach((bullet, bIndex) => {
        bullet.y -= bullet.speed;
        ctx.fillStyle = 'yellow';
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
        
        if (bullet.y < 0) bullets.splice(bIndex, 1);
    });

    // 敵更新
    enemies.forEach((enemy, eIndex) => {
        enemy.y += enemy.speed;
        ctx.fillStyle = '{{ENEMY_COLOR}}';
        ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);

        // 弾丸と敵の衝突
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

        // プレイヤーと敵の衝突
        if (enemy.x < player.x + player.width &&
            enemy.x + enemy.width > player.x &&
            enemy.y < player.y + player.height &&
            enemy.y + enemy.height > player.y) {
            gameOver = true;
        }

        if (enemy.y > canvas.height) enemies.splice(eIndex, 1);
    });

    // スコア表示
    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.fillText('Score: ' + score, 10, 30);
    ctx.fillText('Space to Shoot', 10, 60);

    requestAnimationFrame(gameLoop);
}

// リスタート
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

// プロンプトを解析してゲームを生成
function generateGame(prompt) {
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
    
    // テンプレートを取得
    let code = GAME_TEMPLATES[gameType].template;
    const colors = THEMES[theme];
    const settings = DIFFICULTY[difficulty];
    
    // 変数を置換
    code = code.replace(/{{BACKGROUND}}/g, colors.background);
    code = code.replace(/{{PLAYER_COLOR}}/g, colors.player);
    code = code.replace(/{{OBSTACLE_COLOR}}/g, colors.obstacle);
    code = code.replace(/{{ITEM_COLOR}}/g, colors.item);
    code = code.replace(/{{ENEMY_COLOR}}/g, colors.enemy);
    code = code.replace(/{{SPEED}}/g, settings.speed);
    code = code.replace(/{{SPAWN_RATE}}/g, settings.spawnRate);
    
    return {
        code: code,
        type: GAME_TEMPLATES[gameType].name,
        theme: theme,
        difficulty: difficulty
    };
}

// エクスポート
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { generateGame };
}
