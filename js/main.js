const x = document.getElementById("x")


let longitude
let latitude
let randomLongitude
let randomLatitude
//radius in miles
const searchRadius = 5000
const minPopulation = 1000000
const fetchedCitiesLimit = 1
let cityObject
const mode = {EASY: 'EASY', HARD: 'HARD'}
let selectedMode = mode.EASY
let cityMap =  L.map('mapId')
let cityMapMarker


function generateNewLongitudeCoordinate() {
  return getRandomInRange(-180, 180, 4);
}

function generateNewLatitudeCoordinate() {
  return getRandomInRange(-90, 90, 4)
}

/**
 * Generates a random number
 * @param from lower limit
 * @param to upper limit
 * @param fixed decimals after point (adds zeroes)
 * @return {string}
 */
function getRandomInRange(from, to, fixed) {
  const randomNumber = ((Math.random() * (to - from) + from));
  return randomNumber.toFixed(fixed)
}

function addLeadingZeroesAndSignLongitude(_longitude) {
  //no leading zeroes
  let _longitudeFloat = parseFloat(_longitude)
  if (Math.abs(_longitudeFloat) >= 100) {
    if (_longitude.charAt(0).match(/-/)) {
      return _longitude
    } else {
      return '+'.concat(_longitude)
    }
    //one leading zero
  } else if (Math.abs(_longitudeFloat) >= 10) {
    if (_longitude.charAt(0).match(/-/)) {
      return '-0' + _longitude.substring(1)
    } else {
      return '+0' + _longitude
    }
  }
  //two leading zeroes
  else {
    if (_longitude.charAt(0).match(/-/)) {
      return '-00' + _longitude.substring(1)
    } else {
      return '+00' + _longitude
    }
  }
}

function addLeadingZeroesAndSignLatitude(_latitude) {
  let latitudeFloat = parseFloat(_latitude)
  if (Math.abs(latitudeFloat) >= 10) {
    if (_latitude.charAt(0).match(/-/)) {
      return _latitude
    } else {
      return '+' + _latitude
    }
  } else {
    if (_latitude.charAt(0).match(/-/)) {
      return '-0' + _latitude.substring(1)
    } else {
      return '+0' + _latitude
    }
  }
}

function init() {
  navigator.geolocation.getCurrentPosition(res => {
    longitude = res.coords.longitude
    latitude = res.coords.latitude
    getRandomCityForQuiz()

      //success got city and user coordinates
      .then((res) => {
       cityObject = res
        x.innerText = cityObject.name
        y.innerText = getDistanceFromLatLonInKm(cityObject.latitude, cityObject.longitude, latitude, longitude)
      }).catch(err => {

    })


    //got no geolocation from user
  }, reject => {

  })


}


/**
 * Requests a random city with a population over 2000000
 * @return {Promise<void>}
 */
function getRandomCityForQuiz() {
  //fetch city with random coordinates and over 2000000 inhabitants.(lat before long)
  return new Promise((resolve, reject) => {
    //gen coordinates in ISO-6709
    randomLongitude = addLeadingZeroesAndSignLongitude(generateNewLongitudeCoordinate())
    randomLatitude = addLeadingZeroesAndSignLatitude(generateNewLatitudeCoordinate())
    let cityRequest = `https://wft-geo-db.p.rapidapi.com/v1/geo/cities?radius=${searchRadius}&minPopulation=${minPopulation}
  &location=${encodeURIComponent(randomLatitude)}${encodeURIComponent(randomLongitude)}&limit=${fetchedCitiesLimit}`
    console.log(cityRequest)

    axios({
      method: 'get', url: cityRequest, responseType: 'json', headers: {
        "x-rapidapi-key": "b153197246msh17499e2cfbeafa3p11792cjsn74c890e4d485",
        "x-rapidapi-host": "wft-geo-db.p.rapidapi.com"
      }
    }).then((res) => {
      console.log(res)
      resolve(res.data.data[0])}
    ).catch(err => {
      console.log(err)
      reject(err)
    })
  })
}

function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);  // deg2rad below
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  ;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
}

function deg2rad(deg) {
  return deg * (Math.PI / 180)
}


function resolvePosition(position) {
  x.innerHTML = "Latitude: " + position.coords.latitude +
    " Longitude: " + position.coords.longitude;

  latitude = position.coords.latitude
  longitude = position.coords.longitude
}

function showPositionError(error) {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      x.innerHtml = "User denied the request for Geolocation."
      break;
    case error.POSITION_UNAVAILABLE:
      x.innerHTML = "Location information is unavailable."
      break;
    case error.TIMEOUT:
      x.innerHTML = "The request to get user location timed out."
      break;
  }

}

function generateMap() {
  let latFloat = parseFloat(cityObject.latitude)
  let lonFloat = parseFloat(cityObject.longitude)

  cityMap.setView([latFloat, lonFloat], 7);
  //no tiles
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    'attribution':  'Kartendaten &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> Mitwirkende',
    'useCache': true
  }).addTo(cityMap);

  //add new city marker to map

  if(cityMapMarker) {
    cityMap.removeLayer(cityMapMarker)
  }

  cityMapMarker = new L.marker([latFloat,lonFloat])
  cityMapMarker.addTo(cityMap);
  cityMapMarker.bindPopup(cityObject.name).openPopup();


}

document.getElementById('mapButton').addEventListener("click", generateMap)
