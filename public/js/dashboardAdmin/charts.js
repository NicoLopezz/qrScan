document.addEventListener("DOMContentLoaded", () => {
    // Gráficos para la sección Dashboard
    const ctx1 = document.getElementById('chart1').getContext('2d');
    const ctx2 = document.getElementById('chart2').getContext('2d');

    let chart1 = new Chart(ctx1, {
        type: 'line',
        data: {
            labels: ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5'],
            datasets: [{
                label: 'Ventas',
                data: [12, 19, 3, 5, 2],
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
            labels: ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5'],
            datasets: [{
                label: 'Clientes',
                data: [5, 10, 15, 20, 25],
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

    // Gráficos para la sección Reservas
    const ctx3 = document.getElementById('chart3').getContext('2d');
    const ctx4 = document.getElementById('chart4').getContext('2d');

    let chart3 = new Chart(ctx3, {
        type: 'line',
        data: {
            labels: ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5'],
            datasets: [{
                label: 'Reservas',
                data: [8, 15, 7, 10, 6],
                borderColor: '#FF5733',
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

    let chart4 = new Chart(ctx4, {
        type: 'bar',
        data: {
            labels: ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5'],
            datasets: [{
                label: 'Tiempo de espera',
                data: [10, 12, 15, 8, 6],
                backgroundColor: '#FFC107',
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

    // Actualizar gráficos en ambas secciones al hacer clic en las tarjetas
    document.querySelectorAll('.card').forEach((card, index) => {
        card.addEventListener('click', () => {
            // Nuevos datos para Dashboard
            const newSalesData = Array.from({ length: 5 }, () => Math.floor(Math.random() * 100));
            const newClientsData = Array.from({ length: 5 }, () => Math.floor(Math.random() * 50));

            chart1.data.datasets[0].data = newSalesData;
            chart2.data.datasets[0].data = newClientsData;

            chart1.update();
            chart2.update();

            // Nuevos datos para Reservas
            const newReservationsData = Array.from({ length: 5 }, () => Math.floor(Math.random() * 100));
            const newWaitTimeData = Array.from({ length: 5 }, () => Math.floor(Math.random() * 20));

            chart3.data.datasets[0].data = newReservationsData;
            chart4.data.datasets[0].data = newWaitTimeData;

            chart3.update();
            chart4.update();
        });
    });
});
