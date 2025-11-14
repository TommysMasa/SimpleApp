# iOS Firebase Web SDK 移行プラン

## 目標
- **iOS**: Firebase Web SDK（JS Firebase）を使用
- **Android**: `@react-native-firebase`を継続使用

---

## フェーズ1: 基盤ファイルの準備

### 1.1 `firebase.ts`の修正
**目的**: プラットフォーム分岐でFirebase SDKを切り替える統一エントリーポイントを作成

**変更内容**:
- iOS: `firebaseConfig.js`からFirebase Web SDKをエクスポート
- Android: `@react-native-firebase`をエクスポート
- 型定義の統一（`FirebaseAuthTypes`の互換性確保）

**影響範囲**:
- すべてのファイルがこのファイルを経由してFirebaseにアクセス

---

### 1.2 `firebaseConfig.js`の確認・最適化
**目的**: iOS用のFirebase Web SDK設定を確認

**確認項目**:
- ✅ 既存の設定で問題ないか確認
- ✅ `initializeAuth`と`getReactNativePersistence`が正しく設定されているか
- ✅ `AsyncStorage`の依存関係が正しいか

**変更内容**:
- 必要に応じて微調整のみ

---

## フェーズ2: ネイティブ設定の変更

### 2.1 Podfileの修正
**目的**: iOSから`@react-native-firebase`のpodを除外

**変更内容**:
```ruby
# use_native_modules!の結果を取得後、iOSで@react-native-firebaseを除外
config = use_native_modules!(config_command)

# iOSで@react-native-firebaseを除外
if podfile_properties['ios.useFrameworks'] == 'static'
  config[:ios] ||= {}
  config[:ios][:exclude] ||= []
  config[:ios][:exclude] << '@react-native-firebase/app'
  config[:ios][:exclude] << '@react-native-firebase/auth'
  config[:ios][:exclude] << '@react-native-firebase/firestore'
end
```

**実行コマンド**:
```bash
cd ios && pod install
```

---

### 2.2 `app.json`の修正
**目的**: iOSプラグインから`@react-native-firebase/app`を削除

**変更内容**:
- `plugins`配列から`"@react-native-firebase/app"`を削除
- または、プラットフォーム固有の設定で除外（可能であれば）

**注意**: Expoのプラグインシステムはプラットフォーム分岐を直接サポートしていないため、完全な除外は難しい可能性がある

---

### 2.3 `AppDelegate.swift`の修正
**目的**: iOSで`FirebaseApp.configure()`を削除または条件付きにする

**変更内容**:
- `FirebaseApp.configure()`を削除（Firebase Web SDKは自動初期化される）
- または、`#if !os(iOS)`で条件付きにする

**注意**: `FirebaseCore`のインポートも削除する必要がある可能性がある

---

## フェーズ3: コードレベルの修正

### 3.1 `contexts/AuthContext.tsx`の修正
**目的**: プラットフォーム分岐でFirebase SDKを切り替え

**変更内容**:
- `firebase.ts`から`auth`と`firestore`をインポート（プラットフォーム分岐済み）
- `onAuthStateChanged`の実装をプラットフォーム分岐
- `signUp`, `getUserData`, `updateUserData`のFirestore操作をプラットフォーム分岐
- `logout`の実装をプラットフォーム分岐

**主な変更点**:
- `auth().onAuthStateChanged()` → プラットフォーム分岐
- `firestore().collection()` → プラットフォーム分岐
- `firestore.FieldValue.serverTimestamp()` → プラットフォーム分岐

---

### 3.2 `app/phone-auth.tsx`の修正
**目的**: 電話番号認証をプラットフォーム分岐対応

**変更内容**:
- `firebase.ts`から`auth`をインポート
- `auth().signInWithPhoneNumber()`の実装をプラットフォーム分岐
  - iOS: Firebase Web SDKの`signInWithPhoneNumber`（reCAPTCHA必要）
  - Android: `@react-native-firebase/auth`の`signInWithPhoneNumber`

**注意**: iOSではreCAPTCHAが必要になる可能性がある（`expo-firebase-recaptcha`の代替が必要）

---

### 3.3 `app/sms-verification.tsx`の修正
**目的**: SMS認証コード検証をプラットフォーム分岐対応

**変更内容**:
- `firebase.ts`から`auth`と`firestore`をインポート
- `auth.PhoneAuthProvider.credential()`の実装をプラットフォーム分岐
- `auth().signInWithCredential()`の実装をプラットフォーム分岐
- `auth().onAuthStateChanged()`の実装をプラットフォーム分岐
- `firestore().collection().doc().get()`の実装をプラットフォーム分岐

**主な変更点**:
- `auth.PhoneAuthProvider.credential()` → プラットフォーム分岐
- `auth().signInWithCredential()` → プラットフォーム分岐
- `firestore().collection('users').doc().get()` → プラットフォーム分岐

---

### 3.4 `app/index.tsx`の修正
**目的**: ホーム画面の認証状態監視とFirestore操作をプラットフォーム分岐対応

