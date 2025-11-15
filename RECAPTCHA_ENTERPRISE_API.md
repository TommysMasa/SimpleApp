# reCAPTCHA Enterprise API 手動検証ガイド

## 重要な注意事項

**通常、Firebase Phone Authenticationでは、Firebaseが自動的にreCAPTCHAの検証を処理します。手動でreCAPTCHA Enterprise APIを呼び出す必要はありません。**

このガイドは、デバッグ目的やカスタム検証が必要な場合のみ使用してください。

## 現在の実装について

現在の実装では、`signInWithPhoneNumber`を呼び出すと、Firebaseが内部的に以下の処理を行います：

1. `RecaptchaVerifier`がreCAPTCHAトークンを取得
2. Firebaseが自動的にreCAPTCHAトークンを検証
3. 電話番号認証を処理

したがって、手動でreCAPTCHA Enterprise APIを呼び出す必要はありません。

## 手動検証が必要な場合

もし手動でreCAPTCHA Enterprise APIを呼び出す必要がある場合は、以下の手順に従ってください。

### 1. リクエスト本文の作成

`request.json`ファイルを作成し、以下の形式で記述します：

```json
{
  "event": {
    "token": "TOKEN",
    "expectedAction": "USER_ACTION",
    "siteKey": "6Le8KA0sAAAAAJx-7m6uzI0LEkrExnWT5xmz62ZU"
  }
}
```

**置き換えが必要な値：**
- `TOKEN`: `grecaptcha.enterprise.execute()` 呼び出しから返されたトークン
- `USER_ACTION`: 省略可。`grecaptcha.enterprise.execute()` 呼び出しで指定されたユーザー開始アクション（例: `"LOGIN"`）
- `siteKey`: reCAPTCHA Enterpriseサイトキー（`6Le8KA0sAAAAAJx-7m6uzI0LEkrExnWT5xmz62ZU`）

**注意**: レスポンストークンは2分後に無効になります。

### 2. APIリクエストの送信

保存したJSONデータを含むHTTP POSTリクエストを以下のURLに送信します：

```
https://recaptchaenterprise.googleapis.com/v1/projects/simpleapp-5c1c6/assessments?key=API_KEY
```

**置き換えが必要な値：**
- `API_KEY`: 現在のプロジェクトに関連付けられているAPIキー（`EXPO_PUBLIC_FIREBASE_API_KEY`の値: `AIzaSyBppdGm92dIijZi8V-LUZlnHphR6N6_78E`）

**完全なURL例：**
```
https://recaptchaenterprise.googleapis.com/v1/projects/simpleapp-5c1c6/assessments?key=AIzaSyBppdGm92dIijZi8V-LUZlnHphR6N6_78E
```

### 3. ユーティリティ関数の使用

`utils/recaptcha-enterprise.ts`にユーティリティ関数を用意しています：

```typescript
import { verifyRecaptchaEnterprise, saveRequestJson } from '../utils/recaptcha-enterprise';

// トークンを検証
const result = await verifyRecaptchaEnterprise(
  token, // reCAPTCHAトークン
  '6Le8KA0sAAAAAJx-7m6uzI0LEkrExnWT5xmz62ZU', // サイトキー
  'LOGIN' // アクション（オプション）
);

console.log('Risk score:', result.riskAnalysis.score);
console.log('Valid:', result.tokenProperties.valid);

// リクエストJSONを保存（デバッグ用）
saveRequestJson(token, siteKey, 'LOGIN', 'request.json');
```

## 環境変数の確認

以下の環境変数が設定されていることを確認してください：

- `EXPO_PUBLIC_FIREBASE_API_KEY`: Google Cloud APIキー
- `EXPO_PUBLIC_FIREBASE_PROJECT_ID`: プロジェクトID（デフォルト: `simpleapp-5c1c6`）

## レスポンスの例

成功時のレスポンス例：

```json
{
  "tokenProperties": {
    "valid": true,
    "hostname": "localhost",
    "action": "LOGIN",
    "createTime": "2024-01-01T00:00:00Z"
  },
  "riskAnalysis": {
    "score": 0.9,
    "reasons": []
  },
  "event": {
    "token": "...",
    "siteKey": "6Le8KA0sAAAAAJx-7m6uzI0LEkrExnWT5xmz62ZU",
    "userAgent": "...",
    "expectedAction": "LOGIN"
  }
}
```

## トラブルシューティング

### APIキーが見つからない

- `.env`ファイルまたは`eas.json`で`EXPO_PUBLIC_FIREBASE_API_KEY`が設定されているか確認
- Firebase Console > プロジェクト設定 > 全般 > APIキーで確認

### 403エラーが発生する

- APIキーにreCAPTCHA Enterprise APIへのアクセス権限があるか確認
- Google Cloud Console > APIとサービス > 有効なAPIで「reCAPTCHA Enterprise API」が有効になっているか確認

### トークンが無効

- トークンが有効期限内か確認（通常、reCAPTCHAトークンは2分間有効）
- サイトキーが正しいか確認

## まとめ

**推奨**: Firebase Phone Authenticationを使用する場合、手動でreCAPTCHA Enterprise APIを呼び出す必要はありません。Firebaseが自動的に処理します。

このガイドは、デバッグ目的やカスタム検証が必要な場合のみ使用してください。

