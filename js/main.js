const initButton = document.getElementById("initButtonId")
const questionList = document.getElementById("questionListId")
const blurFrame = document.getElementById('blurFrame')
const cityOrInfo = document.getElementById('cityOrInfo')
const getCityButtonContainer = document.getElementById('getCityButtonContainerId')

let longitudeUser
let latitudeUser
let randomLongitude
let randomLatitude
//radius in miles
const searchRadius = 5000
const minPopulation = 1000000
const fetchedCitiesLimit = 1
let cityObject
const mode = {EASY: 'EASY', HARD: 'HARD'}
let selectedMode = mode.EASY
let cityMap = L.map('mapId')
let cityMapMarkerRandomCity
let cityMapMarkerUserLocation
let questions
const questionNumber = 3
//the current solution in km
let currentSolutionInKm

/**
 * Set drag listener for map just one time; causes error otherwise
 */
document.addEventListener("DOMContentLoaded", () => {
  cityMap.on('drag', function () {
    cityMap.panInsideBounds([
      [-90, -180],
      [90, 180]], {animate: false});
  });
})

initButton.addEventListener("click", () => {
  getCityButtonContainer.style.cssText = "visibility: hidden"
  init()
})

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

function cleanLastRun() {
  //remove buttons
  questionList.innerHTML = ''
}

function init() {

  //prepare for new game
  cleanLastRun()


  navigator.geolocation.getCurrentPosition(res => {
    longitudeUser = res.coords.longitude
    latitudeUser = res.coords.latitude
    getRandomCityForQuiz()

      //success got city and user coordinates
      .then((res) => {
        cityObject = res
        cityOrInfo.innerText = cityObject.name
        showMapAndBlurIt()

        //generate questions
        generateQuestions(Math.round(getDistanceFromLatLonInKm(cityObject.latitude, cityObject.longitude, latitudeUser, longitudeUser)))

        let answerButtons = questions.map((question) => {
          return generateListElementsFromQuestions(question)
        })
        answerButtons.forEach((answerButton) => {
          questionList.appendChild(answerButton)
        })
      }).catch(err => {
        alert("Could not fetch city object from the server: " + err.message)
    })

    //got no geolocation from user
  }, showError
  )
}

function showError(error) {
  switch(error.code) {
    case error.PERMISSION_DENIED:
      alert("User denied the request for Geolocation.")
      break;
    case error.POSITION_UNAVAILABLE:
      alert("Location information is unavailable.")
      break;
    case error.TIMEOUT:
     alert("The request to get user location timed out.")
      break;
    case error.UNKNOWN_ERROR:
      alert("An unknown error occurred.")
      break;
  }
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
        resolve(res.data.data[0])
      }
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


/** function resolvePosition(position) {
  x.innerHTML = "Latitude: " + position.coords.latitude +
    " Longitude: " + position.coords.longitude;

  latitude = position.coords.latitude
  longitude = position.coords.longitude
} */

function showPositionError(error) {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      //x.innerHtml = "User denied the request for Geolocation."
      break;
    case error.POSITION_UNAVAILABLE:
      //x.innerHTML = "Location information is unavailable."
      break;
    case error.TIMEOUT:
      //x.innerHTML = "The request to get user location timed out."
      break;
  }

}

function generateMap() {
  let latFloat = parseFloat(cityObject.latitude)
  let lonFloat = parseFloat(cityObject.longitude)

  cityMap.setView([latFloat, lonFloat], 7);
  //no tiles
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: 'Kartendaten &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> Mitwirkende',
    useCache: true,
    continuousWorld: false,
    noWrap: true,
    bounds: [
      [-90, -180],
      [90, 180]],
  }).addTo(cityMap);

  cityMap.options.minZoom = 7
  cityMap.dragging.disable()


  if (cityMapMarkerRandomCity) {
    cityMap.removeLayer(cityMapMarkerRandomCity)
  }

  if(cityMapMarkerUserLocation) {

    cityMap.removeLayer(cityMapMarkerUserLocation)
  }
}

/**
 * Takes the dist to the solution city (int format in km) and sets the questions
 * attribute to different questions (amount specified in questionNumber)
 */
function generateQuestions(solution) {

  currentSolutionInKm = solution
  questions = []
  questions.push({dist: solution, isSolution: true})

  for (let i = 0; i < questionNumber; i++) {
    let latForQuestion = generateNewLatitudeCoordinate()
    let lonForQuestion = generateNewLongitudeCoordinate()
    let dist = Math.round(getDistanceFromLatLonInKm(latForQuestion, lonForQuestion, latitudeUser, longitudeUser))
    //dist in km
    questions.push({dist: dist, isSolution: false})
  }
  questions = shuffle(questions)
  return questions
}

/**
 * Shuffles array in place.
 * @param {Array} a items An array containing the items.
 */
function shuffle(a) {
  let j, x, i;
  for (i = a.length - 1; i > 0; i--) {
    j = Math.floor(Math.random() * (i + 1));
    x = a[i];
    a[i] = a[j];
    a[j] = x;
  }
  return a;
}

/**
 * Sets marker on map and unblurs it to show the user the solution and enables user to start next run
 */
function showSolution() {
  let latFloat = parseFloat(cityObject.latitude)
  let lonFloat = parseFloat(cityObject.longitude)
  showMarkers()
  cityMap.dragging.enable()
  setBlurEffectOnMap(false)
  cityMap.setView([latFloat, lonFloat], 7);
  cityMap.options.minZoom = 1
  cityOrInfo.innerText = `The distance to ${cityObject.name} from your position is ${currentSolutionInKm}km`
  getCityButtonContainer.style.cssText = "visibility: visible"
}

function showMapAndBlurIt() {
  setBlurEffectOnMap(true)
  generateMap()
}

function showMarkers() {
  let latFloat = parseFloat(cityObject.latitude)
  let lonFloat = parseFloat(cityObject.longitude)
  //add new city marker to map
  cityMapMarkerRandomCity = new L.marker([latFloat, lonFloat])
  cityMapMarkerRandomCity.bindPopup(cityObject.name).openPopup();
  cityMap.addLayer(cityMapMarkerRandomCity)

  cityMapMarkerUserLocation = new L.marker([latitudeUser, longitudeUser])
  cityMapMarkerUserLocation.bindPopup("your current location :)").openPopup()
  cityMap.addLayer(cityMapMarkerUserLocation)

}

function setBlurEffectOnMap(isBlured) {
  if (isBlured) {
    blurFrame.style.cssText = "-webkit-filter: blur(6px); -moz-filter: blur(6px); -o-filter: blur(6px); -ms-filter: blur(6px); filter: blur(6px);";
  } else {
    blurFrame.style.removeProperty('-webkit-filter');
    blurFrame.style.removeProperty('-moz-filter');
    blurFrame.style.removeProperty('-o-filter');
    blurFrame.style.removeProperty('-ms-filter');
    blurFrame.style.removeProperty('filter');
  }
}

function generateListElementsFromQuestions(question) {
  //button with unique tag
  let button = document.createElement('button')
  button.innerHTML = question.dist + " km"
  button.className = "btn btn-dark"
  button.id = "answerListElement"
  button.addEventListener("click", function () {
    //correct solution
    if (question.isSolution) {
      button.style.color = 'green'
      //handle wrong answer
    } else {
      button.style.color = 'red'
    }

    showSolution()
    document.querySelectorAll('#answerListElement').forEach((button) => {
      button.disabled = true
    })
  })
  return button;
}
