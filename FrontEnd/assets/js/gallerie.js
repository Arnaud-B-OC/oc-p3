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

req('/works').then((data) => {
    let gallery = document.getElementById('gallery')
    gallery.innerHTML = ''
    
    data.map((item) => {
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

//     "id": 1,
//     "title": "Abajour Tahina",
//     "imageUrl": "http://localhost:5678/images/abajour-tahina1651286843956.png",
//     "categoryId": 1,
//     "userId": 1,
//     "category": {
//       "id": 1,
//       "name": "Objets"
//     }

});

