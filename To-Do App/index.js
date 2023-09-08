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


// initailizes local storage with pre-defined task Lists on program start
// and dynamically adds get and post endpoints for each of them
function init() {
  console.log('init working');
  // helper.clearStorage();
  
  let userLists = helper.getDataFromLocalStorage();
  if (!userLists) {
    // populate the storage with 7 predefined task Lists (Today, Important, Planned ...)
    helper.updateLocalStorage(helper.userListsData); 
    userLists = helper.getDataFromLocalStorage();
  }

  userLists.forEach(list => {
    addGetAndSetForNewList(list, list.path);
  })
}
init();


app.post('/addList', (req, res) => {
  const [newCustomTasksList, nameForId] = helper.createNewList(req);
  // dynamically adds app.get & app.post to any newly created list
  addGetAndSetForNewList(newCustomTasksList, nameForId); 
  return res.redirect(`/${nameForId}`);
})

function addGetAndSetForNewList(list, path) {
  app.get(`/${path}`, (req, res) => {
    const [userLists, listToShow] = helper.getTasks(list);
    res.render('index.ejs', {userListsData: userLists, list: listToShow})
  });

  app.post(`/${path}`, (req,res) => {
    const [userLists, listTaskWasAddedTo] = helper.addTask(req.body.taskName, list);
    res.render('index.ejs', {userListsData: userLists, list: listTaskWasAddedTo}); // return only data and render in index.js
  });
}


// to make possible data transfer from client side to server side (allows parsing & CORS)
app.use(bodyParser.json());
app.use(helper.allowAccessControl);

// delete custom list 
app.post('/deleteList', (req, res) => {
  const dataFromStorage = helper.getDataFromLocalStorage();
  const listIndex = dataFromStorage.findIndex(list => list.path === req.body.listId);
  dataFromStorage.splice(listIndex, 1);

  helper.updateLocalStorage(dataFromStorage);
  return res.redirect('/');
});


// clicking on tasks from browser results in striking through
app.post('/finished', (req, res) => {
  // get data from local storage
  const dataFromStorage = helper.getDataFromLocalStorage();

  // render task appropriately (stroken through)
  helper.updateTask(dataFromStorage, req.body);

  // save changes
  helper.updateLocalStorage(dataFromStorage);

  res.sendStatus(200);
});


// forwards task to 'completed' list or deletes it 
app.post('/toCompleted', (req, resp) => {
  const dataFromStorage = helper.getDataFromLocalStorage();
  helper.move(dataFromStorage, req.body, 'completed')
  helper.updateLocalStorage(dataFromStorage);
  return resp.redirect('back');
});


app.post("/clearCompletedTasks", (req, res) => {
  const dataFromStorage = helper.getDataFromLocalStorage();
  const completedList = dataFromStorage.find(list => list.path === 'completed');
  completedList.tasks.splice(0);
  helper.updateLocalStorage(dataFromStorage);
  res.render('index.ejs', {userListsData: dataFromStorage, list: completedList})
});


// forward task from 'today' / 'this week' to 'planned' if date expired
const scheduledAction = cron.schedule('0 0 0 * * *' , async (req) => {
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


// update task content
app.patch('/updateTask', (req, res) => {
  const dataFromStorage = helper.getDataFromLocalStorage();

  helper.updateTask(dataFromStorage, req.body);

  helper.updateLocalStorage(dataFromStorage);
})

// starting point, server is ready and up
app.listen(port, () =>
  console.log(`The server is ready on port ${port}`)
);

