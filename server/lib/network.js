const co = require('co');


const handleRequest = (method, uri, promiseFunc) => {
    method(uri, function(req, res) {
        res.set('Access-Control-Allow-Origin', '*');
        res.type('application/json');
        co(function *() {
            try {
                let result = yield promiseFunc(req);
                // HTTP answer
                res.status(200).send(JSON.stringify(result, null, "  "));
            } catch (e) {
                // HTTP error
                res.status(400).send(e);
            }
        });
    });
};

module.exports = {
    handleRequest
};