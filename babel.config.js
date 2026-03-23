module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./src'],
          extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
          alias: {
            '@': './src',
          },
        },
      ],
      // react-native-worklets MUST come before reanimated
      'react-native-worklets/plugin',
      // react-native-reanimated MUST always be the LAST plugin
      'react-native-reanimated/plugin',
    ],
  };
};
