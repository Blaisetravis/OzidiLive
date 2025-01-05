
const menuToggle = document.getElementById('menu-toggle');
const mainMenu = document.querySelector('.main-menu');

menuToggle.addEventListener('click', ()=> {
    mainMenu.classList.toggle('active');
});

document.querySelectorAll('.main-menu .nav--buttons').forEach(button => {
    button.addEventListener('click',()=>{
        mainMenu.classList.remove('active');
    })
})

document.getElementById('home').addEventListener('click', ()=>{
    location.href = '/index';
})

document.getElementById('movies').addEventListener('click',()=>{
    location.href = '/index';
})

document.getElementById('tv-shows').addEventListener('click',()=>{
    location.href = '/index';
})