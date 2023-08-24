// clicking on task makes it become storken through
const tasks = document.querySelector('.tasks');
tasks.addEventListener('click', async (e) => {
    if (!e.target.classList.contains('task')) return;
    e.target.classList.toggle('checked');

    const data = {
        id: e.target.id,
        isChecked: e.target.classList.contains('checked')
    };

    await fetch('/finished', {
        method: 'POST', 
        headers: {
            "Content-Type": "application/json",
          },
        body: JSON.stringify(data),
    });
});

// clicking on list makes it become lighter
const lists = document.querySelector('.lists');
lists.addEventListener('click', async (e) => {
    if (!e.target.classList.contains('my-list')) return;

    await fetch(`/${e.target.path}`, {method: 'GET'});
});

//clicking on task close(X)-button deletes the task from the list
tasks.addEventListener('click', async (e) => {
    if (!e.target.closest('.close')) return;
    
    const body = {
        taskId: e.target.closest('.task').id,
        taskCompleted: e.target.closest('.task').classList.contains('checked'),
    }

    fetch('/toCompleted', {
        method: 'POST',  
        headers: {
        "Content-Type": "application/json",
        }, 
        redirect: "follow",
        body: JSON.stringify(body)
    }).then(response => {
        // HTTP 301 response
        // how to follow the redirection 
        if (response.redirected) {
            window.location.href = response.url;
        }
    })
    .catch(function(err) {
        console.info(err + " url: " + url);
    });
});

tasks.addEventListener('mouseover', async (e) => {
    if (!e.target.closest('.close')) return;
    e.target.style.backgroundColor = '#CED1D6';
});

tasks.addEventListener('mouseout', async (e) => {
    if (!e.target.closest('.close')) return;
    e.target.style.backgroundColor = 'inherit';
});

//clicking on list close(X)-button deletes the list and all tasks
lists.addEventListener('click', async (e) => {
    if (!e.target.closest('.closeList')) return;
    
    const body = {
        listId: e.target.closest('.my-list').path,
    }

    fetch('/deleteList', {
        method: 'POST',  
        headers: {
        "Content-Type": "application/json",
        }, 
        redirect: "follow",
        body: JSON.stringify(body)
    }).then(response => {
        // HTTP 301 response
        // how to follow the redirection 
        if (response.redirected) {
            window.location.href = response.url;
        }
    })
    .catch(function(err) {
        console.info(err + " url: " + url);
    });
});

// displaying weather
async function displayWeather() {
    try {
        const weatherContainer = document.querySelector('.weather')
        const position = await getCurGeolocation();
        const { latitude : lat, longitude : lng} = position.coords;

        // weatherContainer.innerHTML = await getCountry(lat, lng);
        weatherContainer.innerHTML = await getWeather(lat, lng);
    } catch (err) {
        console.log(`${err.message}`);
    }
}
displayWeather();

function getCurGeolocation() {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject);
    });
  };

async function getWeather(lat, lng) {
    try {
        const response = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current_weather=true`
          );
    
        if (!response.ok)
            throw new Error(`Problem with getting the weather data`);
    
        const data = await response.json();
    
        let weatherCode = data.current_weather.weathercode;
        if (weatherCode === 0) weatherCode = 1;
    
        const iconURL = `http://openweathermap.org/img/w/${weatherCode
            .toString()
            .padStart(2, 0)}d.png`;
    
        return ` ${data.current_weather.temperature}°C <img src="${iconURL}" alt="Weather icon"></img>`;
    } catch (error) {
        throw error;
    }
}

async function getCountry(lat, lng) {
    try {
        const resp = await fetch(
            `https://geocode.xyz/${lat},${lng}?geoit=json`
        );
      
        if (!resp.ok) throw new Error('Problem with getting the geolocation data');
        const dataGeo = await resp.json();
        const respGeo = await fetch(
            `https://restcountries.com/v2/name/${dataGeo.country}`
        );
        
        if (!respGeo.ok)
            throw new Error('Problem with getting the data about country');
      
        const dataCountry = await respGeo.json();
        return `${dataCountry[0].name}, `;
    } catch (error) {
        throw error;
    }
}

