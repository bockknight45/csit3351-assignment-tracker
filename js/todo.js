buildLayout("todo.html");
fillClassDropdown("assignmentClass", "No class");

function makeTask(item) {
    var row = makeElement("li", "");
    if (item.done) {
        row.className = "done";
    }

    var left = makeElement("div", "");
    var title = makeElement("div", "");
    title.appendChild(makeCheckbox(item.done, function () {
        toggleAssignment(item.id);
    }));
    title.appendChild(makeElement("span", item.title, "task-title"));
    left.appendChild(title);

    var info = dueText(item);
    if (item.className != "") {
        info = item.className + " - " + info;
    }
    left.appendChild(makeElement("div", info, "item-info " + dueStatus(item)));
    row.appendChild(left);

    var buttons = makeElement("div", "");
    buttons.appendChild(makeButton("Edit", function () {
        editAssignment(item.id);
    }));
    buttons.appendChild(makeButton("Delete", function () {
        removeAssignment(item.id);
    }));
    row.appendChild(buttons);

    return row;
}

function showPage() {
    var assignments = loadData("assignments", []);
    var notDone = [];
    var done = [];

    for (var i = 0; i < assignments.length; i++) {
        if (assignments[i].done) {
            done.push(assignments[i]);
        } else {
            notDone.push(assignments[i]);
        }
    }

    notDone.sort(function (a, b) {
        if (dateSortValue(a) < dateSortValue(b)) {
            return -1;
        }
        if (dateSortValue(a) > dateSortValue(b)) {
            return 1;
        }
        return 0;
    });

    var list = document.getElementById("todoList");
    list.innerHTML = "";

    for (var j = 0; j < notDone.length; j++) {
        list.appendChild(makeTask(notDone[j]));
    }
    for (var k = 0; k < done.length; k++) {
        list.appendChild(makeTask(done[k]));
    }

    var count = document.getElementById("taskCount");
    if (assignments.length == 0) {
        count.innerText = "No tasks yet! Add one above.";
    } else if (notDone.length == 0) {
        count.innerText = "Everything is done. Nice work!";
    } else {
        count.innerText = notDone.length + " left to do";
    }
}

showPage();
