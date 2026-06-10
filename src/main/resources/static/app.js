const API_URL = '/api/tasks';

async function loadTasks(){
    const response = await fetch(API_URL);
    const tasks = await response.json();

    const taskList = document.getElementById('taskList');
    taskList.innerHTML = '';
    tasks.forEach(task => {
        const li = document.createElement('li');
        li.className='task-item';
        li.innerHTML= `
            <input type="checkbox"${task.done ? 'checked' : ''}
            onchange="saveTask(${task.id})">
            <input id="task-title-${task.id}" value="${task.title}">
            <button onclick="saveTask(${task.id})">Сохранить</button>
            <button onclick="deleteTask(${task.id})">Удалить</button>
            `;
        taskList.appendChild(li);
    });
}

async function addTask(){
    const input = document.getElementById('taskTitle');
    const title = input.value.trim();

    if(!title){
        alert ('Введите название задачи');
        return;
    }
    await fetch(API_URL,{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({title: title,done: false})
    });
    input.value='';
    await loadTasks();
}

async function deleteTask(id){
    await fetch(`${API_URL}/${id}`, {
        method:'DELETE'
    });
    await loadTasks();
}

async function saveTask(id) {
    const titleInput = document.getElementById(`task-title-${id}`);
    const title = titleInput.value.trim();
    const checkbox = titleInput.parentElement.querySelector('input[type=checkbox]');
    const done = checkbox.checked;

    if (!title) {
        alert('Название задачи не должно быть пустым');
        return;
    }

    await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({title: title, done: done})
    });
    await loadTasks();
}

loadTasks();