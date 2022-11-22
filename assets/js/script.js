// jQuery provides shorter methods to find and manipulate DOM elements, add event listeners, and perform other common JavaScript-related tasks.
//$ is equivalent to document.querySelector()

var tasks = {};

//FUCNTION TO CREATE A TASK
var createTask = function (taskText, taskDate, taskList) {
  // create elements that make up a task item
  var taskLi = $("<li>").addClass("list-group-item");
  //date of task
  var taskSpan = $("<span>")
    .addClass("badge badge-primary badge-pill")
    .text(taskDate);
  //text of the task
  var taskP = $("<p>")
    .addClass("m-1")
    .text(taskText);

  // APPEND span and p element to parent li
  taskLi.append(taskSpan, taskP);

  //The (taskText, taskDate, "toDo") data points create a <li> element (with child <span> and <p> elements) that is appended to a <ul> element
  //append to ul list on the page
  $("#list-" + taskList).append(taskLi);
};


//LOAD TASKS
var loadTasks = function () {
  //tasks are loaded using the JSON.parse() method to convert the data into a JavaScript object
  tasks = JSON.parse(localStorage.getItem("tasks"));

  // if nothing in localStorage, create a new object to track all task status arrays
  if (!tasks) {
    tasks = {
      toDo: [],
      inProgress: [],
      inReview: [],
      done: []
    };
  }

  // loop over object properties
  $.each(tasks, function (list, arr) {
    console.log(list, arr);
    // then loop over sub-array
    arr.forEach(function (task) {
      createTask(task.text, task.date, list);
    });
  });
};


//SAVE TASKS FUNCTION
//tasks are saved using the JSON.stringify() method to convert the values from JavaScript object into a string
var saveTasks = function () {
  localStorage.setItem("tasks", JSON.stringify(tasks));
};


//FUNCTIONS TO EDIT TEXT
// delegating clicks to the parent <ul> with class list-group
$('.list-group').on('click', 'p', function () {
  //With $ character we can convert "this" into a jQuery object
  let text = $(this)
    .text()
    .trim();
  //The text() method gets the inner text content of the current element, represented by $(this). The text() method often works with the trim() method to remove any extra white space before or after.
  let textInput = $('<textarea>')
    //$("textarea") tells jQuery to find all existing <textarea> elements, and $("<textarea>") tells jQuery to create a new <textarea> element.
    .addClass("form-control")
    .val(text);

  $(this).replaceWith(textInput);
  textInput.trigger('focus');
  //console.log(text);
});

//FUNCTIONS TO EDIT TEXT CONTINUE
$(".list-group").on("blur", "textarea", function () {
  //we need to collect some data: current value of the element, parent element's ID, and element's position in the list

  //get the textarea's current value/text
  var text = $(this)
    .val()
    .trim();

  //get the parent ul's id attribute
  var status = $(this)
    .closest(".list-group")
    //attr(), which is returning the ID, which will be "list-" followed by the category
    .attr("id")
    //chaining that to .replace() to remove "list-" from the text
    .replace('list-', '');

  //get the task's position in the list of other li elements
  var index = $(this)
    .closest(".list-group-item")
    .index();

  //tasks is an object.
  //tasks[status] returns an array (e.g., toDo).
  //tasks[status][index] returns the object at the given index in the array.
  //tasks[status][index].text returns the text property of the object at the given index.
  tasks[status][index].text = text;
  //Updating this tasks object was necessary for localStorage, so we call saveTasks() immediately afterwards
  saveTasks();

  // recreate p element
  var taskP = $("<p>")
    .addClass("m-1")
    .text(text);

  // replace textarea with p element
  $(this).replaceWith(taskP);
})


//FUNCTIONS TO EDIT DATE
$('.list-group').on('click', 'span', function () {
  // get current text
  let date = $(this)
    .text()
    .trim();

  // create date input element
  let dateInput = $('<input>')
    //Using jQuery's attr() method to set it as type="text". attr() can serve two purposes. With one argument, it gets an attribute (e.g., attr("id")). With two arguments, it sets an attribute (e.g., attr("type", "text")).
    .attr('type', 'text')
    .addClass('form-control')
    .val(date);

  // swap out elements
  $(this).replaceWith(dateInput);

  // automatically focus on new element
  dateInput.trigger('focus');
})

