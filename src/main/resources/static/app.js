const API_URL = '/api/tasks';

async function loadTasks(){
    const response = await fetch(API_URL);
    const tasks = await response.json();

    const taskList = document.getElementById('taskList');
    taskList.innerHTML = '';
    tasks.forEach(task=> {
        const li = document.createElement('li');
        li.className='task-item';
        li.innerHTML= `
            <span>${task.title}</span>
        <button onClick="deleteTask(${task.id})">Удалить</button>
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

loadTasks();