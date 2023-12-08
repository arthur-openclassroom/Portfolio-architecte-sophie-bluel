export function listenerLogin() {
    const loginForm = document.querySelector("#login-form");
    loginForm.addEventListener("submit", async function (event) {
        event.preventDefault();
        // Création de l’objet du nouvel avis.
        const login = {
            email: event.target.querySelector("[name=email").value,
            password: event.target.querySelector("[name=password]").value,
        };
        // Création de la charge utile au format JSON
        const payload = JSON.stringify(login);


        // Appel de la fonction fetch avec toutes les informations nécessaires
        const response = await fetch("http://localhost:5678/api/users/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: payload
        });
        const json_response = await response.json();
        console.log(json_response);
        if (json_response.error) {
            alert("Mauvais couple email/mot de passe.");
        }
        else {
            sessionStorage.setItem("sophie-bluel-bearer", json_response.token);
            window.location.replace("/");
        }
    });
}

listenerLogin();