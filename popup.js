// Initialize state
let objectives = [];
let countdownInterval;

//Constants
const maxObjectives = 8;

// Selectors
const taskInput = document.getElementById('task-input');
const priorityInput = document.getElementById('priority-input');
const tagInput = document.getElementById('tag-input');
const addBtn = document.getElementById('add-task-btn');
const listContainer = document.getElementById('objective-list');
const countDisplay = document.getElementById('task-count');
const resetBtn = document.getElementById('reset-all-btn');
const searchInput = document.getElementById('search-input');

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
	chrome.storage.sync.get(['objectives'], (result) => {
		if (result.objectives) {
			objectives = result.objectives;
			renderObjectives();
			startUIUpdateLoop();
			updateBadge(); // Set initial badge count
			}
		});
	taskInput.focus();
});

function startUIUpdateLoop() {
	if (countdownInterval) clearInterval(countdownInterval);
	countdownInterval = setInterval(() => {
		updateTimerDisplays();
	}, 1000);
}

// --- Core Functions ---
function handleAddTask() {
	if (objectives.length >= maxObjectives) {
		alert("Focus! You've reached the " + maxObjectives + "-objective limit.");
		return;
	}
	const taskText = taskInput.value.trim();
	if (!taskText) return;
	const tags = tagInput.value.split(',').map(t => t.trim()).filter(t => t !== "").slice(0, 5);

	const newObjective = {
		id: Date.now(),
		text: taskText,
		priority: priorityInput.value,
		tags: tags,
		completed: false,
		createdAt: new Date().toISOString()
	};

	objectives.push(newObjective);
	saveAndRender();

	// Clear and Refocus
	taskInput.value = '';
	tagInput.value = '';
	taskInput.focus();
}

function saveAndRender() {
chrome.storage.sync.set({ objectives }, () => {
renderObjectives(searchInput.value.toLowerCase());
updateBadge(); // Update the icon badge
});
}

