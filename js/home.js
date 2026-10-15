buildLayout("college-board.html");
fillClassDropdown("assignmentClass", "No class");
fillClassDropdown("filterClass", "All classes");

function showStats() {
    var assignments = loadData("assignments", []);
    var dueThisWeek = 0;
    var overdue = 0;

    for (var i = 0; i < assignments.length; i++) {
        var item = assignments[i];

        if (item.done == false && item.dueDate != "") {
            var days = daysUntil(item.dueDate);

            if (days < 0) {
                overdue = overdue + 1;
            } else if (days <= 7) {
                dueThisWeek = dueThisWeek + 1;
            }
        }
    }

    document.getElementById("dueWeek").innerText = dueThisWeek;
    document.getElementById("overdueCount").innerText = overdue;

    var average = overallAverage();
    if (average == null) {
        document.getElementById("averageGrade").innerText = "--";
    } else {
        document.getElementById("averageGrade").innerText = average.toFixed(1) + "%";
    }
}

function compareItems(a, b) {
    var sortBy = document.getElementById("sortBy").value;
    var first;
    var second;

    if (sortBy == "dueDate") {
        first = dateSortValue(a);
        second = dateSortValue(b);
    } else if (sortBy == "class") {
        first = a.className;
        second = b.className;
    } else {
        first = a.title.toLowerCase();
        second = b.title.toLowerCase();
    }

    if (first < second) {
        return -1;
    }
    if (first > second) {
        return 1;
    }
    return 0;
}

function getVisibleAssignments() {
    var assignments = loadData("assignments", []);
    var search = document.getElementById("search").value.toLowerCase();
    var filter = document.getElementById("filterClass").value;
    var visible = [];

    for (var i = 0; i < assignments.length; i++) {
        var item = assignments[i];
        var text = (item.title + " " + item.className).toLowerCase();

        if (text.includes(search) && (filter == "" || item.className == filter)) {
            visible.push(item);
        }
    }

    visible.sort(compareItems);
    return visible;
}

function makeCard(item) {
    var card = makeElement("div", "", "assignment " + dueStatus(item));

    var className = item.className;
    if (className == "") {
        className = "No class";
    }
    var thumbnail = makeElement("div", className, "thumbnail");
    thumbnail.style.backgroundColor = classColor(item.className);
    card.appendChild(thumbnail);
    card.appendChild(makeElement("h3", item.title));
    card.appendChild(makeElement("p", dueText(item), "due-text"));

    var actions = makeElement("div", "", "actions");
    actions.appendChild(makeCheckbox(item.done, function () {
        toggleAssignment(item.id);
    }));
    actions.appendChild(makeElement("span", "Done "));
    actions.appendChild(makeButton("Edit", function () {
        editAssignment(item.id);
    }));
    actions.appendChild(makeButton("Remove", function () {
        removeAssignment(item.id);
    }));
    card.appendChild(actions);

    return card;
}

function showAssignments() {
    var list = document.getElementById("assignmentList");
    var visible = getVisibleAssignments();

    list.innerHTML = "";

    if (visible.length == 0) {
        list.appendChild(makeElement("p", "No assignments to show. Add one above!", "empty-message"));
    }

    for (var i = 0; i < visible.length; i++) {
        list.appendChild(makeCard(visible[i]));
    }
}

function showPage() {
    showStats();
    showAssignments();
}

showPage();
