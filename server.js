const express = require('express');
const cors = require('cors');
const { generateGame } = require('./game-engine');

const app = express();
const PORT = process.env.PORT || 3000;

// ミドルウェア
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// ゲーム生成API
app.post('/api/generate', async (req, res) => {
    try {
        const { prompt } = req.body;
        
        if (!prompt) {
            return res.status(400).json({ 
                success: false,
                error: 'プロンプトが必要です' 
            });
        }
        
        console.log('🎮 ゲーム生成リクエスト:', prompt);
        
        // AI風の待ち時間（1〜2秒）
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
        
        // ゲームを生成
        const game = generateGame(prompt);
        
        console.log('✅ ゲーム生成成功:', game.type, game.theme, game.difficulty);
        
        res.json({
            success: true,
            game: {
                title: `${game.type} - ${prompt.slice(0, 30)}`,
                description: `テーマ: ${game.theme} | 難易度: ${game.difficulty}`,
                code: game.code,
                type: game.type,
                theme: game.theme,
                difficulty: game.difficulty
            }
        });
        
    } catch (error) {
        console.error('❌ ゲーム生成エラー:', error);
        res.status(500).json({ 
            success: false,
            error: 'ゲーム生成中にエラーが発生しました' 
        });
    }
});

// 生成されたゲーム一覧（メモリ内保存）
let games = [];

// ゲーム保存API
app.post('/api/games', (req, res) => {
    try {
        const { title, description, code } = req.body;
        
        const game = {
            id: Date.now().toString(),
            title,
            description,
            code,
            createdAt: new Date().toISOString(),
            plays: 0
        };
        
        games.unshift(game);
        
        // 最大50件まで保存
        if (games.length > 50) {
            games = games.slice(0, 50);
        }
        
        console.log('💾 ゲーム保存:', game.id, game.title);
        
        res.json({ success: true, game });
    } catch (error) {
        console.error('❌ ゲーム保存エラー:', error);
        res.status(500).json({ success: false, error: 'ゲーム保存に失敗しました' });
    }
});

// ゲーム一覧取得API
app.get('/api/games', (req, res) => {
    res.json({ success: true, games });
});

// ゲーム詳細取得API
app.get('/api/games/:id', (req, res) => {
    const game = games.find(g => g.id === req.params.id);
    
    if (!game) {
        return res.status(404).json({ success: false, error: 'ゲームが見つかりません' });
    }
    
    // プレイ回数を増やす
    game.plays++;
    
    res.json({ success: true, game });
});

// ヘルスチェック
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        message: 'AI Game Generator (Simple Version)',
        timestamp: new Date().toISOString(),
        gamesCount: games.length
    });
});

// サーバー起動
app.listen(PORT, () => {
    console.log(`🎮 AI Game Generator 起動: http://localhost:${PORT}`);
    console.log(`モード: シンプル版（APIキー不要）`);
});

module.exports = app;
