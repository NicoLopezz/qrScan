const ctx1 = document.getElementById('totalDetailsChart').getContext('2d');
const totalDetailsChart = new Chart(ctx1, {
    type: 'line',
    data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [{
            label: 'Total Meals',
            data: [50, 60, 70, 80, 90, 100],
            borderColor: '#7a65ab',
            fill: false,
            tension: 0.1
        },
        {
            label: 'Total Expense',
            data: [30, 40, 50, 60, 70, 80],
            borderColor: '#c62270',
            fill: false,
            tension: 0.1
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

const ctx2 = document.getElementById('totalDetailsChart2').getContext('2d');
const totalDetailsChart2 = new Chart(ctx2, {
    type: 'line',
    data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [{
            label: 'Total Meals',
            data: [40, 50, 60, 70, 80, 90],
            borderColor: '#7a65ab',
            fill: false,
            tension: 0.1
        },
        {
            label: 'Total Expense',
            data: [20, 30, 40, 50, 60, 70],
            borderColor: '#c62270',
            fill: false,
            tension: 0.1
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
