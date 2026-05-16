const { withGradleProperties, withAppBuildGradle } = require('@expo/config-plugins');

const withAndroidFixes = (config) => {
  // Add gradle.properties entries
  config = withGradleProperties(config, (config) => {
    config.modResults = config.modResults.filter(
      (item) => !['android.useAndroidX', 'android.enableJetifier'].includes(item.key)
    );
    config.modResults.push(
      { type: 'property', key: 'android.useAndroidX', value: 'true' },
      { type: 'property', key: 'android.enableJetifier', value: 'true' }
    );
    return config;
  });

  return config;
};

module.exports = withAndroidFixes;
