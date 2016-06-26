//Global vars
//Holds the bounds to be used once all breweries are mapped
var bounds;// = new google.maps.LatLngBounds();
var markers = [];
//Holds the response.data array (list of breweries)
var breweries;

var resultTemplate = "<li class='list-group-item'>Cras justo odio</li>";
var paginationTemplate = "<li class='pagination-item'><a>1</a></li>";


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

//Add a brewery to the results list
function listBrewery(brewery)
{
  var breweryToAdd = $.parseHTML(resultTemplate);
  
  $(breweryToAdd).html(brewery.brewery.name);
  
  $('#results-list').append(breweryToAdd);
}

//Plot the breweries from BreweryDB onto the map
function plotBreweries(response)
{
  console.log(response);

  console.log("Plot the breweries!");

  //If no breweries found
  //TODO display some message
  if (response.data === undefined)
    return;

  //Save breweries from response
  breweries = response.data;

  //clear the markers and the old bounds
  clearMarkersFromMap();
  bounds = new google.maps.LatLngBounds();

  breweries.forEach(plotBrewery);

  //fit bounds to the mapped breweries
  map.fitBounds(bounds);


  //Display the first 5 breweries in search results
  for (var i=0; i<5; i++)
  {
    listBrewery(breweries[i]);
  }

  //add a nav button for every 5 breweries, up to 5
  for (var i=0; i<breweries.length/5 && i<5; i++)
  {

    var paginationToAdd = $.parseHTML(paginationTemplate);

    $(paginationToAdd).children().html(i+1);

    $('#beer-results-pagination .right-arrow').before(paginationToAdd);
  }

  //set the current page variable (pagination.js)
  currentPage = 1;
  $('#beer-results-pagination .pagination-item').first().addClass('active');



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



//Search the BreweryDB for breweries within default range of latLng
function breweryDbSearchByLatLng(latLng)
{
  //Jquery AJAX
  $.get('/searchLatLng?lat=' + latLng.lat() + "&lng=" + latLng.lng(),
        plotBreweries,
        "json");
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
        
        console.log("user's location is at latlng " + results[0].geometry.location.lat() + "  " + results[0].geometry.location.lng());

        breweryDbSearchByLatLng(results[0].geometry.location);
      }
      else
      {
        alert("We couldn't find that location. Sorry!");
      }
    });

    
  }
}


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



$( document ).ready( function() {
 
  $('#results-tabs li').click(function() {

    //diable all tabs
    $('#results-tabs li').removeClass('active');

    //enable the clicked tab
    $(this).addClass('active');


    //disable all tab-sections
    var sections = $('.tab-section');

    sections.addClass('hidden');


    //enable the correct current tab-section
    var section = $(this).attr('data-section');

    $('.tab-section[data-section="' + section + '"]').removeClass('hidden');


    console.log(section);

  });

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