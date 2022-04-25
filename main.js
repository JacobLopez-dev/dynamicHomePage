const apiKey = '88f174139b8cf814e909e31e0e29215c';
const TODO_LIST_STORAGE_KEY = 'homepage.todo';
let list = JSON.parse(localStorage.getItem(TODO_LIST_STORAGE_KEY)) || [];

//DOM Elements
//Time elements
const time = document.querySelector('#time');
const greeting = document.querySelector('#greeting');
const userName = document.querySelector('#name');
const focus = document.querySelector('#focus-input');
const editFocus = document.querySelector('.edit-focus');

//Weather elements
const city = document.querySelector('#tempLocation');
const tempDegree = document.querySelector('#tempDegree');
const tempDescription = document.querySelector('#description')

/********************************* To do List elements **********************************/
const toDoBtn = document.querySelector('.toDoBtn');

const todoList = document.querySelector('.todo-list');
const todoBody= document.querySelector('.todo-body');
const currentDate = document.querySelector('.todays-date');

const todoTemplate = document.querySelector('#todo-template')

const completeBtn = document.querySelector('.complete');
const task = document.querySelector('.todo');
const taskText = document.querySelector('.todo-text');
const trashBtn = document.querySelector('.delete');

const toDoForm = document.querySelector('.todo-form');

const taskInput = document.querySelector('.todo-input');

/********************************* Display current time **********************************/
function showTime(){
    let today = new Date();
    let hour = today.getHours(),
    min = today.getMinutes(),
    sec = today.getSeconds();

    hour = hour % 12 || 12;
    time.innerHTML = `${hour}<span>:</span>${addZero(min)}`;
    // time.innerHTML = `${hour}<span>:</span>${(min)}`; no seconds
    currentDate.innerHTML = `${today.toLocaleDateString('en-US',{ weekday: 'long', month: 'long', day: 'numeric' })}`;

    setTimeout(showTime, 3000);
}

//Add 0 to min and seconds 
function addZero(n){
    return (parseInt(n, 10) < 10 ? '0':'') + n;
}

/********************************* Set greeting **********************************/
//Set the greeting based on time of day
function setGreet(){
    let today = new Date();
    let hour = today.getHours();
    if(hour < 12){
        //Good morning
        document.body.style.backgroundImage = "url('./images/morning.jpg')";
        document.body.style.backgroundSize = 'cover';
        greeting.innerText = 'Good Morning, ';
    }else if(hour < 18){
        // Good afternoon
        greeting.innerText = 'Good afternoon, '
        document.body.style.backgroundImage = "url('./images/afternoon.jpg')";
        document.body.style.backgroundSize = 'cover';
    }else{
        // Goodnight
        greeting.innerText = 'Good evening, '
        document.body.style.backgroundImage = "url('./images/evening.jpg')";
        document.body.style.backgroundSize = 'cover';
    }
}

/********************************* Get/Set name and focus **********************************/
//Get Name if there is one, if this is the first time display 'enter name'
function getName(){
    if(localStorage.getItem('homepage.name') === null || localStorage.getItem('homepage.name') == ''){
        userName.textContent = '[Enter name]';
    }else{
        userName.textContent = localStorage.getItem('homepage.name');
    }
}

//Set Name in local storage
function setName(e){
    if(e.type === 'keypress'){
        if(e.which == 13 || e.keyCode == 13){
            localStorage.setItem('homepage.name', e.target.innerText);
            userName.blur();            
        }
    }else{
        localStorage.setItem('homepage.name', e.target.innerText);
    }
}

//Get Focus, if this is the first time display 'enter focus'
function getFocus(){
    if(localStorage.getItem('homepage.focus') === null){
        focus.textContent = '[Enter focus]';
    }else{
        focus.textContent = localStorage.getItem('homepage.focus');
    }
}

//Set Focus in local storage
function setFocus(e){
    if(e.type === 'keypress'){
        if(e.which == 13 || e.keyCode == 13){
            localStorage.setItem('homepage.focus', e.target.innerText);
            focus.setAttribute("contenteditable",false);
            focus.blur();
        }
    }else{
        localStorage.setItem('homepage.focus', e.target.innerText);
        focus.setAttribute("contenteditable",false);
    }
}

