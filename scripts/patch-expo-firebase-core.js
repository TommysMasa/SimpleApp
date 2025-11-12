const fs = require('fs');
const path = require('path');

const buildGradlePath = path.join(
  __dirname,
  '..',
  'node_modules',
  'expo-firebase-core',
  'android',
  'build.gradle'
);

if (!fs.existsSync(buildGradlePath)) {
  console.log('expo-firebase-core build.gradle not found, skipping patch');
  process.exit(0);
}

let content = fs.readFileSync(buildGradlePath, 'utf8');

// Replace deprecated classifier property with archiveClassifier.set() for Gradle 8.14+
// Old: classifier = 'sources'
// New: archiveClassifier.set('sources')
content = content.replace(
  /(\s+)classifier\s*=\s*['"]sources['"]/g,
  "$1archiveClassifier.set('sources')"
);

// Replace compileSdkVersion with compileSdk for Gradle 8+
// Old: compileSdkVersion safeExtGet("compileSdkVersion", 31)
// New: compileSdk safeExtGet("compileSdkVersion", 36)
content = content.replace(
  /(\s+)compileSdkVersion\s+safeExtGet\(["']compileSdkVersion["'],\s*\d+\)/g,
  "$1compileSdk safeExtGet(\"compileSdkVersion\", 36)"
);

fs.writeFileSync(buildGradlePath, content, 'utf8');
console.log('Successfully patched expo-firebase-core build.gradle');

