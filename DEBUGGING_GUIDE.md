# デバッグガイド

## Expoのバグ情報の確認方法

### 1. Expo公式ドキュメント
- **公式ドキュメント**: https://docs.expo.dev/
- **トラブルシューティング**: https://docs.expo.dev/troubleshooting/clear-cache/
- **GitHub Issues**: https://github.com/expo/expo/issues

### 2. Expo Forums
- **コミュニティフォーラム**: https://forums.expo.dev/
- 他の開発者が報告した問題や解決策を検索できます

### 3. Expo Status Page
- **ステータスページ**: https://status.expo.dev/
- Expoサービスの稼働状況を確認できます

### 4. React Native Firebase Issues
- **GitHub Issues**: https://github.com/invertase/react-native-firebase/issues
- Firebase関連のバグや問題を確認できます

## Firebaseエラーの詳細を確認する方法

### 1. コンソールログの確認

アプリを実行中に、以下のログが出力されます：

```
[PhoneAuth] Error details: {
  message: "...",
  code: "auth/internal-error",
  stack: "...",
  name: "...",
  fullError: "..."
}
```

### 2. Metro Bundlerのログ

ターミナルでMetro Bundlerを実行している場合、エラーログが表示されます：

```bash
npm start
# または
npx expo start
```

### 3. デバイスログの確認

#### iOS (Simulator)
```bash
# Simulatorのログを確認
xcrun simctl spawn booted log stream --predicate 'processImagePath contains "Expo"'
```

#### Android
```bash
# Androidのログを確認
adb logcat | grep -i "expo\|firebase\|react"
```

### 4. React Native Debugger

React Native Debuggerを使用して、詳細なエラー情報を確認できます：

1. React Native Debuggerをインストール
2. アプリでデバッグモードを有効化
3. Chrome DevToolsでエラーを確認

## よくあるFirebaseエラーと対処法

### `auth/internal-error`

このエラーは通常、以下の原因で発生します：

1. **Firebase Consoleの設定**
   - Phone Authenticationが有効になっているか確認
   - reCAPTCHAの設定が正しいか確認
   - `authDomain`が正しく設定されているか確認

2. **Firebase Config**
   - `.env`ファイルの環境変数が正しいか確認
   - `firebaseConfig.js`の設定が正しいか確認

3. **reCAPTCHAの問題**
   - WebViewでreCAPTCHAが正しく読み込まれているか確認
   - ネットワーク接続を確認

### 対処手順

1. **Firebase Consoleを確認**
   ```
   Firebase Console > Authentication > Sign-in method > Phone
   - Phone認証が有効になっているか
   - reCAPTCHAの設定が正しいか
   ```

2. **環境変数を確認**
   ```bash
   # .envファイルを確認
   cat .env
   ```

3. **Firebase Configを確認**
   ```javascript
   // firebaseConfig.jsの内容を確認
   console.log(firebaseConfig);
   ```

4. **詳細ログを確認**
   - アプリを再実行して、コンソールに出力される詳細なエラー情報を確認
   - `[PhoneAuth] Error details:` のログを確認

## エラーログの共有方法

問題を報告する際は、以下の情報を含めてください：

1. **エラーメッセージ**
   - コンソールに出力された完全なエラーメッセージ
   - `[PhoneAuth] Error details:` のログ

2. **環境情報**
   - Expo SDKバージョン
   - React Nativeバージョン
   - プラットフォーム (iOS/Android)
   - デバイス/シミュレーター情報

3. **再現手順**
   - エラーが発生するまでの手順
   - 発生頻度（毎回/時々）

4. **関連ファイル**
   - `firebaseConfig.js`
   - `.env` (機密情報は除く)
   - エラーが発生するコンポーネント

