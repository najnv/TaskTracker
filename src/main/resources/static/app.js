const API_URL = '/api/tasks';
const form = document.getElementById('task-form');
const titleInput = document.getElementById('task-title');
const taskList=document.getElementById('task-list');
const tagList = document.getElementById('tag-list');
const newTagInput = document.getElementById('new-tag-input');
const addTagBtn=document.getElementById('add-tag-btn')

let currentSortBy=`createdAt`;
let currentOrder=`desc`;
let isDraggingTagFromTask = false;

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
    checkbox.addEventListener('change', function(){
        const taskId = this.closest('li').dataset.id;
        const done = this.checked;
        saveTask(taskId,done);
    })
    controls.appendChild(checkbox);

    const titleInput = document.createElement('input');
    titleInput.type = 'text';
    titleInput.value = task.title;
    titleInput.id = `task-title-${task.id}`;
    if (task.done) {
        titleInput.classList.add('done');
    }
    controls.appendChild(titleInput);

    const dateSpan = document.createElement('span');
    dateSpan.className = 'task-date';
    dateSpan.textContent = task.createdAt || '';
    controls.appendChild(dateSpan);

    const saveBtn = document.createElement(`button`);
    saveBtn.textContent = `Сохранить`;
    saveBtn.addEventListener('click', function(){
        const li = this.closest('li');
        const taskId = li.dataset.id;
        const checkbox = li.querySelector('input[type="checkbox"]');
        const done = checkbox.checked;
        saveTask(taskId, done);
    });
    controls.appendChild(saveBtn);

    const deleteBtn = document.createElement(`button`);
    deleteBtn.textContent = `Удалить`;
    deleteBtn.onclick = () => deleteTask(task.id);
    controls.appendChild(deleteBtn);

    li.appendChild(controls);

    const tags = document.createElement('div');
    tags.className='tags';
    const sortedTags = [...(task.tags || [])].sort((a,b) => {
        const nameA = (a.name || a).toLowerCase();
        const nameB = (b.name || b).toLowerCase();
        return nameA.localeCompare(nameB,'ru');
    });

    (sortedTags || []).forEach(tag=>{
        const span = document.createElement('span');
        span.className='tag';
        span.textContent= '#' + (tag.name||tag);
        span.draggable = true;
        span.dataset.tagId = tag.id;
        span.dataset.taskId = task.id;

        span.addEventListener('dragstart', (e) =>{
            e.dataTransfer.setData('text/plain', JSON.stringify({
                tagId: tag.id,
                taskId: task.id
            }));
            e.dataTransfer.effectAllowed = 'move';
            isDraggingTagFromTask = true;
            trashZone.classList.add('active');
        });
        span.addEventListener('dragend', () =>{
           isDraggingTagFromTask = false;
           trashZone.classList.remove('active');
        });
        tags.appendChild(span);
    });
    li.appendChild(tags);

    li.addEventListener('dragover', (e) => {
        if (isDraggingTagFromTask) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        li.style.border = '2px dashed #2c7da0';
    });

    li.addEventListener('dragleave', () => {
        li.style.border = 'none';
    });

    li.addEventListener('drop', async (e) =>{
        if (isDraggingTagFromTask) return;
        e.preventDefault();
        li.style.border = 'none';

        const tagId = e.dataTransfer.getData('text/plain');
        if(!tagId) return;

        const currentTagIds = task.tags.map(t=>t.id);

        if (currentTagIds.includes(Number(tagId))){
            alert('Этот тег уже привязан к задаче');
            return;
        }

        const newTagIds = [...currentTagIds, Number(tagId)];

        await fetch(`${API_URL}/${task.id}/tags`, {
            method:'PUT',
            headers:{'Content-Type':'application/json'},
            body: JSON.stringify(newTagIds)
        });

        await loadTasks();
    });

    const subList = document.createElement('ul');
    subList.className = 'subtasks';
    (task.subtasks || []).forEach(subTask=>{

        const item = document.createElement('li');

        if (subTask.done){
            item.classList.add('done')
        }

        const textSpan = document.createElement('span');
        textSpan.textContent = subTask.title;
        if(subTask.done){
            textSpan.classList.add('done');
        }
        item.appendChild(textSpan);

        const deleteSubBtn = document.createElement('button');
        deleteSubBtn.textContent = 'Удалить';
        deleteSubBtn.className = 'delete-subtask-btn';
        deleteSubBtn.onclick = (e) => {
            e.stopPropagation();
            deleteSubTask(task.id,subTask.id);
        };
        item.appendChild(deleteSubBtn);

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

    if (!title){
        alert ('Введите название задачи');
        return;
    }

    await fetch(API_URL,{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({title, done: false})
    })
    titleInput.value = '';
    await loadTasks();
});

