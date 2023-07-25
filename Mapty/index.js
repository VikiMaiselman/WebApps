"use strict";

// prettier-ignore
let workoutsContainer, form, formRegistered, activitiesMenu, 
    options, selectedActivityType, distance, duration, elevationGain, cadence;

let map, mapEvent;

let workouts = [];
const markers = [];

function init() {
  workoutsContainer = document.querySelector(".workouts__displayed");
  form = document.querySelector(".workout__form");
  activitiesMenu = document.querySelector(".activity__type");
  options = document.querySelectorAll("option");
  distance = document.querySelector("#distance");
  duration = document.querySelector("#duration");
  elevationGain = document.querySelectorAll(".elevation");
  cadence = document.querySelectorAll(".cadence");
}

function getUserPosition() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      function (position) {
        loadMap(position);
        addActionOnMapClick(map);
      },
      function () {
        alert("Could not get your location!");
      }
    );
  }
}

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
    renderMarker(workout.headerMessage, {
      latlng: {
        lat: workout.lat,
        lng: workout.lng,
      },
    });
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
    const id = Array.from({ length: 10 }, (_) =>
      Math.trunc(Math.random() * 1000)
    ).join("");

    if (!checkInputValidity(dur, dist, elev, cad)) return;

    const headerMessage = computeHeaderOfWorkout();
    const formHTML = `
        <div class="workout workout__registered" data-id="${id}">
            <div class="activity activity__description--header"><h2>${headerMessage}</h2></div>
            <div class="activity activity__description--data">
              <div class="activity__type">🏅🏅</div> 
              <div class="duration">${dur} min </div>
              <div class="distance">${dist} km </div>
              <div class="third">${elev ? elev + " m" : cad + " spm"}</div>
            </div> 
            <div class="activity actions--on__workout">
              <button class="on__workout edit">Edit</button>
              <button class="on__workout delete">Delete</button>
              <button class="on__workout delete_all">Delete All</button>
            </div>
        </div>`;

    renderFinishedActivity(formHTML);
    renderMarker(headerMessage, mapEvent);

    // adds new workout to the workouts-arr to be rendered on reload
    workouts.push({
      id: id,
      lat: mapEvent.latlng.lat,
      lng: mapEvent.latlng.lng,
      headerMessage: headerMessage,
      formHTML: formHTML,
    });

    addActionsOnWorkout();

    // local storage is updated after adding new workout
    setLocalStorage();
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

function renderMarker(headerMessage, mapEv) {
  const marker = new L.Marker([mapEv.latlng.lat, mapEv.latlng.lng]);
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
  document
    .querySelectorAll(".delete_all")
    ?.forEach((deleteAllBtn) =>
      deleteAllBtn.addEventListener("click", deleteAll)
    );
}

function editWorkout(e) {
  const workout = e.target.closest(".workout__registered");
  console.log(workout);
}

function deleteWorkout(e) {
  const workout = e.target.closest(".workout__registered");

  const [workoutInArray, marker] = _findELements();
  _removeElementsFromUI(workoutInArray, marker, workout);
  setLocalStorage();
}

function _findELements() {
  const workoutInArray = workouts.find((w) => w.id === workout.dataset.id);
  const marker = markers.find(
    (marker) =>
      workoutInArray.lat === marker._latlng.lat &&
      workoutInArray.lng === marker._latlng.lng
  );

  return [workoutInArray, marker];
}

function _removeElementsFromUI(workoutInArray, marker, workout) {
  workouts.splice(workouts.indexOf(workoutInArray), 1);
  markers.splice(markers.indexOf(marker), 1);
  map.removeLayer(marker);
  workout.remove();
}

function deleteAll() {
  document.querySelectorAll(".workout__registered").forEach((w) => w.remove());
  workouts.splice(0);
  markers.forEach((marker) => {
    map.removeLayer(marker);
  });

  setLocalStorage();
}

function toggleActivitiesTypeMenu(activitiesMenu) {
  activitiesMenu.addEventListener("change", (e) => {
    cadence.forEach((c) => c.classList.toggle("hidden"));
    elevationGain.forEach((eG) => eG.classList.toggle("hidden"));
    options.forEach((opt) => opt.classList.toggle("selected"));
  });
}

function moveToPopup() {
  document
    .querySelector(".workouts__displayed")
    .addEventListener("click", function (e) {
      // clicking on any element inside the workout-div will resilt in the div clicking
      const selectedWorkout = e.target.closest(".workout");
      if (!selectedWorkout) return;

      const workoutToMoveTo = workouts.find(
        (workout) => workout.id === selectedWorkout.dataset.id
      );

      if (!workoutToMoveTo) return;
      map.setView([workoutToMoveTo.lat, workoutToMoveTo.lng], 13);
    });
}

function setLocalStorage() {
  localStorage.setItem("workouts", JSON.stringify(workouts));
  // converts objects to strings
  // this API is already provided for us by the browser
}

function getLocalStorage() {
  const allData = JSON.parse(localStorage.getItem("workouts"));

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
  init();
  getLocalStorage();
  addActionsOnWorkout();
  getUserPosition();
  toggleActivitiesTypeMenu(activitiesMenu);
  addActionOnFormSubmission(form);
  moveToPopup();
}
main();
