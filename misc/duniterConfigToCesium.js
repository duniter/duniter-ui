var fs = require('fs');
function getUserHome() {
    return process.env.HOME || process.env.USERPROFILE;
}

try {

    var duniterConf = JSON.parse(fs.readFileSync(getUserHome()+'/.config/duniter/duniter_default/conf.json', 'utf8'));
    var host = duniterConf.remotehost;
    if(!host) host = duniterConf.remoteipv4;
    if(!host) host = duniterConf.remoteipv6;
    var cesiumConf = {
        "default": {
            "node":{
                "host":host,
                "port":duniterConf.remoteport
            }
        }
    };
    fs.writeFileSync('cesium/app/config.json',JSON.stringify(cesiumConf));

} catch (e) {
    console.log('Not Duniter configuration found, skipping Cesium configuration.');
}
