//map.js
/*
 * This file contains code that relates to map functionality.
 *
 *
 */

//Global vars
//Holds the bounds to be used once all breweries are mapped
var bounds;// = new google.maps.LatLngBounds();
var markers = [];

var map;
function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 39.117189, lng: -84.520097},
    zoom: 8
  });


  //initialize any vars you might need
  bounds = new google.maps.LatLngBounds();



  // var rhinegeist = {lat: 39.117189, lng: -84.520097};
  // var marker = new google.maps.Marker({
  //   position: rhinegeist,
  //   map: map,
  //   title: 'Here be Rhinegeist!'
  // });

  // var infowindow = new google.maps.InfoWindow({
  //   content: 'This is the location of RG'
  // })

  // marker.addListener('click', function() {
  //   infowindow.open(map, marker);
  // })

  $('#zoom-to-location-btn').click(zoomToArea);


}//initMap();

//Search the BreweryDB for breweries within default range of latLng
function breweryDbSearchByLatLng(latLng)
{
  //Jquery AJAX
  $.get('/searchLatLng?lat=' + latLng.lat() + "&lng=" + latLng.lng(),
        plotBreweries,
        "json");
}

function clearMarkersFromMap()
{
  markers.forEach( function(element, index, array) {
    element.setMap(null);
  })
}


function plotBrewery(element, index, array)
{
  console.log("\t"+element.brewery.name);
  console.log("\t"+element.latitude + "\t" + element.longitude);

  breweryLatLng = new google.maps.LatLng({lat: element.latitude, lng: element.longitude});


  var marker = new google.maps.Marker({
    position: breweryLatLng,
    map: map,
    title: element.brewery.name
  });

  markers.push(marker);

  bounds.extend(breweryLatLng);


  // var infowindow = new google.maps.InfoWindow({
  //   content: 'This is the location of RG'
  // })

  // marker.addListener('click', function() {
  //   infowindow.open(map, marker);
  // })
}

//Plot the breweries from BreweryDB onto the map
function plotBreweries(response)
{
  console.log(response);

  console.log("Plot the breweries!");

  //If no breweries found
  //TODO display some better message
  if (response.data === undefined)
  {
    alert('Sorry, we could find no breweries in that area!');
    return;
  }
  //Save breweries from response
  breweries = response.data;

  //clear the markers and the old bounds
  clearMarkersFromMap();
  bounds = new google.maps.LatLngBounds();

  breweries.forEach(plotBrewery);

  //fit bounds to the mapped breweries
  map.fitBounds(bounds);


  //Clear breweries from list
  $('#results-list').empty();

  //Display the first paginationSize breweries in search results
  for (var i=0; i<paginationSize; i++)
  {
    listBrewery(breweries[i]);
  }


  //Clear pagination numbers
  $('#results-pagination li.pagination-item').remove();

  //add a nav button for every paginationSize breweries, up to 5
  for (var i=0; i<breweries.length/paginationSize && i<5; i++)
  {
    var paginationToAdd = $.parseHTML(paginationTemplate);

    $(paginationToAdd).children().html(i+1);

    $('#results-pagination .right-arrow').before(paginationToAdd);
  }

  //set the current page variable
  currentPage = 1;
  $('#results-pagination .pagination-item').first().addClass('active');

  //Select the breweries tab
  showTabBreweries();


  // console.log("\t"+breweriesArr[0].brewery.name);
  // console.log("\t"+breweriesArr[0].latitude + "\t" + breweriesArr[0].longitude);


  // var marker = new google.maps.Marker({
  //   position: {lat: breweriesArr[0].latitude, lng: breweriesArr[0].longitude},
  //   map: map,
  //   title: breweriesArr[0].name
  // });

  // var infowindow = new google.maps.InfoWindow({
  //   content: 'This is the location of RG'
  // })

  // marker.addListener('click', function() {
  //   infowindow.open(map, marker);
  // })


}






//Find nearby breweries and zoom to their area
function zoomToArea() {
  console.log("Zooming to the user's location");

  var geocoder = new google.maps.Geocoder();

  var location = $('#zoom-to-location-txt').val().trim();
  console.log("Loc is '" + location + "'");

  if (location.length == 0)
  {
    //do nothing for now
    //Maybe ask the user for their location
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


//When the user presses enter in the location box, trigger the search
$( document ).ready( function() {
  $("#zoom-to-location-txt").bind("keypress", {}, keypressInBox);

  function keypressInBox(e) {
      var code = (e.keyCode ? e.keyCode : e.which);
      if (code == 13) { //Enter keycode                        
          e.preventDefault();

          console.log("enter pressed in box");

          $("#zoom-to-location-btn").click();
      }
  };
});


////////////////////////////
///OLD OR DEPRECATED CODE///
////////////////////////////

//prelim testing - find breweries by postal code
function breweryDbLocationSearchByPostalCode(loc)
{
  $.get('/dbreq?postalCode=' + loc,
    function(data) {
      alert( "Load was performed." + data );
      console.log(data);
    },
    "json");
}