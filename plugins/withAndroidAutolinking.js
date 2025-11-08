const { withSettingsGradle } = require('expo/config-plugins');

/**
 * Ensures the Android settings.gradle(.kts) applies the Expo autolinking settings plugin
 * so that expo modules are registered when Gradle runs.
 */
function withAndroidAutolinking(config) {
  return withSettingsGradle(config, (modConfig) => {
    const results = modConfig.modResults;
    if (!results || typeof results.contents !== 'string') {
      return modConfig;
    }

    let contents = results.contents;

    const pluginId = 'expo-autolinking-settings';
    const pluginBlockPattern = /plugins\s*\{/;
    const pluginDeclaration = `  id("${pluginId}")`;

    if (!contents.includes(pluginId)) {
      if (pluginBlockPattern.test(contents)) {
        contents = contents.replace(pluginBlockPattern, (match) => `${match}\n${pluginDeclaration}`);
      } else {
        contents = `plugins {\n${pluginDeclaration}\n}\n\n${contents}`;
      }
    }

    const useStatement = 'expoAutolinking.useExpoModules()';
    if (!contents.includes(useStatement)) {
      const includePattern = /include\s*\(.+\)/;
      if (includePattern.test(contents)) {
        contents = contents.replace(includePattern, `${useStatement}\n\n$&`);
      } else {
        contents = `${contents}\n\n${useStatement}`;
      }
    }

    if (!contents.includes('expo-firebase-core')) {
      const isKts = results?.language === 'kts' || /settings\.gradle\.kts$/.test(results?.path || '');

      const ktsMatch = contents.match(/expoAutolinking\s*\{[^}]*exclude\s*=\s*listOf\(([^)]*)\)/);
      const groovyMatch = contents.match(/expoAutolinking\s*\{[^}]*exclude\s*=\s*\[([^\]]*)\]/);

      if (ktsMatch) {
        const existing = ktsMatch[1];
        const trimmed = existing.trim();
        const addition = trimmed.length ? `${trimmed}, "expo-firebase-core"` : '"expo-firebase-core"';
        const updated = ktsMatch[0].replace(existing, addition);
        contents = contents.replace(ktsMatch[0], updated);
      } else if (groovyMatch) {
        const existing = groovyMatch[1];
        const trimmed = existing.trim();
        const addition = trimmed.length ? `${trimmed}, "expo-firebase-core"` : '"expo-firebase-core"';
        const updated = groovyMatch[0].replace(existing, addition);
        contents = contents.replace(groovyMatch[0], updated);
      } else {
        const excludeBlock = isKts
          ? 'expoAutolinking {\n  exclude = listOf("expo-firebase-core")\n}'
          : 'expoAutolinking {\n  exclude = ["expo-firebase-core"]\n}';

        if (contents.includes(useStatement)) {
          contents = contents.replace(useStatement, `${useStatement}\n\n${excludeBlock}`);
        } else {
          contents = `${contents}\n\n${excludeBlock}`;
        }
      }
    }

    results.contents = contents;
    return modConfig;
  });
}

module.exports = withAndroidAutolinking;
module.exports.default = withAndroidAutolinking;
