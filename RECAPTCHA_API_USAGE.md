# reCAPTCHA Enterprise API 使用方法

## リクエスト本文の作成

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

### 置き換えが必要な値

- **TOKEN**: `grecaptcha.enterprise.execute()` 呼び出しから返されたトークン
- **USER_ACTION**: 省略可。`grecaptcha.enterprise.execute()` 呼び出しで指定されたユーザー開始アクション（例: `"LOGIN"`）
- **siteKey**: reCAPTCHA Enterpriseサイトキー（`6Le8KA0sAAAAAJx-7m6uzI0LEkrExnWT5xmz62ZU`）

**重要**: レスポンストークンは2分後に無効になります。

## APIリクエストの送信

保存したJSONデータを含むHTTP POSTリクエストを以下のURLに送信します：

```
https://recaptchaenterprise.googleapis.com/v1/projects/simpleapp-5c1c6/assessments?key=API_KEY
```

### 置き換えが必要な値

- **API_KEY**: 現在のプロジェクトに関連付けられているAPIキー

### 完全なURL例

```
https://recaptchaenterprise.googleapis.com/v1/projects/simpleapp-5c1c6/assessments?key=AIzaSyBppdGm92dIijZi8V-LUZlnHphR6N6_78E
```

## cURLでの実行例

```bash
curl -X POST \
  'https://recaptchaenterprise.googleapis.com/v1/projects/simpleapp-5c1c6/assessments?key=AIzaSyBppdGm92dIijZi8V-LUZlnHphR6N6_78E' \
  -H 'Content-Type: application/json' \
  -d '{
    "event": {
      "token": "TOKEN",
      "expectedAction": "LOGIN",
      "siteKey": "6Le8KA0sAAAAAJx-7m6uzI0LEkrExnWT5xmz62ZU"
    }
  }'
```

## JavaScriptでの実行例

```javascript
const token = await grecaptcha.enterprise.execute('6Le8KA0sAAAAAJx-7m6uzI0LEkrExnWT5xmz62ZU', {action: 'LOGIN'});

const response = await fetch(
  'https://recaptchaenterprise.googleapis.com/v1/projects/simpleapp-5c1c6/assessments?key=AIzaSyBppdGm92dIijZi8V-LUZlnHphR6N6_78E',
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      event: {
        token: token,
        expectedAction: 'LOGIN',
        siteKey: '6Le8KA0sAAAAAJx-7m6uzI0LEkrExnWT5xmz62ZU'
      }
    })
  }
);

const result = await response.json();
console.log('Risk score:', result.riskAnalysis.score);
console.log('Valid:', result.tokenProperties.valid);
```

## ユーティリティ関数の使用

`utils/recaptcha-enterprise.ts`の関数を使用することもできます：

```typescript
import { verifyRecaptchaEnterprise } from '../utils/recaptcha-enterprise';

const token = await grecaptcha.enterprise.execute('6Le8KA0sAAAAAJx-7m6uzI0LEkrExnWT5xmz62ZU', {action: 'LOGIN'});

const result = await verifyRecaptchaEnterprise(
  token,
  '6Le8KA0sAAAAAJx-7m6uzI0LEkrExnWT5xmz62ZU',
  'LOGIN'
);

console.log('Risk score:', result.riskAnalysis.score);
console.log('Valid:', result.tokenProperties.valid);
```

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

## 重要な注意事項

1. **Firebase Phone Authenticationとの関係**: 通常、Firebase Phone Authenticationでは、Firebaseが自動的にreCAPTCHAの検証を処理します。手動でreCAPTCHA Enterprise APIを呼び出す必要はありません。

2. **トークンの有効期限**: レスポンストークンは2分後に無効になります。

3. **APIキーのセキュリティ**: APIキーをクライアント側のコードに直接記述しないでください。本番環境では、バックエンドサーバー経由でAPIを呼び出すことを推奨します。

