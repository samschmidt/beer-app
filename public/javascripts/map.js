/* map.js
  *
  * This file contains code that relates to map functionality.
  * This includes the map definition and the code the plots
  *  breweries onto the map. No beers or recommendations should be
  *  manipulated here.
  */

//Global map vars
//Holds the map's bounds used once all breweries are mapped
var bounds;// = new google.maps.LatLngBounds();
//Array that holds all markers displayed on map
var markers = [];

var searchLocation;

var infoWindowGlobal;

var infoWindowTemplate = '<div class="infoWindow"> \
<h2 class="infoWindowHeading"></h2> \
<div class="infoWindowContent"> \
<p class="otherinfo"></p> \
<p> \
<span class="description">No description available.</span>\
<span class="description-more hide"></span>\
<a class="description-more-click hide"> more...</a>\
</p> \
</p> \
</div> \
</div>';

// Events
$( document ).ready( function() {

  //When the user clicks the "more" text after the brewery description
  $('#map').on('click', '.description-more-click', function() {
    // Show more text
    $(event.target).siblings('.description-more').removeClass('hide');
    // Hide the more link
    $(event.target).addClass('hide');
  });


});

var map;
function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 39.117189, lng: -84.520097},
    zoom: 8
  });

  //initialize any vars you might need
  bounds = new google.maps.LatLngBounds();

  $('#zoom-to-location-btn').click(searchButtonClick);
  $('#use-my-location-search').click(useMyLocationButtonClick);

}//initMap();


/**
 * This function gets us started. It zooms to the user's entered location and plots
 *  the breweries in that location.
 * Called when the user clicks the search button or hits enter.
 */
function zoomToArea() {
  console.log("Zooming to the user's location");

  var geocoder = new google.maps.Geocoder();

  var location = searchLocation;//$('#zoom-to-location-txt').val().trim();
  console.log("Loc is");
  console.log(location);

  if (location.length == 0)
  {
    // do nothing for now
    // Maybe ask the user for their location
  }
  else
  {
    geocoder.geocode(
    {
      address: location
    }, function(results, status) {
      if (status == google.maps.GeocoderStatus.OK)
      {
        map.setCenter(results[0].geometry.location);

        console.log("user's location is at latlng " +
          results[0].geometry.location.lat() + "  " + results[0].geometry.location.lng());

        breweryDbSearchByLatLng(results[0].geometry.location);
      }
      else
      {
        alert("We couldn't find that location. Sorry!");
      }
    });
  }
}

// When the search button is clicked,
// save the user's location and do the search
function searchButtonClick() {
  searchLocation = $('#zoom-to-location-txt').val();
  zoomToArea();
}

// When the "use my location" button is clicked,
// populate the search box and trigger the search
function useMyLocationButtonClick() {
  // Ask for user's location
  var userLocInfoWindow = new google.maps.InfoWindow({map: map});

  // Try HTML5 geolocation.
  //https://developers.google.com/maps/documentation/javascript/geolocation
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      var pos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };

      userLocInfoWindow.setPosition(pos);
      userLocInfoWindow.setContent('Location found.');
      map.setCenter(pos);


      // If provided, save user's location
      // $('#zoom-to-location-txt').val(pos.lat + ' ' + pos.lng);
      searchLocation = pos.lat + ", " + pos.lng;

      // Trigger brewery search
      zoomToArea();

    }, function() {
      handleLocationError(true, userLocInfoWindow, map.getCenter());
    });
  } else {
    // Browser doesn't support Geolocation
    handleLocationError(false, userLocInfoWindow, map.getCenter());
  }

function handleLocationError(browserHasGeolocation, infoWindow, pos) {
  infoWindow.setPosition(pos);
  infoWindow.setContent(browserHasGeolocation ?
    'Error: The Geolocation service failed.' :
    'Error: Your browser doesn\'t support geolocation.');
  }
}


$( document ).ready( function() {
  /**
    * When the user presses enter in the location box, trigger the search.
    */
  $("#zoom-to-location-txt").bind("keypress", {}, keypressInBox);

  function keypressInBox(e) {
    var code = (e.keyCode ? e.keyCode : e.which);
    if (code == 13) { //Enter keycode
        e.preventDefault();
        $("#zoom-to-location-btn").click();
    }
  };
});


/**
 * Remove all markers from the map object
 */
function clearMarkersFromMap()
{
  markers.forEach( function(element, index, array) {
    element.setMap(null);
  })
}


