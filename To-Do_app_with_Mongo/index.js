import express from "express";
import cors from "cors";
import bodyParser from "body-parser";

import * as db from './db_calls.js';

const app = express();
app.use(cors());
const port = 3000;

app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}))

// TASKLISTS
async function init() {
    // ensure database and all schemas are up 
    await db.connectDatabase();
    // get all taskLists from database
    const allTaskLists = await db.getTaskLists();
    // forEach and call dynamicallyAddsGetRoutesForTaskLists
    allTaskLists.forEach((taskList) => dynamicallyAddsGetRoutesForTaskLists(taskList.name));
}
init();

app.get('/', async (req, res) => {
	// get all taskLists, all lists will always be displayed
	const taskLists = await db.getTaskLists();
	res.render('index.ejs', {allTaskLists: taskLists});
});


function dynamicallyAddsGetRoutesForTaskLists(taskListName) {
	app.get(`/tasklists/${taskListName}`, async (req, res) => {
		// get tasks from database
		let tasks = await db.getTasksOfTaskList(taskListName);
		res.render('index.ejs', {taskList: taskListName, tasks: tasks});
	});
}

// TaskLists
app.get('/tasklists/:tasklistName', async (req, res) => {
	await getDataToRender(res, req.params.tasklistName);
});

// an <a> element that leads to post route
app.post('/tasklists', async (req, res) => {
	// create in database, body should contain listName, 
	// listNames should also be unique
	await db.createTaskList(req.body.name.toLowerCase());
	
	// create dynamicallyAddsGetRoutesForTaskLists
	dynamicallyAddsGetRoutesForTaskLists(req.body.name);

	res.redirect('/tasklists/' + req.body.name);
});


app.post('/tasklists/delete/:name', async (req, res) => {
	// delete from database via name (id?)
	await db.deleteTaskList(req.params.name.toLowerCase());
	res.redirect('/');
});

// update tasklistname


// Tasks
app.post('/tasklists/:tasklistName/tasks', async (req, res) => {
	await db.createTask(req.params.tasklistName.toLowerCase(), req.body.taskname);
	res.redirect(`/tasklists/${req.params.tasklistName.toLowerCase()}`)
});

app.post('/tasklists/:tasklistName/tasks/:id', async (req, res) => {
	await db.updateTask(req.params.tasklistName.toLowerCase(), req.params.id, req.body.newTaskName);
	await getDataToRender(res, req.params.tasklistName)
});

app.post('/tasklists/:tasklistName/tasks/delete/:id', async (req, res) => {
	await db.deleteTask(req.params.tasklistName.toLowerCase(), req.params.id);
	await getDataToRender(res, req.params.tasklistName)
});


// Task Info
app.get('/tasklists/:tasklistName/tasks/:id', async (req, res) => {
	const taskInfo = await db.getDataAboutTask(req.params.tasklistName.toLowerCase(), req.params.id);
	await getDataToRender(res, req.params.tasklistName, taskInfo);
})

// update info
app.post('/tasklists/:tasklistName/tasks/:id/info', async (req, res) => {
	console.log('GETS HIT?')
	const taskInfo = await db.updateDataAboutTask(req.params.tasklistName.toLowerCase(), req.params.id, req.body);
	await getDataToRender(res, req.params.tasklistName, taskInfo);
})


app.listen(port, () => {
	console.log(`Server is up and listening on port ${port}`);
});


// Helpers
async function getDataToRender(res, tasklistName, taskInfo=undefined) {
	const tasks = await db.getTasksOfTaskList(tasklistName.toLowerCase());
	const taskLists = await db.getTaskLists();

	if (taskInfo) res.render('index.ejs', {allTaskLists: taskLists, taskList: tasklistName, tasks: tasks, taskInfo: taskInfo});
	else res.render('index.ejs', {allTaskLists: taskLists, taskList: tasklistName, tasks: tasks});
}