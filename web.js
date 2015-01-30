/*

DropBoxPages aka dbPages

*/

// Replace the XxXxXxX with yours good values

// Try nodetime to show you many performance indexes ...
require('nodetime').profile({
    accountKey: 'XxXxXxX',
    appName: 'XxXxXxX'
});

var gUtil = require("util"),
    gHttp = require("http"),
    gHttpProxy = require('http-proxy'),
    gProxy = gHttpProxy.createProxyServer({}),
    gConnect = require('connect'),
    gCompression = require('compression'),
    gResponseTime = require("response-time"),
    gApp = gConnect(),
    gAppPort = process.env.VCAP_APP_PORT || process.env.PORT || 8080,
    // Set your DropBox ID here
    gDropBoxID = "XxXxXxX";

// Program starts here
console.log('Creating http-proxy server');

gApp.use(gCompression({
    threshold: 128,
    memLevel: 9,
    level: 6
}));

gApp.use(gResponseTime());
gApp.use(function(req, res, next) {
    var _writeHead = res.writeHead;
    res.writeHead = function() {
        // Here set your 404 custom page ...
        if ((arguments[0] == 404) && (arguments.callee.caller.name == 'writeStatusCode')) {
            console.log('URI not found (statusCode=404) ', gUtil.inspect(req, true, 2));
            _writeHead.apply(res, [302, {
                'Location': 'XxXxXxX'
            }]);
        } else _writeHead.apply(res, arguments);
    };
    next();
});

gApp.use(function(req, res, next) {
    var requestDomainNames = req.headers.host.toLowerCase().split(/\./g);
    if (requestDomainNames.length < 3) {
        requestDomainNames.unshift('www');
    }
    var dropBoxDir = requestDomainNames.reverse().join('/');
    if (/^[^.]+[\/]?$/.test(req.url)) {
        if (!/\/$/.test(req.url)) {
            req.url += '/';
        }
        req.url += 'index.html';
    }
    req.headers.host = 'dl.dropboxusercontent.com';
    req.url = '/u/' + gDropBoxID + '/SITEs/' + dropBoxDir + req.url;
    gProxy.web(req, res, {
        target: 'https://dl.dropboxusercontent.com'
    });
});

gHttp.createServer(gApp).listen(gAppPort);
console.log('Created http-proxy server on port [' + gAppPort + ']');