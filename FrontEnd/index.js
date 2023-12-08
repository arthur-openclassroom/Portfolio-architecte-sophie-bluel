const isLogged = sessionStorage.getItem("sophie-bluel-bearer");
if(isLogged) {
    alert("loguée")
}


// Récupération des travaux depuis le serveur
const http_response_works = await fetch('http://localhost:5678/api/works');
const works = await http_response_works.json();

function generateDynamicGallery(works) {
    for (const work of works) {
        const divGallery = document.querySelector(".gallery");
        const figureElement = document.createElement("figure");
        // Création des balises 
        const imageElement = document.createElement("img");
        imageElement.src = work.imageUrl;
        const titleElement = document.createElement("figcaption");
        titleElement.innerText = work.title;

        // On rattache la balise figure au div gallery
        divGallery.appendChild(figureElement);
        figureElement.appendChild(imageElement);
        figureElement.appendChild(titleElement);
    }
}

const http_response_categories = await fetch('http://localhost:5678/api/categories');
const categories = await http_response_categories.json();

function cleanActiveButton() {
    const divPortfolio = document.querySelector(".filters");
    for (let button of divPortfolio.children) {
        button.removeAttribute("active", "");    
    }
}

function generateDynamicFilters(categories) {
    for (const categorie of categories) {
        const divPortfolio = document.querySelector(".filters");
        const btnElement = document.createElement("button");
        btnElement.setAttribute("class", "btn-filter")
        btnElement.innerText = categorie.name;
        // Ajout du filtre au bouton
        btnElement.addEventListener("click", function () {
            const worksFiltered = works.filter(function (work) {
                return work.category.id == categorie.id;
            });
            document.querySelector(".gallery").innerHTML = "";
            generateDynamicGallery(worksFiltered);
            cleanActiveButton();
            btnElement.setAttribute("active", "");
        });
        // On rattache la balise bouton au div
        divPortfolio.appendChild(btnElement);
    }
}

const btnElement = document.querySelector("#btn-filter-all");
    btnElement.addEventListener("click", function () {
    document.querySelector(".gallery").innerHTML = "";
    generateDynamicGallery(works);
    cleanActiveButton();
    btnElement.setAttribute("active", "");
});

generateDynamicGallery(works);
generateDynamicFilters(categories);