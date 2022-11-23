$(document).ready(function () {
  $("#currentDay").text(moment().format("MMMM Do YYYY"));
});

var tasks = {};

//FUCNTION TO CREATE A TASK
var createTask = function (taskText, taskDate, taskList) {
  // create elements that make up a task item
  var taskLi = $("<li>").addClass("list-group-item");

  //date of task
  var taskSpan = $("<span>").addClass("badge badge-primary badge-pill")
    .text(taskDate);
  //text of the task
  var taskP = $("<p>").addClass("m-1").text(taskText);

  // APPEND span and p element to parent li
  taskLi.append(taskSpan, taskP);

  // check due date
  auditTask(taskLi);

  //append to ul list on the page
  $("#list-" + taskList).append(taskLi);
};


//LOAD TASKS
var loadTasks = function () {
  tasks = JSON.parse(localStorage.getItem("tasks"));

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
    arr.forEach(function (task) {
      createTask(task.text, task.date, list);
    });
  });
};


//SAVE TASKS FUNCTION
var saveTasks = function () {
  localStorage.setItem("tasks", JSON.stringify(tasks));
};


//FUNCTIONS TO EDIT TEXT
$('.list-group').on('click', 'p', function () {
  let text = $(this).text().trim();
  let textInput = $('<textarea>').addClass("form-control").val(text);

  $(this).replaceWith(textInput);
  textInput.trigger('focus');

});

//FUNCTIONS TO EDIT TEXT CONTINUE
$(".list-group").on("blur", "textarea", function () {
  //get the textarea's current value/text
  var text = $(this).val().trim();

  //get the parent ul's id attribute
  var status = $(this).closest(".list-group").attr("id").replace('list-', '');

  //get the task's position in the list of other li elements
  var index = $(this).closest(".list-group-item").index();

  tasks[status][index].text = text;
  saveTasks();

  // recreate p element
  var taskP = $("<p>").addClass("m-1").text(text);

  // replace textarea with p element
  $(this).replaceWith(taskP);
})


//FUNCTIONS TO EDIT DATE
$('.list-group').on('click', 'span', function () {
  // get current text
  let date = $(this).text().trim();

  // create date input element
  let dateInput = $('<input>').attr('type', 'text').addClass('form-control').val(date);

  // swap out elements
  $(this).replaceWith(dateInput);

  // enable jquery ui datepicker
  dateInput.datepicker({
    minDate: 0,
    onClose: function () {
      $(this).trigger("change");
    }
  });

  // automatically focus on new element
  dateInput.trigger("focus");
})

//FUNCTIONS TO EDIT DATE CONTINUE
$('.list-group').on('change', "input[type='text']", function () {
  //get current text
  let date = $(this).val().trim();

  //get the parent ul's id attribute
  let status = $(this).closest('.list-group').attr('id').replace('list-', '');

  //get the task's position in the list of other li elements
  var index = $(this).closest('.list-group-item').index();

  //update task in array and re-save to localstorage
  tasks[status][index].date = date;
  saveTasks();

  //recreate span element with bootstrap classes
  var taskSpan = $('<span>').addClass("badge badge-primary badge-pill").text(date);

  //replace input with span element
  $(this).replaceWith(taskSpan);

  //Pass task's <li> element into auditTask() to check new due date
  auditTask($(taskSpan).closest('.list-group-item'));
})


//FUNCTIONS FOR SORTABLES AND SAVE AFTER SORTING
//Converting columns into sortables and save changes
$('.card .list-group').sortable({
  connectWith: $('.card .list-group'),
  scroll: false,
  tolerance: "pointer",
  helper: "clone",
  activate: function (event) {
    $(this).addClass('dropover')
    $('.bottom-trash').addClass('bottom-trash-drag')
  },
  deactivate: function (event) {
    $(this).removeClass('dropover')
    $('.bottom-trash').removeClass('bottom-trash-drag')
  },
  over: function (event) {
    $(event.target).addClass('dropover-active')
  },
  out: function (event) {
    $(event.target).removeClass('dropover-active')
  },

  update: function (event) {
    var tempArr = [];
    $(this).children().each(function () {

      var text = $(this).find("p").text().trim();

      var date = $(this).find("span").text().trim();

      //Adding task data to the temp array as an object
      tempArr.push({
        text: text,
        date: date
      });
    })

    let arrName = $(this).attr('id').replace("list-", "");

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
    ui.draggable.remove();
    $('.bottom-trash').removeClass('bottom-trash-active')
  },
  over: function (event, ui) {
    $('.bottom-trash').addClass('bottom-trash-active')
  },
  out: function (event, ui) {
    $('.bottom-trash').removeClass('bottom-trash-active')
  }
});


//FUNCTIONS FOR DUE DATE AUDITS
var auditTask = function (taskEl) {
  // get date from task element
  var date = $(taskEl).find("span").text().trim();

  var time = moment(date, "L").set("hour", 17);

  //Remove any old classes from element with the removeClass() method
  $(taskEl).removeClass('list-group-item-warning list-group-item-danger');

  //Apply new class if task is near/over due date
  if (moment().isAfter(time)) {
    $(taskEl).addClass('list-group-item-danger');
  } else if (Math.abs(moment().diff(time, 'days')) <= 2) {
    $(taskEl).addClass('list-group-item-warning');
  } else {
    $(taskEl).addClass('list-group-item-info');
  }
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
    createTask(taskText, taskDate, "toDo");
    $("#task-form-modal").modal("hide");

    // save in tasks array
    tasks.toDo.push({
      text: taskText,
      date: taskDate
    });
    saveTasks();
  }
});


//REMOVE all tasks
$("#remove-tasks").on("click", function () {
  for (var key in tasks) {
    tasks[key].length = 0;
    $("#list-" + key).empty();
  }
  saveTasks();
});

loadTasks();