**変更内容**:
- `firebase.ts`から`auth`と`firestore`をインポート
- `auth().onAuthStateChanged()`の実装をプラットフォーム分岐
- `firestore().collection('users').doc().get()`の実装をプラットフォーム分岐

---

### 3.5 その他のファイルの確認
**確認対象**:
- `app/barcode.tsx` - Firestore操作があるか確認
- `app/profile.tsx` - Firestore操作があるか確認
- `app/signup.tsx` - Firestore操作があるか確認
- その他のFirestore操作があるファイル

**対応**:
- `firebase.ts`から`firestore`をインポート
- Firestore操作をプラットフォーム分岐対応

---

## フェーズ4: 型定義と互換性

### 4.1 型定義の統一
**目的**: iOS（Firebase Web SDK）とAndroid（@react-native-firebase）の型の違いを吸収

**対応方法**:
- `firebase.ts`で型のラッパーを作成
- `User`型の互換性を確保
- `Firestore`操作の戻り値の型を統一

---

### 4.2 APIの違いの吸収
**主な違い**:

1. **認証状態監視**:
   - iOS: `onAuthStateChanged(auth, callback)` → `User | null`
   - Android: `auth().onAuthStateChanged(callback)` → `FirebaseAuthTypes.User | null`

2. **Firestore操作**:
   - iOS: `getDoc(docRef)` → `DocumentSnapshot`
   - Android: `firestore().collection().doc().get()` → `FirestoreDocumentSnapshot`

3. **ServerTimestamp**:
   - iOS: `serverTimestamp()` (関数)
   - Android: `firestore.FieldValue.serverTimestamp()` (関数)

4. **Phone Auth**:
   - iOS: `signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier)`
   - Android: `auth().signInWithPhoneNumber(phoneNumber)`

---

## フェーズ5: テストと検証

### 5.1 iOSビルドテスト
**実行コマンド**:
```bash
npx expo prebuild --clean --platform ios
cd ios && pod install
npx expo run:ios
```

**確認項目**:
- ✅ ビルドが成功するか
- ✅ `@react-native-firebase`のpodが除外されているか
- ✅ Firebase Web SDKが正しく初期化されるか

---

### 5.2 Androidビルドテスト
**実行コマンド**:
```bash
npx expo run:android
```

**確認項目**:
- ✅ ビルドが成功するか
- ✅ `@react-native-firebase`が正しく動作するか

---

### 5.3 機能テスト
**テスト項目**:
1. **電話番号認証**:
   - iOS: reCAPTCHAが表示されるか、SMSが送信されるか
   - Android: SMSが送信されるか

2. **SMS認証コード検証**:
   - iOS: 認証コードが正しく検証されるか
   - Android: 認証コードが正しく検証されるか

3. **ユーザーデータ取得**:
   - iOS: Firestoreからユーザーデータが取得できるか
   - Android: Firestoreからユーザーデータが取得できるか

4. **認証状態監視**:
   - iOS: ログイン/ログアウト時に正しく状態が更新されるか
   - Android: ログイン/ログアウト時に正しく状態が更新されるか

---

## フェーズ6: クリーンアップ

### 6.1 不要なファイルの削除
**削除候補**:
- `firebase.ts`（既存のもの、新しいものに置き換え）

### 6.2 依存関係の整理
**確認項目**:
- `package.json`の`@react-native-firebase`パッケージはAndroid用に残す
- `firebase`パッケージはiOS用に必要

---

## 実装順序（推奨）

1. **フェーズ1**: 基盤ファイルの準備
   - `firebase.ts`の修正
   - `firebaseConfig.js`の確認

2. **フェーズ2**: ネイティブ設定の変更
   - Podfileの修正
   - `app.json`の修正
   - `AppDelegate.swift`の修正

3. **フェーズ3**: コードレベルの修正
   - `contexts/AuthContext.tsx`
   - `app/phone-auth.tsx`
   - `app/sms-verification.tsx`
   - `app/index.tsx`
   - その他のファイル

4. **フェーズ4**: 型定義と互換性
   - 型定義の統一
   - APIの違いの吸収

5. **フェーズ5**: テストと検証
   - iOSビルドテスト
   - Androidビルドテスト
   - 機能テスト

6. **フェーズ6**: クリーンアップ
   - 不要なファイルの削除
   - 依存関係の整理

---

## 注意事項

1. **reCAPTCHA**: iOSで電話番号認証を使用する場合、reCAPTCHAが必要になる可能性がある。`expo-firebase-recaptcha`の代替手段を検討する必要がある。

2. **型の互換性**: Firebase Web SDKと`@react-native-firebase`の型は完全に互換ではないため、型アサーション（`as any`）が必要な場合がある。

3. **エラーハンドリング**: プラットフォームごとにエラーメッセージの形式が異なる可能性があるため、エラーハンドリングを統一する必要がある。

4. **テスト**: 各プラットフォームで十分なテストを行う必要がある。

---

## 参考リンク

- [Firebase Web SDK Documentation](https://firebase.google.com/docs/web/setup)
- [@react-native-firebase Documentation](https://rnfirebase.io/)
- [Expo Firebase Integration](https://docs.expo.dev/guides/using-firebase/)

