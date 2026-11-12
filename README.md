# ポイマ｜モバイルサービスサイト

2026-11-03に確認された3枚のモバイルデザインをもとにした、ビルド不要のHTML/CSS/JavaScript実装です。

## 表示

`index.html` がページ本体です。以前の `mobile.html` はクエリとアンカーを維持して本体へ移動します。スマホでは画面幅に合わせ、PCでは最大430pxのモバイルページとして表示します。

```sh
python3 -m http.server 4327 --bind 127.0.0.1 --directory sites/poima-github-pages
```

リポジトリルートで実行後、`http://127.0.0.1:4327/` を開きます。

## 実装した動作

- メニューとページ内移動、FAQ・ポイント説明の開閉。
- 遊び方は「チケット獲得 → 予想 → 的中でポイント獲得 → 報酬と交換」の4ステップ。画面を縦に配置した100dvhのステージで、スクロール量に応じてコピーと実アプリ画像が切り替わります。モーション軽減設定では静的な4ステップ表示に切り替わります。実際の参加・付与はありません。
- HOW TO PLAYの次に報酬案内、その次にデイリーパックを表示。えらべるPayの正式ロゴと交換の流れを掲載し、詳細な条件は折りたたみます。
- 背景をぼかしたパック開封。上端のスワイプ／タップ／Enterに対応し、5枚のサンプルチケットをめくれます。Escape、背景タップで閉じられ、起動ボタンにフォーカスを戻します。
- モーション軽減設定とキーボード操作に対応。
- 公開前／配信開始後のCTA切り替え。`?phase=live` で配信開始後の文言を確認できます。

## 接続先

`site-config.js` の `phase`、`exchangeAvailable`、`notificationUrl`、`downloadUrl`、`infoLinks` で指定します。URLが空の間は準備中の案内を表示し、登録・送信・ストアへの移動はしません。HTTPSの接続先のみ受け付けます。

開封結果と掲載のお題はサンプルです。実際のチケット・ポイントの付与、通知登録、ギフト交換はこのサイトから行いません。

## 素材と確認記録

写真、ブランド、パックは個別のWebP素材、文字とカードはHTML/CSSです。モック画像をページ全体に貼る実装ではありません。PNG原本は残し、配信では圧縮したWebPを使っています。

- 基準画像: `output/design/service-site-mobile-full-2026-11-03/`
- 変更前バックアップ: `output/implementation/service-site-mobile-2026-11-03/before/`
- 操作・レイアウト検証と実画面: `output/implementation/service-site-mobile-2026-11-03/`
- 青空・ライブ写真: 組み込みimage_genで生成。プロンプトは同確認フォルダの `asset-prompts.json`。

## 公開先

`https://poima.app/` をGitHub Pages（`yshk0402/poima-service-site`、`codex/github-pages`ブランチのルート）へ接続します。カスタムドメインは `CNAME` に保持します。

LPの公開とアプリ・ポイント交換の提供開始は別です。現状は `phase: prelaunch`、`exchangeAvailable: false` を維持し、未設定の通知受付・ストアリンクを提供中と表示しません。

2026-11-12の公開記録と表示検証は、作業元の `output/deployment/service-site-poima-app-2026-11-12/` に保存します。