function renderObjectives(filterText = '') {
listContainer.innerHTML = '';

// 1. Filter the objectives array based on the search query
const filtered = objectives.filter(obj => {
const matchesTitle = obj.text.toLowerCase().includes(filterText);
const matchesPriority = obj.priority.toLowerCase().includes(filterText);
const matchesTags = obj.tags.some(tag => tag.toLowerCase().includes(filterText.replace('#', '')));

return matchesTitle || matchesPriority || matchesTags;
});

countDisplay.textContent = `${objectives.length}/${maxObjectives}`;

if (filtered.length === 0) {
listContainer.innerHTML = `
<div class="empty-state">
<span class="empty-state-icon">✨</span>
<p>${objectives.length === 0 ? "What are we achieving today?" : "No matches found."}</p>
</div>
`;
return;
}

filtered.forEach(obj => {
const li = document.createElement('li');
li.className = `task-item ${obj.priority} ${obj.completed ? 'is-completed' : ''}`;
const hasActiveTimer = obj.timerEnd && obj.timerEnd > Date.now();

li.innerHTML = `
<div class="task-main-row" style="display: flex; align-items: center; width: 100%;">
<div class="task-left" style="display: flex; align-items: center; gap: 10px; flex-grow: 1;">
<div class="status-circle ${obj.completed ? 'checked' : ''}" data-id="${obj.id}"></div>
<span class="task-text" data-id="${obj.id}" contenteditable="true">${obj.text}</span>
</div>
<span class="priority-label" data-id="${obj.id}" style="cursor: pointer;" title="Click to change priority">${obj.priority}</span>        <span class="delete-btn" data-id="${obj.id}" title="Delete objective">&times;</span>
</div>
<div class="task-tags">
${obj.tags.map(tag => `<span class="tag">#${tag}</span>`).join('')}
</div>
<div class="timer-controls">
${hasActiveTimer ? `
<button class="cancel-btn" data-id="${obj.id}">Cancel Timer</button>
` : `
<span>Set:</span>
${[1, 2, 3, 5, 8].map(h => `<button class="timer-btn" data-id="${obj.id}" data-hours="${h}">${h}h</button>`).join('')}
`}
<span class="time-remaining" id="timer-display-${obj.id}"></span>
</div>
`;
listContainer.appendChild(li);
});
}

// --- Event Listeners ---

// Add Task via Click or Enter
addBtn.addEventListener('click', handleAddTask);
[taskInput, tagInput].forEach(el => {
el.addEventListener('keydown', (e) => {
if (e.key === 'Enter') handleAddTask();
});
});

// Global Reset
resetBtn.addEventListener('click', () => {
if (confirm("Are you sure you want to clear all objectives?")) {
objectives.forEach(obj => chrome.alarms.clear(`timer-${obj.id}`));
objectives = [];
saveAndRender();
}
});

// List Interaction (Click Delegation)
listContainer.addEventListener('click', (e) => {
const taskId = e.target.getAttribute('data-id');
if (!taskId) return;

// 1. Toggle Completion
if (e.target.classList.contains('status-circle')) {
const task = objectives.find(obj => obj.id == taskId);
if (task) {
task.completed = !task.completed;
if (task.completed) cancelTimer(taskId);
saveAndRender();
}
}

// 2. Delete Task
if (e.target.classList.contains('delete-btn')) {
chrome.alarms.clear(`timer-${taskId}`);
objectives = objectives.filter(obj => obj.id != taskId);
saveAndRender();
}

// 3. Timer Start
if (e.target.classList.contains('timer-btn')) {
const hours = parseInt(e.target.getAttribute('data-hours'));
startTimer(taskId, hours);
}

// 4. Timer Cancel
if (e.target.classList.contains('cancel-btn')) {
cancelTimer(taskId);
}

// 5. Cycle Priority In-Situ
if (e.target.classList.contains('priority-label')) {
const task = objectives.find(obj => obj.id == taskId);
if (task) {
const levels = ['low', 'medium', 'high'];
let currentIndex = levels.indexOf(task.priority);

// Cycle to next: 0->1, 1->2, 2->0
let nextIndex = (currentIndex + 1) % levels.length;
task.priority = levels[nextIndex];

saveAndRender();
}
}
});

// Inline Editing Blur
listContainer.addEventListener('blur', (e) => {
if (e.target.classList.contains('task-text')) {
const taskId = e.target.getAttribute('data-id');
const newText = e.target.textContent.trim();
const task = objectives.find(obj => obj.id == taskId);
if (task && newText) {
task.text = newText;
chrome.storage.sync.set({ objectives });
}
}
}, true);

// --- Timer & Drag Logic ---

function startTimer(taskId, hours) {
const durationInMs = hours * 60 * 60 * 1000;
const endTime = Date.now() + durationInMs;
chrome.alarms.create(`timer-${taskId}`, { delayInMinutes: hours * 60 });
const task = objectives.find(o => o.id == taskId);
if (task) {
task.timerEnd = endTime;
saveAndRender();
}
}

function cancelTimer(taskId) {
chrome.alarms.clear(`timer-${taskId}`);
const task = objectives.find(o => o.id == taskId);
if (task) {
delete task.timerEnd;
saveAndRender();
}
}

function updateTimerDisplays() {
objectives.forEach(obj => {
const display = document.getElementById(`timer-display-${obj.id}`);
if (display && obj.timerEnd) {
const remaining = obj.timerEnd - Date.now();
if (remaining > 0) {
const h = Math.floor(remaining / 3600000);
const m = Math.floor((remaining % 3600000) / 60000);
const s = Math.floor((remaining % 60000) / 1000);
display.textContent = `${h}h ${m}m ${s}s`;
} else {
display.textContent = "0h 0m 0s";
display.style.color = "red";
}
}
});
}

const sortable = new Sortable(listContainer, {
animation: 150,
ghostClass: 'sortable-ghost',
onEnd: function() {
const newOrder = [];
const items = listContainer.querySelectorAll('.status-circle');
items.forEach(item => {
const id = item.getAttribute('data-id');
const task = objectives.find(obj => obj.id == id);
if (task) newOrder.push(task);
});
objectives = newOrder;
chrome.storage.sync.set({ objectives });
}
});

searchInput.addEventListener('input', (e) => {
renderObjectives(e.target.value.toLowerCase());
});

function updateBadge() {
const count = objectives.length;
// If count is 0, we can hide the badge by setting it to an empty string
const badgeText = count > 0 ? count.toString() : '';

chrome.action.setBadgeText({ text: badgeText });
chrome.action.setBadgeBackgroundColor({ color: '#B2CEE0' }); // Matching your pastel blue
}