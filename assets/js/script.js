// jQuery provides shorter methods to find and manipulate DOM elements, add event listeners, and perform other common JavaScript-related tasks.
//$ is equivalent to document.querySelector()

$(document).ready(function () {
  $("#currentDay").text(moment().format("MMMM Do YYYY"));
});

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

  // check due date
  auditTask(taskLi);

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
  let date = $(this).text().trim();

  // create date input element
  let dateInput = $('<input>')
    //Using jQuery's attr() method to set it as type="text". attr() can serve two purposes. With one argument, it gets an attribute (e.g., attr("id")). With two arguments, it sets an attribute (e.g., attr("type", "text")).
    .attr('type', 'text')
    .addClass('form-control')
    .val(date);

  // swap out elements
  $(this).replaceWith(dateInput);

  // enable jquery ui datepicker
  dateInput.datepicker({
    minDate: 0,
    onClose: function () {
      // when calendar is closed, force a "change" event on the `dateInput`
      $(this).trigger("change");
    }
  });

  // automatically focus on new element
  dateInput.trigger("focus");
})

//FUNCTIONS TO EDIT DATE CONTINUE
//Edited blur event listener and added a change event instead.
// $('.list-group').on('blur', "input[type='text']", function () {
$('.list-group').on('change', "input[type='text']", function () {
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

  //Pass task's <li> element into auditTask() to check new due date
  auditTask($(taskSpan).closest('.list-group-item'));
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
    $(this).addClass('dropover')
    $('.bottom-trash').addClass('bottom-trash-drag')
    //console.log("activate", this);
  },
  deactivate: function (event) {
    $(this).removeClass('dropover')
    $('.bottom-trash').removeClass('bottom-trash-drag')
    //console.log("deactivate", this);
  },
  //The over and out events trigger when a dragged item enters or leaves a connected list.
  over: function (event) {
    $(event.target).addClass('dropover-active')
    //console.log("over", event.target);
  },
  out: function (event) {
    $(event.target).removeClass('dropover-active')
    //console.log("out", event.target);
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
    //console.log(tempArr);

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
    $('.bottom-trash').removeClass('bottom-trash-active')
    //When we remove an object with the remove method we don't need to save again as jQuery triggers a sortable update() which saves the updates.
    //console.log("drop");
  },
  over: function (event, ui) {
    $('.bottom-trash').addClass('bottom-trash-active')
    //console.log("over");
  },
  out: function (event, ui) {
    $('.bottom-trash').removeClass('bottom-trash-active')
    //console.log("out");
  }
  // $(this)
  //   .addClass("ui-state-highlight");
});


//FUNCTIONS FOR DUE DATE AUDITS
var auditTask = function (taskEl) {
  //we need to check what date was added to the <span> element. This will involve two actions. First, we need to use jQuery to retrieve the date stored in that <span> element. Second, we need to use the moment() function to convert that date value into a Moment object.

  // get date from task element
  var date = $(taskEl).find("span").text().trim();
  //To ensure element is getting to the function
  //console.log(date);

  //convert to moment object at 5:00pm
  //moment().format('L');   -->   11/22/2022
  //Once we get that date information we pass that value into the moment() function to turn it into a Moment object. We use the date variable from taskEl to make a new Moment object, configured for the user's local time using moment(date, "L"). Because the date variable does not specify a time of day (for example, "11/23/2019"), the Moment object will default to 12:00am. Because work usually doesn't end at 12:00am, we convert it to 5:00pm of that day instead, using the .set("hour", 17) method. In this case, the value 17 is in 24-hour time, so it's 5:00pm.
  var time = moment(date, "L").set("hour", 17);
  // this should print out an object for the value of the date variable, but at 5:00pm of that date
  //console.log(time);

  //Remove any old classes from element with the removeClass() method
  $(taskEl).removeClass('list-group-item-warning list-group-item-danger');

  //Apply new class if task is near/over due date
  if (moment().isAfter(time)) {
    $(taskEl).addClass('list-group-item-danger');
    //.diff() method used to get the difference of right now to a day in the future and will return a negative number. Therefore we use the .abs() method to get the absolute value of the number
  } else if (Math.abs(moment().diff(time, 'days')) <= 2) {
    $(taskEl).addClass('list-group-item-warning');
  } else {
    $(taskEl).addClass('list-group-item-info');
  }

  console.log(taskEl)
};

//TIME INTERVAL
setInterval(function () {
  $(".card .list-group-item").each(function (index, el) {
    auditTask(el);
  });
}, (1000 * 60 * 30));

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

$('#modalDueDate').datepicker({
  minDate: 0
});

//Save button in modal was clicked
$("#task-form-modal .btn-save").click(function () {
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

// setTimeout(function () {
//   alert("This message happens after 5 seconds!");
// }, 5000);

// setInterval(function () {
//   alert("This alert shows up every five seconds!");
// }, 5000);

// load tasks for the first time
loadTasks();