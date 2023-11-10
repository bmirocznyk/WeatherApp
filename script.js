/* ¿Qué tecnologías usaron?
Utilizamos JS:
- Promesas
- fetch()
- api de OpenCage (sugerencias para la busqueda de geolocalizaciones por nombre)
- api de OpenStreetMap (informacion geografica para obtener coordenadas de las ciudades buscadas)
- api de OpenWeatherMap (informacion del clima a partir de las coordenadas)
- api de Navigator (informacion de geolocalizacion del dispositivo)

HTML:

CSS:
- estilos propios
- clases de Bootstrap 5.3.2

¿Qué les facilitó esta tecnología?
- La utilizacion de la api de Navigator, conocer la propia ubicacion del dispositivo y emplearla para obtener resultados locales
- La utilizacion de la api de OpenCage nos permitio ampliar el panorama de busquedas de locaciones sin tener que implementar una base de datos propia y ofrecer resultados para mas locaciones, 
sin contar con valores hardcodeados.
- La utilizacion de la api de OpenStreetMap, nos facilito la informacion geografica a partir del nombre de la locacion obtenida via OpenCage API
- La utilizacion de la api de OpenWeatherMap nos permitio abstraernos de la necesidad de hardware y software necesario para mediciones de clima a partir de los datos previamente obtenidos

¿Qué les complicó esta tecnología? ¿Cuál fue el mayor desafío con el que se encontraron?
- Utilizacion de promesas para poder garantizar el correcto funcionamiento asincronico del programa
- la obtencion y mapeo de los datos para las distintas APIs y la comunicacion entre metodos

¿Usaron código de terceros? ¿Cuánto y cómo debieron adaptarlo a lo solicitado en la materia? 
- Nos ayudamos con la documentacion propia de las APIs, la referencia de la documentacion de https://developer.mozilla.org/
*/

const locationInput = document.getElementById('locationInput');
const suggestionsDiv = document.getElementById('autocomplete-suggestions');

getLocal()

locationInput.addEventListener('input', function () {
  const query = locationInput.value;
  const apiKey = "d55b86b23dea4fe7b677707da699cffa";
  
  // Realizar una solicitud a la API de OpenCage Data
  fetch(`https://api.opencagedata.com/geocode/v1/json?q=${query}&key=${apiKey}`)
    .then(response => response.json())
    .then(data => {
      suggestionsDiv.innerHTML = ''; // Limpiar sugerencias anteriores

      data.results.forEach(result => {
        const suggestion = document.createElement('div');
        suggestion.textContent = result.formatted;
        suggestion.addEventListener('click', function () {
          locationInput.value = result.formatted;
          suggestionsDiv.innerHTML = ''; // Limpiar sugerencias después de la selección
        });
        suggestionsDiv.appendChild(suggestion);
      });
    })
    .catch(error => {
      console.log(error);
    });

});


function geocodeLocation() {
  const location = locationInput.value;
  const nominatimEndpoint = 'https://nominatim.openstreetmap.org/search';
  const format = 'json';
  const limit = 1; // Limit the results to 1

  const apiUrl = `${nominatimEndpoint}?q=${location}&format=${format}&limit=${limit}`;

  fetch(apiUrl)
    .then(response => response.json())
    .then(data => {
      if (data.length > 0) {
        const latitude = data[0].lat;
        const longitude = data[0].lon;
        getWeather(latitude, longitude);
      } else {
        console.log('La geocodificación no fue exitosa. Por favor, ingresa una ubicación válida.');
      }
    })
    .catch(error => {
      console.log(error);
    });
}

// El resto del código para obtener el pronóstico del tiempo y mostrarlo sigue siendo el mismo que se mencionó anteriormente.

function getWeather(latitude, longitude) {
  const apiKey = 'ecee476a8c0ea406a61cfcc69223a116';

  // Realizar una solicitud a la API de OpenWeatherMap con unidades métricas
  fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&cnt=40&units=metric&appid=${apiKey}`)
    .then(response => response.json())
    .then(data => {
      //Llama para obtener los datos del clima
      const ciudad = data.city.name;
      const temperatura = data.list[0].main.temp;
      const tempMin = data.list[0].main.temp_min;
      const tempMax = data.list[0].main.temp_max;
      const humidity = data.list[0].main.humidity;
      const icon = "http://openweathermap.org/img/w/" + data.list[0].weather[0].icon + ".png";


      let temp_min = document.getElementById('min-temp');
      temp_min.innerHTML = tempMin + " °C";
      let temp_max = document.getElementById('max-temp');
      temp_max.innerHTML = tempMax + " °C";
      let temp_actual = document.getElementById('temp');
      temp_actual.innerHTML = temperatura + " °C";
      let humedad = document.getElementById('humidity');
      humedad.innerHTML = humidity + "%";
      let estado = document.getElementById('state');
      estado.innerHTML = ciudad;
      let mainicon = document.getElementById('main-icon')
      mainicon.src = icon;

      displayWeather(data.list);
    })
    .catch(error => {
      console.log(error);
    });
}

function displayWeather(dataList) {
  const weatherInfo = document.getElementById('weatherInfo');
  weatherInfo.innerHTML = ''; // Limpiar cualquier información anterior

  // Procesar los datos y mostrar el pronóstico del tiempo para 5 días con datos cada 3 horas
  let currentDate = null;
  let dayCount = 0;
  let divDay = null;
  for (const item of dataList) {
    const date = new Date(item.dt * 1000);
    const temperature = item.main.temp;
    const description = item.weather[0].description;

    // Verificar si es un nuevo día
    if (currentDate === null || date.getDate() !== currentDate.getDate()) {
      currentDate = date;
      dayCount++;

      if (dayCount >= 6) {
        break; // Mostramos solo 5 días
      }

      //div que contiene el dia y la temperatura cada 3hs

      divDay = document.createElement('div');
      divDay.id = 'weather-day-container';
      divDay.className = 'col';
      weatherInfo.appendChild(divDay);

      const dayInfo = document.createElement('div');
      dayInfo.classList = 'col h5';
      dayInfo.innerHTML = `${date.toDateString()}`;
      divDay.appendChild(dayInfo);
    }

    const timeInfo = document.createElement('div');
    timeInfo.id = 'hour-container';
    timeInfo.innerHTML = `${date.getHours()}hs - ${description}, ${temperature}°C`;
    divDay.appendChild(timeInfo);
  }
}

function getLocal() {
  getCoordinates().then((coordinates) => {
    getWeather(coordinates.latitude, coordinates.longitude);
  });
}

function getCoordinates() {
  return new Promise((resolve, reject) => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          reject("Error getting coordinates: " + error.message);
        }
      );
    } else {
      reject("Geolocation is not supported by your browser");
    }
  });
}

function fetchData(endpoint) {
  return new Promise((resolve, reject) => {
    fetch(endpoint)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        resolve(data);
      })
      .catch((error) => {
        console.error("Fetch error:", error);

        reject(error);
      });
  });
}