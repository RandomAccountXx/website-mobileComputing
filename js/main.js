const x = document.getElementById("location");

function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(showPosition, showError);
  } else {
    x.innerText = "Geolocation is not supported by this browser.";
  }
}

function showPosition(position) {
  x.innerText = "Latitude: " + position.coords.latitude +
    "Longitude: " + position.coords.longitude;
}

function showError(error) {
  switch(error.code) {
    case error.PERMISSION_DENIED:
      x.innterText= "User denied the request for Geolocation."
      break;
    case error.POSITION_UNAVAILABLE:
      x.innerText = "Location information is unavailable."
      break;
    case error.TIMEOUT:
      x.innerText = "The request to get user location timed out."
      break;
  }
}
