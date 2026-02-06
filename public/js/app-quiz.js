// ========================================
// グローバル変数
// ========================================
let currentQuestionIndex = 0;
let userInput = ''; // ユーザーの自由入力
let userSelections = {
    gameType: '',
    color: '',
    place: '',
    item: '',
    difficulty: ''
};

// API設定
const API_BASE_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:3000/api' 
    : '/api';

// ========================================
// 質問データ
// ========================================
const questions = [
    {
        id: 0,
        type: 'input',
        title: '<ruby>ふだん<rt>普段</rt></ruby>どんなゲームが<ruby>す<rt>好</rt></ruby>き？',
        subtitle: '<ruby>じゆう<rt>自由</rt></ruby>に<ruby>か<rt>書</rt></ruby>いてね！',
        placeholder: '例：マリオ、ポケモン、鬼ごっこ、パズル...',
        key: 'userInput'
    },
    {
        id: 1,
        title: '<ruby>す<rt>好</rt></ruby>きな<ruby>いろ<rt>色</rt></ruby>は？',
        key: 'color',
        options: [
            { icon: '🔴', text: '<ruby>あか<rt>赤</rt></ruby>', value: 'red' },
            { icon: '🔵', text: '<ruby>あお<rt>青</rt></ruby>', value: 'blue' },
            { icon: '🟢', text: '<ruby>みどり<rt>緑</rt></ruby>', value: 'green' },
            { icon: '🟡', text: '<ruby>きいろ<rt>黄色</rt></ruby>', value: 'yellow' },
            { icon: '🟣', text: '<ruby>むらさき<rt>紫</rt></ruby>', value: 'purple' },
            { icon: '🩷', text: 'ピンク', value: 'pink' },
            { icon: '🟠', text: 'オレンジ', value: 'orange' },
            { icon: '⚪', text: '<ruby>しろ<rt>白</rt></ruby>', value: 'white' }
        ]
    },
    {
        id: 2,
        title: 'どこで<ruby>あそ<rt>遊</rt></ruby>ぶ？',
        key: 'place',
        options: [
            { icon: '🚀', text: '<ruby>うちゅう<rt>宇宙</rt></ruby>', value: 'space' },
            { icon: '🌊', text: '<ruby>うみ<rt>海</rt></ruby>', value: 'ocean' },
            { icon: '🌲', text: '<ruby>もり<rt>森</rt></ruby>', value: 'forest' },
            { icon: '🌅', text: '<ruby>ゆうやけ<rt>夕焼け</rt></ruby>', value: 'sunset' },
            { icon: '🌙', text: '<ruby>よる<rt>夜</rt></ruby>', value: 'night' }
        ]
    },
    {
        id: 3,
        title: 'むずかしさは？',
        key: 'difficulty',
        options: [
            { icon: '😊', text: 'かんたん', value: 'easy' },
            { icon: '😐', text: 'ふつう', value: 'normal' },
            { icon: '😤', text: 'むずかしい', value: 'hard' }
        ]
    }
];

// ========================================
// 初期化
// ========================================
document.addEventListener('DOMContentLoaded', () => {
    console.log('🎮 質問式ゲームジェネレーター起動');
    showQuestion(0);
    setupGameEventListeners();
});

