document.addEventListener("DOMContentLoaded", () => {
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

    // Actualizar gráficos al hacer clic en las tarjetas
    document.querySelectorAll('.card').forEach((card, index) => {
        card.addEventListener('click', () => {
            const newSalesData = Array.from({ length: 5 }, () => Math.floor(Math.random() * 100));
            const newClientsData = Array.from({ length: 5 }, () => Math.floor(Math.random() * 50));

            chart1.data.datasets[0].data = newSalesData;
            chart2.data.datasets[0].data = newClientsData;

            chart1.update();
            chart2.update();
        });
    });
});
