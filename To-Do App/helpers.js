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
    }).join(''); // to external function
  
    const listHtml = `
    <a href="/${nameForId}" class="list-group-item list-group-item--left list-group-item-action my-list" data-name="${nameForId}" id="${nameForId}">
      ${req.body.listName}<div class='closeList'>x</div>
    </a> 
    `;
     
    const userLists = getDataFromLocalStorage();
    const newCustomList = {
      listName: req.body.listName,
      path: nameForId,
      html: listHtml,
      tasks: [],
    };

    userLists.push(newCustomList)
    updateLocalStorage(userLists);

    return [newCustomList, nameForId];
  }

export function getTasks(list) {
    let userLists = getDataFromLocalStorage();

    changeColorOfSelectedList(userLists, list.listName);
    updateLocalStorage(userLists);

    const listToShow = userLists.find(userList => userList.listName === list.listName);
    return [userLists, listToShow];
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

export function addTask(taskName, list) {
    const id = Math.trunc(Math.random() * (Math.random() * 1000)) + 1;
    const completed = false;

    const taskHTML = `
    <li class="list-group-item task contenteditable="false" pb-5" id="${id}"><span class="content contenteditable='false'">${taskName}</span>
    <div class='update'>
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" class="bi bi-pencil-square" viewBox="0 0 16 16">
        <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/>
        <path fill-rule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5v11z"/>
      </svg>
    </div>
    <div class='close'>
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" class="bi bi-x-square" viewBox="0 0 16 16">
      <path d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h12zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2z"/>
      <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
    </svg>
    </div>
   </li>
    `; 
    
    let userLists = getDataFromLocalStorage();
    const listToAddTask = userLists.find(userList => userList.listName === list.listName);

    if (listToAddTask) {
      listToAddTask.tasks.push({
        taskName: taskName,
        taskId: id,
        taskCompleted: completed,
        taskHTML: taskHTML,
        date: new Date(),
      })
    }

    updateLocalStorage(userLists);
    return [userLists, listToAddTask];
  }


export function updateTask(data, requestData) {
  const id = +requestData.taskId;
  const isChecked = requestData.isTaskCompleted;
  const newTaskName = requestData.taskName;

  data.forEach(list => {
    list.tasks.forEach(task => {

      if (task.taskId === id) {
        task.taskCompleted = isChecked;
        const newTaskHTML = `
        <li class="list-group-item task ${isChecked ? 'checked' : ''} pb-5" id="${id}"><span class="content contenteditable='false'">${newTaskName ? newTaskName : task.taskName}</span>
        <div class='update'>
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" class="bi bi-pencil-square" viewBox="0 0 16 16">
            <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/>
            <path fill-rule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5v11z"/>
          </svg>
        </div>
        <div class='close'>
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" class="bi bi-x-square" viewBox="0 0 16 16">
          <path d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h12zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2z"/>
          <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
        </svg>
        </div>
       </li>
        `; 
        
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

  // find the list to which the task will be redirected
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
  taskToMove.taskHTML = `
  <li class="list-group-item task ${taskToMove.taskCompleted ? 'checked' : ''} pb-2" id="${taskToMove.taskId}"><span class="content contenteditable='false'">${taskToMove.taskName}</span>
  </li>
  `
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
    localStorage.clear();
}
