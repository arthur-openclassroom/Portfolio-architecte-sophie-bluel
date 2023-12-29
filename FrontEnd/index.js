/**
 * This function get works from API and return them as a json object.
 * @returns {http_response_works.json()}
 */
async function getWorks() {
    const http_response_works = await fetch('http://localhost:5678/api/works');
    return await http_response_works.json();
}

/**
 * This function get categories from API and return them as a json object.
 * @returns {http_response_categories.json()}
 */
async function getCategories() {
    const http_response_categories = await fetch('http://localhost:5678/api/categories');
    return await http_response_categories.json();
}

const works = await getWorks();
const categories = await getCategories();
const divGallery = document.querySelector(".gallery");

generateDynamicGallery(works, divGallery);
generateDynamicFilters(categories);


const isLogged = sessionStorage.getItem("sophie-bluel-bearer");

if (isLogged) {
    const filtersElement = document.querySelector(".filters");
    filtersElement.style.display = "none";
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

/**
 * This function generate the filters buttons on the page
 * @param {*} categories 
 */
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
    const btnElement = document.querySelector("#btn-filter-all");
    btnElement.addEventListener("click", function () {
        refreshDynamicGallery();
        cleanActiveButton();
        btnElement.setAttribute("active", "");
    });
}

/**
 * This function remove the "active" state of every filters buttons
 */
function cleanActiveButton() {
    const divPortfolio = document.querySelector(".filters");
    for (let button of divPortfolio.children) {
        button.removeAttribute("active", "");
    }
}

let modal = null
const focusableSelector = 'button, a, input, select, textarea'
let focusables = []
let previouslyFocusedElement = null

/**
 * This function open the first modal 
 * @param {*} event 
 */
async function openModal(event) {
    event.preventDefault();
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
    modal.querySelector('.btn-add-photo').addEventListener('click', await openPhotoModal);
    modal.addEventListener('keydown', function (event) {
        if (event.key === "Escape" || event.key === "Esc") {
            closeModal(event);
        }
        if (event.key === "Tab" && modal !== null) {
            focusInModal(event);
        }
    });
}

/**
 * This function close the first modal
 * @param {*} event 
 */
const closeModal = function (event) {
    modal = document.querySelector(".modal");
    if (modal === null) return;
    if (previouslyFocusedElement !== null) previouslyFocusedElement.focus();
    event.preventDefault();
    modal.style.display = "none";
    modal.setAttribute('aria-hidden', 'true');
    modal.removeAttribute('aria-modal');
    modal.removeEventListener('click', closeModal);
    modal.removeEventListener('click', openPhotoModal);
    modal = null;
}

/**
 * This function manage the focus inside the modals
 * @param {*} event 
 */
const focusInModal = function (event) {
    event.preventDefault()
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

/**
 * This function get the works from API and append data in the Gallery
 * @param {*} works 
 * @param {*} parent 
 */
function generateDynamicGallery(works, parent) {
    for (const work of works) {
        const figureElement = document.createElement("figure");

        const imageElement = document.createElement("img");
        imageElement.src = work.imageUrl;
        const titleElement = document.createElement("figcaption");
        titleElement.innerText = work.title;

        parent.appendChild(figureElement);
        figureElement.appendChild(imageElement);
        figureElement.appendChild(titleElement);
    }
}

/**
 * This function refresh the works data in Gallery and Modal Gallery
 */
async function refreshWork() {
    const divModalGallery = document.querySelector(".gallery-modal");
    const divGallery = document.querySelector(".gallery");

    divGallery.innerHTML = "";
    divModalGallery.innerHTML = "";

    const works = await getWorks();
    generateDynamicGalleryModal(works, divModalGallery);
    generateDynamicGallery(works, divGallery);
}

/**
 * This function refresh the works data only in Gallery
 */
async function refreshDynamicGallery() {
    const divGallery = document.querySelector(".gallery");
    divGallery.innerHTML = "";
    generateDynamicGallery(await getWorks(), divGallery);
}

/**
 * This function refresh the works data only in Modal Gallery
 */
async function refreshDynamicModalGallery() {
    const divModalGallery = document.querySelector(".gallery-modal");
    divModalGallery.innerHTML = "";
    generateDynamicGalleryModal(await getWorks(), divModalGallery);
}

/**
 * This function get the works from API and append data in the Modal Gallery
 * @param {*} works 
 * @param {*} parent 
 */
async function generateDynamicGalleryModal(works, parent) {
    for (const work of works) {
        const figureElement = document.createElement("figure");
        const imageElement = document.createElement("img");
        imageElement.src = work.imageUrl;

        const divElement = document.createElement("div");
        divElement.setAttribute("class", "work-trash");
        const iconElement = document.createElement("i");
        iconElement.setAttribute("class", "fa-solid fa-trash-can");
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
                if(response.status === 204) {
                    await refreshWork();
                }
                else {
                    alert("Erreur lors de la suppression, veuillez réessayer")
                }
            }
        });
    }
}


/**
 * This function open the second moda
 */
async function openPhotoModal() {
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
    const selectElement = document.querySelector("#select-category");

    let checkFile = imgInpElement.files ? true : false;
    let checkTitle = titleInputElement.value ? true : false;
    let checkCategory = selectElement.value ? true : false;

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
            if (checkFile && checkTitle && checkCategory) {
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
        if (checkFile && checkTitle && checkCategory) {
            enableValidateButton();
        }
        else {
            disableValidateButton();
        }
    });

    selectElement.addEventListener("change", function changeInput(e) {
        checkCategory = selectElement.value ? true : false;
        if (checkFile && checkTitle && checkCategory) {
            enableValidateButton();
        }
        else {
            disableValidateButton();
        }
    });

    appendCategoriesToSelect(selectElement);
    createWork();
}

/**
 * This function close the second modal
 */
function closeAddPhotoModal() {
    let checkFile = false;
    let checkTitle = false;
    document.querySelector("#main-modal").style.display = "flex";
    document.querySelector("#add-photo-modal").style.display = "none";
}

/** 
 * This function reset the second modal 
 */
async function refreshModalAddPhoto() {
    const content = await fetch("./modalAddPhoto.html");
    return await content.text();
}

/**
 * This function populate the options of the select in the second modal with all the categories
 * @param {*} selectElement 
 */
async function appendCategoriesToSelect(selectElement) {
    selectElement.innerHTML = "<option selected disabled value=''></option>";
    const categories = await getCategories();
    for (const categorie of categories) {
        const optionElement = document.createElement("option");
        optionElement.value = categorie.id;
        optionElement.innerHTML = categorie.name;
        selectElement.appendChild(optionElement);
    }
}

/**
 * This function enable the validate button in the second modal's form
 */
function enableValidateButton() {
    document.querySelector(".btn-validate-photo").removeAttribute("disabled");
}
/**
 * This function disable the validate button in the second modal's form
 */
function disableValidateButton() {
    document.querySelector(".btn-validate-photo").setAttribute("disabled", "disabled");
}

/**
 * This function add the listener to send a new work to the backend with API
 */
function createWork() {
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