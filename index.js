/* index.js */

const taskInput = document.getElementById("taskInput");
const taskList = document.getElementById("taskList");
const progressBar = document.getElementById("progress");
const numbers = document.getElementById("numbers");
const congratsMessage = document.getElementById("congratsMessage");

let tasks = [];

// NOTIFICATION CODE: Request permission on page load
window.addEventListener("load", () => {
  if ("Notification" in window) {
    Notification.requestPermission().then((permission) => {
      if (permission === "granted") {
        new Notification("Quiver of Tasks Notifications Enabled!", {
          body: "We'll let you know if you have pending tasks.",
          icon: "img/bow-and-arrow.png", // optional icon
        });
      }
    });
  }
});

// NOTIFICATION CODE: Function to check and show pending tasks
function notifyPendingTasks() {
  if ("Notification" in window && Notification.permission === "granted") {
    const incompleteTasks = tasks.filter((task) => !task.completed).length;
    // Only notify if there's at least one incomplete task
    if (incompleteTasks > 0) {
      new Notification(`You have ${incompleteTasks} pending task(s).`, {
        body: "Don’t forget to keep shooting! Complete them soon.",
        icon: "img/bow-and-arrow.png", // optional icon
      });
    }
  }
}

// Confetti defaults
const confettiBlast = () => {
  const duration = 3000; // 3 seconds
  const animationEnd = Date.now() + duration;
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

  function randomInRange(min, max) {
    return Math.random() * (max - min) + min;
  }

  const interval = setInterval(() => {
    const timeLeft = animationEnd - Date.now();
    if (timeLeft <= 0) {
      congratsMessage.classList.add("hidden"); // Hide message after confetti
      clearInterval(interval);
      return;
    }

    const particleCount = 50 * (timeLeft / duration);
    confetti(Object.assign({}, defaults, {
      particleCount,
      origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
    }));
    confetti(Object.assign({}, defaults, {
      particleCount,
      origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
    }));
  }, 250);
};

// Add a new task
const addTask = (text) => {
  const newTask = { id: Date.now(), text, completed: false, isEditing: false };
  tasks.push(newTask);
  renderTasks();
};

// Toggle task completion
const toggleTaskComplete = (id) => {
  const task = tasks.find((task) => task.id === id);
  task.completed = !task.completed;
  renderTasks();
};

// Start editing a task
const editTask = (id) => {
  const task = tasks.find((task) => task.id === id);
  task.isEditing = true;
  renderTasks();
};

// Save the edited task
const saveTask = (id, newText) => {
  const task = tasks.find((task) => task.id === id);
  if (newText.trim() !== "") {
    task.text = newText.trim();
  }
  task.isEditing = false;
  renderTasks();
};

// Delete a task
const deleteTask = (id) => {
  tasks = tasks.filter((task) => task.id !== id);
  renderTasks();
};

// Render tasks and update progress
const renderTasks = () => {
  taskList.innerHTML = "";
  const completedTasks = tasks.filter((task) => task.completed).length;

  tasks.forEach((task) => {
    const taskItem = document.createElement("li");
    taskItem.className = `task-item ${task.completed ? "completed" : ""}`;

    if (task.isEditing) {
      taskItem.innerHTML = `
        <div class="task">
          <input class="edit-input"
                 type="text"
                 value="${task.text}"
                 onblur="saveTask(${task.id}, this.value)"
                 autofocus />
          <button class="save-btn"
                  onclick="saveTask(${task.id},
                  document.querySelector('.edit-input').value)">
            Save
          </button>
        </div>
      `;
    } else {
      taskItem.innerHTML = `
        <div class="task">
          <input type="checkbox" ${task.completed ? "checked" : ""}
                 onchange="toggleTaskComplete(${task.id})" />
          <p ondblclick="editTask(${task.id})">${task.text}</p>
        </div>
        <div class="icons">
          <img src="img/edit.png" alt="Edit" onclick="editTask(${task.id})" />
          <img src="img/bin.png" alt="Delete" onclick="deleteTask(${task.id})" />
        </div>
      `;
    }
    taskList.append(taskItem);
  });

  // Update progress
  const progress = tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0;
  progressBar.style.width = `${progress}%`;
  numbers.innerText = `${completedTasks}/${tasks.length}`;

  // Show congratulations message and confetti if all tasks are complete
  if (completedTasks === tasks.length && tasks.length > 0) {
    congratsMessage.classList.remove("hidden");
    confettiBlast();
  }

  // NOTIFICATION CODE: After rendering, notify if pending tasks exist
  notifyPendingTasks();
};

// Handle form submission
document.getElementById("taskForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const taskText = taskInput.value.trim();
  if (taskText) {
    addTask(taskText);
    taskInput.value = "";
  }
});

// Expose functions globally
window.toggleTaskComplete = toggleTaskComplete;
window.deleteTask = deleteTask;
window.editTask = editTask;
window.saveTask = saveTask;

// Initial render
renderTasks();
