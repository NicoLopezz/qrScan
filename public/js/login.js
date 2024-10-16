document.addEventListener("DOMContentLoaded", function() {
    document.getElementById("loginForm").addEventListener("submit", async function(event) {
        event.preventDefault();  // Evita que el formulario se envíe de forma predeterminada.

        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;

        try {
            // Hacer la solicitud de inicio de sesión al backend
            const response = await fetch("/api/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok) {
                // Obtener el username de la cookie y decodificarlo
                let username = getCookie("username");
                username = decodeURIComponent(username);  // Decodifica caracteres especiales como '%40' a '@'
                console.log("Permiso recibido: ", data.permiso); // Verifica el valor del permiso


                // Redirigir según el permiso del usuario
                if (data.permiso === "Admin") {
                    window.location.href = `/api/dashboardLocalAdmin/${username}`;
                } else if (data.permiso === "user") {
                    window.location.href = `/api/dashboar/${username}`;
                }
            } else {
                // Mostrar el error en pantalla
                alert(data.error || "Error al iniciar sesión. Verifica tus credenciales.");
            }
        } catch (error) {
            console.error("Error al iniciar sesión:", error);
            alert("Hubo un problema al iniciar sesión. Inténtalo de nuevo.");
        }
    });

    // Función para obtener el valor de una cookie por su nombre
    function getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
    }
});
