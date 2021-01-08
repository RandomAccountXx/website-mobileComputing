const x = document.getElementById("location");

function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(showPosition, showError);
  } else {
    x.textContent = "Geolocation is not supported by this browser.";
  }
}

function showPosition(position) {
  x.textContent = "Latitude: " + position.coords.latitude +
    "Longitude: " + position.coords.longitude;
}

function showError(error) {
  switch(error.code) {
    case error.PERMISSION_DENIED:
      x.textContent= "User denied the request for Geolocation."
      break;
    case error.POSITION_UNAVAILABLE:
      x.textContent = "Location information is unavailable."
      break;
    case error.TIMEOUT:
      x.textContent = "The request to get user location timed out."
      break;
  }
}
