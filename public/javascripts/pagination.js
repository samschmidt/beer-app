//1-indexed, 0 when no pages visible
var currentPage = 0;

var breweryPage = 0;
var beerPage = 0;
var recPage = 0;


//Holds the breweries or beers or recs depending on what is visible
var currentArray = [];

var paginationSize = 5;


var paginationTemplate = "<li class='pagination-item'><a>1</a></li>";

$( document ).ready( function() {
 
  $('#results-tabs li').click(function() {

    //disable all tabs
    // $('#results-tabs li').removeClass('active');

    //enable the clicked tab
    // $(this).addClass('active');


    //disable all tab-sections
    // var sections = $('.tab-section');

    // sections.addClass('hidden');


    //enable the correct current tab-section
    var section = $(this).attr('data-section');

    // $('.tab-section[data-section="' + section + '"]').removeClass('hidden');


    //TODO pass this?
    showTab(section);

    listResults();

    console.log(section);

  });

});


function showTabBreweries()
{
  showTab('brewery-results');
}

function showTabBeers()
{
  showTab('beer-results');
}

function showTabRecommendations()
{
  showTab('recommendation-results');
}

function showTab(sectionName)
{
  //Get active section
  var activeSection = $('#results-tabs li.active').attr('data-section');

  //Save currentPage to the proper variable
  if (activeSection === 'brewery-results')
  {
    breweryPage = currentPage;
  }
  else if (activeSection === 'beer-results')
  {
    beerPage = currentPage;
  }
  else if (activeSection === 'recommendation-results')
  {
    recPage = currentPage;
  }
  else
  {
    alert('error: Section ' + activeSection + ' is not valid! Can only have brewery, beer, and rec sections.');
  }

  //Enable proper new section
  $('#results-tabs li').removeClass('active');

  $('#results-tabs li[data-section="' + sectionName + '"]').addClass('active');

  //disable all tab-sections
  var sections = $('.tab-section');
  sections.addClass('hidden');

  $('.tab-section[data-section="' + sectionName + '"]').removeClass('hidden');

  //Load currentPage from proper variable
  var oldPage = currentPage;
  if (sectionName === 'brewery-results')
  {
    currentPage = breweryPage;
    currentArray = breweries;
  }
  else if (sectionName === 'beer-results')
  {
    currentPage = beerPage;
    currentArray = beers;
  }
  else if (sectionName === 'recommendation-results')
  {
    currentPage = recPage;
    currentArray = beerRecs;
  }

  //currentPage is only 0 when no values are visible
  if (currentPage === 0)
    currentPage = 1;


  //Clear pagination numbers
  $('#results-pagination li.pagination-item').remove();

  //add a nav button for every paginationSize breweries, up to 5
  for (var i=0; i<currentArray.length/paginationSize && i<5; i++)
  {
    var paginationToAdd = $.parseHTML(paginationTemplate);

    $(paginationToAdd).children().html(i+1);

    $('#results-pagination .right-arrow').before(paginationToAdd);
  }

  //Display the new tab's current page on the pagination numbers
  var interval = currentPage - oldPage;
  currentPage = oldPage;      //Must edit currentPage so next line edits it to correct value (yay globals...)
  showNewActivePagination(interval);
}

//When left arrow is clicked
$( document ).ready( function() {
  $('#results-pagination .left-arrow').click(function() {

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
    listResults();
  })

  //When right arrow is clicked
  $('#results-pagination .right-arrow').click(function() {


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
    listResults();
  });

  //When an item is clicked
  $('#results-pagination').on('click', '.pagination-item', function() {

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
    listResults();
  });

});



//Remove .active from old pagination elt
//Add .active to new pagination elt
//Does not check to see if either are available, do checking prior
//Pass in the interval between the currentPage and the newPage (can be + or -)
function showNewActivePagination(interval) 
{
  //Get all pagination elements
  var paginationItems = $('#results-pagination .pagination-item');

  //Remove active class from old page number
  var oldPageJquery = $(paginationItems).get(currentPage-1);
  $(oldPageJquery).removeClass('active');

  //move to new a results page
  currentPage += interval;

  //Add active class to new page number
  var newPageJquery = $(paginationItems).get(currentPage-1);
  $(newPageJquery).addClass('active');

  // listResults();

  checkIfFirstPage();
  checkIfLastPage();
}

//If currentPage is 1, disable left pagination arrow and return true
//Else enable it and return false
function checkIfFirstPage()
{
  if (currentPage === 1)
  {
    //Disable arrow
    $('#results-pagination .left-arrow').addClass('disabled');

    return true;
  }

  $('#results-pagination .left-arrow').removeClass('disabled');

  return false;
}

//If currentPage is the last page, disable right pagination arrow and return true
//Else enable it and return false
function checkIfLastPage()
{
  if (currentPage === Math.floor(currentArray.length / paginationSize) + 1)
  {
    //Disable arrow
    $('#results-pagination .right-arrow').addClass('disabled');

    return true;
  }

  $('#results-pagination .right-arrow').removeClass('disabled');

  return false;
}

//Old:List breweries in the results section

//Now:List breweries or beers or recs in the result section
//Range should be [(currentPage-1)*paginationSize, (currentPage*paginationSize)-1]
//5 is current page size
function listResults()
{
  //Somewhat redundant to clear all but easier than checking which to do
  $('#results-list').empty();
  $('#beer-list').empty();
  $('#recommendations-list').empty();

  //Get active section
  // var activeSection = $('#results-tabs li.active').attr('data-section');

  //Save currentPage to the proper variable
  // if (activeSection === 'brewery-results')
  // {
    //i is the brewery index
    //j counts from 0 to paginationSize-1 to easily see when to stop
    for (var i=(currentPage-1)*paginationSize, j=0; j<paginationSize; i++, j++)
    {
      if (currentArray.length <= i)
        break;

      if (currentArray === breweries)
        listBrewery(currentArray[i]);

      else if (currentArray === beers)
        listBeer(currentArray[i], i, undefined);

      else if (currentArray === beerRecs)
        listBeerRec(currentArray[i], i, undefined);
    }

    //Select the breweries tab
    // showTabBreweries();
  // }
  // else if (activeSection === 'beer-results')
  // {
  //  // beerPage = currentPage;
  // }
  // else if (activeSection === 'recommendation-results')
  // {
  //  // recommendationPage = currentPage;
  // }
  // else
  // {
  //  alert('error: Section ' + activeSection + ' is not valid! Can only have brewery, beer, and rec sections.');
  // }

  // //Select the breweries tab
  // showTabBreweries();
}