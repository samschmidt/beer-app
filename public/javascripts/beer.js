var beers;
var beerTemplate = "<li class='list-group-item'>Cras justo odio</li>";

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

		console.log("list beers for brewery");

		beers = response.data;

		//Clear beers from list
		$('#beer-list').empty();


		//TODO clean this up
		if (beers === undefined || beers.length === 0)
		{
			//If no beers, show an informative message
			alert("We couldn't find any beers associated with the brewery: " + brewery.brewery.name);
			return;
		}

		//List the beers on the page
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
  var beerToAdd = $.parseHTML(beerTemplate);
  
  $(beerToAdd).html(beer.name);
  
  $('#beer-list').append(beerToAdd);
}