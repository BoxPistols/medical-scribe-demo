# テーマカラー管理システム

このアプリケーションのテーマカラーは一元管理されており、ライト/ダークモード両方に対応しています。

## CSS変数 (globals.css)

すべてのカラーは CSS カスタムプロパティとして定義されています：

### 背景色
- `--bg-primary`: メイン背景
- `--bg-secondary`: セカンダリ背景
- `--bg-tertiary`: ターシャリ背景
- `--glass-bg`: ガラスモーフィズム背景（弱）
- `--glass-bg-strong`: ガラスモーフィズム背景（強）

### テキストカラー
- `--text-primary`: メインテキスト
- `--text-secondary`: セカンダリテキスト
- `--text-tertiary`: ターシャリテキスト（最も薄い）
- `--text-muted`: ミュートテキスト

### ボーダーカラー
- `--border-light`: ライトボーダー
- `--border-medium`: ミディアムボーダー
- `--glass-border`: ガラスモーフィズムボーダー

### アクセントカラー
- `--accent-primary`: メインアクセント（ティファニーブルー）
- `--accent-warm`: ウォームアクセント（オレンジ）
- `--accent-success`: サクセスカラー

### SOAPカラー
- `--soap-s`: Subjective（アンバー/オレンジ）
- `--soap-o`: Objective（ティール）
- `--soap-a`: Assessment（ピンク）
- `--soap-p`: Plan（グリーン）

### モーダル/ダイアログ
- `--modal-header-bg`: モーダルヘッダー背景
- `--modal-footer-bg`: モーダルフッター背景
- `--modal-card-bg`: モーダルカード背景

### 警告
- `--warning-bg`: 警告背景
- `--warning-border`: 警告ボーダー
- `--warning-text`: 警告テキスト

## ユーティリティクラス

これらのクラスを使用することで、ライト/ダークモードが自動的に切り替わります：

### テキストカラー
```css
.text-theme-primary        /* メインテキスト */
.text-theme-secondary      /* セカンダリテキスト */
.text-theme-tertiary       /* ターシャリテキスト（薄い） */
.text-theme-muted          /* ミュートテキスト */
.text-theme-accent         /* アクセントカラー */
.text-theme-warning        /* 警告テキスト */
.text-theme-help-icon      /* ヘルプアイコン */
.text-theme-active         /* アクティブ状態（白） */
```

### 背景カラー
```css
.bg-theme-primary          /* メイン背景 */
.bg-theme-secondary        /* セカンダリ背景 */
.bg-theme-tertiary         /* ターシャリ背景 */
.bg-theme-surface          /* サーフェス背景 */
.bg-theme-card             /* カード背景 */
.bg-theme-glass            /* ガラスモーフィズム背景（弱） */
.bg-theme-glass-strong     /* ガラスモーフィズム背景（強） */
.bg-theme-accent           /* アクセント背景 */
.bg-theme-active           /* アクティブ状態背景 */
.bg-theme-highlight        /* ハイライト背景 */
.bg-theme-overlay          /* モーダルオーバーレイ */
.bg-theme-modal            /* モーダルコンテナ */
.bg-theme-interactive      /* インタラクティブ要素背景 */
.bg-theme-table-header     /* テーブルヘッダー背景（微妙） */
```

### モーダル専用
```css
.bg-theme-modal-header     /* モーダルヘッダー背景 */
.bg-theme-modal-footer     /* モーダルフッター背景 */
.bg-theme-modal-card       /* モーダルカード背景 */
```

### 警告
```css
.bg-theme-warning          /* 警告背景 */
.border-theme-warning      /* 警告ボーダー */
.text-theme-warning        /* 警告テキスト */
```

### ボーダー
```css
.border-theme-light        /* ライトボーダー */
.border-theme-medium       /* ミディアムボーダー */
.border-theme-glass        /* ガラスモーフィズムボーダー */
.border-theme-modal        /* モーダルボーダー */
.border-theme-soft         /* ソフトボーダー（テーブル用・薄い） */
```

### 区切り線
```css
.divide-theme-border       /* 通常の区切り線 */
.divide-theme-soft         /* ソフトな区切り線（テーブル用・薄い） */
```

### ホバー状態
```css
.hover:bg-theme-interactive-hover:hover  /* インタラクティブ要素ホバー */
```

## 使用例

### テーブル（柔らかいコントラスト）
```tsx
<div className="rounded border border-theme-soft overflow-hidden">
  <table className="w-full text-xs">
    <tbody className="divide-y divide-theme-soft">
      <tr>
        <td className="px-3 py-2 bg-theme-table-header font-semibold text-theme-tertiary">
          ラベル
        </td>
        <td className="px-3 py-2 text-theme-secondary">
          値
        </td>
      </tr>
    </tbody>
  </table>
</div>
```

### ドロップダウンメニュー
```tsx
<div className="absolute bg-theme-surface rounded-md shadow-lg border border-theme-glass">
  <button className="w-full text-left px-3 py-2 text-xs text-theme-primary hover:bg-theme-card">
    メニュー項目
  </button>
</div>
```

### モーダル
```tsx
<div className="fixed inset-0 bg-theme-overlay backdrop-blur-sm">
  <div className="bg-theme-modal backdrop-blur-xl rounded-2xl border border-theme-modal">
    <div className="bg-theme-modal-header rounded-t-2xl border-b border-theme-border">
      ヘッダー
    </div>
    <div className="flex-1">
      コンテンツ
    </div>
    <div className="bg-theme-modal-footer rounded-b-2xl border-t border-theme-border">
      フッター
    </div>
  </div>
</div>
```

### アクティブボタン
```tsx
<button className={`
  px-3 py-1.5 rounded-md transition-colors
  ${isActive
    ? 'bg-theme-active'
    : 'bg-theme-surface text-theme-primary border border-theme-border hover:bg-theme-card'
  }
`}>
  ボタン
</button>
```

## ベストプラクティス

1. **直接的なTailwindのカラークラスを使用しない**
   - ❌ `bg-white`, `dark:bg-gray-900`, `text-gray-500`
   - ✅ `bg-theme-surface`, `text-theme-secondary`

2. **CSS変数を使用する場合**
   - インラインスタイルで: `style={{ background: 'var(--soap-s)' }}`
   - グラデーション: `style={{ background: 'var(--gradient-primary)' }}`

3. **コントラストレベル**
   - 強調したいUI: `text-theme-primary` + `bg-theme-surface`
   - 通常のUI: `text-theme-secondary` + `bg-theme-card`
   - 微妙なUI: `text-theme-tertiary` + `bg-theme-table-header`
   - 最も薄いUI: `text-theme-muted` + 背景透明

4. **ボーダーの使い分け**
   - 通常のボーダー: `border-theme-light`
   - 微妙なボーダー: `border-theme-soft`（テーブル、フッターなど）
   - ガラスモーフィズム: `border-theme-glass`

## メンテナンス

新しいカラーが必要な場合：

1. `globals.css`の`:root`と`[data-theme="dark"]`に CSS 変数を追加
2. 対応するユーティリティクラスを作成
3. このドキュメントを更新

これにより、すべてのコンポーネントが自動的にライト/ダークモードに対応します。
