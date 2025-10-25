# n8n 名言データ設定ガイド

WiseTalkで100以上の名言をランダムに表示するためのn8n設定手順です。

## 前提条件

- n8nワークフローが既に作成されている
- Webhook URL: `https://n8n.ichi-dify.com/webhook/394837e1-cffc-436e-b568-79404f497be6`

## 推奨構成

### オプション1: JSONファイルを使用（推奨）

100以上の名言をJSONファイルで管理し、ランダムに選択する方法です。

#### 1. 名言データの準備

名言データをJSON形式で準備します：

```json
[
  {
    "quote": "夢を見ることができれば、それは実現できる。",
    "author": "ウォルト・ディズニー",
    "bio": "アニメーションの父。ミッキーマウスを生み出し、夢と希望を世界に広めた。"
  },
  {
    "quote": "成功とは、失敗から失敗へと情熱を失わずに進むことである。",
    "author": "ウィンストン・チャーチル",
    "bio": "イギリスの政治家。第二次世界大戦を勝利に導いた名宰相。"
  },
  {
    "quote": "人生とは自転車のようなものだ。倒れないためには走り続けなければならない。",
    "author": "アルベルト・アインシュタイン",
    "bio": "理論物理学者。相対性理論を発表し、現代物理学の基礎を築いた。"
  }
  // ... 100件以上のデータ
]
```

#### 2. n8nワークフロー構成

1. **Webhookノード**
   - Method: GET
   - Path: 既存のパス

2. **HTTPリクエストノード** または **Read Binary Fileノード**
   - 名言データのJSONファイルを読み込む
   - 外部URL（例: GitHub Pages）またはローカルファイル

3. **Functionノード** - ランダム選択
   ```javascript
   // 名言データを取得
   const quotes = $input.first().json;

   // ランダムに1件選択
   const randomIndex = Math.floor(Math.random() * quotes.length);
   const selectedQuote = quotes[randomIndex];

   // 日付を追加
   const today = new Date();
   const dateStr = today.toLocaleDateString('ja-JP', {
     year: 'numeric',
     month: 'long',
     day: 'numeric',
     weekday: 'short'
   });

   return {
     json: {
       date: dateStr,
       quote: selectedQuote.quote,
       author: selectedQuote.author,
       bio: selectedQuote.bio
     }
   };
   ```

4. **Respondノード**
   - Response Code: 200
   - Response Body: {{ $json }}

### オプション2: データベースを使用

Supabase、Airtable、Google Sheetsなどのデータベースを使用する方法です。

#### Supabaseの例

1. **Supabaseでテーブル作成**
   ```sql
   CREATE TABLE quotes (
     id SERIAL PRIMARY KEY,
     quote TEXT NOT NULL,
     author VARCHAR(255) NOT NULL,
     bio TEXT,
     created_at TIMESTAMP DEFAULT NOW()
   );
   ```

2. **n8nでSupabaseノードを追加**
   - Operation: Get All
   - Table: quotes
   - Return All: Yes

3. **Functionノードでランダム選択**
   ```javascript
   const quotes = $input.first().json;
   const randomIndex = Math.floor(Math.random() * quotes.length);
   return { json: quotes[randomIndex] };
   ```

### オプション3: スプレッドシート（Google Sheets）

1. **Google Sheetsで名言リストを作成**
   - A列: quote（名言）
   - B列: author（著者）
   - C列: bio（経歴）

2. **n8nでGoogle Sheetsノードを追加**
   - Operation: Get All
   - Range: A2:C (ヘッダー行を除く)

3. **Functionノードでランダム選択**

## 名言データの例（100件以上推奨）

以下のカテゴリで100件以上の名言を準備することを推奨します：

### カテゴリ例
1. **成功・目標達成** (20件)
2. **努力・忍耐** (20件)
3. **人生・生き方** (20件)
4. **愛・人間関係** (15件)
5. **挑戦・冒険** (15件)
6. **知恵・学び** (10件)

### 名言サンプル

```json
[
  {
    "quote": "夢を見ることができれば、それは実現できる。",
    "author": "ウォルト・ディズニー",
    "bio": "アニメーションの父。ミッキーマウスを生み出し、夢と希望を世界に広めた。"
  },
  {
    "quote": "成功とは、失敗から失敗へと情熱を失わずに進むことである。",
    "author": "ウィンストン・チャーチル",
    "bio": "イギリスの政治家。第二次世界大戦を勝利に導いた名宰相。"
  },
  {
    "quote": "人生とは自転車のようなものだ。倒れないためには走り続けなければならない。",
    "author": "アルベルト・アインシュタイン",
    "bio": "理論物理学者。相対性理論を発表し、現代物理学の基礎を築いた。"
  },
  {
    "quote": "未来を予測する最良の方法は、それを発明することだ。",
    "author": "アラン・ケイ",
    "bio": "コンピューター科学者。パーソナルコンピューターの概念を生み出した。"
  },
  {
    "quote": "天才とは1%のひらめきと99%の努力である。",
    "author": "トーマス・エジソン",
    "bio": "発明王。電球や蓄音機など、数多くの発明で人類に貢献した。"
  }
]
```

## フロントエンド側の重複防止機能

フロントエンド（JavaScript）側で以下の機能を実装済みです：

1. **localStorageで表示済み名言を記録**
   - 一度表示した名言は記録される
   - ブラウザを閉じても記録は保持される

2. **重複チェック**
   - APIから取得した名言が既に表示済みの場合、最大5回まで再取得を試行
   - 5回試行しても新しい名言が取得できない場合は、重複を許容

3. **リセット機能**
   - ブラウザのlocalStorageをクリアすることで履歴をリセット可能
   - 開発者ツールのコンソールで `localStorage.clear()` を実行

## 推奨事項

1. **最低100件、理想は200件以上の名言を準備**
   - 重複を避けるため、できるだけ多くのデータを用意する

2. **定期的なデータ更新**
   - 季節やイベントに応じた名言を追加

3. **カテゴリ分け**
   - ビジネス、人生、愛、成功など、カテゴリ別に整理

4. **品質管理**
   - 誤字脱字のチェック
   - 著者情報の正確性確認
   - 適切な長さ（読みやすさ）

## トラブルシューティング

### 同じ名言が繰り返し表示される

**原因**: n8n側の名言データが少ない

**解決策**:
1. n8nのデータソースに100件以上の名言を追加
2. フロントエンド側のlocalStorageをクリア
3. ブラウザで `localStorage.clear()` を実行して履歴をリセット

### APIエラーが発生する

**原因**: n8nワークフローの設定エラー

**解決策**:
1. n8nワークフローが有効化されているか確認
2. Webhook URLが正しいか確認
3. n8nのログでエラー内容を確認

## 参考資料

- [n8n公式ドキュメント](https://docs.n8n.io/)
- [n8n Webhook設定](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.webhook/)
- [JavaScriptでのランダム選択](https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Math/random)

---

このガイドに従って、100以上の偉人の名言を設定し、ユーザーに多様な名言体験を提供してください。
