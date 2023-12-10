// {
//     "id": 1,
//     "title": "Abajour Tahina",
//     "imageUrl": "http://localhost:5678/images/abajour-tahina1651286843956.png",
//     "categoryId": 1,
//     "userId": 1,
//     "category": {
//       "id": 1,
//       "name": "Objets"
//     }
// },


const API_URL = 'http://localhost:5678/api'

function req(endpoint) {
    return new Promise((resolve) => {
        fetch(API_URL + endpoint, {

        }).then((res) => {
            console.log(res)
            // TODO : STATUS CODE 404 / 401 ...
            return res.json()
        }).then((json) => {
            console.log(json)
            resolve(json)
        })
    })
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

req('/categories').then((data) => {
    let filters = document.getElementById('filters')
    filters.innerHTML = ''

    console.log(data)

    filters.appendChild(createFilter(0, 'Tous', true))

    data.map((item) => {
        filters.appendChild(createFilter(item.id, item.name))
    });

	// {
	// 	"id": 1,
	// 	"name": "Objets"
	// },

});

let projects = []
req('/works').then((data) => {
    projects = data
    renderProjects()
});

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