// ========================================
// 質問表示
// ========================================
function showQuestion(index) {
    const question = questions[index];
    currentQuestionIndex = index;

    // プログレスバー更新
    const totalSteps = questions.length;
    const currentStep = index + 1;
    document.getElementById('currentStep').textContent = currentStep;
    const progressPercent = (currentStep / totalSteps) * 100;
    document.getElementById('progressFill').style.width = progressPercent + '%';

    // 質問タイトル
    document.getElementById('questionTitle').innerHTML = question.title;

    // サブタイトル
    const subtitleEl = document.getElementById('questionSubtitle');
    if (question.subtitle) {
        document.getElementById('questionTitle').innerHTML = question.title;
        subtitleEl.style.display = 'block';
    } else {
        subtitleEl.style.display = 'none';
    }

    // 選択肢を生成
    const optionsContainer = document.getElementById('optionsContainer');
    optionsContainer.innerHTML = '';

    if (question.type === 'input') {
        // 自由入力
        const inputContainer = document.createElement('div');
        inputContainer.className = 'input-container';
        inputContainer.innerHTML = `
            <textarea 
                id="freeInput" 
                placeholder="${question.placeholder}"
                rows="4"
            >${userInput}</textarea>
            <button id="nextBtn" class="btn-next">
                <ruby>つぎ<rt>次</rt></ruby>へ →
            </button>
        `;
        optionsContainer.appendChild(inputContainer);

        // 次へボタンのイベント
        setTimeout(() => {
            document.getElementById('nextBtn').onclick = () => {
                const input = document.getElementById('freeInput').value.trim();
                if (input.length < 2) {
                    alert('もう少し詳しく書いてね！😊');
                    return;
                }
                userInput = input;
                analyzeUserInput(input);
                currentQuestionIndex++;
                showQuestion(currentQuestionIndex);
            };
        }, 100);

    } else {
        // 選択肢
        question.options.forEach(option => {
            const optionCard = document.createElement('div');
            optionCard.className = 'option-card';
            optionCard.innerHTML = `
                <div class="option-icon">${option.icon}</div>
                <div class="option-text">${option.text}</div>
            `;
            optionCard.onclick = () => selectOption(question.key, option.value);
            optionsContainer.appendChild(optionCard);
        });
    }

    // 戻るボタン表示
    const backBtn = document.getElementById('backBtn');
    if (index > 0) {
        backBtn.style.display = 'block';
        backBtn.onclick = () => showQuestion(index - 1);
    } else {
        backBtn.style.display = 'none';
    }
}

// ========================================
// ユーザー入力を分析
// ========================================
function analyzeUserInput(input) {
    console.log('🔍 入力を分析:', input);
    
    const text = input.toLowerCase();
    
    // ゲームタイプを推測
    const gameTypeKeywords = {
        'avoid': ['逃げ', 'にげ', '避け', 'さけ', '鬼ごっこ', 'おにごっこ', 'ランゲー', '走る', 'はしる'],
        'catch': ['集め', 'あつめ', 'キャッチ', 'きゃっち', '取る', 'とる', '拾う', 'ひろう', 'ポケモン', 'ぽけもん'],
        'shoot': ['撃つ', 'うつ', 'シュート', 'しゅーと', '攻撃', 'こうげき', '倒す', 'たおす', 'シューティング'],
        'jump': ['ジャンプ', 'じゃんぷ', '飛ぶ', 'とぶ', 'マリオ', 'まりお', 'タイミング', 'たいみんぐ'],
        'breakout': ['ブロック', 'ぶろっく', '崩し', 'くずし', 'breakout'],
        'memory': ['神経衰弱', 'しんけいすいじゃく', '記憶', 'きおく', 'カード', 'かーど', 'めくる', 'メモリー'],
        'puzzle': ['パズル', 'ぱずる', 'スライド', 'すらいど', '並べ', 'ならべ'],
        'clicker': ['クリック', 'くりっく', 'タップ', 'たっぷ', '連打', 'れんだ', 'クリッカー']
    };

    for (const [type, keywords] of Object.entries(gameTypeKeywords)) {
        if (keywords.some(keyword => text.includes(keyword))) {
            userSelections.gameType = type;
            console.log('✅ ゲームタイプ推測:', type);
            break;
        }
    }

    // アイテムを推測
    const itemKeywords = {
        'apple': ['りんご', 'リンゴ', '林檎', 'apple'],
        'star': ['星', 'ほし', 'スター', 'star'],
        'coin': ['コイン', 'こいん', 'coin', 'お金', 'おかね'],
        'heart': ['ハート', 'はーと', '心', 'heart', 'こころ'],
        'candy': ['キャンディ', 'きゃんでぃ', '飴', 'あめ', 'candy'],
        'ball': ['ボール', 'ぼーる', 'ball', '球', 'きゅう'],
        'flower': ['花', 'はな', 'フラワー', 'flower'],
        'diamond': ['ダイヤ', 'だいや', 'ダイヤモンド', 'diamond', '宝石', 'ほうせき']
    };

    for (const [item, keywords] of Object.entries(itemKeywords)) {
        if (keywords.some(keyword => text.includes(keyword))) {
            userSelections.item = item;
            console.log('✅ アイテム推測:', item);
            break;
        }
    }
}

// ========================================
// 選択肢選択
// ========================================
function selectOption(key, value) {
    console.log(`選択: ${key} = ${value}`);
    userSelections[key] = value;

    // 次の質問へ
    setTimeout(() => {
        currentQuestionIndex++;
        if (currentQuestionIndex < questions.length) {
            showQuestion(currentQuestionIndex);
        } else {
            showResult();
        }
    }, 300);
}