async function deleteTask(id){
    const response = await fetch(`${API_URL}/${id}`, {
        method:'DELETE'
    });

    if(!response.ok){
        const errorMessage = await response.text();
        alert(`Не удалось удалить задачу: ${errorMessage}`);
        return;
    }
    await loadTasks();
}

async function saveTask(id, done) {
    const li = document.querySelector(`li[data-id='${id}']`);
    if (!li)
        return;

    const titleInput = document.getElementById(`task-title-${id}`);
    const title = titleInput ? titleInput.value.trim() : '';

    if (!title) {
        alert('Название задачи не должно быть пустым');
        return;
    }

    console.log('Sending done: ', done)
    await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({title, done})
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

async function deleteSubTask(taskId, subTaskId){
    await fetch(`${API_URL}/${taskId}/subtasks/${subTaskId}`, {
        method:'DELETE'
    })
    await loadTasks();
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

async function loadTags(){
    const response = await fetch('/api/tags');
    const tags = await response.json();
    tagList.innerHTML ='';
    tags.forEach(tag=>{
        const li = document.createElement('li');
        li.dataset.id = tag.id;
        li.draggable = true;

        li.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', tag.id);
            e.dataTransfer.effectAllowed = 'move';
        })

        const nameSpan=document.createElement('span');
        nameSpan.className='tag-name';
        nameSpan.textContent=tag.name;
        nameSpan.addEventListener('dblclick', () => enableTagEditing(nameSpan,tag.id))

        const deleteBtn = document.createElement('button');
        deleteBtn.className='tag-delete-btn';
        deleteBtn.textContent='✕';
        deleteBtn.onclick = () => deleteTag(tag.id);

        li.appendChild(nameSpan);
        li.appendChild(deleteBtn);
        tagList.appendChild(li);
    });
}

async function createTag(){
    const name = newTagInput.value.trim();
    if(!name) {
        alert('Введите наазвание тега');
        return;
    }
    await fetch('/api/tags',{
        method: 'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({name})
    });
    newTagInput.value = '';
    await loadTags();
}

async function updateTag(id, name) {
    await fetch(`/api/tags/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
    });
}

function  enableTagEditing(span, tagId){
    const currentName = span.textContent;
    const input = document.createElement('input');
    input.type = 'text';
    input.value = currentName;
    input.className = 'tag-name editing';
    span.replaceWith(input);
    input.focus();
    input.select();

    const save = async () => {
        const newName = input.value.trim();
        if (newName && newName !== currentName) {
            await updateTag(tagId, newName);
        }
        await loadTags();
    };

    input.addEventListener('blur', save);
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            input.blur();
        } else if (e.key === 'Escape') {
            const span = document.createElement('span');
            span.className = 'tag-name';
            span.textContent = currentName;
            span.addEventListener('dblclick', () => enableTagEditing(span, tagId));
            input.replaceWith(span);
            loadTags();
        }
    });
}

async function deleteTag(id) {
    if (!confirm('Удалить тег?')) return;
    await fetch(`/api/tags/${id}`, {
        method: 'DELETE'
    });
    await loadTags();
    await loadTasks();
}

addTagBtn.addEventListener('click', createTag);
newTagInput.addEventListener('keydown', (e) =>{
    if(e.key === 'Enter'){
        e.preventDefault();
        createTag();
    }
});

async function removeTagFromTask(taskId, tagId) {
    const response = await fetch(`/api/tasks/${taskId}/tags/${tagId}`, {
        method: 'DELETE'
    });

    if (!response.ok){
        throw new Error(`Ошибка при отвязке тега: ${response.status}`)
    }
}

const trashZone = document.getElementById('trash-zone');


trashZone.addEventListener('dragover', (e) =>{
   e.preventDefault();
   e.dataTransfer.dropEffect = 'move';
});

trashZone.addEventListener('drop', async (e) =>{
   e.preventDefault();

   const rawData = e.dataTransfer.getData('text/plain');
   if (!rawData) return;

   try{
       const data = JSON.parse(rawData);
       if (!data.tagId || !data.taskId) return;

       await removeTagFromTask(data.taskId, data.tagId);
       await loadTasks();

   }
   catch (error){
       console.error('Ошибка при отвязке тега', error);
       alert('Не удалось отвязать тег');
   }

    isDraggingTagFromTask = false;
    trashZone.classList.remove('active');
});

loadTags();