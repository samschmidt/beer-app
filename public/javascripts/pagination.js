//
//1-indexed value of the current pagination page being displayed, 0 when no pages visible
var currentPage = 0;

//These values hold the saved pagination states for each tab
var breweryPage = 0;
var beerPage = 0;
var recPage = 0;


//Holds the breweries or beers or recs depending on what is visible
var currentArray = [];

//Globals that contain the current state of the application
//One for each main tab of the page
var breweries = [];
var beers = [];
var beerRecs = [];

//How many search results should we show on each pagination page? Currently 1 value for all 3 tabs.
var paginationSize = 5;


var paginationTemplate = "<li class='pagination-item'><a>1</a></li>";

$( document ).ready( function() {

  $('#results-tabs li').click(function() {
    //enable the correct current tab-section
    var section = $(this).attr('data-section');

    showTab(section);

    listResults();

    console.log(section);

  });

});


/**
 * Wrapper for showTab(). Call showTab() for breweries.
 */
function showTabBreweries()
{
  showTab('brewery-results');
}

/**
 * Wrapper for showTab(). Call showTab() for beers.
 */
function showTabBeers()
{
  showTab('beer-results');
}

/**
 * Wrapper for showTab(). Call showTab() for recommendations.
 */
function showTabRecommendations()
{
  showTab('recommendation-results');
}

/**
 * Transition from displaying one tab to another.
 * Save the old tab's currentPage into the appropriate global (breweryPage, etc.).
 * The display the appropriate tab.
 * Load currentPage from the appropriate global.
 * Create pagination buttons for the new tab.
 * Then display the appropriate data for the value of currentPage.
 * (If currentPage is 1, show values 1-paginationSize.)
 */
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

  //Show the pagination arrows if there are >paginationSize elements
  if (currentArray.length > paginationSize)
    $('#results-pagination').css('display', 'inline-block');
  else
    $('#results-pagination').css('display', 'none');

  //add a nav button for every paginationSize breweries, up to 5
  for (var i=0; i<currentArray.length/paginationSize /*&& i<5*/; i++)
  {
    var paginationToAdd = $.parseHTML(paginationTemplate);

    $(paginationToAdd).children().html(i+1);

    //Only add 5 visible buttons
    if (i>=5)
      $(paginationToAdd).addClass('hide');

    $('#results-pagination .right-arrow').before(paginationToAdd);
  }

  //Display the new tab's current page on the pagination numbers
  var interval = currentPage - oldPage;
  currentPage = oldPage;      //Must edit currentPage so next line edits it to correct value (yay globals...)
  showNewActivePagination(interval);
}

/**
 * When left arrow is clicked, attempt to move the active page down by 1.
 * Decrement current page counter and and highlight the correct page number.
 * Also disable the left arrow if we're now on the first page.
 */
$( document ).ready( function() {
  $('#results-pagination .left-arrow').click(function() {

    //Check if we're at first page
    if (checkIfFirstPage())
    {
      return;
    }
    else
    {
    }

    //Move the active class down 1 pagination element
    showNewActivePagination(-1);

    checkIfFirstPage();
    checkIfLastPage();

    //display correct breweries
    listResults();
  })

/**
 * When right arrow is clicked, attempt to move the active page up by 1.
 * Increment current page counter and and highlight the correct page number.
 * Also disable the right arrow if we're now on the last page.
 */
 $('#results-pagination .right-arrow').click(function() {


    //Check if we're at last page
    if (checkIfLastPage())
    {
      return;
    }
    else
    {
    }

    //Move the active class up 1 pagination element
    showNewActivePagination(1);

    checkIfFirstPage();
    checkIfLastPage();

    //display correct breweries
    listResults();
  });

/**
 * When a pagination number is clicked, move to that page.
 * Increment/decrement current page counter and and highlight the correct page number.
 * Also disable appropriate arrow if we're now on the first/last page.
 */
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



/**
 * Remove .active from old pagination elt
 * Add .active to new pagination elt
 * Does not check to see if either are available, do checking prior
 * Pass in the interval between the currentPage and the newPage (can be + or -)
 */
function showNewActivePagination(interval)
{
  //Get all pagination elements
  var paginationItems = $('#results-pagination .pagination-item');

  //Remove active class from old page number
  var oldPaginationItem = $(paginationItems).get(currentPage-1);
  $(oldPaginationItem).removeClass('active');

  //move to new a results page
  currentPage += interval;

  //Add active class to new page number
  var newPaginationItem = $(paginationItems).get(currentPage-1);
  $(newPaginationItem).addClass('active');

  //If the new item is not visible, display it
  if ($(newPaginationItem).hasClass('hide'))
  {
    if ($(newPaginationItem).removeClass('hide'))

    var visiblePaginationItems = $(paginationItems).not('.hide');

    //If the new item is the first in the list, disable the last item
    var paginationItemFirst = $(visiblePaginationItems).get(0);
    if ($(newPaginationItem).is($(paginationItemFirst)))
    {
      paginationLastVisible = $(visiblePaginationItems).get(visiblePaginationItems.length-1);
      $(paginationLastVisible).addClass('hide');
    }

    //If the new item is the last in the list, disable the first item
    var paginationItemLast = $(visiblePaginationItems).get(visiblePaginationItems.length-1);
    if ($(newPaginationItem).is($(paginationItemLast)))
    {
      var paginationFirstVisible = $(visiblePaginationItems).get(0);
      $(paginationFirstVisible).addClass('hide');
    }
  }

  checkIfFirstPage();
  checkIfLastPage();
}

/**
 * If currentPage is 1, disable left pagination arrow and return true.
 * Else enable it and return false.
 */
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

/**
 * If currentPage is the last page for the current tab, disable right pagination arrow and return true.
 * Else enable it and return false.
 */
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

/**
 * List breweries or beers or recs in the result section.
 * Range to display is [(currentPage-1)*paginationSize, (currentPage*paginationSize)-1]
 * 5 is current page size (declared globally).
 */
function listResults()
{
  //Somewhat redundant to clear all but easier than checking which to do
  $('#results-list').empty();
  $('#beer-list').empty();
  $('#recommendations-list').empty();


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
}
