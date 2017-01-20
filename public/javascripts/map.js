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
<div class="info-window-header"> \
<h2 class="infoWindowHeading"></h2> \
</div> \
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

  // Use a marker instead of an InfoWindow to show user location
  // Image is a blue dot w/ shadow
  // http://stackoverflow.com/questions/9142833/show-my-location-on-google-maps-api-v3
  var userLocMarker = new google.maps.Marker({
  clickable: false,
  icon: new google.maps.MarkerImage('//maps.gstatic.com/mapfiles/mobile/mobileimgs2.png',
                                    new google.maps.Size(22,22),
                                    new google.maps.Point(0,18),
                                    new google.maps.Point(11,11)),
    shadow: null,
    zIndex: 999,
    map:map // your google.maps.Map object
  });

  // Try HTML5 geolocation.
  //https://developers.google.com/maps/documentation/javascript/geolocation
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      var pos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };

    userLocMarker.setPosition(pos);
    map.setCenter(pos);

    // If provided, save user's location
    searchLocation = pos.lat + ", " + pos.lng;

    // Trigger brewery search
    zoomToArea();

  }, function() {
    handleLocationError(true);
  });
} else {
  // Browser doesn't support Geolocation
  handleLocationError(false);
}

// Still inside useMyLocationButtonClick()
function handleLocationError(browserHasGeolocation) {
  if(browserHasGeolocation)
    alert('Error: The Geolocation service failed.');
  else
    alert('Error: Your browser doesn\'t support geolocation.');
  }
} //End useMyLocationButtonClick()


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

    // Add a listener to clean up the infowindow slightly when it's loaded
    // http://en.marnoto.com/2014/09/5-formas-de-personalizar-infowindow.html
    google.maps.event.addListener(infoWindowGlobal, 'domready', function() {

       // Reference to the DIV which receives the contents of the infowindow using jQuery
       var iwOuter = $('.gm-style-iw');
       var iwBackground = iwOuter.prev();

       // Remove the background shadow DIV
       iwBackground.children(':nth-child(2)').css({'display' : 'none'});

       // Remove the white background DIV
       iwBackground.children(':nth-child(4)').css({'display' : 'none'});

       // Moves the infowindow 115px to the right.
       iwOuter.parent().parent().css({left: '115px'});
       // Moves the shadow of the arrow 76px to the left margin
      iwBackground.children(':nth-child(1)').attr('style', function(i,s){ return s + 'left: 76px !important;'});
      // Moves the arrow 76px to the left margin
      iwBackground.children(':nth-child(3)').attr('style', function(i,s){ return s + 'left: 76px !important;'});
      // Changes the desired color for the tail outline.
      // The outline of the tail is composed of two descendants of div which contains the tail.
      // The .find('div').children() method refers to all the div which are direct descendants of the previous div.
      iwBackground.children(':nth-child(3)').find('div').children().css({'box-shadow': 'rgba(72, 181, 233, 0.6) 0px 1px 6px', 'z-index' : '1'});
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
