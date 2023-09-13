async function whichImageToDisplay() {
    try {
        const response = await fetch('/internal-weather-data');
        if (!response.ok) throw new Error('Could not get data about weather conditions');

        const data = await response.json();
        const content = document.querySelector('.content');
        
        if (data) content.style.backgroundImage = "url('images/rainy_day.jpg')";
        else {
            content.style.backgroundImage = "url('images/sun.jpg')";
        }
    } catch (err) {
        console.error(err.message);
    }
    
    
    
}
whichImageToDisplay();