const fs = require('fs');
const path = require('path');

const targetPath = path.join(__dirname, '..', 'node_modules', 'expo-firebase-core', 'android', 'build.gradle');

function applyPatch() {
  if (!fs.existsSync(targetPath)) {
    return;
  }

  const original = fs.readFileSync(targetPath, 'utf8');
  const needle = "classifier = 'sources'";
  if (!original.includes(needle)) {
    return;
  }

  const patched = original.replace(needle, "archiveClassifier.set('sources')");
  if (patched === original) {
    return;
  }

  fs.writeFileSync(targetPath, patched, 'utf8');
  console.log('Patched expo-firebase-core build.gradle for Gradle 8 compatibility.');
}

try {
  applyPatch();
} catch (error) {
  console.warn('Failed to patch expo-firebase-core build.gradle:', error);
}
