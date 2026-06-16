const API_URL = '/api/tasks';
const form = document.getElementById('task-form');
const titleInput = document.getElementById('task-title');
const tagsInput=document.getElementById('task-tags');
const taskList=document.getElementById('task-list');

let currentSortBy=`createdAt`;
let currentOrder=`desc`;

function renderTask(task){

    const li = document.createElement('li');
    li.className='task-item';
    li.dataset.id = task.id;

    if (task.done){
        li.classList.add('done');
    }

    const controls = document.createElement(`div`);
    controls.className=`task-controls`;

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = task.done;
    checkbox.onchange = () => saveTask(task.id, task.tags);
    controls.appendChild(checkbox);

    const titleInput = document.createElement('input');
    titleInput.type = 'text';
    titleInput.value = task.title;
    titleInput.id = `task-title-${task.id}`;
    if (task.done) {
        titleInput.classList.add('done');
    }
    controls.appendChild(titleInput);

    const saveBtn = document.createElement(`button`);
    saveBtn.textContent = `Сохранить`;
    saveBtn.onclick = () => saveTask(task.id,task.tags);
    controls.appendChild(saveBtn);

    const deleteBtn = document.createElement(`button`);
    deleteBtn.textContent = `Удалить`;
    deleteBtn.onclick = () => deleteTask(task.id);
    controls.appendChild(deleteBtn);

    li.appendChild(controls);

    /*const title = document.createElement('strong');
    title.textContent = task.title;
    if (task.done) {
        title.classList.add('done');
    }*/

    const tags = document.createElement('div');
    tags.className='tags';
    (task.tags || []).forEach(tag=>{
        const span = document.createElement('span');
        span.className='tag';
        span.textContent= '#' + tag;
        tags.appendChild(span);
    });
    li.appendChild(tags);

    const subList = document.createElement('ul');
    subList.className = 'subtasks';
    (task.subtasks || []).forEach(subTask=>{
        const item = document.createElement('li');
        item.textContent = subTask.title;
        if(subTask.done){
            item.classList.add('done');
        }
        item.onclick = () => toggleSubTask(task.id, subTask.id);
        subList.appendChild(item);
    });
    li.appendChild(subList);

    const addSubButton = document.createElement('button');
    addSubButton.className = 'add-sub-button';
    addSubButton.textContent = 'Добавить подзадачу';
    addSubButton.onclick = () => addSubTask(task.id);
    li.appendChild(addSubButton);

    return li;
}


async function loadTasks(){
    const response = await fetch(`${API_URL}?sortBy=${currentSortBy}&order=${currentOrder}`);
    const tasks = await response.json();

    taskList.innerHTML = '';
    tasks.forEach(task => {
        taskList.appendChild(renderTask(task));
    });
}


form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const title = titleInput.value.trim();
    const tags = tagsInput.value
        .split(',')
        .map(tag=>tag.trim())
        .filter(tag=>tag.length > 0);

    if (!title){
        alert ('Введите название задачи');
        return;
    }

    await fetch(API_URL,{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({title, done: false, tags})
    })
    titleInput.value = '';
    tagsInput.value = '';
    await loadTasks();
});

/*async function addTask(){
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
}*/

async function deleteTask(id){
    await fetch(`${API_URL}/${id}`, {
        method:'DELETE'
    });
    await loadTasks();
}

async function saveTask(id, tags) {
    const li = document.querySelector(`li[data-id='${id}']`);
    if (!li)
        return;

    const titleInput = document.getElementById(`task-title-${id}`);
    const title = titleInput ? titleInput.value.trim() : '';

    //const title = titleInput.value.trim();
    //const checkbox = titleInput.parentElement.querySelector('input[type=checkbox]');
    const checkbox = li.querySelector('input[type="checkbox"]');
    //const done = checkbox.checked;
    const done = checkbox ? checkbox.checked : false;

    if (!title) {
        alert('Название задачи не должно быть пустым');
        return;
    }

    await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({title: title, done: done, tags:tags})
    });
    await loadTasks();
}

async function addSubTask(taskId){
    const title = prompt('Название подзадачи');

    if(!title || !title.trim()){
        return;
    }

    await fetch(`${API_URL}/${taskId}/subtasks`,{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({title: title.trim(), done:false})
    });

    loadTasks();
}

async function toggleSubTask(taskId, subTaskId){
    await fetch(`${API_URL}/${taskId}/subtasks/${subTaskId}/toggle`,{
        method:'PATCH'
    });

    loadTasks();
}

const sortBySelect = document.getElementById(`sortBy`);
const sortToggleBtn=document.getElementById(`sortToggle`);

sortBySelect.addEventListener(`change`, () => {
    currentSortBy=sortBySelect.value;
    loadTasks();
})

sortToggleBtn.addEventListener(`click`, () => {
    currentOrder = currentOrder === `desc` ? `asc` : `desc`;
    loadTasks();
})

loadTasks();