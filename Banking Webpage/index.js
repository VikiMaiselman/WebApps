// Tabbed Component
document.querySelector(".buttons").addEventListener("click", (e) => {
  document
    .querySelectorAll(".content")
    .forEach((elem) => elem.classList.remove("active"));

  document.querySelectorAll(".btn").forEach((elem) => {
    elem.classList.remove("active-button");
  });

  document.querySelector(`.c-${e.target.dataset.num}`).classList.add("active");

  document
    .querySelector(`.btn-${e.target.dataset.num}`)
    .classList.add("active-button");
});

// Carousel Component
const reviews = document.querySelectorAll(".reviews-content");
const carousel = document.querySelector(".carousel");
const btns = [
  carousel.querySelector(".left-btn"),
  carousel.querySelector(".right-btn"),
];
const positions = [0, 1, 2];
const numReviews = positions.length;

let start = 0;

const carouselScroll = function (e) {
  const positionDisabled = positions.at(start % numReviews);
  start = start + this;
  const positionActive = positions.at(start % numReviews);

  if (
    document
      .querySelector(`.r--${positionDisabled + 1}`)
      .classList.contains("active-r")
  ) {
    document
      .querySelector(`.r--${positionActive + 1}`)
      .classList.add("active-r");

    document
      .querySelector(`.r--${positionDisabled + 1}`)
      .classList.remove("active-r");
  }
};

btns[0].addEventListener("click", carouselScroll.bind(-1));
btns[1].addEventListener("click", carouselScroll.bind(1));

// starting is the first review
// when you press right-btn this one is .remove class and the next one is .add class
// const position = [0, 1, 2]
// const startPosition = 0
// if right-btn pressed - active = arr[(startPosition + 1) % 3]
// if left-btn active = arr[startPosition - 1 % 3]

// Reveal on scrolling
const sections = document.querySelectorAll(".section");

const sectionObserverOpts = {
  root: null,
  threshold: 0.15,
};

const revealSectionCallback = (entries, observer) => {
  const entry = entries[0];

  if (!entry.isIntersecting) return;
  entry.target.classList.remove("hidden");
  sectionsObserver.unobserve(entry.target);
};

const sectionsObserver = new IntersectionObserver(
  revealSectionCallback,
  sectionObserverOpts
);
sections.forEach((section) => {
  section.classList.add("hidden");
  sectionsObserver.observe(section);
});

// sticky nav bar when outside the hero area
// const hero = document.querySelector(".hero");
// const navHeight = document
//   .querySelector(".navigbar")
//   .getBoundingClientRect().height;

// const stickyNavOpts = {
//   root: null,
//   threshold: 0,
//   rootMargin: `-${navHeight}px`,
// };

// const stickyNavAppears = function (entries) {
//   const entry = entries[0];

//   if (!entry.isIntersecting)
//     document.querySelector(".navigbar").classList.add("sticky");
//   else document.querySelector(".navigbar").classList.remove("sticky");
// };

// const navObserver = new IntersectionObserver(stickyNavAppears, stickyNavOpts);
// navObserver.observe(hero);

// document.querySelectorAll(".nav__to").forEach((link) => {
//   link.addEventListener("click", function (e) {
//     const dest = e.target.getAttribute("href");
//     document.querySelector(dest).scrollIntoView({ behavior: "smooth" });
//   });
// });
