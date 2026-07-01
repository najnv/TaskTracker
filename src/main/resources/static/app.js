const API_URL = '/api/tasks';
const ARCHIVE_URL = '/api/archive';
const form = document.getElementById('task-form');
const titleInput = document.getElementById('task-title');
const taskList=document.getElementById('task-list');
const tagList = document.getElementById('tag-list');
const newTagInput = document.getElementById('new-tag-input');
const addTagBtn=document.getElementById('add-tag-btn');
const archiveBtn = document.getElementById('archive-btn');
const archivePanel = document.getElementById('archive-panel');
const archiveOverlay = document.getElementById('archive-overlay');
const closeArchiveBtn = document.getElementById('close-archive');
const archiveList = document.getElementById('archive-list');
const clearArchiveBtn = document.getElementById('clear-archive-btn');

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

    const header = document.createElement('div');
    header.className = 'task-header';
    controls.appendChild(header);

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = task.done;

    checkbox.addEventListener('change', function () {
        const taskId = this.closest('li').dataset.id;
        saveTask(taskId, this.checked);
    });

    header.appendChild(checkbox);

    const right = document.createElement('div');
    right.className = 'task-main';

    const titleInput = document.createElement('textarea');
    titleInput.className = 'task-title-input';

    console.log(task);
    console.log(task.title);

    titleInput.value = task.title;
    titleInput.placeholder = 'Название задачи';
    titleInput.id = `task-title-${task.id}`;

    if (task.done) {
        titleInput.classList.add('done');
    }

    titleInput.rows = 1;

    titleInput.addEventListener("input", () => {
        titleInput.style.height = "auto";
        titleInput.style.height = titleInput.scrollHeight + "px";
    });

    titleInput.addEventListener('blur', () => {
        saveTask(task.id, checkbox.checked);
    });

    titleInput.addEventListener('keydown', e => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            titleInput.blur();
        }
    });

    right.appendChild(titleInput);

    requestAnimationFrame(() => {
        titleInput.style.height = "auto";
        titleInput.style.height = titleInput.scrollHeight + "px";
    });

    const actions = document.createElement('div');
    actions.className = 'task-actions';

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Удалить';
    deleteBtn.onclick = () => deleteTask(task.id);

    actions.appendChild(deleteBtn);

    right.appendChild(actions);

    header.appendChild(right);

    li.appendChild(controls);


    const dateSpan = document.createElement('span');
    dateSpan.className = 'task-date';
    dateSpan.textContent = task.createdAt || '';

    const meta = document.createElement('div');
    meta.className='task-meta';

    meta.appendChild(dateSpan);

    li.appendChild(meta);

    const tagsTitle = document.createElement('div');
    tagsTitle.className = 'section-title';
    tagsTitle.textContent = 'Теги';
    li.appendChild(tagsTitle);

    const tags = document.createElement('div');
    tags.className='tags';

    if(!task.tags || task.tags.length === 0){
        const empty = document.createElement('div');
        empty.className = 'empty-tags';
        empty.textContent = 'Перетащите сюда тег из левой панели';
        tags.appendChild(empty);
    }

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

    const subTitle = document.createElement('div');
    subTitle.className = 'section-title';

    const total = task.subtasks.length;
    const completed = task.subtasks.filter(s => s.done).length;

    subTitle.textContent=`✔ Подзадачи (${completed}/${total})`;
    li.appendChild(subTitle);

    const subList = document.createElement('ul');
    subList.className = 'subtasks';
    (task.subtasks || []).forEach(subTask=>{

        const item = document.createElement('li');

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'subtask-checkbox';
        checkbox.checked = subTask.done;

        checkbox.addEventListener('click', (e)=>{
           e.stopPropagation();
           toggleSubTask(task.id,subTask.id);
        });

        item.appendChild(checkbox);

        if (subTask.done){
            item.classList.add('done')
        }

        const textSpan = document.createElement('span');
        textSpan.className = 'subtask-title';
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

function updateSortButton(){
    if(currentOrder === 'asc'){
        sortToggleBtn.textContent = (currentSortBy === 'createdAt' ? '▲ Старые' : '▲ А→Я');
    } else {
        sortToggleBtn.textContent = (currentSortBy === 'createdAt' ? '▼ Новые' : '▼ Я→А');
    }
}

sortBySelect.addEventListener(`change`, () => {
    currentSortBy=sortBySelect.value;
    updateSortButton();
    loadTasks();
})

sortToggleBtn.addEventListener(`click`, () => {
    currentOrder = currentOrder === `desc` ? `asc` : `desc`;
    updateSortButton();
    loadTasks();
})

updateSortButton();

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
        nameSpan.title='Двойной клик для редактирования';
        nameSpan.textContent='#' + tag.name;
        nameSpan.addEventListener('dblclick', () => enableTagEditing(nameSpan,tag.id))

        const actions = document.createElement('div');
        actions.className = 'tag-actions';

        const editBtn = document.createElement('button');
        editBtn.className='tag-edit-btn';
        editBtn.innerHTML='✎';

        editBtn.onclick = (e) =>{
            e.stopPropagation();
            enableTagEditing(nameSpan,tag.id);
        }

        actions.appendChild(editBtn);

        const deleteBtn = document.createElement('button');
        deleteBtn.className='tag-delete-btn';
        deleteBtn.textContent='✕';
        deleteBtn.onclick = () => deleteTag(tag.id);

        actions.appendChild(deleteBtn);

        li.appendChild(nameSpan);
        li.appendChild(actions);
        tagList.appendChild(li);
    });
}

