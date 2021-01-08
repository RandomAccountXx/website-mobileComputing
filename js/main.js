const x = document.getElementById("x")


let longitude
let latitude
let randomLongitude
let randomLatitude


function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(resolvePosition, showPositionError);
  } else {
    x.innerHTML = "Geolocation is not supported by this browser.";
  }
}

function generateNewLongitudeCoordinate() {
  return getRandomInRange(-180, 180, 4);
}

function generateNewLatitudeCoordinate() {
  return getRandomInRange(-90, 90,4)
}

/**
 * Generates a random number
 * @param from lower limit
 * @param to upper limit
 * @param fixed decimals after point (adds zeroes)
 * @return {string}
 */
function getRandomInRange(from, to, fixed) {
  const randomNumber =   ((Math.random() * (to - from) + from));
  return randomNumber.toFixed(fixed)
}

function addLeadingZeroesAndSignLongitude(_longitude) {
  //no leading zeroes
  let _longitudeFloat = parseFloat(_longitude)
  if(Math.abs(_longitudeFloat) >= 100) {
    if(_longitude.charAt(0).match(/-/)) {
      return _longitude
    } else {
      return '+'.concat(_longitude)
    }
    //one leading zero
  } else if(Math.abs(_longitudeFloat) >= 10) {
    if(_longitude.charAt(0).match(/-/)) {
      return '-0' + _longitude.substring(1)
    } else {
      return '+0' + _longitude
    }
  }
  //two leading zeroes
  else {
    if(_longitude.charAt(0).match(/-/)) {
      return '-00' + _longitude.substring(1)
    } else {
      return '+00' + _longitude    }
  }
}

function addLeadingZeroesAndSignLatitude(_latitude) {
  let latitudeFloat = parseFloat(_latitude)
  if(Math.abs(latitudeFloat) >= 10) {
    if(_latitude.charAt(0).match(/-/)) {
      return _latitude
    }
     else {
       return '+' + _latitude
    }
  } else {
    if(_latitude.charAt(0).match(/-/)) {
      return '-0' + _latitude.substring(1)
    }
    else {
      return '+0' + _latitude
    }
  }
}


/**
 * Requests a random city with a population over 2000000
 * @return {Promise<void>}
 */
function getRandomCityForQuiz() {

  //gen coordinates in ISO-6709
  randomLongitude = addLeadingZeroesAndSignLongitude(generateNewLongitudeCoordinate())
  randomLatitude = addLeadingZeroesAndSignLatitude(generateNewLatitudeCoordinate())
  
  let cityRequest = `https://wft-geo-db.p.rapidapi.com/v1/geo/cities?minPopulation=2000000&location=${randomLatitude}${randomLongitude}`
  console.log(cityRequest)

  //fetch city with random coordinates and over 2000000 inhabitants.(lat before long)
  fetch(cityRequest, {
    "method": "GET",
    "headers": {
      "x-rapidapi-key": "b153197246msh17499e2cfbeafa3p11792cjsn74c890e4d485",
      "x-rapidapi-host": "wft-geo-db.p.rapidapi.com"
    }
  })
    .then(res => {
      console.log(res.json())
    })
    .catch(err => {
      console.error(err);
    });

}


function resolvePosition(position) {
  x.innerHTML = "Latitude: " + position.coords.latitude +
    " Longitude: " + position.coords.longitude;

  latitude = position.coords.latitude
  longitude = position.coords.longitude
}

function showPositionError(error) {
  switch(error.code) {
    case error.PERMISSION_DENIED:
      x.innerHtml= "User denied the request for Geolocation."
      break;
    case error.POSITION_UNAVAILABLE:
      x.innerHTML = "Location information is unavailable."
      break;
    case error.TIMEOUT:
      x.innerHTML = "The request to get user location timed out."
      break;
  }
}

