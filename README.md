# WebApps
## 4 Projects that are Static Web Pages (no running server)

### About Me
* A simple basic website about my achievements and experience
* Implemented with HTML, CSS and Bootstrap Library

### Banking Webpage 
* A generic website that displays a landing page for a (hypothethical) bank.
* Implemented as a static website with HTML and CSS only (all components implemented w/o external libraries) and JS for visual effects.

### Mapty 
* An app that uses current geolocation to display a map, on which workouts can be marked and rendered.
* Allows to make some basic actions on workouts includein editing, sorting, deleting, displaying all workouts at once etc.
* Implemented as a static website with HTML, CSS and JS.
* The project uses the geolocation and local storage Web APIs.

### Forkify
* A website that allows searching for recipes by categories, saving them as bookmarks and using them later.
* Implemented as a static website with HTML, CSS and asynchronous JS using the MVC architecture.



## Projects that are full-blown dynamic Web Apps
### To-Do App
* A to-do application that allows user to create new tasks and delete them upon completion.
* Allows some additional features such as:
    1. Using pre-defined lists of tasks, the lists are logical entites that can contain tasks based on common features (such as Today List, Important List, Completed etc.). Pre-defined lists can't be deleted.
    2. Creating custom lists with custom names. Can be deleted by clicking on X-button attached to each custom list.
    3. Tasks can be signed as finished by clicking on them (the task appears stroken through). Finished tasks stay in the current list unless the user clicks on X-button allowed on each task. Tasks that are closed by this way are automatically moved to Completed pre-defined list.
    4. If the user clicked on X-button of the task without signing it as finished, the task is permanently deleted (does not appear in Completed list).
    5. Tasks in Today and This Week lists are automatically moved to Planned list if the day / 7 days have expired accordingly.
    6. The weather icon is displayed in the navigation bar if the browser allows for geolocation.
 
* Implemented with node.js as a backend side with the help of express.js library. 
* The client side is the browser itself.
* Bootstrap library was used to implement a mobile-friendly navbar and layout.
* Some additional features will be implemented in the nearest future:
    1. Marking tasks as important.
    2. Returning tasks from Completed back to the original list.
    3. The ability to save notes and upload files for tasks.
  
### To-Do App with MongoDB 
* A logical upgrade of To-Do app with Mongo database and Node.js
* Interactions between Node.js and MongoDB are via Mongoose package
* Basic functionality includes an ability to create and remove task lists | get all tasks of a task list | create, update and delete tasks | get and update info on a task if needed
* This is a separate Node.js as well as UI code, independent of the previous project. UI is implemented locally in the project with the help of EJS template language. 
* Potential improvements: implement a separate UI with React.

### UV index 
* A small Node.js project that shows the UV Index in your location and (depending on your skin type) how much time you are allowed to be under direct sunlight without sunscreen (based on Fitzpatrick skin type classification).

### Collect Coins 
* Node.js implemented application that allows the user to collect coins based on implementing activities in different sections.
* An example of a section could be "Sports" and an example of activity "Run 30 minutes". The user decides how much each activity "costs". 
* On implementing successfully an activity, coins are collected. Coins are "related" to the section: each section has a unique color and coins are also of the color of the section which the completed activity belonged to.
* 
