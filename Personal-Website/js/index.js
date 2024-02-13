// show medical experience on click
const showMedicalBtn = document.querySelector(".show-medical");
const showMessage = "Show my medical experience?";
const hideMessage = "Hide medical experience?";

const medicalExperienceArticle = document.getElementsByTagName("article")[0];
showMedicalBtn.addEventListener("click", (e) => {
  medicalExperienceArticle.classList.toggle("display-on-click");
  showMedicalBtn.innerHTML =
    showMedicalBtn.innerHTML === showMessage ? hideMessage : showMessage;
});

// scrolling into view
const navigationBar = document.querySelector(".navbar");

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
  console.log(entries);
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
