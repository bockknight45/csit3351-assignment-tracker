function loadData(key, fallback) {
    var text = localStorage.getItem(key);
    if (text == null) {
        return fallback;
    }
    return JSON.parse(text);
}

function saveData(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

function findById(list, id) {
    for (var i = 0; i < list.length; i++) {
        if (list[i].id == id) {
            return list[i];
        }
    }
    return null;
}

function removeById(list, id) {
    var kept = [];
    for (var i = 0; i < list.length; i++) {
        if (list[i].id != id) {
            kept.push(list[i]);
        }
    }
    return kept;
}

function pressEnter(event, action) {
    if (event.key == "Enter") {
        action();
    }
}


function applyTheme() {
    var button = document.getElementById("themeButton");

    if (loadData("theme", "dark") == "light") {
        document.documentElement.classList.add("light");
        if (button) {
            button.innerText = "Dark mode";
        }
    } else {
        document.documentElement.classList.remove("light");
        if (button) {
            button.innerText = "Light mode";
        }
    }
}

function toggleTheme() {
    if (loadData("theme", "dark") == "light") {
        saveData("theme", "dark");
    } else {
        saveData("theme", "light");
    }
    applyTheme();
}


function makeElement(tag, text, className) {
    var element = document.createElement(tag);
    element.innerText = text;
    if (className) {
        element.className = className;
    }
    return element;
}

function makeButton(text, action) {
    var button = makeElement("button", text);
    button.onclick = action;
    return button;
}

function makeCheckbox(checked, action) {
    var box = document.createElement("input");
    box.type = "checkbox";
    box.checked = checked;
    box.onchange = action;
    return box;
}

function buildLayout(currentPage) {
    var header = document.getElementById("header");
    header.appendChild(makeElement("h1", "Assignment Tracker"));

    var themeButton = makeButton("Light mode", toggleTheme);
    themeButton.id = "themeButton";
    themeButton.className = "theme-button";
    header.appendChild(themeButton);

    var pages = [
        ["college-board.html", "Home"],
        ["grades.html", "Grades"],
        ["classes.html", "Classes"],
        ["todo.html", "To-Do"]
    ];
    var nav = document.getElementById("nav");

    for (var i = 0; i < pages.length; i++) {
        var link = makeElement("a", pages[i][1]);
        link.href = pages[i][0];
        if (pages[i][0] == currentPage) {
            link.className = "active";
        }
        nav.appendChild(link);
    }

    applyTheme();
}

function fillClassDropdown(selectId, firstOption) {
    var select = document.getElementById(selectId);
    var oldValue = select.value;
    var classes = loadData("classes", []);

    select.innerHTML = "";

    if (firstOption) {
        var first = document.createElement("option");
        first.value = "";
        first.innerText = firstOption;
        select.appendChild(first);
    }

    for (var i = 0; i < classes.length; i++) {
        var option = document.createElement("option");
        option.value = classes[i].name;
        option.innerText = classes[i].name;
        select.appendChild(option);
    }

    select.value = oldValue;
    if (select.selectedIndex == -1) {
        select.selectedIndex = 0;
    }
}


function pad(number) {
    return ("0" + number).slice(-2);
}

function dateFromToday(offset) {
    var date = new Date();
    date.setDate(date.getDate() + offset);
    return date.getFullYear() + "-" + pad(date.getMonth() + 1) + "-" + pad(date.getDate());
}

function daysUntil(dateText) {
    var due = new Date(dateText + "T00:00:00");
    var today = new Date();
    today.setHours(0, 0, 0, 0);
    return Math.round((due - today) / 86400000);
}

function dueText(item) {
    if (item.dueDate == "") {
        return "No due date";
    }

    var days = daysUntil(item.dueDate);
    var dateText = new Date(item.dueDate + "T00:00:00").toLocaleDateString();

    if (days == 0) {
        return "Due today - " + dateText;
    }
    if (days == 1) {
        return "Due tomorrow - " + dateText;
    }
    if (days > 1) {
        return "Due in " + days + " days - " + dateText;
    }
    if (days == -1) {
        return "Due yesterday - " + dateText;
    }
    return "Due " + (-days) + " days ago - " + dateText;
}

function dueStatus(item) {
    if (item.done) {
        return "done";
    }
    if (item.dueDate == "") {
        return "";
    }

    var days = daysUntil(item.dueDate);
    if (days < 0) {
        return "overdue";
    }
    if (days <= 3) {
        return "soon";
    }
    return "";
}

function dateSortValue(item) {
    if (item.dueDate == "") {
        return "9999-12-31";
    }
    return item.dueDate;
}


function addAssignmentFromForm() {
    var title = document.getElementById("assignmentTitle").value.trim();
    var className = document.getElementById("assignmentClass").value;
    var dueDate = document.getElementById("assignmentDate").value;

    if (title == "") {
        alert("Please type a title first");
        return;
    }

    var assignments = loadData("assignments", []);
    assignments.push({
        id: Date.now(),
        title: title,
        className: className,
        dueDate: dueDate,
        done: false
    });
    saveData("assignments", assignments);

    document.getElementById("assignmentTitle").value = "";
    document.getElementById("assignmentDate").value = "";
    showPage();
}

function toggleAssignment(id) {
    var assignments = loadData("assignments", []);
    var item = findById(assignments, id);
    item.done = !item.done;
    saveData("assignments", assignments);
    showPage();
}

function editAssignment(id) {
    var assignments = loadData("assignments", []);
    var item = findById(assignments, id);

    var newTitle = prompt("Change the title:", item.title);
    if (newTitle == null) {
        return;
    }
    newTitle = newTitle.trim();
    if (newTitle == "") {
        alert("The title can't be empty");
        return;
    }

    var newDate = prompt("Change the due date (YYYY-MM-DD) or leave it blank for none:", item.dueDate);
    if (newDate == null) {
        return;
    }
    newDate = newDate.trim();
    if (newDate != "" && !/^\d{4}-\d{2}-\d{2}$/.test(newDate)) {
        alert("Please use the format YYYY-MM-DD, like 2026-10-31");
        return;
    }
    if (newDate != "" && isNaN(new Date(newDate + "T00:00:00"))) {
        alert("That date doesn't exist");
        return;
    }

    item.title = newTitle;
    item.dueDate = newDate;
    saveData("assignments", assignments);
    showPage();
}

function removeAssignment(id) {
    var assignments = loadData("assignments", []);
    saveData("assignments", removeById(assignments, id));
    showPage();
}


function classAverage(className) {
    var grades = loadData("grades", []);
    var total = 0;
    var weights = 0;

    for (var i = 0; i < grades.length; i++) {
        if (grades[i].className == className) {
            total = total + grades[i].score * grades[i].weight;
            weights = weights + grades[i].weight;
        }
    }

    if (weights == 0) {
        return null;
    }
    return Math.round(total / weights * 10) / 10;
}

function overallAverage() {
    var classes = loadData("classes", []);
    var total = 0;
    var count = 0;

    for (var i = 0; i < classes.length; i++) {
        var average = classAverage(classes[i].name);
        if (average != null) {
            total = total + average;
            count = count + 1;
        }
    }

    if (count == 0) {
        return null;
    }
    return Math.round(total / count * 10) / 10;
}

function letterGrade(percent) {
    if (percent >= 93) {
        return "A";
    }
    if (percent >= 90) {
        return "A-";
    }
    if (percent >= 87) {
        return "B+";
    }
    if (percent >= 83) {
        return "B";
    }
    if (percent >= 80) {
        return "B-";
    }
    if (percent >= 77) {
        return "C+";
    }
    if (percent >= 73) {
        return "C";
    }
    if (percent >= 70) {
        return "C-";
    }
    if (percent >= 60) {
        return "D";
    }
    return "F";
}

function gradePoints(letter) {
    var points = {
        "A": 4.0,
        "A-": 3.7,
        "B+": 3.3,
        "B": 3.0,
        "B-": 2.7,
        "C+": 2.3,
        "C": 2.0,
        "C-": 1.7,
        "D": 1.0,
        "F": 0.0
    };
    return points[letter];
}

function describeGrade(percent) {
    return percent.toFixed(1) + "% (" + letterGrade(percent) + ")";
}


var classColors = ["#6c5ce7", "#e17055", "#00a884", "#0984e3", "#d63384", "#c58a00", "#2d9cdb"];

function classColor(className) {
    var classes = loadData("classes", []);

    for (var i = 0; i < classes.length; i++) {
        if (classes[i].name == className) {
            return classes[i].color;
        }
    }
    return "#6b6b6b";
}

function addMissingColors() {
    var classes = loadData("classes", []);

    for (var i = 0; i < classes.length; i++) {
        if (!classes[i].color) {
            classes[i].color = classColors[i % classColors.length];
        }
    }
    saveData("classes", classes);
}

function addStartingData() {
    if (localStorage.getItem("classes") == null) {
        saveData("classes", [
            { id: 1, name: "Class 1", time: "Mon / Wed 9:00 AM" },
            { id: 2, name: "Class 2", time: "Tue / Thu 11:00 AM" },
            { id: 3, name: "Class 3", time: "Fri 1:00 PM" }
        ]);
    }

    if (localStorage.getItem("assignments") == null) {
        saveData("assignments", [
            { id: 1, title: "Exam 2", className: "Class 2", dueDate: dateFromToday(2), done: false },
            { id: 2, title: "Assignment 4", className: "Class 1", dueDate: dateFromToday(-7), done: false },
            { id: 3, title: "Lab 3", className: "Class 3", dueDate: dateFromToday(-2), done: false },
            { id: 4, title: "Quiz", className: "Class 1", dueDate: dateFromToday(5), done: false },
            { id: 5, title: "Study for Exam 2", className: "Class 2", dueDate: dateFromToday(1), done: false }
        ]);
    }

    if (localStorage.getItem("grades") == null) {
        saveData("grades", [
            { id: 1, className: "Class 1", name: "Exam 1", score: 90, weight: 30 },
            { id: 2, className: "Class 1", name: "Homework", score: 86, weight: 20 },
            { id: 3, className: "Class 2", name: "Exam 1", score: 92, weight: 40 },
            { id: 4, className: "Class 3", name: "Lab 1", score: 79, weight: 25 }
        ]);
    }
}

applyTheme();
addStartingData();
addMissingColors();
