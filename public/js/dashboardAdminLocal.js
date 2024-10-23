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

// Escuchar clic en los elementos del menú lateral
document.querySelectorAll('.menu-item').forEach(item => {
    item.addEventListener('click', function() {
        // Obtener el valor del atributo data-section
        const sectionId = this.getAttribute('data-section');

        // Ocultar todas las secciones
        document.querySelectorAll('.section').forEach(section => {
            section.classList.remove('active');
        });

        // Mostrar la sección seleccionada
        document.getElementById(`section-${sectionId}`).classList.add('active');
    });
});

// Navegación por secciones
document.querySelectorAll('.menu-item').forEach(item => {
    item.addEventListener('click', function() {
        const sectionId = this.getAttribute('data-section');
        document.querySelectorAll('.section').forEach(section => {
            section.classList.remove('active');
        });
        document.getElementById(`section-${sectionId}`).classList.add('active');
    });
});

// FAQ: Mostrar y ocultar las respuestas
document.querySelectorAll('.faq-question').forEach(question => {
    question.addEventListener('click', function() {
        const answer = this.nextElementSibling;
        const icon = this.querySelector('i');
        if (answer.style.display === 'block') {
            answer.style.display = 'none';
            icon.classList.replace('fa-chevron-up', 'fa-chevron-down');
        } else {
            answer.style.display = 'block';
            icon.classList.replace('fa-chevron-down', 'fa-chevron-up');
        }
    });
});

// Actualizar hora y fecha en tiempo real
function updateTime() {
    const now = new Date();
    const time = now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    const date = now.toLocaleDateString('es-ES');
    document.getElementById('time').textContent = time;
    document.getElementById('date').textContent = date;
}
setInterval(updateTime, 1000);

document.querySelectorAll('.faq-question').forEach(question => {
    question.addEventListener('click', function() {
        const parent = this.parentElement;
        parent.classList.toggle('active');
    });
});
