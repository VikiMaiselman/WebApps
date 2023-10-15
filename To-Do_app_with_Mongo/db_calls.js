import mongoose from 'mongoose';

let TaskList; 
let Task;
let TaskInfo;

export async function connectDatabase() {
    try {
        await mongoose.connect("mongodb://localhost:27017/toDo");

        const taskInfoSchema = new mongoose.Schema({
            isImportant: Boolean,
            dateCreated: Date, 
            note: String,

        });

        const taskSchema = new mongoose.Schema({
            name: String,
            isChecked: Boolean,
            metadata: taskInfoSchema,
        });

        const taskListSchema = new mongoose.Schema({
            name: {
                type: String,
                unique: true,
            },
            tasks: [taskSchema],
        });

        TaskList = mongoose.model("TaskList", taskListSchema);
        Task = mongoose.model("Task", taskSchema);
        TaskInfo = mongoose.model("TaskInfo", taskInfoSchema);
        
        // await TaskList.deleteOne({name: 'today'});
        // await TaskList.deleteOne({name: 'this_week'});
        // await TaskList.deleteOne({name: 'personal'});
        // await TaskList.deleteOne({name: 'work'});
        // await TaskList.deleteOne({name: 'important'});

        // once create predefined lists: Today, This week, Personal, Work, Important
        const taskLists = await TaskList.find({});

        const isDbEmpty = Object.keys(taskLists).length === 0 ? true : false;

        if (isDbEmpty) {
            const today = new TaskList({
                name: 'today',
                tasks: []
            });

            const thisWeek = new TaskList({
                name: 'this_week',
                tasks: []
            });

            const personal = new TaskList({
                name: 'personal',
                tasks: []
            });

            const work = new TaskList({
                name: 'work',
                tasks: []
            });
            
            const important = new TaskList({
                name: 'important',
                tasks: []
            });

            await TaskList.insertMany([today, thisWeek, personal, work, important]);
        }   
    } finally {
        mongoose.connection.close();
    }
}

export async function getTaskLists() {
    try {
        await mongoose.connect("mongodb://localhost:27017/toDo");
        const allLists = await TaskList.find({});
        return allLists;
    } finally {
        mongoose.connection.close();
    }
}

export async function getTasksOfTaskList(taskListName) {
    try {
        await mongoose.connect("mongodb://localhost:27017/toDo");

        const taskList = await TaskList.find({name: taskListName});
        if (! taskList) return;

        const allTasks = taskList[0].tasks;
        return allTasks;
    } finally {
        mongoose.connection.close();
    }
}

export async function createTaskList(tasklistName) {
    try {
        await mongoose.connect("mongodb://localhost:27017/toDo");
        
        const newTasklist = new TaskList({
            name: `${tasklistName}`,
            tasks: []
        });
        await newTasklist.save();
    } catch (error) {
        console.error(error);
    } finally {
        mongoose.connection.close();
    }
}

export async function deleteTaskList(id) {
    try {
        await mongoose.connect("mongodb://localhost:27017/toDo");

        await TaskList.deleteOne({_id: id});
    } catch (error) {
        console.error(error);
    } finally {
        mongoose.connection.close();
    }
}


// Tasks 
export async function createTask(tasklistName, taskName) {
    try {
        await mongoose.connect("mongodb://localhost:27017/toDo");

        const metadata = new TaskInfo({
            isImportant: false,
            dateCreated: `${new Date().toISOString()}`, 
            note: '',

        });
        const newTask = new Task({
            name: taskName,
            metadata: metadata,
        });

        await TaskList.updateOne({name: tasklistName}, { $push: { tasks: newTask  } });
    } catch (error) {
        console.error(error);
    } finally {
        mongoose.connection.close();
    }
}

export async function updateTask(tasklistName, id, newTaskName, isChecked) {
    try {
        await mongoose.connect("mongodb://localhost:27017/toDo");

        await TaskList.findOneAndUpdate(
            {
                name: tasklistName,
                'tasks._id': id,
            }, 
            { $set: { 
                'tasks.$.name': newTaskName,
                'tasks.$.isChecked': isChecked  
            } }
        );
    } catch (error) {
        console.error(error);
    } finally {
        mongoose.connection.close();
    }
}

export async function deleteTask(tasklistName, id) {
    try {
        await mongoose.connect("mongodb://localhost:27017/toDo");
        
        await TaskList.findOneAndUpdate(
            {name: tasklistName, 'tasks._id': id}, 
            {$pull: {tasks : {
                _id: id,
            }}}
            );
    } catch (error) {
        console.error(error);
    } finally {
        mongoose.connection.close();
    }
}


// Notes
export async function getDataAboutTask(tasklistName, id) {
    try {
        await mongoose.connect("mongodb://localhost:27017/toDo");

        const task = await TaskList.findOne(
            {
                name: tasklistName,
                'tasks._id': id,
            } ,
            {'tasks.$': 1}
        );

        const {isImportant, dateCreated, note} = task.tasks[0].metadata
        return {isImportant: isImportant, dateCreated: dateCreated, 
                        note: note, taskName: task.tasks[0].name, taskId: task.tasks[0]._id};
    } catch (error) {
        console.error(error);
    } finally {
        mongoose.connection.close();
    }
}

export async function updateDataAboutTask(tasklistName, id, newData) {
    try {
        await mongoose.connect("mongodb://localhost:27017/toDo");

        const notes = newData.note;
        const isImportant = newData.isImportant;
        let task;

        if (notes) {
            task = await TaskList.findOneAndUpdate(
                {
                    name: tasklistName,
                    'tasks._id': id,
                } ,
                { $set: { 'tasks.$.metadata.note': notes } }
            );
        }

        if (isImportant) {
            task = await TaskList.findOneAndUpdate(
                {
                    name: tasklistName,
                    'tasks._id': id,
                } ,
                { $set: { 'tasks.$.metadata.isImportant': isImportant } }
            );
        }
        
        return await getDataAboutTask(tasklistName, id);
    
    } catch (error) {
        console.error(error);
    } finally {
        mongoose.connection.close();
    }
}