async function createTag(){
    const name = newTagInput.value.trim();
    if(!name) {
        alert('Введите название тега');
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

    const currentName = span.textContent.replace(/^#/,"");

    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'tag-name-input';
    input.value = currentName;

    span.replaceWith(input);

    input.focus();
    input.select();

    async function save(){

        const newName = input.value.trim();

        if(newName === ""){
            input.replaceWith(span);
            return;
        }

        if(newName === currentName){
            input.replaceWith(span);
            return;
        }

        await updateTag(tagId, newName);
        await loadTags();
    }

    function cansel(){
        input.replaceWith(span);
    }

    input.addEventListener('blur', save);

    input.addEventListener('keydown', (e) => {

        if (e.key === 'Enter') {
            e.preventDefault();
            input.blur();
        }

        if (e.key === 'Escape') {
            e.preventDefault();
            cansel();
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

async function openArchive(){
    await loadArchive();
    archivePanel.classList.add('active');
    archiveOverlay.classList.add('active');
}

function closeArchive(){
    archivePanel.classList.remove('active');
    archiveOverlay.classList.remove('active');
}

archiveBtn.addEventListener('click', openArchive);

closeArchiveBtn.addEventListener('click', closeArchive);

archiveOverlay.addEventListener('click', closeArchive);

async function loadArchive(){
    const response = await fetch(ARCHIVE_URL);
    const archivedTasks = await response.json();
    archiveList.innerHTML = '';
    archivedTasks.forEach(task =>{
       archiveList.appendChild(renderArchiveItem(task));
    });
}

function renderArchiveItem(task){
    const card = document.createElement('div');
    card.className = 'archive-card';

    const title = document.createElement('h3');
    title.textContent = task.title;
    card.appendChild(title);

    if(task.tags && task.tags.length > 0){

        const tagContainer = document.createElement('div');
        tagContainer.className = 'archive-tags';

        task.tags.forEach(tag=>{

            const span = document.createElement('span');
            span.className = 'archive-tag';
            span.textContent = '#' + tag.name;

            tagContainer.appendChild(span);
        });
        card.appendChild(tagContainer);
    }

    if(task.subTasks && task.subTasks.length){

        const subtitle = document.createElement('p');
        subtitle.innerHTML = '<strong>Подзадачи</strong>';
        card.appendChild(subtitle);

        const ul = document.createElement('ul');
        ul.className = 'archive-subtasks';

        task.subTasks.forEach(sub=>{

            const li = document.createElement('li');
            li.textContent = sub.title;

            if(sub.done){
                li.classList.add('done');
            }

            ul.appendChild(li);
        });
        card.appendChild(ul);
    }

    const deleted = document.createElement('p');
    deleted.innerHTML = `<strong>Удалена:</strong> ${formatDate(task.deletedTimestamp)}`;
    card.appendChild(deleted);

    const expires = document.createElement('p');
    expires.innerHTML = `<strong>Удалится через:</strong> ${task.retention === 'NEVER' ? 'никогда' : formatRemainingTime(task.expiresTimestamp)}`;

    card.appendChild(expires);

    if(task.retention !== "NEVER"){

        const exact = document.createElement("small");

        exact.className = "archive-exact-date";

        exact.textContent = "До " + formatDate(task.expiresTimestamp);

        card.appendChild(exact);

    }

    const select = document.createElement('select');
    [
        'HOUR',
        'DAY',
        'WEEK',
        'MONTH',
        'NEVER'
    ].forEach(value => {
       const option = document.createElement('option');
       option.value = value;
       option.textContent = {
           HOUR:'1 час',
           DAY:'1 день',
           WEEK:'1 неделя',
           MONTH:'1 месяц',
           NEVER:'Не удалять'
       }[value];
       option.selected = value === task.retention;
       select.appendChild(option);
    });

    select.addEventListener('change', async () =>{
        await changeRetention(task.id, select.value);
    });

    const label = document.createElement('label');
    label.textContent = 'Срок хранения';
    card.appendChild(label);
    card.appendChild(select)

    const buttons = document.createElement('div');
    buttons.className = 'archive-buttons';

    const restoreBtn = document.createElement('button');
    restoreBtn.textContent = '↩ Восстановить';
    buttons.appendChild(restoreBtn);

    restoreBtn.addEventListener('click', async () =>{
        await restoreTask(task.id);
    });

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = '🗑 Удалить';
    buttons.appendChild(deleteBtn);

    deleteBtn.addEventListener('click', async () =>{
        await deleteArchivedTask(task.id);
    });

    card.appendChild(buttons);

    return card;
}

async function changeRetention(taskId, retention){

    const response = await fetch(`${ARCHIVE_URL}/${taskId}/retention`, {
        method:'PATCH',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({
            retention: retention
        })
    });

    if(!response.ok){
        alert('Не удалось изменить срок хранения');
        return;
    }
    await loadArchive();
}

async function restoreTask(taskId){

    const response = await fetch(`${ARCHIVE_URL}/${taskId}/restore`,{
        method:'POST'
    });

    if(!response.ok){
        const errorMessage = await response.text();
        alert(`Не удалось восстановить задачу:  ${errorMessage}`);
        return;
    }
    await loadArchive();
    await loadTasks();
}

async function deleteArchivedTask(taskId){

    const response = await fetch(`${ARCHIVE_URL}/${taskId}`, {
        method:'DELETE'
    });

    if(!response.ok){
        const errorMessage = await response.text();
        alert(`Не удалось удалить задачу: ${errorMessage}`);
        return;
    }

    await loadArchive();
}

async function clearArchive(){

    if(!confirm('Очистить весь архив?')){
        return;
    }

    const response = await fetch(ARCHIVE_URL,{
        method:'DELETE'
    })

    if(!response.ok){
        alert('Не удалось очистить архив');
        return;
    }

    await loadArchive();
}

clearArchiveBtn.addEventListener('click', clearArchive);


function formatRemainingTime(expiresTimestamp) {

    if (!expiresTimestamp) {
        return 'Неизвестно';
    }

    const diff = expiresTimestamp - Date.now();

    if (diff < 60000) {
        return 'меньше минуты';
    }

    const totalMinutes = Math.floor(diff / 60000);

    const days = Math.floor(totalMinutes / (60 * 24));
    const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
    const minutes = totalMinutes % 60;

    if (days > 0) {
        return `${days} дн. ${hours} ч.`;
    }

    if (hours > 0) {
        return `${hours} ч. ${minutes} мин.`;
    }

    return `${minutes} мин.`;
}

function formatDate(timestamp) {

    if (!timestamp) {
        return '';
    }

    return new Date(timestamp).toLocaleString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

loadTags();