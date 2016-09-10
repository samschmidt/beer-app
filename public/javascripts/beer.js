var beerTemplate =
"<li class='list-group-item'> \
<p><img class='main-img' style='float:left; margin-right: 10px;' height='100px' max-width='75px'> \
<h4 class='beerName resultName'><a>Beer Name</a></h4> \
<h5 class='beerStyle'>Style</h5> \
<h5 class='beerInfo' style='line-height: 25px'><span class='abv'></span> \
<span class='pipe'> | </span><span class='ibu'></span> \
<img class='beerGlass' style='float:right;' height='40px' max-width='40px'></h5> \
</p> \
</li>"
;


$( document ).ready( function() {
	
	//When a brewery from the results list is selected
	$('#results-list').on('click', '.list-group-item', function() {
		console.log('brewery clicked');

		//Get brewery index
		var idx = paginationSize*(currentPage-1) + $( "#results-list .list-group-item" ).index( this );

		//Select the marker on the map that corresponds to this brewery
		google.maps.event.trigger(markers[idx], 'click');

		//Get brewery id
		console.log(idx);
		console.log(breweries[idx].breweryId);

		//Search for their beers
		breweryDbBeersByBreweryId(breweries[idx]);
		//callback lists the beers on the page
	});
});


//Search the BreweryDB for beers that belong to the given brewery
function breweryDbBeersByBreweryId(brewery)
{
  //Jquery AJAX
  $.get('/beersForBrewery?breweryId=' + brewery.breweryId,
        listBeers(brewery),
        "json");
}

//Callback for beer search (given breweryId)
function listBeers(brewery)
{
	//Define fn pointer to $.get callback so we can pass in the brewery (just above)
	return function(response, textStatus, jqXHR) {
    
		console.log(response);

		beers = response.data;

		

		//TODO clean this up
		if (beers === undefined || beers.length === undefined || beers.length === 0)
		{
			//If no beers, show an informative message
			alert("We couldn't find any beers associated with the brewery: " + brewery.brewery.name);
			return;
		}

		console.log("list beers for brewery (" + beers.length + " beers.)");

		//Clear beers from list
		$('#beer-list').empty();


		console.log(beers);

		beers.sort(compareBeersByAvailability);

		console.log('SORTED\n\n\n');

		console.log(beers);

		//List the beers on the page
		// beers.forEach(listYearRoundBeers);

		// beers.forEach(listBeer);


		// //Hide all current tab-sections
		// $('.tab-section').addClass('hidden');

		// //Show the proper tab-section
		// $('#tab-beer-results.tab-section').removeClass('hidden');

		//Show the proper tab-section
		showTabBeers();

		listResults();
	};
}

/** 
 * Add a beer to the visible results list.
 */
function listBeer(beer, index, array)
{
	//if (beer === undefined)

	var beerToAdd = $.parseHTML(beerTemplate);

	// console.log(beer);


	if (beer.nameDisplay)
	{
		var nameElt = $(beerToAdd).find('.beerName');
		$(nameElt).html(beer.nameDisplay);
	}
	else if (beer.name)
	{
		var nameElt = $(beerToAdd).find('.beerName');
		$(nameElt).html(beer.name);
	}

	if (beer.labels && beer.labels.medium)
	{
		var imgElt = $(beerToAdd).find('img.main-img');
		$(imgElt).prop('src', beer.labels.medium);

		//Then we must clear:left the info element so it appears below the img
		//also re-add the auto indent
		// var infoElt = $(beerToAdd).find('.beerInfo');
		// $(infoElt).css('clear', 'left');
		// $(infoElt).css('margin-left', '10px');
		// $(imgElt).css('margin-left', '10px');
	}

	if (beer.style && beer.style.name)
	{
		var styleElt = $(beerToAdd).find('.beerStyle');
		$(styleElt).html(beer.style.name);
	}

	if (beer.abv)
	{
		var abvElt = $(beerToAdd).find('.abv');
		$(abvElt).html(beer.abv + '% ABV');
	}
	else if (beer.style && beer.style.abvMin && beer.style.abvMax)
	{
		var abvElt = $(beerToAdd).find('.abv');
		$(abvElt).html(beer.style.abvMin + '-' + beer.style.abvMax + '% ABV');
	}

	if (beer.ibu)
	{
		var ibuElt = $(beerToAdd).find('.ibu');
		$(ibuElt).html(beer.ibu + ' IBUs');
	}
	else if (beer.style && beer.style.ibuMin && beer.style.ibuMax)
	{
		var ibuElt = $(beerToAdd).find('.ibu');
		$(ibuElt).html(beer.style.ibuMin + '-' + beer.style.ibuMax + ' IBUs');
	}

	//TODO logic for glassware image
	//may need to default to what the style typically takes
	//this will take some work
	//https://www.beeradvocate.com/beer/101/glassware/
	if (beer.glass && beer.glass.id)
	{
		var glassElt = $(beerToAdd).find('.beerGlass');
		$(glassElt).prop('src', 'images/glass' + beer.glass.id +'.png');
	}
	else if (beer.glasswareId)
	{
		var glassElt = $(beerToAdd).find('.beerGlass');
		$(glassElt).prop('src', 'images/glass' + beer.glasswareId +'.png');
	}

	$('#beer-list').append(beerToAdd);
}



function compareBeersByAvailability(beer1, beer2)
{
	var avail1 = beer1.availableId;
	var avail2 = beer2.availableId;

	// if (avail1 === undefined)
		// return 1;
	// else if (avail2 === undefined)
		// return -1;

	if (avail1 === 1 && avail2 === 1)
		return 0;
	else if (avail1 === 1)
		return -1;
	else if (avail2 === 1)
		return 1;

	return 0;
}


//Unused yet
function listYearRoundBeers(beer, index, array)
{
	console.log(beer);

	if (beer.available && beer.available.id && beer.available.id === 1)
		listBeer(beer, 0, undefined);

	array.splice(index, 1);
}

// function listOtherBeers(beer, index, array)
// {
// 	//console.log(beer);

// 	if (beer.available.id !== 1)
// 		listBeer(beer, 0, undefined);

// 	// array.splice(index, 1);
// }
