# 手動検証ガイド

## 現在の実装

`app/phone-auth.tsx`に手動検証のコードを追加しました。以下の流れで動作します：

### 1. トークンの取得
```typescript
const recaptchaToken = await recaptchaVerifier.current.verify();
```

### 2. 手動検証の実行
```typescript
const verificationResult = await verifyRecaptchaEnterprise(
  recaptchaToken,
  '6Le8KA0sAAAAAJx-7m6uzI0LEkrExnWT5xmz62ZU',
  'LOGIN'
);
```

### 3. 検証結果の確認
コンソールに以下の情報が出力されます：
- `valid`: トークンが有効かどうか
- `riskScore`: リスクスコア（0.0-1.0、高いほど安全）
- `action`: アクション名（"LOGIN"）
- `hostname`: ホスト名

## 動作確認方法

1. **アプリを実行**
   ```bash
   npm start
   # または
   npx expo start
   ```

2. **電話番号認証画面で「Start Verification」を押す**

3. **コンソールログを確認**
   以下のログが出力されます：
   ```
   [PhoneAuth] reCAPTCHA token obtained: ...
   [PhoneAuth] Verifying reCAPTCHA token manually...
   [PhoneAuth] reCAPTCHA verification result: {
     valid: true,
     riskScore: 0.9,
     action: "LOGIN",
     hostname: "localhost"
   }
   [PhoneAuth] reCAPTCHA token verified successfully
   ```

## 検証結果の見方

### 成功時
- `valid: true` - トークンが有効
- `riskScore: 0.5以上` - リスクが低い（推奨）
- `action: "LOGIN"` - アクションが一致

### 警告時
- `riskScore: 0.5未満` - リスクが高い（警告が表示されます）
- ただし、Firebase Phone Authenticationは続行されます

### エラー時
- `valid: false` - トークンが無効
- エラーメッセージが表示されます
- Firebase Phone Authenticationは続行されます（Firebaseも検証します）

## トラブルシューティング

### トークンが取得できない
- `RecaptchaVerifier`が正しく初期化されているか確認
- WebViewでreCAPTCHA Enterpriseが正しく読み込まれているか確認

### 検証APIが失敗する
- `EXPO_PUBLIC_FIREBASE_API_KEY`が正しく設定されているか確認
- APIキーにreCAPTCHA Enterprise APIへのアクセス権限があるか確認

### リスクスコアが低い
- これは警告のみで、Firebase Phone Authenticationは続行されます
- 本番環境では、リスクスコアに基づいて追加の検証を行うことを検討してください

## 注意事項

1. **手動検証はオプション**: 手動検証が失敗しても、Firebase Phone Authenticationは続行されます（Firebaseも検証します）

2. **トークンの有効期限**: reCAPTCHAトークンは2分後に無効になります

3. **APIキーのセキュリティ**: 本番環境では、APIキーをクライアント側のコードに直接記述しないでください

