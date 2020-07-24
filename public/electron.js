const log = require('electron-log');
try {
    require('./electronjs/main.js')
} catch(e) {
    log.error(e)
}
