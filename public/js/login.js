// login.js
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
                // Redirigir al dashboard si el inicio de sesión es exitoso
                // window.location.href = `/dashboard?email=${email}`;
                window.location.href = `/api/dashboardAdmin`;

            } else {
                // Mostrar el error en pantalla
                alert(data.error || "Error al iniciar sesión. Verifica tus credenciales.");
            }
        } catch (error) {
            console.error("Error al iniciar sesión:", error);
            alert("Hubo un problema al iniciar sesión. Inténtalo de nuevo.");
        }
    });
});
