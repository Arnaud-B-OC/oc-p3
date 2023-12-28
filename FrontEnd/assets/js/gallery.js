// ### API Request ### //
const API_URL = 'http://localhost:5678/api'

let token = localStorage.getItem('token')
function request(endpoint, data = undefined, method = 'GET', headers = {'content-type': 'application/json'}) {
    return new Promise((resolve, reject) => {
        fetch(API_URL + endpoint, {
            method: method,
            headers: Object.assign({
                'authorization': token ? `Bearer ${token}` : undefined,
            }, headers),
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
                case 204:
                    return {}
                    break;
                default:
                    reject(res.status)
                    break;
            }
        }).then((json) => {
            if (json) resolve(json)
        });
    });
}


function addWork(formData) {
    request('/works', formData, 'POST', {}).then((data) => {
        projects.push(data);
        renderProjects();
        toggleModal();

    }).catch((errCode) => {
        switch (errCode) {
            case 401:
                document.querySelector('p.err').innerText = 'Vous devez vous connecter pour effectuer cette action !'
                break;
            case 400:
                document.querySelector('p.err').innerText = 'Bad request !'
                break;
            case 500:
                document.querySelector('p.err').innerText = 'Erreur serveur !'
                break;
            default:
                document.querySelector('p.err').innerText = 'Erreur inconnue !'
                break;
        }
    });
}


function removeWork(id) {
    request(`/works/${id}`, undefined, 'DELETE').then(() => {
        projects = projects.filter((project) => project.id != id)
        renderProjects()
        renderProjectsInModal()
    }).catch((errCode) => {
        switch (errCode) {
            case 401:
                alert('Vous devez vous connecter pour effectuer cette action !')
                break;
            case 500:
                alert('Erreur serveur !')
                break;
            default:
                alert('Erreur inconnue !')
                break;
        }
    });
}

// ### Render Projects ### //
let projects = []
let selected_filter = 0

function renderProjects(filter = 0) {
    let gallery = document.getElementById('gallery')
    gallery.innerHTML = ''

    projects.map((item) => {
        if (filter != 0 && item.categoryId != filter) return;

        let e = document.createElement('figure')
        e.id = `projet_${item.id}`
        e.dataset.category = item.categoryId

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


function renderProjectsInModal() {
    let editGallery = document.querySelector('.gallery-edit')
    editGallery.innerHTML = ''
    projects.map((work) => {
        let workDiv = document.createElement('div')
        let img = document.createElement('img')
        img.src = work.imageUrl
        img.crossOrigin = 'anonymous'

        let btn = document.createElement('button')
        btn.classList.add('btn-remove-project')
        btn.addEventListener('click', () => removeWork(work.id))

        workDiv.appendChild(img)
        workDiv.appendChild(btn)
        editGallery.appendChild(workDiv)
    });
}


function renderProjectsFilter(filter = 0) {
    let gallery = document.querySelector('#gallery')
    if (!gallery.classList.contains('loading')) return;
    
    let items = document.querySelectorAll('#gallery figure')
    items.forEach((item) => {
        if (filter != 0 && item.dataset.category != filter)
            item.classList.add('hide');
        else
            item.classList.remove('hide');
    });

    gallery.classList.remove('loading')
}

// ### Render Categories ### //
let categories = []


function renderCategories() {
    let filters = document.getElementById('filters');
    filters.innerHTML = '';

    filters.appendChild(createCategoryFilter(0, 'Tous', true));
    categories.map((item) => filters.appendChild(createCategoryFilter(item.id, item.name)));
}


function createCategoryFilter(id, name, checked = false) {
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
    label.addEventListener('click', () => {
        let gallery = document.querySelector('#gallery')
        gallery.classList.add('loading')
        selected_filter = id
    })

    div.appendChild(label)
    
    return div
}


function renderCategoriesInModal() {
    let select = document.querySelector('#selectCategory')
    select.innerHTML = ''
    categories.map((category) => {
        let opt = document.createElement('option')
        opt.value = category.id
        opt.innerText = category.name
        select.appendChild(opt)
    });
}

// ### Pages Load ### //
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

    let gallery = document.querySelector('#gallery')
    gallery?.addEventListener('transitionend', (e) => renderProjectsFilter(selected_filter))

    request('/categories').then((data) => {
        categories = data;
        renderCategories();
    });
    
    request('/works').then((data) => {
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

    document.getElementById('connect').addEventListener('submit', (e) => {
        e.preventDefault();
        let data = Object.fromEntries(new FormData(document.getElementById('connect')));

        request('/users/login', JSON.stringify(data), 'POST').then((json) => {
            localStorage.setItem('token', json.token)
            location.href = '/'
        }).catch((errCode) => {
            document.querySelector('p.err').innerText = 'Email ou mot passe incorrect !'
        });
    });
}



// ### Modal ### //
let modalDiv;
function toggleModal() {
    if (!modalDiv) modalDiv = document.querySelector('.modal-div');

    if (!modalDiv.classList.contains('active')) {
        openModalPhotoView();
    }
    
    modalDiv.classList.toggle('active');
}


async function initModal() {
    document.querySelectorAll('.toggle-modal').forEach((toggle) => toggle.addEventListener('click', toggleModal))
    document.querySelector('#addPhoto').addEventListener('click', openModalAddPhoto)
    document.querySelector('#validatePhoto').addEventListener('submit', validatePhoto)
}


async function openModalPhotoView() {
    document.querySelector('#modalAddPhoto').classList.add('hide')
    document.querySelector('#modalViewPhoto').classList.remove('hide')

    renderProjectsInModal();
}


async function openModalAddPhoto() {
    document.querySelector('#modalAddPhoto').classList.remove('hide')
    document.querySelector('#modalViewPhoto').classList.add('hide')

    document.querySelector('p.err').innerText = ''
    document.querySelector('#title').value = ''

    renderCategoriesInModal();
}


async function validatePhoto(e) {
    e.preventDefault();

    let data = Object.fromEntries(new FormData(this));

    if (!data.title) {
        document.querySelector('p.err').innerText = 'Veuillez entrer un titre'
        return;
    }

    if (!data.file || data.file.size == 0) {
        document.querySelector('p.err').innerText = 'Veuillez selectionner une image'
        return;
    }

    if (data.file.size > 4000000) {
        document.querySelector('p.err').innerText = 'Votre image dépasse la taille maximale (4Mo)'
        return;
    }

    if (!data.selectedCategory) {
        document.querySelector('p.err').innerText = 'Veuillez selectionner une categorie'
        return;
    }

    let reqData = new FormData()
    reqData.append('image', data.file)
    reqData.append('title', data.title)
    reqData.append('category', data.selectedCategory)

    addWork(reqData)
}
