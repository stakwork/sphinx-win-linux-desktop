module.exports = function(api) {
  api.cache(true);
  return {
    presets: ["module:metro-react-native-babel-preset"],
    plugins: [
      [require('@babel/plugin-proposal-decorators'), {legacy: true}]
    ],
  }
}
