import express from 'express';
import axios from 'axios';
import bodyParser from "body-parser";

const app = express();
const port = 3000;
let safeExposureTime;
let renderData;
let weatherCode;

app.use(express.static("public"));

app.get('/internal-weather-data', async (req, res) => {
    let isRainy = false;
    switch (weatherCode) {
        case '04d' || '04n' || '09d' || '09n' || '10d' || '10n':
            isRainy = true;
            break;
    };
    res.send(isRainy);
})

app.get('/', async (req, res) => {
    const data = await getDataAboutLocation(req.ip)
    const {city, lat, lng} = data;
    const [temperature, weatherIcon] = await getWeather(lat, lng);

    const monthNames = ["January", "February", "March", "April", "May", "June",
         "July", "August", "September", "October", "November", "December"
    ];
    const now = new Date();
    const day = now.getDate();
    const month = monthNames[now.getMonth()];
    const year = now.getFullYear();
    const date = `${day} of ${month} ${year}`;

    const uvIndex = await getUvIndex(lat, lng);

    renderData = {
        city: city,
        temperature: temperature,
        weatherIcon: weatherIcon,
        date: date,
        uv: uvIndex.uv,
        maxUV: uvIndex.maxUv,
        maxUVTime: uvIndex.maxUvTime
    }

    safeExposureTime = uvIndex.safeExposureTime;

    res.render('index.ejs', {data: renderData})
});

app.use(bodyParser.urlencoded({ extended: true }));
app.post('/submit-skin-type', (req, res) => {
    const skinType = `st${req.body.skinType}`;
    res.render('index.ejs', {data: renderData, yourSafeExposureTime: true, exposureTimeData: safeExposureTime[skinType]})
})

app.listen(port, () => {
    console.log(`Server is up and listening on port ${port}`);
})


// ************************************ H E L P E R S ************************************
async function getDataAboutLocation(ipAddr) {
    try {
        const url = `https://ipapi.co/json/`;
        const response = await axios.get(url);
        const result = response.data;

        return {
            lat: result.latitude,
            lng: result.longitude,
            city: result.city,
            country: result.country_name,
        }
    } catch(err) {
        console.error(err);
    }
}

async function getWeather(lat, lng) {
    try {
        const response = await axios.get(
            `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current_weather=true`
          );
        const result = response.data;
 
        let weatherCode = result.current_weather.weathercode;
        if (weatherCode === 0) weatherCode = 1;
        
        const hourNow = new Date().getHours();
        const isDay = hourNow > 20 || hourNow < 6 ? false : true;
        
        weatherCode = `${weatherCode.toString().padStart(2, 0)}${isDay ? 'd' : 'n'}`
        console.log(weatherCode);
        const iconURL = `http://openweathermap.org/img/w/${weatherCode}.png`;
      
        return [result.current_weather.temperature, iconURL];
    } catch (error) {
        throw error;
    }
}

async function getUvIndex(lat, lng) {
    try {
        const url = `https://api.openuv.io/api/v1/uv?lat=${lat}&lng=${lng}`;

        const response = await axios.get(url, {
            headers: {
                "x-access-token": "openuv-aar2tsrlmd05hjb-io",
                "content-type": "application/json"
            }
        });

        const result = response.data;
        console.log(result);

        let uv = result.result.uv;
        const maxUv = result.result.uv_max;
        let maxUvTime = result.result.uv_max_time;
        maxUvTime = new Date(maxUvTime);
        maxUvTime = `${maxUvTime.getHours().toString().padStart(2, 0)}:${maxUvTime.getMinutes().toString().padStart(2, 0)}`;
        
        const safeExposureTime = result.result.safe_exposure_time;

        switch (true) {
            case uv <= 3:
                uv = 'Low';
                break;

            case uv > 3 && uv <= 6:
                uv = 'Moderate';
                break;

            case uv > 6 && uv <= 8:
                uv = 'High';
                break;

            case uv > 8 && uv <= 11:
                uv = 'Very High';
                break;

            case uv > 11:
                uv = 'Extreme';
                break;

            default: 
                uv = 'Could not figure out UV Level';
                break;
        }

        return {
            uv: uv,
            maxUv: +maxUv.toFixed(0),
            maxUvTime: maxUvTime,
            safeExposureTime: safeExposureTime,
        }

    } catch (error) {
        console.log(error.message);
        throw error;
    }
}