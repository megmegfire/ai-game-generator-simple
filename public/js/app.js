// ========================================
// グローバル変数
// ========================================
let userSelections = {
    gameType: '',
    color: '',
    place: '',
    difficulty: ''
};

// API設定
const API_BASE_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:3000/api' 
    : '/api';

// ========================================
// 初期化
// ========================================
document.addEventListener('DOMContentLoaded', () => {
    console.log('🎮 AI Game Generator 起動');
    setupSelectionButtons();
    setupGenerateButton();
    setupGameEventListeners();
    loadGallery();
});

// ========================================
// 選択ボタンのセットアップ
// ========================================
function setupSelectionButtons() {
    const selectBtns = document.querySelectorAll('.select-btn');
    
    selectBtns.forEach(btn => {
        // クリック・タッチの両方に対応
        const handleSelection = (e) => {
            e.preventDefault(); // デフォルト動作を防止
            
            const type = btn.getAttribute('data-type');
            const value = btn.getAttribute('data-value');
            
            // 同じタイプの他のボタンの選択を解除
            document.querySelectorAll(`[data-type="${type}"]`).forEach(b => {
                b.classList.remove('selected');
            });
            
            // このボタンを選択
            btn.classList.add('selected');
            
            // 選択を保存
            userSelections[type] = value;
            
            console.log('✅ 選択:', type, '=', value);
            console.log('📱 現在の選択:', userSelections);
        };
        
        // タッチとクリックの両方をサポート
        btn.addEventListener('touchstart', handleSelection, { passive: false });
        btn.addEventListener('click', handleSelection);
    });
}

// ========================================
// 生成ボタンのセットアップ
// ========================================
function setupGenerateButton() {
    const generateBtn = document.getElementById('generateBtn');
    
    const handleGenerate = async (e) => {
        e.preventDefault(); // デフォルト動作を防止
        
        // すべて選択されているか確認
        if (!userSelections.gameType || !userSelections.color || 
            !userSelections.place || !userSelections.difficulty) {
            showError('すべての項目を選択してください！');
            return;
        }
        
        await generateGame();
    };
    
    // タッチとクリックの両方をサポート
    generateBtn.addEventListener('touchstart', handleGenerate, { passive: false });
    generateBtn.addEventListener('click', handleGenerate);
}

