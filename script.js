
// Get HTML elements
const registrationForm = document.getElementById("registrationForm");
const participantList = document.getElementById("participantList");
const totalCount = document.getElementById("totalCount");
const message = document.getElementById("message");

const registerButton = document.getElementById("registerButton");
const cancelEditButton = document.getElementById("cancelEdit");

// Load saved registrations
let registrations = JSON.parse(
    localStorage.getItem("collegeRegistrations") || "[]"
);

// Track which student is being edited
let editingIndex = null;

// Show message
function showMessage(text, type) {
    message.textContent = text;
    message.className = `alert alert-${type}`;
    message.style.display = "block";
}

// Save registrations
function saveRegistrations() {
    localStorage.setItem(
        "collegeRegistrations",
        JSON.stringify(registrations)
    );
}

// Display participants
function displayParticipants() {

    participantList.innerHTML = "";

    registrations.forEach((student, index) => {

        const row = document.createElement("tr");

        const values = [
            index + 1,
            student.name,
            student.usn,
            student.email,
            student.department,
            student.semester || "Not specified",
            student.event
        ];

        values.forEach(value => {
            const cell = document.createElement("td");
            cell.textContent = value;
            row.appendChild(cell);
        });

        // Actions column
        const actionCell = document.createElement("td");

        // Edit button
        const editButton = document.createElement("button");
        editButton.textContent = "Edit";
        editButton.className = "btn btn-warning btn-sm me-2";
        editButton.type = "button";

        editButton.addEventListener("click", () => {
            editStudent(index);
        });

        // Delete button
        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.className = "btn btn-danger btn-sm";
        deleteButton.type = "button";

        deleteButton.addEventListener("click", () => {
            deleteStudent(index);
        });

        actionCell.appendChild(editButton);
        actionCell.appendChild(deleteButton);

        row.appendChild(actionCell);

        participantList.appendChild(row);
    });

    // Update total count
    totalCount.textContent = registrations.length;
}

// Register or update student
registrationForm.addEventListener("submit", function(event) {

    event.preventDefault();

    const name = document.getElementById("studentName").value.trim();
    const usn = document.getElementById("usn").value.trim();
    const email = document.getElementById("email").value.trim();
    const department = document.getElementById("department").value;
    const semester = document.getElementById("semester").value;
    const eventChoice = document.getElementById("eventChoice").value;

    // Validate required fields
    if (!name || !usn || !email || !department || !semester || !eventChoice) {
        showMessage("Please fill all required fields.", "danger");
        return;
    }

    // Validate email
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
        showMessage("Please enter a valid email address.", "danger");
        return;
    }

    // Check duplicate USN and email
    const duplicate = registrations.some((student, index) => {

        // Ignore the current student during editing
        if (index === editingIndex) {
            return false;
        }

        return (
            student.usn.toLowerCase() === usn.toLowerCase() ||
            student.email.toLowerCase() === email.toLowerCase()
        );
    });

    if (duplicate) {
        showMessage(
            "USN or Email is already registered!",
            "danger"
        );
        return;
    }

    // Create student object
    const student = {
        name,
        usn,
        email,
        department,
        semester,
        event: eventChoice
    };

    if (editingIndex !== null) {

        // Update existing student
        registrations[editingIndex] = student;

        showMessage(
            "Student details updated successfully!",
            "success"
        );

    } else {

        // Add new student
        registrations.push(student);

        showMessage(
            `Registration successful! Welcome, ${name}.`,
            "success"
        );
    }

    // Save and update table
    saveRegistrations();
    displayParticipants();

    // Reset form
    registrationForm.reset();
    resetEditMode();
});

// Edit student
function editStudent(index) {

    const student = registrations[index];

    document.getElementById("studentName").value = student.name;
    document.getElementById("usn").value = student.usn;
    document.getElementById("email").value = student.email;
    document.getElementById("department").value = student.department;
    document.getElementById("semester").value = student.semester || "";
    document.getElementById("eventChoice").value = student.event;

    editingIndex = index;

    registerButton.textContent = "Update Student";
    cancelEditButton.style.display = "block";

    showMessage(
        "Editing student: " + student.name,
        "info"
    );

    // Scroll to form
    registrationForm.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });
}

// Delete student
function deleteStudent(index) {

    const student = registrations[index];

    const confirmDelete = confirm(
        `Are you sure you want to delete ${student.name}?`
    );

    if (confirmDelete) {

        registrations.splice(index, 1);

        // Save updated data
        saveRegistrations();

        // Refresh table and count
        displayParticipants();

        // Cancel edit if the deleted record was being edited
        if (editingIndex === index) {
            registrationForm.reset();
            resetEditMode();
        } else if (editingIndex !== null && editingIndex > index) {
            editingIndex--;
        }

        showMessage(
            "Student deleted successfully!",
            "success"
        );
    }
}

// Reset edit mode
function resetEditMode() {

    editingIndex = null;

    registerButton.textContent = "Register Now";

    cancelEditButton.style.display = "none";
}

// Cancel editing
cancelEditButton.addEventListener("click", function() {

    registrationForm.reset();

    resetEditMode();

    showMessage(
        "Editing cancelled.",
        "info"
    );
});

// Display saved registrations on page load
displayParticipants();
