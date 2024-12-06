document.addEventListener("DOMContentLoaded", () => {
    // Obtén los contextos de los gráficos
    const ctx1 = document.getElementById('chart1').getContext('2d');
    const ctx2 = document.getElementById('chart2').getContext('2d');

    // Inicializa los gráficos
    let chart1 = new Chart(ctx1, {
        type: 'line',
        data: {
            labels: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'],
            datasets: [{
                label: 'Ventas',
                data: [10, 20, 30, 40, 50],
                borderColor: '#5636D3',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });

    let chart2 = new Chart(ctx2, {
        type: 'bar',
        data: {
            labels: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'],
            datasets: [{
                label: 'Clientes',
                data: [5, 15, 25, 35, 45],
                backgroundColor: '#28A745',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });

    // Escucha los clics en las tarjetas
    document.querySelectorAll('.card').forEach((card, index) => {
        card.addEventListener('click', () => {
            console.log(`Tarjeta ${index + 1} seleccionada`);

            // Genera nuevos datos para los gráficos
            const newData1 = Array.from({ length: 5 }, () => Math.floor(Math.random() * 100));
            const newData2 = Array.from({ length: 5 }, () => Math.floor(Math.random() * 50));

            // Actualiza los gráficos
            chart1.data.datasets[0].data = newData1;
            chart2.data.datasets[0].data = newData2;

            chart1.update();
            chart2.update();
        });
    });
});
