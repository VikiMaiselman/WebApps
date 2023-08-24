import { parse } from 'node-html-parser';
import {LocalStorage} from "node-localstorage"

export const userListsData = [
    {
      listName: 'Today',
      path: 'today',
      html: `<a href="/today" class="list-group-item list-group-item--left list-group-item-action my-list" data-name="today" id="today">Today</a>`,
      tasks: [],
    }, 
    {
      listName: 'Important',
      path: 'important',
      html: `<a href="/important" class="list-group-item list-group-item--left list-group-item-action my-list" data-name="important" id="important">Important</a>`,
      tasks: [],
    },
    {
      listName: 'This Week',
      path: 'thisWeek',
      html: `<a href="/thisWeek" class="list-group-item list-group-item--left list-group-item-action my-list" data-name="thisWeek" id="thisWeek">This Week</a>`,
      tasks: [],
    },
    {
      listName: 'This Month',
      path: 'thisMonth',
      html: `<a href="/thisMonth" class="list-group-item list-group-item--left list-group-item-action my-list" data-name="thisMonth" id="thisMonth">This Month</a>`,
      tasks: [],
    },
    {
      listName: 'This Year',
      path: 'thisYear',
      html: `<a href="/thisYear" class="list-group-item list-group-item--left list-group-item-action my-list" data-name="thisYear" id="thisYear">This Year</a>`,
      tasks: [],
    },
    {
      listName: 'Completed',
      path: 'completed',
      html: `<a href="/completed" class="list-group-item list-group-item--left list-group-item-action my-list" data-name="completed" id="completed">Completed</a>`,
      tasks: [],
    },
    {
      listName: 'Planned',
      path: 'planned',
      html: `<a href="/planned" class="list-group-item list-group-item--left list-group-item-action my-list" data-name="planned" id="planned">Planned</a>`,
      tasks: [],
    }
  ];

  export function createNewList(req) {
    // creates path & id names
    const nameForId = req.body.listName.split(' ').map((word, idx) => {
      if (idx === 0) {
        return word.toLowerCase();
      } else {
        return word.at(0).toUpperCase() + word.slice(1).toLowerCase();
      }
    }).join('');
  
    const listHtml = `
    <a href="/${nameForId}" class="list-group-item list-group-item--left list-group-item-action my-list" data-name="${nameForId}" id="${nameForId}">
      ${req.body.listName}<div class='closeList'>x</div>
    </a> 
    `;
     
    const userLists = getDataFromLocalStorage();
    userLists.push({
      listName: req.body.listName,
      path: nameForId,
      html: listHtml,
      tasks: [],
    })
    updateLocalStorage(userLists);

    return [userLists, nameForId];
  }

export async function getTasks(listName, res) {
    let userLists = getDataFromLocalStorage();
    const list = userLists.find(list => list.listName === listName);

    changeColorOfSelectedList(userLists, listName);
    updateLocalStorage(userLists);
  
    res.render('index.ejs', {userListsData: userLists, list: list});
}

function changeColorOfSelectedList(userLists, listName) {
  userLists.forEach(list => {
    const parsedListHTML = parse(list.html).querySelector('.my-list');

    if (list.listName === listName) {
      parsedListHTML.classList.add('list-group-item-light');
    } else {
      parsedListHTML.classList.remove('list-group-item-light');
    }

    const newHTML = parsedListHTML.toString();
    list.html = newHTML;
  });
}

export function addTask(taskName, listName, res) {
    const id = Math.trunc(Math.random() * (Math.random() * 1000)) + 1;
    const completed = false;

    const taskHTML = `
    <li class="list-group-item task" id="${id}">${taskName}<div class='close'>x</div></li>
    `; 
    
    let userLists = getDataFromLocalStorage();
  
    const list = userLists.find(list => list.listName === listName);
    if (list) {
      list.tasks.push({
        taskName: taskName,
        taskId: id,
        taskCompleted: completed,
        taskHTML: taskHTML,
        date: new Date(),
      })
    }

    updateLocalStorage(userLists);
  
    res.render('index.ejs', {userListsData: userLists, list: list})
  }


export function updateTaskStatus(data, requestData) {
  const id = +requestData.id;
  const isChecked = requestData.isChecked;

  data.forEach(list => {
    list.tasks.forEach(task => {

      if (task.taskId === id) {
        task.taskCompleted = true;
        const newTaskHTML = `<li class="list-group-item task ${isChecked ? 'checked' : ''}" id="${id}">${task.taskName}<div class='close'>x</div></li>`; 
        task.taskHTML = newTaskHTML;
      }
    })
  });
}

export function allowAccessControl(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
    return res.status(200).json({});
  }
  next();
}

export function move(dataFromStorage, taskToMove, whereToMove) {
  let listToMoveTo, listToMoveFrom;

  // find the list to which list the tasks will be redirected
  dataFromStorage.forEach(list => {
    if (list.path === whereToMove) {
      listToMoveTo = list;
    }
  });

  // find the task by id and list it's associated with
  dataFromStorage.forEach(curList => {
    curList.tasks.forEach((task, taskIdx) => {

      if (+task.taskId === +taskToMove.taskId) {
        listToMoveFrom = curList;
        taskToMove = task;

        if (whereToMove === 'completed') {
          moveToCompleted(listToMoveFrom, listToMoveTo, taskToMove, taskIdx);
        }

        if (whereToMove === 'planned') {
          moveToPlanned (listToMoveFrom, listToMoveTo, taskToMove, taskIdx);
        }
      } 
    });
  });
}

export function moveToPlanned (listToMoveFrom, listPlanned, taskToMove, taskIdx) {
  const now = new Date();
  const taskCreated = new Date(taskToMove.date);
  const daysPassed = Math.trunc(Math.abs(now - taskCreated) / (1000 * 3600 * 24));

  if (hasDueDateExpired(listToMoveFrom, daysPassed) && (!taskToMove.isChecked)) {
    redirectTask(listToMoveFrom, listPlanned, taskToMove, taskIdx);
  }
}

function hasDueDateExpired(listToMoveFrom, daysPassed) {
  return (listToMoveFrom.path === 'today' && daysPassed < 1) || 
    (listToMoveFrom.path === 'thisWeek' && daysPassed >= 7)
}

function moveToCompleted(listToMoveFrom, listCompleted, taskToComplete, taskIdx) {
  if (taskToComplete.taskCompleted && listCompleted !== listToMoveFrom) {
    redirectTask(listToMoveFrom, listCompleted, taskToComplete, taskIdx);
  }
  else if (!taskToComplete.taskCompleted) {
    // remove entirely, do not add to completed
    listToMoveFrom.tasks.splice(taskIdx, 1);
  }
}

function redirectTask (listToMoveFrom, listToMoveTo, taskToMove, taskIdx) {
  // remove from current list
  listToMoveFrom.tasks.splice(taskIdx, 1);

  // forward to Completed list
  listToMoveTo.tasks.push(taskToMove);
}

const localStorage = new LocalStorage('./scratch');

export function updateLocalStorage(userListsData) {
  localStorage.setItem('userListsData', JSON.stringify(userListsData));
}

export function getDataFromLocalStorage() {
    const data = localStorage.getItem('userListsData');
    if (data) return JSON.parse(data);
}

export function clearStorage() {
    // console.log(localStorage);
    localStorage.clear();
}