/**
 * Search the BreweryDB for breweries within default range of latLng.
 * Callback gives control to plotBreweries()
 */
function breweryDbSearchByLatLng(latLng)
{
  //Jquery AJAX
  $.get('/searchLatLng?lat=' + latLng.lat() + "&lng=" + latLng.lng(),
        plotBreweries,
        "json");
}

/**
 * Display all found breweries on the map.
 * This function is the callback for the latlng search.
 */
function plotBrewery(element, index, array)
{
  console.log("\t"+element.brewery.name);
  console.log("\t"+element.latitude + "\t" + element.longitude);

  //Object to be mapped
  breweryLatLng = new google.maps.LatLng({lat: element.latitude, lng: element.longitude});

  var marker = new google.maps.Marker({
    position: breweryLatLng,
    map: map,
    title: element.brewery.name
  });

  marker.addListener('click', function() {
    if (infoWindowGlobal && infoWindowGlobal !== undefined)
      infoWindowGlobal.close();


    console.log(element);

    var infoWindowContentStr = fillInfoWindowTemplateWithBrewery(element);

    infoWindowGlobal = new google.maps.InfoWindow({
      content: infoWindowContentStr
    });

    infoWindowGlobal.open(map, marker);
  });


  markers.push(marker);

  bounds.extend(breweryLatLng);
}

/**
 * Fill an infoWindowTemplate string with information from the given brewery.
 * Return the new, information-filled string
 */
function fillInfoWindowTemplateWithBrewery(brewery)
{
    var infoWindowContent = $.parseHTML(infoWindowTemplate);
    console.log(infoWindowContent);


    if (brewery.brewery && brewery.brewery.name)
    {
      var nameElt = $(infoWindowContent).find('.infoWindowHeading');
      nameElt.html(brewery.brewery.name);
    }
    if (brewery.yearOpened)
    {
      var yearElt = $(infoWindowContent).find('.otherinfo');
      yearElt.html("Opened in " + brewery.yearOpened);
    }
    if (brewery.brewery && brewery.brewery.description)
    {
      var descrElt = $(infoWindowContent).find('.description');
      var descrMoreElt = $(infoWindowContent).find('.description-more');
      var descrMoreClickElt = $(infoWindowContent).find('.description-more-click');

      var descrString = brewery.brewery.description;
      var subStrIdx = 140;

      var descriptionBeginning, descriptionEnd;
      if (descrString.length > subStrIdx)
      {
        descriptionBeginning = descrString.substring(0, subStrIdx);
        descriptionEnd = descrString.substring(subStrIdx, descrString.length);
        //Show the 'more' link
        descrMoreClickElt.removeClass('hide');
      }
      else
      {
        descriptionBeginning = descrString;
        descriptionEnd = '';
        //Hide the 'more' link
        descrMoreClickElt.addClass('hide');
      }


      descrElt.html(descriptionBeginning);
      descrMoreElt.html(descriptionEnd);
    }

    return $(infoWindowContent).prop('outerHTML').toString();
  }

/**
 * Plot the breweries from BreweryDB onto the map.
 * Also fill the in the appropriate pagination information, including
 *  setting globals and drawing the pagination elements.
 */
function plotBreweries(response)
{
  console.log(response);

  console.log("Plot the breweries!");

  //If no breweries found
  if (response.data === undefined)
  {
    alert('Sorry, we couldn\'t find any breweries in that area!');
    return;
  }

  //Clear the markers and the old bounds
  clearMarkersFromMap();
  bounds = new google.maps.LatLngBounds();

  //Save breweries from response to the global array
  breweries = response.data;
  //Set pagination array to be breweries
  currentArray = breweries;



  //Plot breweries and fit the map bounds around them
  breweries.forEach(plotBrewery);
  map.fitBounds(bounds);


  //Set the current pagination variable
  // currentPage = 1;
  // $('#results-pagination .pagination-item').first().addClass('active');

  //Select the breweries tab
  showTabBreweries();
  listResults();
}

////////////////////////////
///OLD OR DEPRECATED CODE///
////////////////////////////

//prelim testing - find breweries by postal code
// function breweryDbLocationSearchByPostalCode(loc)
// {
//   $.get('/dbreq?postalCode=' + loc,
//     function(data) {
//       alert( "Load was performed." + data );
//       console.log(data);
//     },
//     "json");
// }
