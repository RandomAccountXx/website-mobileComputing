const x = document.getElementById("x");

function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(showPosition, showError);
  } else {
    x.html = "Geolocation is not supported by this browser.";
  }
}

function showPosition(position) {
  x.html = "Latitude: " + position.coords.latitude +
    "Longitude: " + position.coords.longitude;
}

function showError(error) {
  switch(error.code) {
    case error.PERMISSION_DENIED:
      x.html= "User denied the request for Geolocation."
      break;
    case error.POSITION_UNAVAILABLE:
      x.html = "Location information is unavailable."
      break;
    case error.TIMEOUT:
      x.html = "The request to get user location timed out."
      break;
  }
}
