document.getElementById('adminForm').addEventListener('submit', async function(event) {
    event.preventDefault(); // Evitar que el formulario se envíe automáticamente

    const email = document.getElementById('email').value;
    const localNumber = document.getElementById('localNumber').value;
    const nameRef = document.getElementById('nameRef').value;
    const password = document.getElementById('password').value;

    const data = {
        email,
        localNumber,
        nameRef,
        password
    };

    try {
        const response = await fetch('/api/newLocal', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            document.getElementById('message').innerText = 'Administrador agregado con éxito.';
            document.getElementById('adminForm').reset(); // Limpiar el formulario
        } else {
            document.getElementById('message').innerText = 'Error al agregar el administrador.';
        }
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('message').innerText = 'Error en la solicitud.';
    }
});
