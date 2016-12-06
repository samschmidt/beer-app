var breweryTemplate =
"<li class='list-group-item'> \
<p><img style='float:left; margin-right: 10px; margin-bottom: 10px;' height='75px' max-width='75px' \
 src='images/no_image_available.png' alt='No Image Available'> \
<h4 class='breweryName resultName'><a>Brewery Name</a></h4> \
<h5 class='breweryType'></h5> \
<h5 class='breweryOpen'></h5> \
<h5 class='breweryContact' style='clear:left'><a class='website'>Website</a> \
<span class='pipe'> | </span><span class='address-and-locality'><span class='address'></span>\
<span class='locality'></span></span><span class='pipe'> | </span><span class='phone'>No Phone</span></h5> \
</p> \
</li>"
;

/**
 * Add a brewery to the visible results list.
 */
function listBrewery(brewery)
{
  var breweryToAdd = $.parseHTML(breweryTemplate);

  console.log(breweryToAdd);
  console.log(brewery);

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
    else if (brewery.isClosed === 'N')
    {
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
