const { 
    override, 
    babelInclude, 
    addDecoratorsLegacy, 
    disableEsLint, 
    removeModuleScopePlugin, 
    addWebpackExternals 
} = require("customize-cra");
const path = require('path');

module.exports = override(
    removeModuleScopePlugin(),
    addDecoratorsLegacy(),
    disableEsLint(),
    babelInclude([
        path.resolve("src"),
        path.resolve("web")
    ]),
    addWebpackExternals({
        realm:'RealmStub'
    })
)

// const path = require('path');
// const ModuleScopePlugin = require('react-dev-utils/ModuleScopePlugin');

// module.exports = {
//     webpack: override(
//         addDecoratorsLegacy(),
//         disableEsLint(),
//         removeModuleScopePlugin(),
//     ),
//     paths: function (paths, env) {        
//         paths.appIndexJs = path.resolve(__dirname, 'web/index.tsx');
//         paths.appSrc = path.resolve(__dirname, 'web');
//         return paths;
//     },
// }
