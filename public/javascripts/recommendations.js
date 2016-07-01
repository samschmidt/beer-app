var beerRecs = [];
var beerRecTemplate = "<li class='list-group-item'>Rec Template</li>";

//TODO make the template much better
//show brewery, etc.

$( document ).ready( function() {
	
	//When a brewery from the results list is selected
	$('ul#beer-list').on('click', 'li', function() {
		console.log('beer clicked');

		//Get beer index
		var idx = $( "ul#beer-list li" ).index( this );

		//Get brewery id
		console.log(beers[idx].name);
		console.log(beers[idx]);


		//Search for their beers
		breweryDbBeerRecs(beers[idx]);
		//callback lists the beers on the page
	});
});


function breweryDbBeerRecs(clickedBeer)
{
	console.log("getting beers to choose recs from");
	
	//Clear out any old recs
	beerRecs = [];

	//save the user's beer so we can access it later
	//may not need to do this - would rather not
	// clickedBeer = beer;

	var deferreds = [];

	//Use breweries already searched for now
	for (var i=0; i<breweries.length; i++)
	{
		console.log(breweries[i].breweryId);

		deferreds.push(
			$.get('/beersForBrewery?breweryId=' + breweries[i].breweryId,
				addBeerstoArray,
				"json")
		);

			
	}

	//When here, all beers have been retrieved and are in beerRecs
	$.when.apply($, deferreds).done( function() {
		processAndListRecs(clickedBeer)
	});
}

//Callback from beersFromBrewery AJAX
//Add all beers to the beerRecs array so we can evaluate them
function addBeerstoArray(response)
{
	var beers = response.data;
	console.log(beers);

	if(beers === undefined)
		return;

	//Fastest way to empty array
	//http://stackoverflow.com/questions/1232040/how-do-i-empty-an-array-in-javascript


	for (var i=0; i<beers.length; i++)
	{
		// beerRecs.push(beers[i]);
		beerRecs[beerRecs.length] = beers[i];
	}
}


//Decide which beers are sufficiently similar to the given beer
//And list them on the page
function processAndListRecs(clickedBeer)
{
	console.log("user's beer is ");
	console.log(clickedBeer);

	//This should occur if there is only 1 beer in the given radius
	//Unlikely, but display an informative message
	if (beerRecs === undefined || beerRecs.length === 0)
	{
		alert("We couldn't find any other beers within your radius.\n" +
				"Try expanding it or searching in another location to find recommendations");
		return;
	}

	var beerRecsByStyleId = [];

	//Evaluate each beer
	for (var i=0; i<beerRecs.length; i++)
	{
		if (beerRecs[i].styleId === clickedBeer.styleId)
		{
			beerRecsByStyleId.push(beerRecs[i]);

			console.log(beerRecs[i]);
		}
	}

	//Clear any recs off of the page
	$('#recommendations-list').empty();


	//TODO display "showing recommendations for [your beer] from [the brewery]"

	//TODO show a nice msg if no beers recommended (may show style, etc.)

	//List the recs on the page
	beerRecsByStyleId.forEach(listBeerRec);

	// //Hide all current tab-sections
	// $('.tab-section').addClass('hidden');

	// //Show the proper tab-section
	// $('#tab-beer-recommendations.tab-section').removeClass('hidden');

	//Show the proper tab-section
	showTabRecommendations();
}

//Add a brewery to the results list
function listBeerRec(beerRec, index, array)
{
  var recToAdd = $.parseHTML(beerRecTemplate);
  
  $(recToAdd).html(beerRec.name);
  
  $('#recommendations-list').append(recToAdd);
}