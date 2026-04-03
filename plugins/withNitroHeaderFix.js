const { withDangerousMod, withPlugins } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

/**
 * This plugin surgically injects NitroModules header search paths into the Podfile
 * to resolve the "NitroModules cannot be found!" error in NitroIap.
 */
const withNitroHeaderFix = (config) => {
  return withDangerousMod(config, [
    'ios',
    async (config) => {
      const podfilePath = path.join(config.modRequest.projectRoot, 'ios', 'Podfile');
      let podfileContent = fs.readFileSync(podfilePath, 'utf8');

      const headerFix = `
    # [NitroFix] Inject NitroModules headers into NitroIap
    installer.pods_project.targets.each do |target|
      if target.name == 'NitroIap'
        target.build_configurations.each do |config|
          config.build_settings['HEADER_SEARCH_PATHS'] ||= '$(inherited) '
          config.build_settings['HEADER_SEARCH_PATHS'] << '"$(SRCROOT)/../node_modules/react-native-nitro-modules/cpp"'
        end
      end
    end
`;

      // Find the post_install block and inject our fix
      if (podfileContent.includes('post_install do |installer|')) {
        if (!podfileContent.includes('[NitroFix]')) {
          podfileContent = podfileContent.replace(
            'post_install do |installer|',
            `post_install do |installer|${headerFix}`
          );
        }
      } else {
        // If no post_install block exists (rare in Expo), append one
        podfileContent += `
post_install do |installer|
${headerFix}
end
`;
      }

      fs.writeFileSync(podfilePath, podfileContent);
      return config;
    },
  ]);
};

module.exports = withNitroHeaderFix;
