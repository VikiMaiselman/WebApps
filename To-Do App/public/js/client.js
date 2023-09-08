// clicking on task makes it become storken through
const tasks = document.querySelector('.tasks');
tasks.addEventListener('dblclick', async (e) => {
    if (e.target.classList.contains('task') || e.target.classList.contains('content')) {
        e.target.closest('.task').classList.toggle('checked');

        const data = {
            taskId: e.target.id,
            isTaskCompleted: e.target.classList.contains('checked')
        };

        await fetch('/finished', {
            method: 'POST', 
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });
    }
});


// on click on the text - task content is changed
tasks.addEventListener('click', (e) => {
    if (!e.target.closest('.update')) return;

    const task = e.target.closest('.task');
    const content = task.querySelector('.content');

    content.setAttribute("contenteditable", true);

    document.addEventListener('keydown', async (e) => {
        if (e.code === "Enter") {
            content.setAttribute("contenteditable", false);
            const newValue = content.innerHTML;
            console.log(task);

            const body = {
                taskId: task.id,
                taskName: newValue,
                isTaskCompleted: task.classList.contains('checked'),
            }

            await fetch('/updateTask', {
                method: 'PATCH',
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(body),
            }).then(response => response.json())
              .catch(err => console.error(err));
        }
    })
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

function addEffectsOnHover(object) {
    object.addEventListener('mouseover', async (e) => {
        if (e.target.closest('.close') || e.target.closest('.closeList') || e.target.closest('.update')) {
            e.target.style.backgroundColor = '#495157';
        }
    });
    
    object.addEventListener('mouseout', async (e) => {
        if (e.target.closest('.close') || e.target.closest('.closeList') || e.target.closest('.update')) {
            e.target.style.backgroundColor = 'inherit';
        }
    });
}
addEffectsOnHover(tasks);
addEffectsOnHover(lists);

//clicking on list close(X)-button deletes the list and all its tasks
lists.addEventListener('click', async (e) => {
    if (!e.target.closest('.closeList')) return;

    const data = {
        listId: e.target.closest('.my-list').id,
    };

    await fetch('/deleteList', {
        method: 'POST',  
        headers: {
        "Content-Type": "application/json",
        }, 
        body: JSON.stringify(data),
        redirect: "follow",
    }).then(response => {
        // HTTP 301 response
        // how to follow the redirection 
        if (response.redirected) {
            window.location.href = response.url;
        }
    }).then(data => console.log(data))
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

