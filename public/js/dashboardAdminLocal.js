// Configuración inicial de los gráficos
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


// Función para actualizar la hora y la fecha
function updateTimeAndDate() {
    const now = new Date();
    
    // Formato de 24 horas
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const timeString = `${hours}:${minutes}`;
    
    // Fecha en formato dd/mm/yyyy
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0'); // Mes empieza desde 0
    const year = now.getFullYear();
    const dateString = `${day}/${month}/${year}`;
    
    // Actualiza el contenido de los elementos
    document.getElementById('time').textContent = timeString;
    document.getElementById('date').textContent = dateString;
}

// Llamada inicial para establecer la hora y la fecha
updateTimeAndDate();

// Actualiza cada minuto
setInterval(updateTimeAndDate, 60000); // Actualiza cada 60 segundos

// Detectar cuando el usuario hace scroll
window.addEventListener('scroll', function() {
    const topBar = document.querySelector('.topBar');

    // Si el usuario ha scrolleado más de 50 píxeles, cambia la opacidad
    if (window.scrollY > 10) {
        topBar.style.opacity = '0.0'; // Mayor transparencia
    } else {
        topBar.style.opacity = '1'; // Sin transparencia cuando no hay scroll
    }
});
