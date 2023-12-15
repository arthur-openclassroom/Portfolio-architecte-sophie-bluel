async function getWorks() {
    const http_response_works = await fetch('http://localhost:5678/api/works');
    return await http_response_works.json();
}

async function getCategories() {
    const http_response_categories = await fetch('http://localhost:5678/api/categories');
    return await http_response_categories.json();
}

// Récupération des travaux et catégories depuis le serveur
const works = await getWorks();
const categories = await getCategories();

let modal = null
const focusableSelector = 'button, a, input, select, textarea'
let focusables = []

let previouslyFocusedElement = null

async function openModal(e) {
    e.preventDefault();
    modal = document.querySelector(".modal");
    let modalPage = modal.querySelector("#main-modal");
    focusables = Array.from(modalPage.querySelectorAll(focusableSelector));
    previouslyFocusedElement = document.querySelector(':focus');
    modal.style.display = null;
    focusables[0].focus();
    modal.removeAttribute("aria-hidden");
    modal.setAttribute('aria-modal', 'true');
    const divGallery = document.querySelector(".gallery-modal")
    await refreshDynamicModalGallery();
    modal.querySelector('.fa-xmark').addEventListener('click', closeModal);
    modal.querySelector('.btn-add-photo').addEventListener('click', await showAddPhotoModal);
}

function enableValidateButton() {
    document.querySelector(".btn-validate-photo").removeAttribute("disabled");
}

function disableValidateButton() {
    document.querySelector(".btn-validate-photo").setAttribute("disabled", "disabled");
}


function closeAddPhotoModal() {
    let checkFile = false;
    let checkTitle = false;
    document.querySelector("#main-modal").style.display = "flex";
    document.querySelector("#add-photo-modal").style.display = "none";
}

async function showAddPhotoModal() {
    modal.removeEventListener("click", closeModal);
    let modalPage = modal.querySelector("#add-photo-modal");
    modalPage.innerHTML = await refreshModalAddPhoto();
    document.querySelector("#main-modal").style.display = "none";
    document.querySelector("#add-photo-modal").style.display = "flex";
    focusables = Array.from(modalPage.querySelectorAll(focusableSelector));
    previouslyFocusedElement = document.querySelector(':focus');

    modalPage.querySelector('.fa-xmark').addEventListener('click', closeModal);

    const imgInpElement = document.querySelector("#upload-photo");
    const titleInputElement = document.querySelector("#input-title");

    let checkFile = imgInpElement.files ? true : false;
    let checkTitle = titleInputElement.value ? true : false;
    
    modalPage.querySelector('.fa-xmark').addEventListener('click', function goBack(e) {
        closeAddPhotoModal();
    });
    
    const returnBackElement = document.querySelector(".fa-arrow-left");
    returnBackElement.addEventListener("click", function goBack(e) {
        closeAddPhotoModal();
        closeModal();
    });

    
    imgInpElement.addEventListener("change", function changePhoto(e) {
        const [file] = imgInpElement.files;
        if (file) {
            checkFile = true;
            if (checkFile && checkTitle) {
                enableValidateButton();
            }
            else {
                disableValidateButton();
            }
            const imagePreviewElement = document.createElement("img");
            imagePreviewElement.src = URL.createObjectURL(file);
            imagePreviewElement.style.objectFit = "none";
            const customFileUpload = document.querySelector(".custom-file-upload");
            customFileUpload.innerHTML = "";
            customFileUpload.appendChild(imgInpElement);
            customFileUpload.appendChild(imagePreviewElement);

        }
    });

    
    titleInputElement.addEventListener("change", function changeInput(e) {
        checkTitle = titleInputElement.value ? true : false;
        if (checkFile && checkTitle) {
            enableValidateButton();
        }
        else {
            disableValidateButton();
        }
    });

    const selectElement = document.querySelector("#select-category");
    appendCategoriesToSelect(selectElement);

    sendPhotoToAPI();
}

async function appendCategoriesToSelect(selectElement) {
    selectElement.innerHTML = "";
    const categories = await getCategories();
    for (const categorie of categories) {
        const optionElement = document.createElement("option");
        optionElement.value = categorie.id;
        optionElement.innerHTML = categorie.name;
        selectElement.appendChild(optionElement);
    }
}

const closeModal = function (e) {
    modal = document.querySelector(".modal");
    if (modal === null) return;
    if (previouslyFocusedElement !== null) previouslyFocusedElement.focus();
    e.preventDefault();
    modal.style.display = "none";
    modal.setAttribute('aria-hidden', 'true');
    modal.removeAttribute('aria-modal');
    modal.removeEventListener('click', closeModal);
    modal.removeEventListener('click', showAddPhotoModal);
    modal = null;
}

const stopPropagation = function (e) {
    e.stopPropagation()
}

const focusInModal = function (e) {
    e.preventDefault()
    console.log(focusables);
    let index = focusables.findIndex(f => f === modal.querySelector(':focus'));
    if (e.shiftKey === true) {
        index--;
        if (index < 0) {
            index = focusables.length - 1;
        }
    }
    else {
        index++;
        if (index >= focusables.length) {
            index = 0;
        }
    }
    console.log(index);
    focusables[index].focus()
}

