//Global vars
//Holds the bounds to be used once all breweries are mapped
var bounds;// = new google.maps.LatLngBounds();
var markers = [];
//Holds the response.data array (list of breweries)
var breweries;

//TODO default image
var resultTemplate =
"<li class='list-group-item'> \
<p><img style='float:left; margin-right: 10px; margin-bottom: 10px;' height='75px' max-width='75px' src='images/no_image_available.png' alt='No Image Available'> \
<h4 class='breweryName'><a>Brewery Name</a></h4> \
<h5 class='breweryType'></h5> \
<h5 class='breweryOpen'></h5> \
<h5 class='breweryContact' style='clear:left'><a class='website'>Website</a><span class='pipe'> | </span><span class='address-and-locality'><span class='address'></span><span class='locality'></span></span><span class='pipe'> | </span><span class='phone'>No Phone</span></h5> \
</p> \
</li>"
;
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

  console.log(breweryToAdd);
  console.log(brewery);
  
  //TODO Fix Defaults
  if (brewery.brewery && brewery.brewery.images && brewery.brewery.images.squareMedium)
  {
    var imgTag = $(breweryToAdd).find('img');
    $(imgTag).prop('src', brewery.brewery.images.squareMedium);

    if (brewery.brewery.nameShortDisplay)
    {
      $(imgTag).prop('alt', brewery.brewery.nameShortDisplay + 'Logo');
    }
    else if (brewery.brewery.name)
    {
      $(imgTag).prop('alt', brewery.brewery.nameShortDisplay + 'Logo');
    }
    else
    {
      $(imgTag).prop('alt', 'Brewery Logo');
    }
  }

  if (brewery.brewery && brewery.brewery.name)
  {
    var nameElt = $(breweryToAdd).find('.breweryName');
    $(nameElt).html(brewery.brewery.name);
  }

  

  // if (brewery.brewery && brewery.brewery.established)
  // {
  //   var estElt = $(breweryToAdd).find('.breweryEstablished');
  //   $(estElt).html('Est. ' + brewery.brewery.established);
  // }  

  if (brewery.isClosed)
  {
    var openElt = $(breweryToAdd).find('.breweryOpen');

    if (brewery.isClosed === "Y")
    {
      if (brewery.yearClosed)
      {
        $(openElt).html('CLOSED since ' + brewery.yearClosed);        
      }
      else
      {
        $(openElt).html('CLOSED');
      }

      $(openElt).css('color', 'red');
    }
    //TODO make green? or not
    else if (brewery.isClosed === 'N')
    {
      // if (brewery.yearOpened)
      // {
      //   $(openElt).html('Opened ' + brewery.yearOpened);        
      // }
      //  else
      // {
      //   $(openElt).html('Open');
      // }

      //if brewery is not closed but is not open to public
      if (brewery.openToPublic && brewery.openToPublic === "N")
      {
        $(openElt).html('Not open to the public');
        $(openElt).css('color', 'red');
      }
    }
  }

  if (brewery.locationTypeDisplay)
  {
    var typeElt = $(breweryToAdd).find('.breweryType');

    $(typeElt).html(brewery.locationTypeDisplay);        
  }



  if (brewery.brewery && brewery.brewery.website)
  {
    var websiteElt = $(breweryToAdd).find('.breweryContact .website');

    if ( brewery.brewery.website !== "")
    {
      $(websiteElt).prop('href', brewery.brewery.website);
    }
  }
  else
  {
    var websiteElt = $(breweryToAdd).find('.breweryContact .website');

    $(websiteElt).html('No Website');

    $(websiteElt).css('text-decoration', 'none');
    $(websiteElt).css('color', 'black');
  }

  if (brewery.streetAddress)
  {
    var addrElt = $(breweryToAdd).find('.breweryContact .address');
    $(addrElt).html(brewery.streetAddress + ', ');
  }  

  if (brewery.locality)
  {
    var localityElt = $(breweryToAdd).find('.breweryContact .locality');
    $(localityElt).html(brewery.locality);
  }  

  if (brewery.phone)
  {
    var phoneElt = $(breweryToAdd).find('.breweryContact .phone');
    $(phoneElt).html(brewery.phone.replace(/\D/g, ' ').replace(/\s+/g, '.').replace(/^\./, '').replace(/\.$/, ''));
  }  

  //Insert the new brewery into the page
  $('#results-list').append(breweryToAdd);
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
  $('#beer-results-pagination li.pagination-item').remove();

  //add a nav button for every paginationSize breweries, up to 5
  for (var i=0; i<breweries.length/paginationSize && i<5; i++)
  {
    var paginationToAdd = $.parseHTML(paginationTemplate);

    $(paginationToAdd).children().html(i+1);

    $('#beer-results-pagination .right-arrow').before(paginationToAdd);
  }

  //set the current page variable (pagination.js)
  currentPage = 1;
  $('#beer-results-pagination .pagination-item').first().addClass('active');

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

    //disable all tabs
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
  $('#results-tabs li').removeClass('active');

  $('#results-tabs li[data-section="' + sectionName + '"]').addClass('active');

  //disable all tab-sections
  var sections = $('.tab-section');
  sections.addClass('hidden');

  $('.tab-section[data-section="' + sectionName + '"]').removeClass('hidden');
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