// ========================================
// 結果表示
// ========================================
function showResult() {
    console.log('🎉 結果表示:', { userInput, userSelections });

    // クイズセクションを非表示
    document.getElementById('quizSection').style.display = 'none';

    // 結果セクションを表示
    const resultSection = document.getElementById('resultSection');
    resultSection.style.display = 'block';

    // 結果を日本語に変換
    const gameNames = {
        'avoid': 'にげるゲーム',
        'catch': 'あつめるゲーム',
        'shoot': 'シューティング',
        'jump': 'ジャンプゲーム',
        'breakout': 'ブロックくずし',
        'memory': 'しんけいすいじゃく',
        'puzzle': 'パズル',
        'clicker': 'クリッカー'
    };

    const colorNames = {
        'red': 'あか', 'blue': 'あお', 'green': 'みどり', 'yellow': 'きいろ',
        'purple': 'むらさき', 'pink': 'ピンク', 'orange': 'オレンジ', 'white': 'しろ'
    };

    const placeNames = {
        'space': 'うちゅう', 'ocean': 'うみ', 'forest': 'もり',
        'sunset': 'ゆうやけ', 'night': 'よる'
    };

    const itemNames = {
        'apple': 'リンゴ', 'star': 'ほし', 'coin': 'コイン', 'heart': 'ハート',
        'candy': 'キャンディ', 'ball': 'ボール', 'flower': 'はな', 'diamond': 'ダイヤ'
    };

    const difficultyNames = {
        'easy': 'かんたん', 'normal': 'ふつう', 'hard': 'むずかしい'
    };

    // 結果を表示
    document.getElementById('resultInput').textContent = userInput;
    document.getElementById('resultGame').textContent = userSelections.gameType ? (gameNames[userSelections.gameType] || 'おまかせ') : 'おまかせ';
    document.getElementById('resultColor').textContent = colorNames[userSelections.color] || '???';
    document.getElementById('resultPlace').textContent = placeNames[userSelections.place] || '???';
    document.getElementById('resultItem').textContent = userSelections.item ? (itemNames[userSelections.item] || 'おまかせ') : 'おまかせ';
    document.getElementById('resultLevel').textContent = difficultyNames[userSelections.difficulty] || '???';

    // 遊ぶボタン
    document.getElementById('playBtn').onclick = generateGameFromSelections;
}

// ========================================
// ゲーム生成
// ========================================
async function generateGameFromSelections() {
    console.log('🎮 ゲーム生成開始:', { userInput, userSelections });

    // プロンプトを生成
    const prompt = buildPromptFromSelections(userInput, userSelections);
    console.log('📝 生成されたプロンプト:', prompt);

    // 結果セクションを非表示
    document.getElementById('resultSection').style.display = 'none';

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
        } else {
            throw new Error('ゲームデータが取得できませんでした');
        }

    } catch (error) {
        console.error('❌ エラー:', error);
        alert('ゲーム生成に失敗しました: ' + error.message);
        
        // クイズに戻る
        document.getElementById('quizSection').style.display = 'block';
        currentQuestionIndex = 0;
        showQuestion(0);
    }
}

// ========================================
// プロンプト生成
// ========================================
function buildPromptFromSelections(input, selections) {
    // ユーザー入力をベースにする
    let prompt = input;

    // 場所を追加
    const placeMap = {
        'space': '宇宙',
        'ocean': '海',
        'forest': '森',
        'sunset': '夕焼け',
        'night': '夜'
    };

    if (selections.place) {
        prompt += ` ${placeMap[selections.place]}`;
    }

    // 難易度を追加
    const difficultyMap = {
        'easy': '簡単',
        'normal': '普通',
        'hard': '難しい'
    };

    if (selections.difficulty) {
        prompt += ` ${difficultyMap[selections.difficulty]}`;
    }

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
        alert('ゲームの起動に失敗しました');
    }
}

// ========================================
// ゲームイベント
// ========================================
function setupGameEventListeners() {
    // 新しいゲームボタン
    document.getElementById('newGameBtn').onclick = () => {
        location.reload();
    };

    // フルスクリーンボタン
    document.getElementById('fullscreenBtn').onclick = () => {
        const canvas = document.getElementById('gameCanvas');
        if (canvas.requestFullscreen) {
            canvas.requestFullscreen();
        } else if (canvas.webkitRequestFullscreen) {
            canvas.webkitRequestFullscreen();
        }
    };
}