//FUNCTIONS TO EDIT DATE CONTINUE
//value of due date was changed
$('.list-group').on('blur', "input[type='text']", function () {
  //get current text
  let date = $(this)
    .val()
    .trim();

  //get the parent ul's id attribute
  let status = $(this)
    .closest('.list-group')
    .attr('id')
    .replace('list-', '');

  //get the task's position in the list of other li elements
  var index = $(this)
    .closest('.list-group-item')
    .index();

  //update task in array and re-save to localstorage
  tasks[status][index].date = date;
  saveTasks();

  //recreate span element with bootstrap classes
  var taskSpan = $('<span>')
    .addClass("badge badge-primary badge-pill")
    .text(date);

  //replace input with span element
  $(this).replaceWith(taskSpan);
})


//FUNCTIONS FOR SORTABLES AND SAVE AFTER SORTING
//Converting columns into sortables and save changes
$('.card .list-group').sortable({
  //connectWith property links the sortable lists with any other from the same class
  connectWith: $('.card .list-group'),
  scroll: false,
  tolerance: "pointer",
  //The helper event creates a copy of the dragged element and move the copy instead of the original. This is necessary to prevent click events from accidentally triggering on the original element.
  helper: "clone",
  //The activate and deactivate events trigger once for all connected lists as soon as dragging starts and stops.
  activate: function (event) {
    console.log("activate", this);
  },
  deactivate: function (event) {
    console.log("deactivate", this);
  },
  //The over and out events trigger when a dragged item enters or leaves a connected list.
  over: function (event) {
    console.log("over", event.target);
  },
  out: function (event) {
    console.log("out", event.target);
  },

  //The update event triggers when the contents of a list have changed (e.g., the items were re-ordered, an item was removed, or an item was added).
  update: function (event) {
    //Declaring a new array to store the task data before the looping starts
    var tempArr = [];

    //loop over current set of children in sortable list
    //jQuery's each() method will run a callback function for every item/element in the array. It's another form of looping, except that a function is now called on each loop iteration. The potentially confusing part of this code is the second use of $(this). Inside the callback function, $(this) actually refers to the child element at that index.
    //Loop over current set of children in sortable list
    $(this).children().each(function () {
      //console.log($(this));

      var text = $(this)
        .find("p")
        .text()
        .trim();

      var date = $(this)
        .find("span")
        .text()
        .trim();

      //Adding task data to the temp array as an object
      tempArr.push({
        text: text,
        date: date
      });
      //console.log(text, date);
    })
    //console.log("update", this);
    //Console logging a jQuery variable (e.g. $(this)) will display more information
    //The children() method returns an array of the list element's children (the <li> elements, labeled as li.list-group-item)
    //console.log($(this).children());
    console.log(tempArr);

    //trim down list's ID to match object property
    let arrName = $(this)
      .attr('id')
      .replace("list-", "");

    //Update array on tasks object and save
    tasks[arrName] = tempArr;
    saveTasks();
  }
})


//FUNCTIONS TO DELETE ON REMOVE ELEMENT
$("#trash").droppable({
  accept: '.card .list-group-item',
  tolerance: "touch",
  drop: function (event, ui) {
    //draggable is a jQuery object representing the draggable element, therefore we can call DOM methods on it
    ui.draggable.remove();
    //When we remove an object with the remove method we don't need to save again as jQuery triggers a sortable update() which saves the updates.
    console.log("drop");
  },
  over: function (event, ui) {
    console.log("over");
  },
  out: function (event, ui) {
    console.log("out");
  }
  // $(this)
  //   .addClass("ui-state-highlight");
});


//MODAL
// modal was triggered
$("#task-form-modal").on("show.bs.modal", function () {
  // clear values
  $("#modalTaskDescription, #modalDueDate").val("");
});

// modal is fully visible
$("#task-form-modal").on("shown.bs.modal", function () {
  // highlight textarea
  $("#modalTaskDescription").trigger("focus");
});

// save button in modal was clicked
$("#task-form-modal .btn-primary").click(function () {
  // get form values
  var taskText = $("#modalTaskDescription").val();
  var taskDate = $("#modalDueDate").val();

  if (taskText && taskDate) {
    //call made to createTask(taskText, taskDate, "toDo"), passing in the task's description, due date, and type (hardcoded as "toDo")
    createTask(taskText, taskDate, "toDo");

    // close modal
    $("#task-form-modal").modal("hide");

    // save in tasks array
    tasks.toDo.push({
      text: taskText,
      date: taskDate
    });

    saveTasks();
  }
});

// remove all tasks
$("#remove-tasks").on("click", function () {
  for (var key in tasks) {
    tasks[key].length = 0;
    $("#list-" + key).empty();
  }
  saveTasks();
});

// load tasks for the first time
loadTasks();