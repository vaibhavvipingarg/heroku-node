var express = require('express'),
    request = require('request-promise'),
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
		console.log("Request body: " + req.body.q);
		var options_interpret = {
			'method': 'POST',
			'url': 'https://na44.stmfa.stm.salesforce.com/services/data/v50.0/autonomous-analytics/nlq/interpret',
			'headers': {
			  'Authorization': 'Bearer 00DRM000000GySC!AQkAQLeaE3NX0QM5qXJIP0E2XTZHMxTxrAEboney2oCOK3JPy7T9nqFWtOA4Lc.cOArVvtB9HuNvrydHnb3j0TNgSWTgCXwz',
			  'Content-Type': 'application/json',
			  'Cookie': 'BrowserId=fESh3bcvEeqVIqtpX5pgxQ'
			},
			body: JSON.stringify({"query":`${req.body.q}`,"dataSource":{"type":"dataset","id":"0FbRM0000001hOf0AI"},"labelOverrides":[]})
			// body: JSON.stringify({"query":"annual revenue by billing_country","dataSource":{"type":"dataset","id":"0FbRM0000001g4n0AA"},"labelOverrides":[]})
		  
		  };
		  request(options_interpret, function (error, response_interpret) {
			if (error) throw new Error(error);
		  })
		  .then(function (response) {
			response_interpret = JSON.parse(response);
			console.log(response_interpret.query);
			group = response_interpret.query.sources[0].groups[0];
			measure = response_interpret.query.sources[0].columns[0].name;
			var options = {
				'method': 'POST',
				'url': 'https://na44.stmfa.stm.salesforce.com/services/data/v50.0/wave/query',
				'headers': {
				'Authorization': 'Bearer 00DRM000000GySC!AQkAQLeaE3NX0QM5qXJIP0E2XTZHMxTxrAEboney2oCOK3JPy7T9nqFWtOA4Lc.cOArVvtB9HuNvrydHnb3j0TNgSWTgCXwz',
				  'Content-Type': 'application/json',
				  'Cookie': 'BrowserId=fESh3bcvEeqVIqtpX5pgxQ'
				},
				body: JSON.stringify({"query":`q = load \"0FbRM0000001hOf0AI/0FcRM0000002CyI0AU\";\nq = group q by ${group};\nq = foreach q generate ${group} as ${group}, count() as ${measure};\nq = order q by ${group} asc;\nq = limit q 1000;\n`})
			  
			  };
			  return request(options, function (error, response) {
				if (error) throw new Error(error);
				console.log(response.body);
			  });
		  })
		  .then(function(response) {
			  query_result = JSON.parse(response);
			  console.log(query_result.results.records[0]);
			  res.send(query_result.results.records);
		  })
    }
});

app.set('port', process.env.PORT || 8000);

app.listen(app.get('port'), function () {
    console.log('Proxy server listening on port ' + app.get('port'));
});
