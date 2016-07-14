var beers;
// var beerTemplate = "<li class='list-group-item'>Cras justo odio</li>";

var beerTemplate =
"<li class='list-group-item'> \
<p><img class='main-img' style='float:left; margin-right: 10px;' height='100px' max-width='75px' src='images/no_image_available.png' alt='No Image Available'> \
<h4 class='beerName'><a>Beer Name</a></h4> \
<h5 class='beerStyle'>Style</h5> \
<h5 class='beerInfo' style='clear:left'><span class='abv'>ABV%</span><span class='pipe'> | </span><span class='ibu'></span><span class='pipe'> | </span></h5><img style='float:right;' height='25px' max-width='25px' src='images/no_image_available.png' alt='No Image Available'> \
</p> \
</li>"
;


$( document ).ready( function() {
	
	//When a brewery from the results list is selected
	$('#results-list').on('click', '.list-group-item', function() {
		console.log('brewery clicked');

		//Get brewery index
		var idx = paginationSize*(currentPage-1) + $( "#results-list .list-group-item" ).index( this );

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


		//List the beers on the page
		// beers.forEach(listYearRoundBeers);

		beers.forEach(listBeer);

		// //Hide all current tab-sections
		// $('.tab-section').addClass('hidden');

		// //Show the proper tab-section
		// $('#tab-beer-results.tab-section').removeClass('hidden');

		//Show the proper tab-section
		showTabBeers();
	};
}

//Add a brewery to the results list
function listBeer(beer, index, array)
{
	//if (beer === undefined)

	var beerToAdd = $.parseHTML(beerTemplate);

	console.log(beer);


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
	}


	// $(beerToAdd).html(beer.name);

	$('#beer-list').append(beerToAdd);
}

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
