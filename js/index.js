var APIkey = 'e35b38d0fdfdbe50df60d75dfb60145e';
var days = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];
function GetWindDirection(degress) {
  if (degress <= 11.25 || degress >= 348.75) {
    return 'N';
  }
  if (11.25 < degress && degress <= 33.75) {
    return 'NNE';
  }
  if (33.75 < degress && degress <= 56.25) {
    return 'NE';
  }
  if (56.25 < degress && degress <= 78.75) {
    return 'ENE';
  }
  if (78.75 < degress && degress <= 101.25) {
    return 'E';
  }
  if (101.25 < degress && degress <= 123.75) {
    return 'ESE';
  }
  if (123.75 < degress && degress <= 146.25) {
    return 'SE';
  }
  if (146.25 < degress && degress <= 168.75) {
    return 'SSE';
  }
  if (168.75 < degress && degress <= 191.25) {
    return 'S';
  }
  if (191.25 < degress && degress <= 213.75) {
    return 'SSW';
  }
  if (213.75 < degress && degress <= 236.25) {
    return 'SW';
  }
  if (236.25 < degress && degress <= 258.75) {
    return 'WSW';
  }
  if (258.75 < degress && degress <= 281.25) {
    return 'W';
  }
  if (281.25 < degress && degress <= 303.75) {
    return 'WNW';
  }
  if (303.75 < degress && degress <= 326.25) {
    return 'NW';
  }
  if (326.25 < degress && degress <= 348.75) {
    return 'NNW';
  }
}
function GetHumidityDescription(percentaje) {
  if (percentaje <= 20) {
    return 'Uncomfortably Dry';
  }
  if (percentaje <= 60) {
    return 'Comfort range';
  }
  return 'Uncomfortably Wet';
}
function GetVisibilityDescription(meters) {
  if (meters <= 8000) {
    return 'Low';
  }
  if (meters <= 10000) {
    return 'Average';
  }
  return 'High';
}
function GetAirPollutionDescription(index) {
  switch (index) {
    case 1:
      return 'Good';
    case 2:
      return 'Fair';
    case 3:
      return 'Moderate';
    case 4:
      return 'Poor';
    default:
      return 'Very Poor';
  }
}
function GetAirPollutionNumber(index) {
  switch (index) {
    case 1:
      return Math.round(Math.random() * 50);
    case 2:
      return Math.round(Math.random() * 50 + 50);
    case 3:
      return Math.round(Math.random() * 100 + 100);
    case 4:
      return Math.round(Math.random() * 100 + 200);
    default:
      return Math.round(Math.random() * 100 + Math.random() * 100 + 300);
  }
}

var input = document.getElementById('search-input');
input.addEventListener('input', Debounce(HandleInputChange, 500));
var lastText = '';
var rightResponse = false;

var todayHourElement = document.getElementById('today-hour');
var cityName = document.getElementById('city-name');

