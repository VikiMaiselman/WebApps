import express from "express";
import bodyParser from "body-parser";
import cron from 'node-cron';

import * as helper from "./helpers.js"

const app = express();
const port = 3000;

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));


app.get("/", (req, res) => {
  const userLists = helper.getDataFromLocalStorage();
  res.render("index.ejs", {userListsData: userLists});
});


// initailizes local storage with pre-defined lists on program start
function init() {
  console.log('init working');
  // helper.clearStorage();
  
  let userLists = helper.getDataFromLocalStorage();
  if (!userLists) {
    helper.updateLocalStorage(helper.userListsData);
    userLists = helper.getDataFromLocalStorage();
  }

  userLists.forEach(list => {
    app.get(`/${list.path}`, async (req,res) => {
      await helper.getTasks(list.listName, res)
    });
  
    app.post(`/${list.path}`, (req,res) => {
      helper.addTask(req.body.taskName, list.listName, res);
    });
  })
}
init();


app.post('/addList', (req, res) => {
  const [userLists, nameForId] = helper.createNewList(req);
  // dynamically adds app.get & app.post to any newly created list
  addGetAndSetForNewCustomList(req.body.listName, nameForId); 
  res.redirect(`/${nameForId}`)
})

function addGetAndSetForNewCustomList(listName, path) {
  app.get(`/${path}`, async (req, res) => {
    await helper.getTasks(listName, res);
  });

  app.post(`/${path}`, (req,res) => {
    helper.addTask(req.body.taskName, listName, res);
  });
}


// delete custom list 
app.post('/deleteList', (req, res) => {
  const dataFromStorage = helper.getDataFromLocalStorage();

  const listIndex = dataFromStorage.findIndex(list => list.path === req.body.listId);
  dataFromStorage.splice(listIndex, 1);

  helper.updateLocalStorage(dataFromStorage);
  res.redirect('/');
});


// to make possible data transfer from client side to server side (allows parsing & CORS)
app.use(bodyParser.json());
app.use(helper.allowAccessControl);


// clicking on tasks from browser results in striking through
app.post('/finished', (req, res) => {
  // get data from local storage
  const dataFromStorage = helper.getDataFromLocalStorage();

  // render task appropriately (stroken through)
  helper.updateTaskStatus(dataFromStorage, req.body);

  // save changes
  helper.updateLocalStorage(dataFromStorage);

  res.sendStatus(200);
});


// forwards task to 'completed' list or deletes it 
app.post('/toCompleted', (req, resp) => {
  const dataFromStorage = helper.getDataFromLocalStorage();
  helper.move(dataFromStorage, req.body, 'completed')
  helper.updateLocalStorage(dataFromStorage);
  resp.redirect('back');
});


app.post("/clearCompletedTasks", (req, res) => {
  const dataFromStorage = helper.getDataFromLocalStorage();
  const completedList = dataFromStorage.find(list => list.path === 'completed');
  completedList.tasks.splice(0);
  helper.updateLocalStorage(dataFromStorage);
  res.render('index.ejs', {userListsData: dataFromStorage, list: completedList})
});


// forward task from 'today' / 'this week' to 'planned' if date expired
const scheduledAction = cron.schedule('0 25 13 * * *' , async (req) => {
  const dataFromStorage = helper.getDataFromLocalStorage();
  dataFromStorage.forEach(list => {
    if (list.path === 'today' || list.path === 'thisWeek') {
      list.tasks.forEach(task => {
        helper.move(dataFromStorage, task, 'planned')
      })
    }
  })
  helper.updateLocalStorage(dataFromStorage);
});

app.post('/start-scheduler', async (req, res) => {
  await scheduledAction(req);
  return res.redirect('back');
});


// starting point, server is ready and up
app.listen(port, (req, res) =>
  console.log(`The server is ready on port ${port}`)
);

