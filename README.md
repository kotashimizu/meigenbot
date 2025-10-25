# WiseTalk - 偉人の言葉チャットボット

偉人たちの知恵をチャット形式で届けるWebアプリケーションです。

## 概要

WiseTalkは、ブラウザ上で動作するチャット形式の名言ボットです。
n8nで構築されたAPIと連携し、毎回異なる偉人の名言を提供します。

## 特徴

- 📱 **レスポンシブデザイン**: PC・スマホ両対応
- 💬 **チャットUI**: 直感的なチャット形式のインターフェース
- 🎨 **洗練されたデザイン**: ICHIブランドのトンマナに準拠
- ⚡ **高速表示**: Vanilla JavaScript使用で軽量・高速
- 🔄 **スムーズなアニメーション**: フェードイン・スライドアニメーション

## 技術スタック

- **フロントエンド**: HTML5, CSS3, Vanilla JavaScript
- **バックエンド**: n8n Webhook API
- **フォント**: Google Fonts (Noto Sans JP, Playfair Display)

## カラースキーム

- メインカラー: `#1A2B4C` (濃いネイビー)
- アクセントカラー: `#00A99D` (ターコイズ)
- 背景色: `#F5F7FA` (明るいグレー)

## ディレクトリ構成

```
meigenbot/
├── public/
│   ├── index.html          # メインHTMLファイル
│   ├── css/
│   │   └── style.css       # スタイルシート
│   ├── js/
│   │   └── app.js          # JavaScriptアプリケーション
│   └── ICHI. トンマナ .png  # トンマナ参考画像
├── data/                    # データ保存用ディレクトリ
└── README.md               # このファイル
```

## セットアップ

### 1. リポジトリのクローン

```bash
cd /Users/kota5656/projects/meigenbot
```

### 2. ローカルサーバーの起動

以下のいずれかの方法でローカルサーバーを起動してください。

#### Python3を使用する場合:

```bash
cd public
python3 -m http.server 8000
```

#### Node.jsを使用する場合:

```bash
# http-serverをインストール（初回のみ）
npm install -g http-server

# サーバー起動
cd public
http-server -p 8000
```

#### PHPを使用する場合:

```bash
cd public
php -S localhost:8000
```

### 3. ブラウザでアクセス

ブラウザで以下のURLにアクセスしてください:

```
http://localhost:8000
```

## 使い方

1. ページを開くと、初期メッセージが表示されます
2. 「名言をもらう 💬」ボタンをクリック
3. チャット形式で偉人の名言が表示されます
4. 何度でもボタンをクリックして、新しい名言を取得できます

## API仕様

### エンドポイント

```
GET https://n8n.ichi-dify.com/webhook/394837e1-cffc-436e-b568-79404f497be6
```

### レスポンス形式

```json
{
  "date": "2025年10月25日（土）",
  "quote": "夢を見ることができれば、それは実現できる。",
  "author": "ウォルト・ディズニー",
  "bio": "アニメーションの父。ミッキーマウスを生み出し、夢と希望を世界に広めた。"
}
```

または配列形式:

```json
[
  {
    "date": "2025年10月25日（土）",
    "quote": "夢を見ることができれば、それは実現できる。",
    "author": "ウォルト・ディズニー",
    "bio": "アニメーションの父。ミッキーマウスを生み出し、夢と希望を世界に広めた。"
  }
]
```

## カスタマイズ

### API URLの変更

`public/js/app.js` の `CONFIG.API_URL` を変更してください:

```javascript
const CONFIG = {
    API_URL: 'your-new-api-url',
    // ...
};
```

### カラースキームの変更

`public/css/style.css` の CSS変数を変更してください:

```css
:root {
    --primary-color: #1A2B4C;
    --accent-color: #00A99D;
    --background-color: #F5F7FA;
    /* ... */
}
```

## ブラウザ対応

- Chrome (最新版)
- Firefox (最新版)
- Safari (最新版)
- Edge (最新版)
- モバイルブラウザ対応

## トラブルシューティング

### 名言が表示されない場合

1. ブラウザのコンソールを開いて、エラーメッセージを確認
2. n8n APIが正常に動作しているか確認
3. CORS設定が適切か確認
4. ネットワーク接続を確認

### スタイルが適用されない場合

1. ブラウザのキャッシュをクリア
2. CSSファイルのパスが正しいか確認
3. ブラウザの開発者ツールでCSSが読み込まれているか確認

## ライセンス

© 2025 WiseTalk. All rights reserved.

## 連絡先

プロジェクトに関するお問い合わせは、開発チームまでご連絡ください。
