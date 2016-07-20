// var beerRecTemplate = "<li class='list-group-item'>Rec Template</li>";

$( document ).ready( function() {
	
	/**
	 * Trigger AJAX call when a brewery from the results list is selected.
	 */
	$('ul#beer-list').on('click', 'li', function() {
		console.log('beer clicked');

		var beerIndex = $( "ul#beer-list li" ).index( this );
		beerIndex = ((currentPage-1) * paginationSize) + beerIndex;

		//Get brewery id
		console.log(beers[beerIndex].name);
		console.log(beers[beerIndex]);


		//Search for their beers
		breweryDbBeerRecs(beers[beerIndex]);
		//callback lists the beers on the page
	});
});

/**
 * Get all beers from all breweries in the global breweries array.
 * Use $.when.apply callback to process them once all of them arrive.
 */
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

/**
 * Callback from beersFromBrewery AJAX
 * Add all beers to the beerRecs array
 */
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


/**
 * Decide which beers are sufficiently similar to the given beer.
 * Then list them on the page.
 */
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

	//Save the recommended beers to the global array
	beerRecs  = beerRecsByStyleId;

	//Show the proper tab-section
	showTabRecommendations();
}

/**
 * Add a beer recommendation to the visible results list.
 */
function listBeerRec(beerRec, index, array)
{
	// listBeer(beerRec, index, array);

  // var recToAdd = $.parseHTML(beerRecTemplate);



	var recToAdd = $.parseHTML(beerTemplate);

	console.log(beerRec);

	//TODO use premium method of brewery/beers?withBreweries=Y
	//Jquery AJAX
	//TODO do this outside of this function so it's only done once
	$.get('/breweriesForBeer?beerId=' + beerRec.id,
	    insertBreweryNameIntoRec(recToAdd),
	    "json");


	if (beerRec.nameDisplay)
	{
		var nameElt = $(recToAdd).find('.beerName');
		$(nameElt).html(beerRec.nameDisplay);
	}
	else if (beerRec.name)
	{
		var nameElt = $(recToAdd).find('.beerName');
		$(nameElt).html(beerRec.name);
	}

	if (beerRec.labels && beerRec.labels.medium)
	{
		var imgElt = $(recToAdd).find('img.main-img');
		$(imgElt).prop('src', beerRec.labels.medium);

		//Then we must clear:left the info element so it appears below the img
		//also re-add the auto indent
		// var infoElt = $(recToAdd).find('.beerInfo');
		// $(infoElt).css('clear', 'left');
		// $(infoElt).css('margin-left', '10px');
		// $(imgElt).css('margin-left', '10px');
	}

	if (beerRec.style && beerRec.style.name)
	{
		var styleElt = $(recToAdd).find('.beerStyle');
		$(styleElt).html(beerRec.style.name);
	}

	if (beerRec.abv)
	{
		var abvElt = $(recToAdd).find('.abv');
		$(abvElt).html(beerRec.abv + '% ABV');
	}
	else if (beerRec.style && beerRec.style.abvMin && beerRec.style.abvMax)
	{
		var abvElt = $(recToAdd).find('.abv');
		$(abvElt).html(beerRec.style.abvMin + '-' + beerRec.style.abvMax + '% ABV');
	}

	if (beerRec.ibu)
	{
		var ibuElt = $(recToAdd).find('.ibu');
		$(ibuElt).html(beerRec.ibu + ' IBUs');
	}
	else if (beerRec.style && beerRec.style.ibuMin && beerRec.style.ibuMax)
	{
		var ibuElt = $(recToAdd).find('.ibu');
		$(ibuElt).html(beerRec.style.ibuMin + '-' + beerRec.style.ibuMax + ' IBUs');
	}

  
	$('#recommendations-list').append(recToAdd);
}

/**
 * Currently the breweryDB API won't give use the brewery name back when
 *  searching for brewery->beers. The premium account allows this.
 * Must use a separate API call to save each beer's brewery.
 */
function insertBreweryNameIntoRec(recToAdd)
{
	return function(response, textStatus, jqXHR) {
    
    	console.log("testestestestes");
		console.log(response);

		var responseBreweries = response.data;


		if (responseBreweries !== undefined)
		{
			var styleElt = $(recToAdd).find('.beerInfo');
			$(styleElt).html(responseBreweries[0].name);
		}
	}
}