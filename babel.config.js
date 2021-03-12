module.exports = function(api) {
  api.cache(true);
  const config = {
    presets: ["module:metro-react-native-babel-preset"],
    plugins: [
      [require('@babel/plugin-proposal-decorators'), {legacy: true}],
    ],
  }
  // if(getEnv()!=='development') {
  //   config.plugins.push(['transform-remove-console'])
  // }
  // config.plugins.push(['transform-remove-console'])
  return config
}

function getEnv(defaultValue = "development") {
  return process.env.BABEL_ENV || process.env.NODE_ENV || defaultValue;
}
