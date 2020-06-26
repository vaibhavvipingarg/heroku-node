var express = require('express'),
    request = require('request'),
    bodyParser = require('body-parser'),
    app = express();

var myLimit = typeof(process.argv[2]) != 'undefined' ? process.argv[2] : '100kb';
console.log('Using limit: ', myLimit);

app.use(bodyParser.json({limit: myLimit}));

app.all('*', function (req, res, next) {

    // Set CORS headers: allow all origins, methods, and headers: you may want to lock this down in a production environment
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, PUT, PATCH, POST, DELETE");
    res.header("Access-Control-Allow-Headers", req.header('access-control-request-headers'));

    if (req.method === 'OPTIONS') {
        // CORS Preflight
        res.send();
    } else {
        // var targetURL = req.header('Target-URL');
        // if (!targetURL) {
        //     res.send(500, { error: 'There is no Target-Endpoint header in the request' });
        //     return;
        // }
        request({ url: 'https://na44.stmfa.stm.salesforce.com/services/data/v50.0/wave/folders', method: "GET", json: req.body, headers: {'Authorization': 'Bearer 00DRM000000GySC!AQkAQNG9EuYL5YfyaQmDYpZ4zUupRd8ML_CeVhIosp7Mb6nIquS3g33uD_SMSaUkgbqjNcHl9rHsF.r8mMXPpq.1a0KiQHMM', "Cookie": "BrowserId=fESh3bcvEeqVIqtpX5pgxQ"} },
            function (error, response, body) {
                console.log(error);
                if (error) {
                    console.error('error: ' + response.statusCode)
                }
               console.log(body);
            }).pipe(res);
    }
});

app.set('port', process.env.PORT || 3002);

app.listen(app.get('port'), function () {
    console.log('Proxy server listening on port ' + app.get('port'));
});
