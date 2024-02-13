// DOM elements
const showMedicalBtn = document.querySelector(".show-medical");
const navigationBar = document.querySelector(".navbar");
const header = document.querySelector(".header");

// show medical experience on click
const showMessage = "Show my medical experience?";
const hideMessage = "Hide medical experience?";

const medicalExperienceArticle = document.getElementsByTagName("article")[0];
showMedicalBtn.addEventListener("click", (e) => {
  medicalExperienceArticle.classList.toggle("display-on-click");
  showMedicalBtn.innerHTML =
    showMedicalBtn.innerHTML === showMessage ? hideMessage : showMessage;
});

// scrolling into view

navigationBar.addEventListener("click", (e) => {
  e.preventDefault();
  if (!e.target.classList.contains("reference")) return;

  document
    .querySelector(e.target.getAttribute("href"))
    .scrollIntoView({ behavior: "smooth" });
});

// revealing elements on scrolling with IntersectionObserver API
const sectionObserver = new IntersectionObserver(action, {
  root: null,
  threshold: 0,
});

function action(entries) {
  const entry = entries[0];
  if (!entry.isIntersecting) return;

  entry.target.classList.remove("hidden");
  sectionObserver.unobserve(entry.target);
}

const allSections = document.querySelectorAll(".content");
allSections.forEach((section) => {
  section.classList.add("hidden");
  sectionObserver.observe(section);
});

// sticky navbar
const navbarHeight = navigationBar.getBoundingClientRect().height;
const opts = {
  root: null,
  threshold: 0,
  rootMargin: `-${navbarHeight}px`,
};

function stickyNavbarAction(entries) {
  const entry = entries[0];
  console.log(entries);

  console.log(entry.isIntersecting);
  if (!entry.isIntersecting) navigationBar.classList.add("sticky");
  else navigationBar.classList.remove("sticky");
}
const navObserver = new IntersectionObserver(stickyNavbarAction, opts);
navObserver.observe(header);