// ========================================
// ゲーム生成
// ========================================
async function generateGame() {
    console.log('🎮 ゲーム生成開始:', userSelections);
    
    // プロンプトを生成
    const prompt = buildPrompt(userSelections);
    console.log('📝 生成されたプロンプト:', prompt);
    
    // ローディング開始
    setGenerating(true);
    hideError();
    
    // ゲームセクションを非表示
    document.getElementById('gameSection').style.display = 'none';
    
    try {
        // API呼び出し
        const response = await fetch(`${API_BASE_URL}/generate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ prompt })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'ゲーム生成に失敗しました');
        }
        
        if (data.success && data.game) {
            displayGame(data.game);
            loadGallery();
        } else {
            throw new Error('ゲームデータが取得できませんでした');
        }
        
    } catch (error) {
        console.error('❌ エラー:', error);
        showError('ゲーム生成に失敗しました: ' + error.message);
    } finally {
        setGenerating(false);
    }
}

// ========================================
// プロンプト生成
// ========================================
function buildPrompt(selections) {
    const gameTypeMap = {
        'avoid': '逃げるゲーム',
        'catch': '集めるゲーム',
        'shoot': 'シューティングゲーム',
        'jump': 'ジャンプゲーム',
        'breakout': 'ブロック崩しゲーム',
        'memory': '神経衰弱ゲーム',
        'puzzle': 'スライドパズルゲーム',
        'clicker': 'クリッカーゲーム'
    };
    
    const placeMap = {
        'space': '宇宙',
        'ocean': '海',
        'forest': '森',
        'sunset': '夕焼け',
        'night': '夜'
    };
    
    const difficultyMap = {
        'easy': '簡単',
        'normal': '普通',
        'hard': '難しい'
    };
    
    const gameType = gameTypeMap[selections.gameType] || 'ゲーム';
    const place = placeMap[selections.place] || '';
    const difficulty = difficultyMap[selections.difficulty] || '';
    
    let prompt = `${place}で${gameType} ${difficulty}`;
    return prompt.trim();
}

// ========================================
// ゲーム表示
// ========================================
function displayGame(game) {
    console.log('🎮 ゲーム表示:', game);
    
    // ゲームセクションを表示
    const gameSection = document.getElementById('gameSection');
    gameSection.style.display = 'block';
    
    // タイトルと説明
    document.getElementById('gameTitle').textContent = `🎉 ${game.title || 'ゲーム'}`;
    document.getElementById('gameDescription').textContent = game.description || '';
    
    // スクロール
    gameSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    
    // ゲームコード実行（少し遅延）
    setTimeout(() => {
        executeGameCode(game.code);
    }, 300);
}

// ========================================
// ゲームコード実行
// ========================================
function executeGameCode(code) {
    try {
        console.log('▶️ ゲームコード実行');
        
        // Canvasをリセット
        const canvas = document.getElementById('gameCanvas');
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // 古いCanvasを削除して新しいのを作る
        const container = canvas.parentElement;
        const newCanvas = canvas.cloneNode(true);
        container.removeChild(canvas);
        container.appendChild(newCanvas);
        
        // スクリプトタグを削除
        const oldScripts = document.querySelectorAll('script[data-game-script]');
        oldScripts.forEach(script => script.remove());
        
        // 新しいスクリプトを追加
        const script = document.createElement('script');
        script.setAttribute('data-game-script', 'true');
        script.textContent = code;
        document.body.appendChild(script);
        
        console.log('✅ ゲーム起動成功');
        
    } catch (error) {
        console.error('❌ ゲーム実行エラー:', error);
        showError('ゲームの起動に失敗しました');
    }
}

// ========================================
// ゲームイベント
// ========================================
function setupGameEventListeners() {
    // 新しいゲームボタン
    const newGameBtn = document.getElementById('newGameBtn');
    const handleNewGame = (e) => {
        e.preventDefault();
        location.reload();
    };
    newGameBtn.addEventListener('touchstart', handleNewGame, { passive: false });
    newGameBtn.addEventListener('click', handleNewGame);
    
    // フルスクリーンボタン
    const fullscreenBtn = document.getElementById('fullscreenBtn');
    const handleFullscreen = (e) => {
        e.preventDefault();
        const canvas = document.getElementById('gameCanvas');
        if (canvas.requestFullscreen) {
            canvas.requestFullscreen();
        } else if (canvas.webkitRequestFullscreen) {
            canvas.webkitRequestFullscreen();
        }
    };
    fullscreenBtn.addEventListener('touchstart', handleFullscreen, { passive: false });
    fullscreenBtn.addEventListener('click', handleFullscreen);
    
    // 仮想コントローラーセットアップ
    setupVirtualControls();
}

// ========================================
// ギャラリー読み込み
// ========================================
async function loadGallery() {
    try {
        const response = await fetch(`${API_BASE_URL}/games`);
        const data = await response.json();
        
        const gallery = document.getElementById('gameGallery');
        
        if (data.success && data.games && data.games.length > 0) {
            gallery.innerHTML = data.games.map(game => `
                <div class="gallery-item">
                    <h4>${game.title}</h4>
                    <p>${game.description || ''}</p>
                    <div class="gallery-meta">
                        <span>🎮 ${game.plays || 0} プレイ</span>
                        <span>📅 ${new Date(game.created_at).toLocaleDateString('ja-JP')}</span>
                    </div>
                    <button class="btn-play" onclick="loadGame('${game.id}')">
                        ▶️ プレイ
                    </button>
                </div>
            `).join('');
        } else {
            gallery.innerHTML = '<p class="no-games">まだゲームが生成されていません</p>';
        }
    } catch (error) {
        console.error('ギャラリー読み込みエラー:', error);
    }
}

// ========================================
// ゲームロード
// ========================================
async function loadGame(gameId) {
    try {
        const response = await fetch(`${API_BASE_URL}/games/${gameId}`);
        const data = await response.json();
        
        if (data.success && data.game) {
            displayGame(data.game);
        }
    } catch (error) {
        console.error('ゲームロードエラー:', error);
        showError('ゲームの読み込みに失敗しました');
    }
}

// ========================================
// UIヘルパー
// ========================================
function setGenerating(isGenerating) {
    const generateBtn = document.getElementById('generateBtn');
    const btnText = generateBtn.querySelector('.btn-text');
    const btnLoading = generateBtn.querySelector('.btn-loading');
    
    if (isGenerating) {
        btnText.style.display = 'none';
        btnLoading.style.display = 'inline';
        generateBtn.disabled = true;
    } else {
        btnText.style.display = 'inline';
        btnLoading.style.display = 'none';
        generateBtn.disabled = false;
    }
}

function showError(message) {
    const errorDiv = document.getElementById('errorMessage');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
}

function hideError() {
    const errorDiv = document.getElementById('errorMessage');
    errorDiv.style.display = 'none';
}

// ========================================
// 仮想コントローラー (スマホ用)
// ========================================
function setupVirtualControls() {
    const leftBtn = document.getElementById('leftBtn');
    const rightBtn = document.getElementById('rightBtn');
    const actionBtn = document.getElementById('actionBtn');
    
    if (!leftBtn || !rightBtn || !actionBtn) {
        console.log('⚠️ 仮想コントローラーのボタンが見つかりません');
        return;
    }
    
    console.log('🎮 仮想コントローラーをセットアップ');
    
    // 左ボタン
    const handleLeft = (e) => {
        e.preventDefault();
        console.log('◀️ 左ボタン押下');
        simulateKeyPress('ArrowLeft');
    };
    
    leftBtn.addEventListener('touchstart', handleLeft, { passive: false });
    leftBtn.addEventListener('mousedown', handleLeft);
    
    // 右ボタン
    const handleRight = (e) => {
        e.preventDefault();
        console.log('▶️ 右ボタン押下');
        simulateKeyPress('ArrowRight');
    };
    
    rightBtn.addEventListener('touchstart', handleRight, { passive: false });
    rightBtn.addEventListener('mousedown', handleRight);
    
    // アクションボタン (スペースキー)
    const handleAction = (e) => {
        e.preventDefault();
        console.log('🎯 アクションボタン押下');
        simulateKeyPress(' '); // スペースキー
    };
    
    actionBtn.addEventListener('touchstart', handleAction, { passive: false });
    actionBtn.addEventListener('mousedown', handleAction);
}

// キーボードイベントをシミュレート
function simulateKeyPress(key) {
    // keydown イベント
    const keydownEvent = new KeyboardEvent('keydown', {
        key: key,
        code: key === 'ArrowLeft' ? 'ArrowLeft' : key === 'ArrowRight' ? 'ArrowRight' : 'Space',
        keyCode: key === 'ArrowLeft' ? 37 : key === 'ArrowRight' ? 39 : 32,
        which: key === 'ArrowLeft' ? 37 : key === 'ArrowRight' ? 39 : 32,
        bubbles: true,
        cancelable: true
    });
    
    document.dispatchEvent(keydownEvent);
    window.dispatchEvent(keydownEvent);
    
    // 少し遅延して keyup イベント
    setTimeout(() => {
        const keyupEvent = new KeyboardEvent('keyup', {
            key: key,
            code: key === 'ArrowLeft' ? 'ArrowLeft' : key === 'ArrowRight' ? 'ArrowRight' : 'Space',
            keyCode: key === 'ArrowLeft' ? 37 : key === 'ArrowRight' ? 39 : 32,
            which: key === 'ArrowLeft' ? 37 : key === 'ArrowRight' ? 39 : 32,
            bubbles: true,
            cancelable: true
        });
        
        document.dispatchEvent(keyupEvent);
        window.dispatchEvent(keyupEvent);
    }, 100);
}
