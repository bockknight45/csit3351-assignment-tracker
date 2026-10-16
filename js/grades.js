buildLayout("grades.html");
fillClassDropdown("gradeClass", "");
fillClassDropdown("calcClass", "Pick a class (optional)");

function askNumber(message, current, min, max) {
    var answer = prompt(message, current);
    if (answer == null) {
        return null;
    }

    var number = Number(answer);
    if (answer.trim() == "" || isNaN(number) || number < min || number > max) {
        alert("Please enter a number from " + min + " to " + max);
        return null;
    }
    return number;
}

function addGrade() {
    var className = document.getElementById("gradeClass").value;
    var name = document.getElementById("gradeName").value.trim();
    var scoreText = document.getElementById("gradeScore").value;
    var weightText = document.getElementById("gradeWeight").value;

    if (className == "") {
        alert("Add a class on the Classes page first");
        return;
    }
    if (name == "" || scoreText == "" || weightText == "") {
        alert("Please fill in all the boxes");
        return;
    }

    var score = Number(scoreText);
    var weight = Number(weightText);
    if (score < 0 || score > 100) {
        alert("The score has to be between 0 and 100");
        return;
    }
    if (weight < 1 || weight > 100) {
        alert("The weight has to be between 1 and 100");
        return;
    }

    var grades = loadData("grades", []);
    grades.push({ id: Date.now(), className: className, name: name, score: score, weight: weight });
    saveData("grades", grades);

    document.getElementById("gradeName").value = "";
    document.getElementById("gradeScore").value = "";
    document.getElementById("gradeWeight").value = "";
    showPage();
}

function editGrade(id) {
    var grades = loadData("grades", []);
    var item = findById(grades, id);

    var newName = prompt("Change the name:", item.name);
    if (newName == null) {
        return;
    }
    newName = newName.trim();
    if (newName == "") {
        alert("The name can't be empty");
        return;
    }

    var newScore = askNumber("Change the score (0-100):", item.score, 0, 100);
    if (newScore == null) {
        return;
    }

    var newWeight = askNumber("Change the weight % (1-100):", item.weight, 1, 100);
    if (newWeight == null) {
        return;
    }

    item.name = newName;
    item.score = newScore;
    item.weight = newWeight;
    saveData("grades", grades);
    showPage();
}

function removeGrade(id) {
    var grades = loadData("grades", []);
    saveData("grades", removeById(grades, id));
    showPage();
}

function makeGradeRow(item) {
    var row = document.createElement("tr");
    row.appendChild(makeElement("td", item.name));
    row.appendChild(makeElement("td", item.score + "%"));
    row.appendChild(makeElement("td", item.weight + "%"));

    var buttons = document.createElement("td");
    buttons.appendChild(makeButton("Edit", function () {
        editGrade(item.id);
    }));
    buttons.appendChild(makeButton("Remove", function () {
        removeGrade(item.id);
    }));
    row.appendChild(buttons);

    return row;
}

function makeClassSection(classItem) {
    var section = makeElement("div", "", "class-section");
    var average = classAverage(classItem.name);

    var title = classItem.name;
    if (average != null) {
        title = title + " - " + describeGrade(average);
    }
    var heading = makeElement("h3", title);
    heading.style.borderLeft = "6px solid " + classColor(classItem.name);
    heading.style.paddingLeft = "10px";
    section.appendChild(heading);

    var grades = loadData("grades", []);
    var table = document.createElement("table");
    var head = document.createElement("tr");
    head.appendChild(makeElement("th", "Name"));
    head.appendChild(makeElement("th", "Score"));
    head.appendChild(makeElement("th", "Weight"));
    head.appendChild(makeElement("th", ""));
    table.appendChild(head);

    var count = 0;
    for (var i = 0; i < grades.length; i++) {
        if (grades[i].className == classItem.name) {
            table.appendChild(makeGradeRow(grades[i]));
            count = count + 1;
        }
    }

    if (count == 0) {
        section.appendChild(makeElement("p", "No grades yet.", "empty-message"));
    } else {
        var wrap = makeElement("div", "", "table-wrap");
        wrap.appendChild(table);
        section.appendChild(wrap);
    }

    return section;
}

function showStats() {
    var average = overallAverage();

    if (average == null) {
        document.getElementById("averageGrade").innerText = "--";
        document.getElementById("gpa").innerText = "--";
        return;
    }

    var classes = loadData("classes", []);
    var totalPoints = 0;
    var count = 0;
    for (var i = 0; i < classes.length; i++) {
        var classAvg = classAverage(classes[i].name);
        if (classAvg != null) {
            totalPoints = totalPoints + gradePoints(letterGrade(classAvg));
            count = count + 1;
        }
    }

    document.getElementById("averageGrade").innerText = describeGrade(average);
    document.getElementById("gpa").innerText = (totalPoints / count).toFixed(2);
}

function showPage() {
    var classes = loadData("classes", []);
    var list = document.getElementById("gradeList");
    list.innerHTML = "";

    if (classes.length == 0) {
        list.appendChild(makeElement("p", "No classes yet. Add one on the Classes page.", "empty-message"));
    }

    for (var i = 0; i < classes.length; i++) {
        list.appendChild(makeClassSection(classes[i]));
    }

    showStats();
}

function fillCurrentGrade() {
    var average = classAverage(document.getElementById("calcClass").value);
    if (average != null) {
        document.getElementById("calcCurrent").value = average;
    }
}

function calculateFinal() {
    var currentText = document.getElementById("calcCurrent").value;
    var weightText = document.getElementById("calcWeight").value;
    var wantedText = document.getElementById("calcWanted").value;
    var result = document.getElementById("calcResult");

    if (currentText == "" || weightText == "" || wantedText == "") {
        alert("Please fill in the current grade, final weight, and the grade you want");
        return;
    }

    var current = Number(currentText);
    var weight = Number(weightText);
    var wanted = Number(wantedText);

    if (current < 0 || current > 100 || wanted < 0 || wanted > 100 || weight < 1 || weight > 100) {
        alert("Grades must be 0-100 and the final weight must be 1-100");
        return;
    }

    var needed = (wanted - current * (100 - weight) / 100) / (weight / 100);
    var message = "You need " + needed.toFixed(1) + "% on the final to finish with " + wanted + "%.";

    if (needed > 100) {
        message = message + " That is over 100%, so it might not be possible.";
    } else if (needed <= 0) {
        message = "You already have enough points to finish with " + wanted + "%!";
    }

    result.innerText = message;
}

showPage();
