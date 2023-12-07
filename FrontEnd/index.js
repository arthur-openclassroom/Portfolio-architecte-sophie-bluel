// Récupération des travaux depuis le serveur
alert("ok");
const http_response = await fetch('http://localhost:5678/api/works');
const works = await http_response.json();

function generateGallery(works){
    for (let i = 0; i < works.length; i++) {
        const work = works[i];
        const divGallery = document.querySelector(".gallery");
        const figureElement = document.createElement("figure");
        // Création des balises 
        const imageElement = document.createElement("img");
        imageElement.src = work.imageUrl;
        const titleElement = document.createElement("figcaption");
        titleElement.innerText = work.title;
        
        // On rattache la balise article a la section Fiches
        divGallery.appendChild(figureElement);
        figureElement.appendChild(imageElement);
        figureElement.appendChild(titleElement);    
     }
}

generateGallery(works);