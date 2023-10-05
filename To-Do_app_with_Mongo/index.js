import express from "express";
import cors from "cors";
import bodyParser from "body-parser";

import * as db from './db_calls.js';

const app = express();
app.use(cors());
const port = 3000;

app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}))

// ensure database and all schemas are up 
async function init() {
    await db.connectDatabase();
}
init();

app.get('/', async (req, res) => {
	const taskLists = await db.getTaskLists();
	res.render('index.ejs', {allTaskLists: taskLists});
});

// TaskLists
app.get('/tasklists/:tasklistName', async (req, res) => {
	await getDataToRender(res, req.params.tasklistName);
});

app.post('/tasklists', async (req, res) => {
	// create in database, body should contain listName, listNames are unique
	const tasklistName = req.body.name;
	if (tasklistName === '') res.sendStatus(400);
	await db.createTaskList(tasklistName.toLowerCase());
	res.redirect('/tasklists/' + req.body.name);
});


app.post('/tasklists/delete/:id', async (req, res) => {
	await db.deleteTaskList(req.params.id);
	res.redirect('/');
});


// Tasks
app.post('/tasklists/:tasklistName/tasks', async (req, res) => {
	await db.createTask(req.params.tasklistName.toLowerCase(), req.body.taskname);
	res.redirect(`/tasklists/${req.params.tasklistName.toLowerCase()}`)
});

app.post('/tasklists/:tasklistName/tasks/:id', async (req, res) => {
	let isChecked = req.body.finished;
	if (!isChecked) isChecked = false;
	else isChecked = true;

	await db.updateTask(req.params.tasklistName.toLowerCase(), req.params.id, req.body.newTaskName, isChecked);
	res.redirect(`/tasklists/${req.params.tasklistName.toLowerCase()}`)
});

app.post('/tasklists/:tasklistName/tasks/delete/:id', async (req, res) => {
	await db.deleteTask(req.params.tasklistName.toLowerCase(), req.params.id);
	res.redirect(`/tasklists/${req.params.tasklistName.toLowerCase()}`)
});


// Task Info
app.get('/tasklists/:tasklistName/tasks/:id', async (req, res) => {
	const taskInfo = await db.getDataAboutTask(req.params.tasklistName.toLowerCase(), req.params.id);
	await getDataToRender(res, req.params.tasklistName, taskInfo);
})

// update info
app.post('/tasklists/:tasklistName/tasks/:id/info', async (req, res) => {
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