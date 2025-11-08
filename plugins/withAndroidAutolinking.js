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

    results.contents = contents;
    return modConfig;
  });
}

module.exports = withAndroidAutolinking;
module.exports.default = withAndroidAutolinking;
