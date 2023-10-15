import express from 'express';
import bodyParser from 'body-parser';

import * as db from './db_calls.js';

const app = express();
const port = 3002;

app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}))

db.initDatabaseAndSchemas();

app.get('/', async (req, res) => {
    const number = await db.getScoreWithoutColors();
    const allSections = await db.getAllSections();
    res.render('index.ejs', {sections: allSections, totalScore: number});
});

app.post('/', async (req, res) => {
    const color = getRandomColor();
    await db.addNewColor(color);
    await db.createSection({name: req.body.sectionName, color: color});
    res.redirect('/');
});

app.post('/section/:id', async (req, res) => {
    await db.deleteSection(req.params.id);
    await db.removeColor(req.params.id);
    res.redirect('/');
});

app.post('/section/:sectionId/activities/', async (req, res) => {
    const [sectionColor, sectionName] = await db.getSectionColorAndName(req.params.sectionId);
    if (!+req.body.coinsNum || !req.body.activityName) {
        res.redirect('/');
        return;
    }
    const coins = [{
        color: sectionColor,
        value: +req.body.coinsNum,
        sectionName: sectionName,
        }];

    await db.createActivityInSection({
                                      coins: coins, 
                                      name: req.body.activityName, 
                                      id: req.params.sectionId
                                    });
    res.redirect('/');
});

app.post('/section/:sectionId/activities/:activityId', async (req, res) => {
    await db.deleteActivityInSection(req.params.activityId, req.params.sectionId);
    res.redirect('/');
});

app.post('/section/:sectionId/activities/:activityId/score', async (req, res) => {
    await db.addCoinsFromActivity(req.params.sectionId, req.params.activityId);
    res.redirect('/');
});

app.get('/score', async (req, res) => {
    const scoresByColor = await db.getScoreByColors();
    const number = await db.getScoreWithoutColors();
    res.render('score.ejs', {scoresByColor: scoresByColor, totalScore: number});
});


/* ******************* W I S H E S ******************* */
app.get('/wishes', async (req, res) => {
    const allColors = await db.getAllColors();
    const allWishes = await db.getAllWishes();
    const number = await db.getScoreWithoutColors();

    res.render('wishes.ejs', {wishes: allWishes, coinColors: allColors, totalScore: number});
});

// coins should return or be turned to an array of objects
app.post('/wishes', async (req, res) => {
    const coins = [];

    for (let [idx, num] of req.body.values.entries()) {
        console.log(num);
        if (num === '') continue;

        const value = +num;
        const sectionName = await db.findSectionNameByColor(req.body.color[idx]);

        const coin = {
            color: req.body.color[idx],
            value: value,
            sectionName: sectionName
        };
        coins.push(coin);
    }

    const allWishes = await db.createWish({name: req.body.wishName, coins: coins});
    res.redirect('/wishes');
});

app.post('/wishes/:wishId', async (req, res) => {
    await db.deleteWish(req.params.wishId);
    res.redirect('/wishes');
});

app.listen(port, () => {
    console.log(`Server is up and listening on port ${port}`);
});

function getRandomColor() {
    const getRandomNumber = () => Math.floor(Math.random() * 256);
    return `rgb(${getRandomNumber()}, ${getRandomNumber()}, ${getRandomNumber()})`;
}
