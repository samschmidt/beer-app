var express = require('express');
var http = require('http');
var router = express.Router();


//strings
var locationQuery = '/v2/locations?postalCode='
var keyString = '&key=4d484f109c0c282af90081a494c20c08';

var options = {
		host: 'api.brewerydb.com',
		path: '/v2/locations?postalCode=40508&key=4d484f109c0c282af90081a494c20c08'
	};


/* GET home page. */
router.get('/', function(req, res, next) {
	res.render('index', { title: 'Express' });
});


//breweryDB postalCode requests
router.get('/dbreq', function(req, res, next) {
	//Do the brewerydb request here


	callback = function(response) {
		console.log('test');
	  	var str = '';

		//another chunk of data has been recieved, so append it to `str`
		response.on('data', function (chunk) {
			console.log("test2");
			str += chunk;
		});

		//the whole response has been recieved, so we just print it out here
		response.on('end', function () {
			console.log("test3");
			res.send(str);
		});
	}


	console.log(req.query);
	options.path = locationQuery + req.query.postalCode + keyString;

	http.request(options, callback).end();


	// res.send("hello w");	
})


//strings
var latlngQuery = '/v2/search/geo/point?lat='
// var keyString = '&key=4d484f109c0c282af90081a494c20c08';

var options = {
		host: 'api.brewerydb.com',
		path: '/v2/search/geo/point?lat=35.772096&lng=-78.638614'
	};


router.get('/searchLatLng', function(req, res, next) {

	callback = function(response) {
		// console.log('testlatlng1');
	  	var str = '';

		//another chunk of data has been recieved, so append it to `str`
		response.on('data', function (chunk) {
			// console.log("testlatlng2");
			str += chunk;
		});

		//the whole response has been recieved, so we just print it out here
		response.on('end', function () {
			// console.log("testlatlng3");
			res.send(str);
		});
	}

	console.log(req.query);
	options.path = latlngQuery + req.query.lat + '&lng=' + req.query.lng + keyString;

	console.log(options.path);

	http.request(options, callback).end();

})

//strings
var beersForBreweryQuery = '/v2/brewery/'
var slashBeers = '/beers'

var options = {
		host: 'api.brewerydb.com',
		path: '/v2/brewery/noGtDY/beers'
		//Bell's by default :)
	};

router.get('/beersForBrewery', function(req, res, next) {
	
	callback = function(response) {
		// console.log('beersForBrewery1');
	  	var str = '';

		//another chunk of data has been recieved, so append it to `str`
		response.on('data', function (chunk) {
			// console.log("beersForBrewery2");
			str += chunk;
		});

		//the whole response has been recieved, so we just print it out here
		response.on('end', function () {
			// console.log("beersForBrewery3");
			res.send(str);
		});
	}

	console.log(req.query);
	options.path = beersForBreweryQuery + req.query.id + slashBeers + keyString;

	console.log(options.path);

	http.request(options, callback).end();
})


module.exports = router;