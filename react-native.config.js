// react-native.config.js
// Exclude @react-native-firebase from iOS autolinking
// iOS uses Firebase Web SDK instead
// Android continues to use @react-native-firebase

module.exports = {
  dependencies: {
    '@react-native-firebase/app': {
      platforms: {
        ios: null, // Disable iOS platform, it will use Firebase Web SDK
      },
    },
    '@react-native-firebase/auth': {
      platforms: {
        ios: null, // Disable iOS platform, it will use Firebase Web SDK
      },
    },
    '@react-native-firebase/firestore': {
      platforms: {
        ios: null, // Disable iOS platform, it will use Firebase Web SDK
      },
    },
  },
};

