"use strict";
function startApp() {
  // prettier-ignore
  let workoutsContainer, form, formRegistered, activitiesMenu, 
    options, selectedActivityType, distance, duration, elevationGain, cadence,
    sortOptionToHigh, sortOptionToLow, sortingOptions;

  let map, mapEvent;

  let workouts = [];
  const markers = [];

  function initFields() {
    workoutsContainer = document.querySelector(".workouts__displayed");
    form = document.querySelector(".workout__form");
    activitiesMenu = document.querySelector(".activity__type");
    options = document.querySelectorAll("option");
    distance = document.querySelector("#distance");
    duration = document.querySelector("#duration");
    elevationGain = document.querySelectorAll(".elevation");
    cadence = document.querySelectorAll(".cadence");
    sortOptionToHigh = document.querySelector(".to--high");
    sortOptionToLow = document.querySelector(".to--low");
    sortingOptions = document.querySelector("#sort_options");
  }

  function clearUnrelatedData() {
    window.addEventListener("load", (e) => {
      document.querySelectorAll(".weather__field").forEach((field) => {
        field.innerHTML = "";
        field.classList.add("hidden");
      });
    });
  }

  async function getUserPosition() {
    if (navigator.geolocation) {
      try {
        const position = await getCurGeolocation();
        loadMap(position);
        addActionOnMapClick(map);
      } catch (err) {
        swal({
          title: "Could not get your location",
          text: "Check your internet connection and/or browser settings",
          icon: "error",
          button: "Ok",
        });
        return;
      }
    }
  }

  const getCurGeolocation = function () {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject);
    });
  };

  function loadMap(position) {
    const { latitude, longitude } = position.coords;
    const coords = [latitude, longitude];

    map = L.map("side--right").setView(coords, 13);
    // 2nd arg is zooming: the bigger the # the closer the view

    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    // because of localStorage API, markers are displayed only after map is loaded
    workouts.forEach((workout) => {
      renderMarker(workout.headerMessage, workout.lat, workout.lng);
    });
  }

  function addActionOnMapClick() {
    // instead of a regular eventListener
    // document.querySelector(".side--right").addEventListener("click", (e) => {
    map.on("click", (e) => {
      mapEvent = e;
      renderForm();
      getCurrentSelectedOption();
    });
  }

  function getCurrentSelectedOption() {
    selectedActivityType = document.querySelector(".selected");
  }

  function renderForm() {
    form.querySelector("#duration").value = "";
    form.querySelector("#distance").value = "";
    form.querySelector("#cadence").value = "";
    form.querySelector("#elevation").value = "";
    form.classList.remove("hidden");
    // the cursor is automatically focused on the dustance-input
    distance.focus();
  }

  function addActionOnFormSubmission(form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      getCurrentSelectedOption();

      const dur = +duration.value;
      const dist = +distance.value;
      const elev = +document.querySelector("#elevation").value;
      const cad = +document.querySelector("#cadence").value;

      // prettier-ignore
      const id = Array.from({ length: 10 }, (_) => Math.trunc(Math.random() * 1000)).join("");

      if (!checkInputValidity(dur, dist, elev, cad)) return;

      const headerMessage = computeHeaderOfWorkout();
      const formHTML = `
        <div class="workout workout__registered" data-id="${id}">
            <div class="activity activity__description--header" contenteditable="false"><h2>${headerMessage}</h2></div>
            <div class="activity activity__description--data" contenteditable="false">
              <div class="activity__type">🏅🏅</div> 
              <div class="duration">${dur} min </div>
              <div class="distance">${dist} km </div>
              <div class="third">${elev ? elev + " m" : cad + " spm"}</div>
              <div class="weather__field hidden"></div>
            </div> 
            <div class="activity actions--on__workout">
              <button class="on__workout edit">Edit</button>
              <button class="on__workout delete">Delete</button>
              <button class="on__workout weather">Display Weather</button>
              <button id="edit_content" class="on__workout removed--from__flow">Save</button>
            </div>
        </div>`;

      renderFinishedActivity(formHTML);
      renderMarker(headerMessage, mapEvent.latlng.lat, mapEvent.latlng.lng);

      // adds new workout to the workouts-arr to be rendered on reload
      workouts.push({
        id: id,
        lat: mapEvent.latlng.lat,
        lng: mapEvent.latlng.lng,
        headerMessage: headerMessage,
        formHTML: formHTML,
        duration: dur,
        distance: dist,
      });

      addActionsOnWorkout();

      // local storage is updated after adding new workout
      setLocalStorage("workouts", workouts);
    });
  }

  function checkInputValidity(dur, dist, elev, cad) {
    const isValidInput = (...inputs) =>
      inputs.every((inp) => Number.isFinite(inp));

    const isPositive = (...inputs) => inputs.every((inp) => inp > 0);

    if (selectedActivityType.value === "Cycling") {
      if (!isValidInput(dur, dist, elev) || !isPositive(dur, dist)) {
        swal({
          title: "Invalid data",
          text: "Only positive numbers can be used, unless you were cycling downhill of course :)",
          icon: "error",
          button: "Try again!",
        });
        return false;
      }
    }

    if (selectedActivityType.value === "Running") {
      if (!isValidInput(dur, dist, cad) || !isPositive(dur, dist, cad)) {
        swal({
          title: "Invalid data",
          text: "Only positive numbers can be used",
          icon: "error",
          button: "Try again!",
        });
        return false;
      }
    }

    return true;
  }

  function computeHeaderOfWorkout() {
    // prettier-ignore
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const date = new Date();

    return `${
      selectedActivityType.value === "Running"
        ? "👟👟 Running on"
        : "🚴🏼🚴🏼 Cycling on"
    } ${months.at(date.getMonth())}, ${" "} ${date.getDate()}`;
  }

  function renderFinishedActivity(formHTML) {
    workoutsContainer.insertAdjacentHTML("afterbegin", formHTML);
    form.classList.add("hidden");
  }

  function renderMarker(headerMessage, lat, lng) {
    const marker = new L.Marker([lat, lng]);
    marker.addTo(map).bindPopup(headerMessage).openPopup();
    markers.push(marker);
  }

  function addActionsOnWorkout() {
    document
      .querySelectorAll(".edit")
      ?.forEach((editBtn) => editBtn.addEventListener("click", editWorkout));

    document
      .querySelectorAll(".delete")
      ?.forEach((deleteBtn) =>
        deleteBtn.addEventListener("click", deleteWorkout)
      );

    document.querySelectorAll(".weather")?.forEach((weatherBtn) => {
      const idWorkoutGUI = weatherBtn.closest(".workout__registered").dataset
        .id;
      const workoutInArray = workouts.find((w) => w.id === idWorkoutGUI);
      weatherBtn.addEventListener(
        "click",
        getWeatherForWorkout.bind([
          workoutInArray,
          weatherBtn.closest(".workout__registered"),
        ])
      );
    });
  }

  function addActionsOnAllWorkouts() {
    document.querySelector(".delete_all")?.addEventListener("click", deleteAll);

    document
      .querySelector(".sort__duration")
      ?.addEventListener("click", sortByDuration);

    document
      .querySelector(".sort__distance")
      ?.addEventListener("click", sortByDistance);

    document
      .querySelector(".position")
      ?.addEventListener("click", positionToSeeAllMarkers);
  }

  function editWorkout(e) {
    const workout = e.target.closest(".workout__registered");
    const saveBtn = workout.children[2].children[3];
    saveBtn.classList.remove("removed--from__flow");

    const [activityDescription, activityHeader] = makeContentEditable(workout);
    const [workoutInArray, marker] = _findELements(workout);

    saveBtn.addEventListener("click", () => {
      activityDescription.setAttribute("contenteditable", "false");
      activityHeader.setAttribute("contenteditable", "false");
      saveBtn.classList.add("removed--from__flow");

      workoutInArray.formHTML = `<div class="workout workout__registered" data-id=${workout.dataset.id}>
     ${workout.innerHTML} </div>`;
      workoutInArray.headerMessage = workout.children[0].innerText;

      _removeMarkerFromUI(marker);
      renderMarker(
        workoutInArray.headerMessage,
        workoutInArray.lat,
        workoutInArray.lng
      );
      setLocalStorage("workouts", workouts);
    });
  }

  function makeContentEditable(workout) {
    const activityDescription = workout.querySelectorAll(
      ".activity__description--data"
    )[0];
    const activityHeader = workout.querySelectorAll(
      ".activity__description--header"
    )[0];

    activityDescription.setAttribute("contenteditable", "true");
    activityHeader.setAttribute("contenteditable", "true");

    return [activityDescription, activityHeader];
  }

  function deleteWorkout(e) {
    const workout = e.target.closest(".workout__registered");

    const [workoutInArray, marker] = _findELements(workout);
    _removeElementFromUI(workoutInArray, workout);
    _removeMarkerFromUI(marker);
    setLocalStorage("workouts", workouts);
  }

  function _findELements(workout) {
    const workoutInArray = workouts.find((w) => w.id === workout.dataset.id);
    const marker = markers.find(
      (marker) =>
        workoutInArray.lat === marker._latlng.lat &&
        workoutInArray.lng === marker._latlng.lng
    );

    return [workoutInArray, marker];
  }

  function _removeElementFromUI(workoutInArray, workout) {
    workouts.splice(workouts.indexOf(workoutInArray), 1);
    workout.remove();
  }

  function _removeMarkerFromUI(marker) {
    markers.splice(markers.indexOf(marker), 1);
    map.removeLayer(marker);
  }

  function deleteAll() {
    document
      .querySelectorAll(".workout__registered")
      .forEach((w) => w.remove());
    workouts.splice(0);
    markers.forEach((marker) => {
      map.removeLayer(marker);
    });

    setLocalStorage("workouts", workouts);
  }

  function sortByDuration() {
    sortWorkouts("duration");
  }

  function sortByDistance() {
    sortWorkouts("distance");
  }

  function sortWorkouts(sortField) {
    const sortedWorkouts = [...workouts];
    sortOptionToLow.classList.contains("sort-selected")
      ? sortedWorkouts.sort(
          (workout1, workout2) => workout1[sortField] - workout2[sortField]
        )
      : sortedWorkouts.sort(
          (workout1, workout2) => workout2[sortField] - workout1[sortField]
        );

    setLocalStorage("sortedWorkouts", sortedWorkouts);
    document
      .querySelectorAll(".workout__registered")
      .forEach((w) => w.remove());
    getLocalStorage("sortedWorkouts");

    addActionsOnWorkout();
  }

  function toggleMenusOptions(activitiesMenu, sortingOptions) {
    // activity dropdown
    activitiesMenu.addEventListener("change", (e) => {
      cadence.forEach((c) => c.classList.toggle("hidden"));
      elevationGain.forEach((eG) => eG.classList.toggle("hidden"));
      options.forEach((opt) => opt.classList.toggle("selected"));
    });

    // sorting drowdown
    sortingOptions.addEventListener("change", (e) => {
      sortOptionToLow.classList.toggle("sort-selected");
      sortOptionToHigh.classList.toggle("sort-selected");
    });
  }

  function moveToPopup() {
    document
      .querySelector(".workouts__displayed")
      .addEventListener("click", function (e) {
        // clicking on any element inside the workout-div will result in the div clicking
        const selectedWorkout = e.target.closest(".workout");
        if (!selectedWorkout) return;

        const workoutToMoveTo = workouts.find(
          (workout) => workout.id === selectedWorkout.dataset.id
        );

        if (!workoutToMoveTo) return;
        map.setView([workoutToMoveTo.lat, workoutToMoveTo.lng], 13);
      });
  }

  function positionToSeeAllMarkers() {
    const allMarkers = new L.featureGroup([...markers]);
    map.fitBounds(allMarkers.getBounds());
  }

  const getWeatherForWorkout = async function () {
    // SHOULD NOT be hardcoded!
    try {
      //   const APIkey = "0f627327d6667cb5f27a7ff7043bc433";
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${this[0].lat}&lon=${this[0].lng}&units=metric&appid=${APIKey}`
      );

      if (!response.ok)
        throw new Error(`Something went wrong, ${response.status}`);

      const data = await response.json();

      const iconURL =
        "http://openweathermap.org/img/w/" + data.weather[0].icon + ".png";

      const displayWeatherField = this[1]
        .querySelector(".activity__description--data")
        .querySelector(".weather__field");

      displayWeatherField.innerHTML = `${data.main.temp}°C  <img src="${iconURL}" alt="Weather icon"></img>`;
      displayWeatherField.classList.remove("hidden");
    } catch (err) {
      swal({
        title: "Something went wrong",
        text: `${err.message}`,
        icon: "error",
        button: "Reload and try again",
      });
      throw new Error(err.message);
    }
  };

  function setLocalStorage(itemToSetName, itemToSetData) {
    localStorage.setItem(itemToSetName, JSON.stringify(itemToSetData));
    // converts objects to strings
    // this API is already provided for us by the browser
  }

  function getLocalStorage(itemToGetName) {
    const allData = JSON.parse(localStorage.getItem(itemToGetName));

    if (!allData) return;
    workouts = allData;
    workouts.forEach((workout) => renderFinishedActivity(workout.formHTML));
  }

  function reset() {
    localStorage.removeItem("workouts");
    location.reload();
  }

  // ***************************************************************
  function main() {
    initFields();
    clearUnrelatedData();
    getLocalStorage("workouts");
    addActionsOnWorkout();
    addActionsOnAllWorkouts();
    getUserPosition();
    toggleMenusOptions(activitiesMenu, sortingOptions);
    addActionOnFormSubmission(form);
    moveToPopup();
  }
  main();
}
startApp();