/********************************* Event listeners **********************************/
// name and focus
userName.addEventListener('keypress',setName);
userName.addEventListener('blur', setName);
userName.addEventListener('click', () => {
        if(userName.innerHTML == '[Enter name]'){
        userName.innerHTML = ''
    }
})
focus.addEventListener('keypress',setFocus);
focus.addEventListener('blur', setFocus);
// Make the focus box editable after user clicks edit button
editFocus.addEventListener('click',()=>{
    focus.setAttribute("contenteditable", true);
    focus.focus();
    focus.innerHTML = '';
});
// show/hide todo list
toDoBtn.addEventListener('click', ()=>{
    if (todoList.className === 'todo-list') {
    todoList.classList.add('hide');
  } else if (todoList.className === 'todo-list hide') {
    todoList.classList.remove('hide');
  } else {
    todoList.classList.add('hide');
  }
});



/************************* Weather API integration ***************************/
window.addEventListener('load', ()=>{
    let long = 0;
    let lat = 0

    if(navigator.geolocation){
        navigator.geolocation.getCurrentPosition(position=>{
            long = position.coords.longitude;
            lat = position.coords.latitude;
            const api = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${long}&exclude=hourly&appid=${apiKey}&units=imperial`;
            // The api call below retrieves upcoming forecasts in addition to current weather data. However it only returns timezone and not specific location. Data must be pulled from json through a different method than the fetch below.
            // const api = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${long}&appid=${apiKey}&units=imperial`; 
    
            fetch(api).then(response =>{
                return response.json();
            }).then(data => {
                const {name} = data;
                const {temp} = data.main;
                const description = data.weather[0].description;
    
                //Set DOM elements to match data
                city.innerText = name;
                tempDegree.textContent = `${Math.floor(temp)}° F`;
                tempDescription.textContent = description;
            })
        });
    }
});

/*************** Save input into local storage *************************************/
// Return new task element
function createToDo(name){
    return {id: Date.now().toString(), name: name, completed: false}
}

// These two event listeners check
toDoForm.addEventListener('submit', e =>{
    e.preventDefault();
    const taskName = taskInput.value;
    if(taskName == null || taskName === '')return;
    const task = createToDo(taskName);
    taskInput.value = null;
    list.push(task)
    saveAndRender()
});

todoBody.addEventListener("click", (e) =>{
    const element = e.target;
    console.log(element)
    const elementJob = element.attributes.job.value;
    const elementId = element.attributes.id.value;
    const nextSibling = element.nextSibling.nextSibling;
    
    if(elementJob == "delete"){
        list = list.filter(item => item.id !== elementId);
        saveAndRender();
    }

    if(elementJob == "complete"){
        if(element.classList.contains('fa-circle')){
            element.classList.replace('fa-circle', 'fa-check-circle');
            element.style.color = 'rgb(9, 255, 0)';
            nextSibling.style.textDecoration = 'line-through';
            nextSibling.style.color = 'rgba(255, 255, 255, 0.315)';
        }else{
           element.classList.replace('fa-check-circle', 'fa-circle', );
           element.style.color = 'white';
           nextSibling.style.textDecoration = 'none';       
           nextSibling.style.color = 'white';
        }
    }
    
});

function save(){
    localStorage.setItem(TODO_LIST_STORAGE_KEY,JSON.stringify(list));
}

function renderList(){
    clearElement(todoBody);
    list.forEach(item => {
        const taskElement = document.importNode(todoTemplate.content, true);
        const todoText = taskElement.querySelector('.todo-text');
        const completeTask = taskElement.querySelector('.complete');
        const deleteTask = taskElement.querySelector('.delete');
        todoText.append(item.name);
        todoBody.appendChild(taskElement)
        completeTask.attributes.id.value = item.id;
        deleteTask.attributes.id.value = item.id;
    });
}

function saveAndRender(){
    save();
    renderList();
}

function clearElement(element){
    while(element.firstChild){
        element.removeChild(element.firstChild);
    }
}
/*************** Check for variables in local storage/display data ****************/


/*************** get time, set greet,  get name, and get focus ********************/
showTime();
setGreet();
getName();
getFocus();
renderList();