 var map, places, infoWindow;
      var markers = [];
      var autocomplete;
      var countryRestrict = {'country': 'tr'};
      var MARKER_PATH = 'https://developers.google.com/maps/documentation/javascript/images/marker_green';
      var hostnameRegexp = new RegExp('^https?://.+?/');
      
      var countries = {
        'tu': {
          center: {lat: 38.585146, lng: 30.675218},
          zoom: 6
        },
        'ie': {
          center: {lat: 53.258385, lng: -10.4613931},
          zoom: 7
        },
        'fr': {
          center: {lat: 45.579696, lng: 2.431745},
          zoom: 6
        },
        'uk': {
          center: {lat: 53.8271119, lng: -6.7191083},
          zoom: 6
        }
      };
        
        function initMap() {
        map = new google.maps.Map(document.getElementById('map'), {
          zoom: countries['tu'].zoom,
          center: countries['tu'].center,
          mapTypeControl: false,
          panControl: false,
          zoomControl: false,
          streetViewControl: false,
          mapTypeId: 'hybrid',
        } );

        infoWindow = new google.maps.InfoWindow({
          content: document.getElementById('info-content')
        });
        
         autocomplete = new google.maps.places.Autocomplete((
                document.getElementById('autocomplete')), {
              types: ['(cities)'],
              
            });
            
        places = new google.maps.places.PlacesService(map);
        autocomplete.addListener('place_changed', onPlaceChanged);
        document.getElementById('country').addEventListener(
            'change', setAutocompleteCountry);
      }

  function onPlaceChanged() {
        var place = autocomplete.getPlace();
        if (place.geometry) {
          map.panTo(place.geometry.location);
          map.setZoom(14);
          search();
        } else {
          document.getElementById('autocomplete').placeholder = 'Enter a city';
        }
      }
      
      function search() {
        var search = {
          bounds: map.getBounds(),
          types: ['lodging']
        };

        places.nearbySearch(search, function(results, status) {
          if (status === google.maps.places.PlacesServiceStatus.OK) {
            clearResults();
            clearMarkers();
            for (var i = 0; i < results.length; i++) {
              var markerLetter = String.fromCharCode('A'.charCodeAt(0) + (i % 26));
              var markerIcon = MARKER_PATH + markerLetter + '.png';
              
              markers[i] = new google.maps.Marker({
                position: results[i].geometry.location,
                animation: google.maps.Animation.DROP,
                icon: markerIcon
              });
              
              markers[i].placeResult = results[i];
              google.maps.event.addListener(markers[i], 'click', showInfoWindow);
              setTimeout(dropMarker(i), i * 100);
              addResult(results[i], i);
            }
          }
        });
      }

      function clearMarkers() {
        for (var i = 0; i < markers.length; i++) {
          if (markers[i]) {
            markers[i].setMap(null);
          }
        }
        markers = [];
      }
      
         function setAutocompleteCountry() {
          
          var country = document.getElementById('country').value;
        
          autocomplete.setComponentRestrictions({'country': country});
          map.setCenter(countries[country].center);
          map.setZoom(countries[country].zoom);
          clearResults();
          clearMarkers();
          }
          
          function dropMarker(i) {
        return function() {
          markers[i].setMap(map);
        };
      }

        function addResult(result, i) {
        var results = document.getElementById('results');
        var markerLetter = String.fromCharCode('A'.charCodeAt(0) + (i % 26));
        var markerIcon = MARKER_PATH + markerLetter + '.png';

        var tr = document.createElement('tr');
        tr.style.backgroundColor = (i % 2 === 0 ? '#F0F0F0' : '#fff');
        tr.onclick = function() {
          google.maps.event.trigger(markers[i], 'click');
        };

        var iconTd = document.createElement('td');
        var nameTd = document.createElement('td');
        var icon = document.createElement('img');
        icon.src = markerIcon;
        icon.setAttribute('class', 'placeIcon');
        icon.setAttribute('className', 'placeIcon');
        var name = document.createTextNode(result.name);
        iconTd.appendChild(icon);
        nameTd.appendChild(name);
        tr.appendChild(iconTd);
        tr.appendChild(nameTd);
        results.appendChild(tr);
      }

        function clearResults() {
        var results = document.getElementById('results');
        while (results.childNodes[0]) {
          results.removeChild(results.childNodes[0]);
        }
      }
      
        function showInfoWindow() {
        var marker = this;
        places.getDetails({placeId: marker.placeResult.place_id},
           
            function(place, status) {
              if (status !== google.maps.places.PlacesServiceStatus.OK) {
                return;
              }
              infoWindow.open(map, marker);
              buildIWContent(place);
            });
      }
      
        function buildIWContent(place) {
          console.log(place)
        document.getElementById('iw-icon').innerHTML = '<img class="hotelIcon" ' +
            'src="' + place.icon + '"/>';
        document.getElementById('iw-url').innerHTML = '<b><a href="' + place.url +
            '">' + place.name + '</a></b>';
        document.getElementById('iw-address').textContent = place.vicinity;

        if (place.formatted_phone_number) {
          document.getElementById('iw-phone-row').style.display = '';
          document.getElementById('iw-phone').textContent =
              place.formatted_phone_number;
        } else {
          document.getElementById('iw-phone-row').style.display = 'none';
        }
        
        
        
        if (place.website) {
          var fullUrl = place.website;
          var website = hostnameRegexp.exec(place.website);
          if (website === null) {
            website = 'http://' + place.website + '/';
            fullUrl = website;
          }
          document.getElementById('iw-website-row').style.display = '';
          document.getElementById('iw-website').textContent = website;
        } else {
          document.getElementById('iw-website-row').style.display = 'none';
        }
      }