window.addEventListener('keydown', function (e) {
    if (e.key === "Escape" || e.key === "Esc") {
        closeModal(e);
    }
    if (e.key === "Tab" && modal !== null) {
        focusInModal(e);
    }
})

const isLogged = sessionStorage.getItem("sophie-bluel-bearer");
if (isLogged) {
    const divEdits = document.querySelectorAll(".edit");
    divEdits[0].style.display = "block";

    divEdits.forEach(function (divEdit) {
        const editElement = document.createElement("a");
        const txtElement = document.createTextNode("Mode édition");
        const iconElement = document.createElement("i");
        iconElement.setAttribute("class", "fa-regular fa-pen-to-square");
        editElement.appendChild(iconElement);
        editElement.appendChild(txtElement);
        editElement.setAttribute("class", "btn-edit-element");
        divEdit.appendChild(editElement);
        editElement.addEventListener("click", openModal);
    });

    const loginElement = document.querySelector("#login");
    loginElement.innerHTML = "<li>logout</li>";
    loginElement.removeAttribute("id");
    loginElement.setAttribute("id", "logout");
    loginElement.addEventListener("click", function (event) {
        sessionStorage.clear("sophie-bluel-bearer");
        window.location.href("/");
    });





}

function generateDynamicGallery(works, parent) {
    for (const work of works) {
        const figureElement = document.createElement("figure");
        // Création des balises 
        const imageElement = document.createElement("img");
        imageElement.src = work.imageUrl;
        const titleElement = document.createElement("figcaption");
        titleElement.innerText = work.title;

        // On rattache la balise figure au noeud parent
        parent.appendChild(figureElement);
        figureElement.appendChild(imageElement);
        figureElement.appendChild(titleElement);
    }
}

async function refreshWork() {
    const divModalGallery = document.querySelector(".gallery-modal");
    const divGallery = document.querySelector(".gallery");

    divGallery.innerHTML = "";
    divModalGallery.innerHTML = "";

    generateDynamicGalleryModal(await getWorks(), divModalGallery);
    generateDynamicGallery(await getWorks(), divGallery);
}

async function refreshDynamicGallery() {
    const divGallery = document.querySelector(".gallery");
    divGallery.innerHTML = "";
    generateDynamicGallery(await getWorks(), divGallery);
}


async function refreshDynamicModalGallery() {
    const divModalGallery = document.querySelector(".gallery-modal");
    divModalGallery.innerHTML = "";
    generateDynamicGalleryModal(await getWorks(), divModalGallery);
}


async function generateDynamicGalleryModal(works, parent) {
    for (const work of works) {
        const figureElement = document.createElement("figure");
        // Création des balises 
        const imageElement = document.createElement("img");
        imageElement.src = work.imageUrl;

        const divElement = document.createElement("div");
        divElement.setAttribute("class", "work-trash");
        const iconElement = document.createElement("i");
        iconElement.setAttribute("class", "fa-solid fa-trash-can");
        // On rattache la balise figure au noeud parent
        divElement.appendChild(iconElement);
        figureElement.appendChild(imageElement);
        figureElement.appendChild(divElement);
        parent.appendChild(figureElement);
        divElement.addEventListener("click", async function () {
            if (isLogged) {
                const bearerToken = sessionStorage.getItem("sophie-bluel-bearer");
                const response = await fetch(`http://localhost:5678/api/works/${work.id}`, {
                    method: "DELETE",
                    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${bearerToken}` }
                });
                await refreshWork();
            }
        });
    }
}

function cleanActiveButton() {
    const divPortfolio = document.querySelector(".filters");
    for (let button of divPortfolio.children) {
        button.removeAttribute("active", "");
    }
}

function generateDynamicFilters(categories) {
    const galleryElement = document.querySelector(".gallery");
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
            generateDynamicGallery(worksFiltered, galleryElement);
            cleanActiveButton();
            btnElement.setAttribute("active", "");
        });
        // On rattache la balise bouton au div
        divPortfolio.appendChild(btnElement);
    }
}

const btnElement = document.querySelector("#btn-filter-all");
btnElement.addEventListener("click", function () {
    refreshDynamicGallery();
    cleanActiveButton();
    btnElement.setAttribute("active", "");
});


function sendPhotoToAPI() {
    const bearerToken = sessionStorage.getItem("sophie-bluel-bearer");
    const photoForm = document.querySelector(".add-photo-form-wrapper");
    photoForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const formData = new FormData();
        formData.append("image", event.target.querySelector("[name=photo]").files[0]);
        formData.append("title", event.target.querySelector("[name=title]").value);
        formData.append("category", parseInt(event.target.querySelector("[name=category-id]").value));
        const request = new XMLHttpRequest();
        request.open("POST", "http://localhost:5678/api/works");
        request.setRequestHeader("Authorization", `Bearer ${bearerToken}`);
        request.send(formData);
        request.onreadystatechange = function () {
            if (request.readyState == 4) {
                if (request.status === 201) {
                    alert("Image ajoutée.");
                    refreshWork();
                    closeAddPhotoModal();
                } else {
                    alert("Erreur lors de l'envoi.");
                }
            }
        }
    });
}









const divGallery = document.querySelector(".gallery");

generateDynamicGallery(works, divGallery);
generateDynamicFilters(categories);

async function refreshModalAddPhoto() {
    const content = await fetch("./modalAddPhoto.html");
    return await content.text();
}