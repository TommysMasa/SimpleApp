# reCAPTCHA設定ガイド

## 重要なポイント

**Firebase Phone Authenticationでは、通常はFirebaseが自動的にreCAPTCHAを管理するため、明示的なreCAPTCHAキーの作成は不要です。**

ただし、`auth/internal-error`が発生している場合は、以下の設定を確認してください。

## 1. Firebase Consoleでの設定確認

### Phone Authenticationの有効化

1. **Firebase Console**にアクセス
   - https://console.firebase.google.com/
   - プロジェクト「SimpleApp」を選択

2. **Authentication > Sign-in method**に移動
   - Phone認証が有効になっているか確認
   - 有効になっていない場合は、有効化してください

3. **reCAPTCHAの設定確認**
   - Phone認証の設定で、reCAPTCHAの設定を確認
   - 通常は「reCAPTCHA Enterprise」または「reCAPTCHA v2」が自動的に使用されます

## 2. カスタムreCAPTCHAキーが必要な場合

もしカスタムreCAPTCHAキーを作成する必要がある場合：

### アプリケーションの種類の選択

**「Web」を選択してください**

理由：
- iOSアプリでは、WebView内でFirebase Web SDKのreCAPTCHAを使用しています
- `RecaptchaVerifier.tsx`では、WebView内でHTMLを読み込んでFirebase compat版のreCAPTCHAを使用しています
- これは実質的に「Web」アプリケーションとして扱われます

### ドメインの設定

WebView内でreCAPTCHAを使用する場合、以下のドメインを追加してください：

1. **`localhost`** - 開発環境用
2. **実際のドメイン**（もしあれば）
   - 例: `simpleapp-5c1c6.firebaseapp.com`
   - これは`authDomain`の値です

**注意**: WebViewは`about:blank`を使用するため、通常のドメイン検証は難しい場合があります。その場合は、「ドメインの所有権の証明を無効にする」を有効にしてください。

## 3. 推奨される対処方法

### 方法1: Firebaseの自動reCAPTCHAを使用（推奨）

1. **Google Cloud ConsoleのreCAPTCHAキー作成はスキップ**
2. **Firebase ConsoleでPhone Authenticationを有効化**
3. **アプリを再実行して動作確認**

Firebaseが自動的にreCAPTCHAを管理するため、これで動作するはずです。

### 方法2: カスタムreCAPTCHAキーを作成する場合

1. **Google Cloud Console > Security > reCAPTCHA**に移動
2. **「鍵を作成」をクリック**
3. **設定**:
   - **表示名**: `SimpleApp`（任意）
   - **アプリケーションの種類**: **「Web」を選択**
   - **ドメインリスト**: 
     - `localhost`を追加
     - `simpleapp-5c1c6.firebaseapp.com`を追加（`authDomain`の値）
     - 「ドメインの所有権の証明を無効にする」を有効にする（必要に応じて）
4. **「鍵を作成」をクリック**
5. **作成されたキーをFirebase Consoleに設定**
   - Firebase Console > Authentication > Settings > reCAPTCHA
   - 作成したキーを設定

## 4. 現在の実装の確認

現在の実装では：
- **iOS**: WebView内でFirebase Web SDKのreCAPTCHAを使用
- **Android**: `@react-native-firebase`を使用（reCAPTCHA不要）

したがって、reCAPTCHAキーが必要なのは**iOSのみ**で、**「Web」アプリケーション**として設定する必要があります。

## 5. トラブルシューティング

### `auth/internal-error`が発生する場合

1. **Firebase ConsoleでPhone Authenticationが有効になっているか確認**
2. **`authDomain`が正しく設定されているか確認**
   - `.env`または`eas.json`の`EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN`を確認
   - 通常は `your-project-id.firebaseapp.com` の形式
3. **Firebase Console > Authentication > Settings > reCAPTCHA**で設定を確認
4. **アプリを再実行して、コンソールログを確認**
   - `[RecaptchaVerifier] Debug:` のログで`authDomain`と`projectId`を確認

## まとめ

**推奨**: まずはFirebaseの自動reCAPTCHAを使用してみてください。カスタムキーは必要になった場合のみ作成してください。

**アプリケーションの種類**: 「Web」を選択してください（iOSアプリでもWebView内でWeb SDKを使用しているため）

