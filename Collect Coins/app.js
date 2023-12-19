import express from "express";
import bodyParser from "body-parser";

import * as db from "./db_calls.js";

const app = express();
const port = 3002;

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

db.initDatabaseAndSchemas();

app.get("/", async (req, res) => {
  const totalScore = await db.getTotalScore();
  const allSections = await db.getAllSections();
  res.render("index.ejs", { sections: allSections, totalScore: totalScore });
});

app.post("/", async (req, res) => {
  const color = getRandomColor();
  // each section recieves a new unique color
  await db.addNewColor(color, req.body.sectionName);
  await db.createSection({ name: req.body.sectionName, color: color });
  res.redirect("/");
});

app.post("/section/:id", async (req, res) => {
  try {
    // section won't be deleted (and therefore the color)
    // if the coins associated with this section are still available
    await db.deleteSection(req.params.id);
  } catch (error) {
    res.render("index.ejs", { error: error.message });
    return;
  }
  res.redirect("/");
});

app.post("/section/:sectionId/activities/", async (req, res) => {
  const [sectionColor, sectionName] = await db.getSectionColorAndName(
    req.params.sectionId
  );

  if (!+req.body.coinsNum || !req.body.activityName) {
    res.redirect("/");
    return;
  }

  const coins = [
    {
      color: sectionColor,
      value: +req.body.coinsNum,
      sectionName: sectionName,
    },
  ];
  await db.createActivityInSection({
    coins: coins,
    name: req.body.activityName,
    id: req.params.sectionId,
  });
  res.redirect("/");
});

app.post("/section/:sectionId/activities/:activityId", async (req, res) => {
  await db.deleteActivityInSection(req.params.activityId, req.params.sectionId);
  res.redirect("/");
});

/* ******************* S C O R E S   &    C O I N S ******************* */
app.post(
  "/section/:sectionId/activities/:activityId/score",
  async (req, res) => {
    await db.addCoinsFromActivity(req.params.sectionId, req.params.activityId);
    res.redirect("/");
  }
);

app.get("/score", async (req, res) => {
  const coinPriceByColor = await db.getAllCoinPrices();
  const totalScore = await db.getTotalScore();
  res.render("score.ejs", {
    scoresByColor: coinPriceByColor,
    totalScore: totalScore,
  });
});

/* ******************* W I S H E S ******************* */
app.get("/wishes", async (req, res) => {
  const allColors = await db.getAllColors();
  const allWishes = await db.getAllWishes();
  const totalScore = await db.getTotalScore();
  const coinPriceByColor = await db.getAllCoinPrices();

  res.render("wishes.ejs", {
    wishes: allWishes,
    coinColors: allColors,
    scoresByColor: coinPriceByColor,
    totalScore: totalScore,
  });
});

app.post("/wishes", async (req, res) => {
  const coins = [];
  const userPricesForCoins = req.body.values.entries();

  for (let [idx, num] of userPricesForCoins) {
    if (num === "") continue; // the coin was ignored, valid

    const value = +num;
    const sectionName = await db.findSectionNameByColor(req.body.colors[idx]);

    const coin = {
      color: req.body.colors[idx],
      value: value,
      sectionName: sectionName,
    };
    coins.push(coin);
  }

  await db.createWish({ name: req.body.wishName, coins: coins });
  res.redirect("/wishes");
});

app.post("/wishes/:wishId", async (req, res) => {
  await db.deleteWish(req.params.wishId);
  res.redirect("/wishes");
});

app.post("/wishes/:wishId/fulfilled", async (req, res) => {
  try {
    await db.accomplishWishAndDelete(req.params.wishId);
  } catch (error) {
    res.render("wishes.ejs", { error: error.message });
    return;
  }
  res.redirect("/wishes");
});

app.listen(port, () => {
  console.log(`Server is up and listening on port ${port}`);
});

/* ******************* H E L P E R S ******************* */
function getRandomColor() {
  const getRandomNumber = () => Math.floor(Math.random() * 256);
  return `rgb(${getRandomNumber()}, ${getRandomNumber()}, ${getRandomNumber()})`;
}
