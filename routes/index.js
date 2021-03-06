var express = require('express');
var http = require('http');
var router = express.Router();


//strings
var locationQuery = '/v2/locations?postalCode='
var keyString = 'key=4d484f109c0c282af90081a494c20c08';

var optionsPostal = {
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
	optionsPostal.path = locationQuery + req.query.postalCode + '&' + keyString;

	http.request(optionsPostal, callback).end();


	// res.send("hello w");	
})


//strings
var latlngQuery = '/v2/search/geo/point?lat='
// var keyString = '&key=4d484f109c0c282af90081a494c20c08';

var optionsLatLng = {
		host: 'api.brewerydb.com',
		path: '/v2/search/geo/point?lat=35.772096&lng=-78.638614'
	};

//Search for breweries near a latlng. Uses default distance for now
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
	optionsLatLng.path = latlngQuery + req.query.lat + '&lng=' + req.query.lng + '&' + keyString;

	console.log(optionsLatLng.path);

	http.request(optionsLatLng, callback).end();

});

//strings
var beersForBreweryQuery = '/v2/brewery/'
var slashBeers = '/beers'

var optionsBeers = {
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


	optionsBeers.path = beersForBreweryQuery + req.query.breweryId + slashBeers + '?' + keyString;



	console.log("path");
	console.log(optionsBeers.path);
	console.log("query");
	console.log(req.query);


	http.request(optionsBeers, callback).end();
});


//
//
//
//strings
var breweriesForBeerQuery = '/v2/beer/'
var slashBreweries = '/breweries'

var optionsBreweries = {
		host: 'api.brewerydb.com',
		path: '/v2/brewery/noGtDY/beers'
		//Bell's by default :)
	};

router.get('/breweriesForBeer', function(req, res, next) {
	
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


	optionsBreweries.path = breweriesForBeerQuery + req.query.beerId + slashBreweries + '?' + keyString;



	console.log("pathBreweries");
	console.log(optionsBreweries.path);
	console.log("queryBreweries");
	console.log(req.query);


	http.request(optionsBreweries, callback).end();
});





module.exports = router;