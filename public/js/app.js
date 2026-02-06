// ===== 設定 =====
const API_BASE_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:3000/api'
  : '/api';

// ===== DOM要素の取得 =====
const promptInput = document.getElementById('promptInput');
const generateBtn = document.getElementById('generateBtn');
const btnText = generateBtn.querySelector('.btn-text');
const btnLoading = generateBtn.querySelector('.btn-loading');
const errorMessage = document.getElementById('errorMessage');
const gameSection = document.getElementById('gameSection');
const gameTitle = document.getElementById('gameTitle');
const gameDescription = document.getElementById('gameDescription');
const fullscreenBtn = document.getElementById('fullscreenBtn');
const newGameBtn = document.getElementById('newGameBtn');
const gameGallery = document.getElementById('gameGallery');

let currentGame = null;
let activeScripts = [];

// ===== 初期化 =====
document.addEventListener('DOMContentLoaded', () => {
    console.log('🎮 AI Game Generator 起動');
    
    // イベントリスナー設定
    setupEventListeners();
    
    // ギャラリーを読み込み
    loadGallery();
});

// ===== イベントリスナー設定 =====
function setupEventListeners() {
    // 生成ボタン
    generateBtn.addEventListener('click', generateGame);
    
    // Enter キーで生成
    promptInput.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            generateGame();
        }
    });
    
    // サンプルプロンプト
    document.querySelectorAll('.sample-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            promptInput.value = btn.dataset.prompt;
            promptInput.focus();
        });
    });
    
    // フルスクリーン
    fullscreenBtn.addEventListener('click', toggleFullscreen);
    
    // 新しいゲーム
    newGameBtn.addEventListener('click', () => {
        gameSection.style.display = 'none';
        promptInput.value = '';
        promptInput.focus();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// ===== 現在のゲームを停止 =====
function stopCurrentGame() {
    console.log('🛑 現在のゲームを停止');
    
    // Canvas をクリア
    const canvas = document.getElementById('gameCanvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    
    // 古いスクリプトタグを削除
    activeScripts.forEach(script => {
        if (script && script.parentNode) {
            script.parentNode.removeChild(script);
        }
    });
    activeScripts = [];
}

// ===== ゲーム生成 =====
async function generateGame() {
    const prompt = promptInput.value.trim();
    
    // バリデーション
    if (!prompt) {
        showError('ゲームの説明を入力してください');
        promptInput.focus();
        return;
    }
    
    if (prompt.length < 5) {
        showError('もう少し詳しく説明してください（5文字以上）');
        promptInput.focus();
        return;
    }
    
    // UIの状態変更
    setGenerating(true);
    hideError();
    gameSection.style.display = 'none';
    
    // 前のゲームを停止
    stopCurrentGame();
    
    console.log('🎮 ゲーム生成開始:', prompt);
    
    try {
        const response = await fetch(`${API_BASE_URL}/generate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ prompt })
        });
        
        const data = await response.json();
        
        if (!response.ok || !data.success) {
            throw new Error(data.error || 'ゲーム生成に失敗しました');
        }
        
        // ゲームを表示
        displayGame(data.game);
        
        // ギャラリーを更新
        loadGallery();
        
        console.log('✅ ゲーム生成成功');
        
    } catch (error) {
        console.error('❌ ゲーム生成エラー:', error);
        showError(`ゲーム生成エラー: ${error.message}`);
    } finally {
        setGenerating(false);
    }
}

// ===== ゲーム表示 =====
function displayGame(game) {
    currentGame = game;
    
    // ゲーム情報を設定
    gameTitle.textContent = `🎮 ${game.title}`;
    gameDescription.textContent = game.description;
    
    // ゲームセクションを表示
    gameSection.style.display = 'block';
    
    // スクロール
    gameSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    
    // ゲームコードを実行（300ms後）
    setTimeout(() => {
        executeGameCode(game.code);
    }, 300);
}

// ===== ゲームコードを実行 =====
function executeGameCode(code) {
    console.log('🎮 ゲームコードを実行:', code.length, '文字');
    
    try {
        // Canvas を完全にリセット
        const oldCanvas = document.getElementById('gameCanvas');
        const newCanvas = document.createElement('canvas');
        newCanvas.id = 'gameCanvas';
        newCanvas.width = 800;
        newCanvas.height = 600;
        
        // 古い Canvas を置き換え
        oldCanvas.parentNode.replaceChild(newCanvas, oldCanvas);
        
        // コードを実行
        const script = document.createElement('script');
        script.textContent = code;
        document.body.appendChild(script);
        
        // スクリプトタグを記録（後で削除するため）
        activeScripts.push(script);
        
        console.log('✅ ゲームコード実行完了');
        
    } catch (error) {
        console.error('❌ ゲームコード実行エラー:', error);
        showError(`ゲームの実行に失敗しました: ${error.message}`);
    }
}

// ===== フルスクリーン切替 =====
function toggleFullscreen() {
    const canvas = document.getElementById('gameCanvas');
    if (!document.fullscreenElement) {
        canvas.requestFullscreen().catch(err => {
            console.error('フルスクリーンエラー:', err);
        });
    } else {
        document.exitFullscreen();
    }
}

// ===== ギャラリーを読み込み =====
async function loadGallery() {
    try {
        const response = await fetch(`${API_BASE_URL}/games`);
        const data = await response.json();
        
        if (!data.success || !data.games || data.games.length === 0) {
            gameGallery.innerHTML = '<p class="no-games">まだゲームが生成されていません</p>';
            return;
        }
        
        // ギャラリーを表示
        gameGallery.innerHTML = data.games.map(game => `
            <div class="game-card" data-id="${game.id}">
                <h3>${game.title}</h3>
                <p>${game.description}</p>
                <div class="game-meta">
                    <span>🎮 ${game.plays || 0} プレイ</span>
                    <span>📅 ${new Date(game.createdAt).toLocaleDateString('ja-JP')}</span>
                </div>
                <button class="btn-play" onclick="loadGame('${game.id}')">
                    ▶️ プレイ
                </button>
            </div>
        `).join('');
        
    } catch (error) {
        console.error('❌ ギャラリー読み込みエラー:', error);
    }
}

// ===== ゲームを読み込み =====
async function loadGame(gameId) {
    try {
        // 前のゲームを停止
        stopCurrentGame();
        
        const response = await fetch(`${API_BASE_URL}/games/${gameId}`);
        const data = await response.json();
        
        if (!data.success || !data.game) {
            throw new Error('ゲームが見つかりません');
        }
        
        displayGame(data.game);
        
    } catch (error) {
        console.error('❌ ゲーム読み込みエラー:', error);
        showError(error.message);
    }
}

// ===== UIヘルパー関数 =====
function setGenerating(isGenerating) {
    generateBtn.disabled = isGenerating;
    btnText.style.display = isGenerating ? 'none' : 'inline';
    btnLoading.style.display = isGenerating ? 'inline' : 'none';
}

function showError(message) {
    errorMessage.textContent = `❌ ${message}`;
    errorMessage.style.display = 'block';
}

function hideError() {
    errorMessage.style.display = 'none';
}

console.log('✅ app.js 読み込み完了');
