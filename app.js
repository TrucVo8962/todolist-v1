const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const _ = require("lodash");

// Initialise app
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(express.static("public"));


// Initialise Database
// 'mongodb://localhost:27017/todolist'
// 'mongodb+srv://Admin_Truc:Thanhtruc96@cluster0.ewkhb.mongodb.net/todolist'
mongoose.connect('mongodb+srv://Admin_Truc:Thanhtruc96@cluster0.ewkhb.mongodb.net/todolist', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Initialise Task
const taskSchema = new mongoose.Schema({
  name: String
});

const Task = new mongoose.model("Task", taskSchema);

const task1 = new Task({
  name: "Coding"
});
const task2 = new Task({
  name: "Eating"
});
const task3 = new Task({
  name: "Sleeping"
});
const defaultTasks = [task1, task2, task3];

// Initialise List of tasks
const listSchema = {
  name: String,
  items: [taskSchema]
};

const List = new mongoose.model("List", listSchema);

// GET Request to prevent creating favicon.ico
app.get('/favicon.ico', (req, res) => res.status(204));

// GET Requests for root List
app.get("/", (req, res) => {

  let day = date.getDate();
  Task.find({}, function(err, foundTasks) {
    if (foundTasks.length === 0) {
      Task.insertMany(defaultTasks, (err) => {
        if (err) {
          console.log(err);
        } else {
          console.log('Insert defaultTasks succeeded');
        }
        res.redirect("/");
      });

    } else {
      res.render("list", {
        listTitle: "Today",
        listItems: foundTasks
      });
    }
  });
});

// GET Requests for custom List
app.get("/:customListName", (req, res) => {
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({
    name: customListName
  }, function(err, foundList) {
    if (!err) {
      if (!foundList) {
        // Create new list
        const newList = new List({
          name: customListName,
          items: defaultTasks
        });
        newList.save(function(err, result){
          console.log(result);
          res.redirect("/" + customListName);
        });
        //res.redirect("/" + customListName); Put redirect outside save() leads to duplicates. WHY?
      } else {
        // Show existing list
        res.render("list", {
          listTitle: foundList.name,
          listItems: foundList.items
        });
      }
    }
  });
});

// POST Request to add new task to a List
app.post("/", (req, res) => {
  console.log(req.body);
  var itemName = req.body.newItem;
  var listName = req.body.list;

  const newTask = new Task({
    name: itemName
  });

  if (listName === "Today") {
    newTask.save();
    res.redirect("/");
  } else {
    List.findOne({
      name: listName
    }, function(err, foundList) {
      foundList.items.push(newTask);
      foundList.save();
      res.redirect("/" + listName);
    });
  };
});

// POST Request to remove task from a List
app.post("/delete", (req, res) => {
  const checkedItemId = req.body.checkbox;
  var listName = req.body.listName;

  if (listName === "Today") {
    Task.findByIdAndRemove(checkedItemId, function(err) {
      if (err) {
        console.log(err);
      } else {
        console.log("Deleted Item with ID " + checkedItemId);
        res.redirect("/");
      }
    });
  } else {
    List.findOneAndUpdate({
      name: listName
    }, {
      $pull: {
        items: {
          _id: checkedItemId
        }
      }
    }, function(err, foundList) {
      if (!err) {
        res.redirect("/" + listName);
      }
    });
  };
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, () => console.log("Server is up and running on port 3000"));