function HandleInputChange(event) {
  var text = event.target.value;
  lastText = text;
  if (text.length === 0) {
    return;
  }
  fetch(
    `https://api.openweathermap.org/geo/1.0/direct?q=${text}&limit=5&appid=${APIkey}`
  )
    .then(function (res) {
      var q = res.url.split('q=').pop().split('&')[0];
      q = decodeURI(q);
      if (lastText === q) {
        rightResponse = true;
      } else {
        rightResponse = false;
      }
      return res.json();
    })
    .then(function (data) {
      return UpdateSuggestions(data);
    })
    .catch(function (error) {
      console.log('An error occurred');
    });
}
function UpdateSuggestions(data) {
  var list = document.getElementById('suggestions');

  if (!rightResponse) {
    return;
  }

  list.innerHTML = '';
  if (data.length > 0) {
    list.classList.remove('inactive');
    list.classList.add('active');

    data.forEach(function (city) {
      var li = CreateLiFromCity(city);
      list.appendChild(li);
    });
  } else {
    list.classList.remove('active');
    list.classList.add('inactive');
  }
}
function CreateLiFromCity(city) {
  var li = document.createElement('li');
  var text = document.createElement('span');
  text.textContent = city.name + ', ' + city.country;
  text.classList.add('text');
  li.appendChild(text);

  var lat = document.createElement('span');
  lat.classList.add('lat');
  lat.textContent = city.lat;
  var lon = document.createElement('span');
  lon.classList.add('lon');
  lon.textContent = city.lon;

  var coorWrapper = document.createElement('div');
  coorWrapper.appendChild(lat);
  coorWrapper.appendChild(lon);
  li.appendChild(coorWrapper);

  li.addEventListener('click', function (e) {
    input.value = e.currentTarget.querySelector('.text').textContent;
    cityName.textContent = input.value;

    var list = document.getElementById('suggestions');
    list.classList.remove('active');
    list.classList.add('inactive');
    var selectedLat = e.currentTarget.querySelector('.lat').textContent;
    var selectedLon = e.currentTarget.querySelector('.lon').textContent;
    fetch(
      `https://api.openweathermap.org/data/2.5/air_pollution?lat=${selectedLat}&lon=${selectedLon}&appid=${APIkey}`
    )
      .then((res) => res.json())
      .then(UpdateAirQuality)
      .catch(function (error) {
        console.log('An error occurred');
      });

    fetch(
      `https://api.openweathermap.org/data/2.5/onecall?lat=${selectedLat}&lon=${selectedLon}&exclude=minutely,hourly,alerts&appid=${APIkey}&units=metric`
    )
      .then((res) => res.json())
      .then(UpdateView)
      .catch(function (error) {
        console.log('An error occurred');
      });
  });
  return li;
}
function HandleSuggestionClick(e) {}
function UpdateView(data) {
  UpdateSummary(data);
  UpdateForecast(data);
  UpdateTodayDetails(data);
}
function UpdateAirQuality(data) {
  var airValueElement = document.getElementById('air-quality-value');
  airValueElement.textContent = GetAirPollutionNumber(data.list[0].main.aqi);
  var airDescElement = document.getElementById('air-quality-desc');
  airDescElement.textContent = GetAirPollutionDescription(
    data.list[0].main.aqi
  );
}
function UpdateSummary(data) {
  var todayTemperatureValueElement = document.getElementById(
    'today-temperature-value'
  );
  todayTemperatureValueElement.textContent = Math.round(data.current.temp);

  var todayWeatherIcon = document.getElementById('today-weather-icon');
  todayWeatherIcon.innerHTML = '';
  var iconImg = document.createElement('img');
  iconImg.src =
    './weather-icons/fill/openweathermap/' +
    data.current.weather[0].icon +
    '.svg';
  todayWeatherIcon.appendChild(iconImg);

  var date = new Date(data.current.dt * 1000 + data.timezone_offset * 1000);
  var todayDayElement = document.getElementById('today-day');
  todayDayElement.textContent = days[date.getUTCDay()];
  var minutes = GetMinutes(date);
  todayHourElement.textContent = date.getUTCHours().toString() + ':' + minutes;

  var listItem = document.createElement('li');
  var itemImgContainer = document.createElement('div');
  var itemImg = document.createElement('img');
  itemImg.src =
    './weather-icons/fill/openweathermap/' +
    data.current.weather[0].icon +
    '.svg';
  var itemDesc = document.createElement('p');
  itemDesc.textContent = data.current.weather[0].description.replace(
    /(^\w{1})|(\s+\w{1})/g,
    (letter) => letter.toUpperCase()
  );

  var todayWeatherListElement = document.getElementById('today-weather-list');
  todayWeatherListElement.innerHTML = '';
  itemImgContainer.appendChild(itemImg);
  listItem.appendChild(itemImgContainer);
  listItem.appendChild(itemDesc);
  todayWeatherListElement.appendChild(listItem);
}
function GetMinutes(date) {
  return date.getUTCMinutes() > 9
    ? date.getUTCMinutes().toString()
    : '0' + date.getUTCMinutes().toString();
}
function UpdateTodayDetails(data) {
  var uvImgElement = document.getElementById('uv-image');
  var uvIndex = Math.round(data.current.uvi).toString();
  uvImgElement.src = './weather-icons/fill/all/uv-index-' + uvIndex + '.svg';

  var windValuElement = document.getElementById('wind-value-number');
  windValuElement.textContent =
    Math.round((data.current.wind_speed / 1000) * 3600 * 10) / 10;
  var windDirElement = document.getElementById('wind-direction');
  windDirElement.textContent = GetWindDirection(data.current.wind_deg);

  var suriseValueElement = document.getElementById('sunrise-value');
  var sunsetValueElement = document.getElementById('sunset-value');
  var sunriseTime = new Date(
    data.current.sunrise * 1000 + data.timezone_offset * 1000
  );
  var sunsetTime = new Date(
    data.current.sunset * 1000 + data.timezone_offset * 1000
  );

  suriseValueElement.textContent =
    sunriseTime.getUTCHours().toString() + ':' + GetMinutes(sunriseTime);

  sunsetValueElement.textContent =
    sunsetTime.getUTCHours().toString() + ':' + GetMinutes(sunsetTime);

  var humidityValueElement = document.getElementById('humidity-value');
  humidityValueElement.textContent = data.current.humidity;
  var humidityDescElement = document.getElementById('humidity-desc');
  humidityDescElement.textContent = GetHumidityDescription(
    data.current.humidity
  );

  var visibilityValueElement = document.getElementById(
    'visibility-value-number'
  );
  visibilityValueElement.textContent =
    Math.round((data.current.visibility / 1000) * 10) / 10;
  var visibilityDescElement = document.getElementById('visibility-desc');
  visibilityDescElement.textContent = GetVisibilityDescription(
    data.current.visibility
  );
}
function UpdateForecast(data) {
  for (let i = 1; i <= 7; i++) {
    var forecastDate = new Date(data.daily[i].dt * 1000);
    var daySelector = '#day-' + i.toString() + ' .day-name';
    var liDay = document.querySelector(daySelector);
    liDay.textContent = days[forecastDate.getDay()].substr(0, 3);

    var iconSelector = '#day-' + i.toString() + ' .day-weather-icon';
    var liIcon = document.querySelector(iconSelector);
    liIcon.src =
      './weather-icons/fill/openweathermap/' +
      data.daily[i].weather[0].icon +
      '.svg';

    var maxTempSelector = '#day-' + i.toString() + ' .day-max-temp';
    var minTempSelector = '#day-' + i.toString() + ' .day-min-temp';

    liMax = document.querySelector(maxTempSelector);
    liMin = document.querySelector(minTempSelector);
    liMax.textContent = Math.round(data.daily[i].temp.max).toString() + '°';
    liMin.textContent = Math.round(data.daily[i].temp.min).toString() + '°';
  }
}

function Debounce(callback, delay) {
  let timeoutID;

  return function (arg) {
    if (timeoutID) {
      clearTimeout(timeoutID);
    }
    timeoutID = setTimeout(() => {
      callback(arg);
    }, delay);
  };
}

var defaultEvent = {
  target: {
    value: 'Montes de Oca, AR',
  },
};
input.value = 'Montes de Oca, AR';
cityName.textContent = 'Montes de Oca, AR';

fetch(
  `https://api.openweathermap.org/data/2.5/air_pollution?lat=-32.5667&lon=-61.7688&&appid=${APIkey}`
)
  .then((res) => res.json())
  .then(UpdateAirQuality)
  .catch(function (error) {
    console.log('An error occurred');
  });

fetch(
  `https://api.openweathermap.org/data/2.5/onecall?lat=-32.5667&lon=-61.7688&exclude=minutely,hourly,alerts&appid=${APIkey}&units=metric`
)
  .then((res) => res.json())
  .then(UpdateView)
  .catch(function (error) {
    console.log('An error occurred');
  });
