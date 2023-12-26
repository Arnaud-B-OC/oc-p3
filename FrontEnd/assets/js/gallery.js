const API_URL = 'http://localhost:5678/api'

let token = localStorage.getItem('token')

function req(endpoint, data = undefined, method = 'GET') {
    return new Promise((resolve, reject) => {
        fetch(API_URL + endpoint, {
            method: method,
            headers: {
                'content-type': data ? 'application/json' : undefined,
                'authorization': token ? `Bearer ${token}` : undefined
            },
            body: data
        }).then((res) => {
            switch (res.status) {
                case 400:
                case 401:
                case 404:
                case 500:
                    reject(res.status)
                    break;
                case 200:
                case 201:
                    return res.json()
                default:
                    reject(res.status)
                    break;
            }
        }).then((json) => {
            if (json) resolve(json)
        });
    });
}

function createFilter(id, name, checked = false) {
    let div = document.createElement('div')
    div.id = 'filter-'+id

    let input = document.createElement('input')
    input.id = 'radio-'+id
    input.type = 'radio'
    input.checked = checked
    input.name = 'filter'
    div.appendChild(input)

    let label = document.createElement('label')
    label.innerText = name
    label.htmlFor = 'radio-'+id
    label.addEventListener('click', () => renderProjects(id))

    div.appendChild(label)
    
    return div
}

let projects = []
function renderProjects(filter = 0) {
    let gallery = document.getElementById('gallery')
    gallery.innerHTML = ''

    projects.map((item) => {
        if (filter != 0 && item.categoryId != filter) return;

        let e = document.createElement('figure')
        e.id = item.id

        let img = document.createElement('img')
        img.src = item.imageUrl
        img.alt = item.title
        img.crossOrigin = 'anonymous'
        e.appendChild(img)

        let figcaption = document.createElement('figcaption')
        figcaption.innerText = item.title
        e.appendChild(figcaption)

        gallery.appendChild(e)
    });
}

function loadGallery() {
    if (token) {
        let loginPageBtn = document.getElementById('login')
        loginPageBtn.innerText = 'logout'
        loginPageBtn.href = '#'
        loginPageBtn.addEventListener('click', () => {
            localStorage.removeItem('token')
            document.location.href = '/'
        });

        document.body.classList.add('logged')
    }

    req('/categories').then((data) => {
        let filters = document.getElementById('filters');
        filters.innerHTML = '';

        filters.appendChild(createFilter(0, 'Tous', true));
        data.map((item) => filters.appendChild(createFilter(item.id, item.name)));
    });
    
    req('/works').then((data) => {
        projects = data;
        renderProjects();
    });

    if (token) initModal();
}
function loadConnexion() {
    if (token) {
        location.href = '/'
        return;
    }

    let form = document.getElementById('connect')

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        let data = Object.fromEntries(new FormData(form));

        req('/users/login', JSON.stringify(data), 'POST').then((json) => {
            localStorage.setItem('token', json.token)
            location.href = '/'
        }).catch((errCode) => {
            document.querySelector('p.err').innerText = 'Email ou mot passe incorrect !'
        });
    });
}

function addWork() {
    req('/works', {
        image: 'IMAGEDATA',
        title: 'title',
        category: 'categoryID'
    }).then(() => {

    });
}




let modalDiv;
function toggleModal() {
    if (!modalDiv) modalDiv = document.querySelector('.modal-div');
    modalDiv.classList.toggle('active');
}
async function initModal() {
    // document.querySelector('#portfolio').appendChild

    document.querySelectorAll('.toggle-modal').forEach((toggle) => toggle.addEventListener('click', toggleModal))

    document.querySelector('#addPhoto').addEventListener('click', openModalAddPhoto)
    
    let gallery = document.querySelector('.gallery-edit')

    // TODO : Chargement à l'ouverture de la modale
    let works = await req('/works')
    works.map((work) => {
        let workDiv = document.createElement('div')
        let img = document.createElement('img')
        img.src = work.imageUrl
        img.crossOrigin = 'anonymous'
        // TODO : Boutton supprimer
        workDiv.appendChild(img)
        gallery.appendChild(workDiv)
    });
}

async function openModalAddPhoto() {

}


