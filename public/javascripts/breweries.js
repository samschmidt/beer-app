//1-indexed, 0 when no pages visible
var currentPage = 0;
var paginationSize = 5;

//When left arrow is clicked
$( document ).ready( function() {
	$('#beer-results-pagination .left-arrow').click(function() {

		//Check if we're at first page
		if (checkIfFirstPage())
		{
			return;
		}
		else
		{
			//TODO see if we need to shift all #s dn
			//if currentPage is not the first page,
			//but it is the first visible pagination number
			//shift all numbers down 1
		}

		//Move the active class down 1 pagination element
		showNewActivePagination(-1);

		checkIfFirstPage();
		checkIfLastPage();

		//display correct breweries
		listBreweries();
	})

	//When right arrow is clicked
	$('#beer-results-pagination .right-arrow').click(function() {


		//Check if we're at last page
		if (checkIfLastPage())
		{
			return;
		}
		else
		{
			//TODO see if we need to shift all #s up
			//if currentPage is not the last page,
			//but it is the last visible pagination number
			//shift all numbers up 1
		}

		//Move the active class up 1 pagination element
		showNewActivePagination(1);

		checkIfFirstPage();
		checkIfLastPage();

		//display correct breweries
		listBreweries();
	});

	//When an item is clicked
	$('#beer-results-pagination').on('click', '.pagination-item', function() {

		//get number from clicked element
		var newPageNum = $(this).children().html();

		var interval = newPageNum - currentPage;

		//If we're not moving between pages, quit
		if (interval == 0)
			return;

		showNewActivePagination(interval);


		//check if first or last page
		checkIfFirstPage();
		checkIfLastPage();

		//display correct breweries
		listBreweries();
	});

});



//Remove .active from old pagination elt
//Add .active to new pagination elt
//Does not check to see if either are available, do checking prior
//Pass in the interval between the currentPage and the newPage (can be + or -)
function showNewActivePagination(interval) 
{
	//Get all pagination elements
	var paginationItems = $('#beer-results-pagination .pagination-item');

	//Remove active class from old page number
	var oldPageJquery = $(paginationItems).get(currentPage-1);
	$(oldPageJquery).removeClass('active');

	//move to new a results page
	currentPage += interval;

	//Add active class to new page number
	var newPageJquery = $(paginationItems).get(currentPage-1);
	$(newPageJquery).addClass('active');
}

//If currentPage is 1, disable left pagination arrow and return true
//Else enable it and return false
function checkIfFirstPage()
{
	if (currentPage === 1)
	{
		//Disable arrow
		$('#beer-results-pagination .left-arrow').addClass('disabled');

		return true;
	}

	$('#beer-results-pagination .left-arrow').removeClass('disabled');

	return false;
}

//If currentPage is the last page, disable right pagination arrow and return true
//Else enable it and return false
function checkIfLastPage()
{
	if (currentPage === Math.floor(breweries.length / paginationSize) + 1)
	{
		//Disable arrow
		$('#beer-results-pagination .right-arrow').addClass('disabled');

		return true;
	}

	$('#beer-results-pagination .right-arrow').removeClass('disabled');

	return false;
}

//List breweries in the results section
//Range should be [(currentPage-1)*paginationSize, (currentPage*paginationSize)-1]
//5 is current page size
function listBreweries()
{
	//Remove visible breweries
	$('#results-list li').remove()

	//i is the brewery index
	//j counts from 0 to paginationSize-1 to easily see when to stop
	for (var i=(currentPage-1)*paginationSize, j=0; j<paginationSize; i++, j++)
	{
		if (breweries.length > i)
			listBrewery(breweries[i]);
	}

	//Select the breweries tab
	showTabBreweries();
}