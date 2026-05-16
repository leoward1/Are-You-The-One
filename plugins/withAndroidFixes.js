const { withGradleProperties, withAppBuildGradle } = require('@expo/config-plugins');

const withAndroidFixes = (config) => {
  config = withGradleProperties(config, (config) => {
    config.modResults = config.modResults.filter(
      (item) => !['android.useAndroidX', 'android.enableJetifier'].includes(item.key)
    );
    config.modResults.push(
      { type: 'property', key: 'android.useAndroidX', value: 'true' },
      { type: 'property', key: 'android.enableJetifier', value: 'true' },
      { type: 'property', key: 'kotlin.jvm.target.validation.mode', value: 'WARNING' }
    );
    return config;
  });

  config = withAppBuildGradle(config, (config) => {
    if (!config.modResults.contents.includes('kotlin.jvm.target.validation.mode')) {
      config.modResults.contents = config.modResults.contents.replace(
        'android {',
        `android {
    kotlinOptions {
        jvmTarget = "17"
    }`
      );
    }
    return config;
  });

  return config;
};

module.exports = withAndroidFixes;
