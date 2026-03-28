document.addEventListener("DOMContentLoaded", () => {
    const primary = '#7C3AED';
    const primaryLight = 'rgba(124, 58, 237, 0.15)';
    const accent = '#F59E0B';
    const success = '#10B981';
    const successLight = 'rgba(16, 185, 129, 0.15)';

    const chartDefaults = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: true,
                labels: {
                    font: { family: 'Inter', size: 12, weight: '500' },
                    color: '#6B7280',
                    boxWidth: 12,
                    padding: 16
                }
            }
        },
        scales: {
            x: {
                grid: { display: false },
                ticks: { font: { family: 'Inter', size: 11 }, color: '#9CA3AF' },
                border: { display: false }
            },
            y: {
                beginAtZero: true,
                grid: { color: '#F3F4F6', drawBorder: false },
                ticks: { font: { family: 'Inter', size: 11 }, color: '#9CA3AF' },
                border: { display: false }
            }
        }
    };

    // ---- Chart 1: Ventas semanales (line) ----
    const ctx1 = document.getElementById('chart1');
    if (ctx1) {
        new Chart(ctx1.getContext('2d'), {
            type: 'line',
            data: {
                labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
                datasets: [{
                    label: 'Ventas ($)',
                    data: [32000, 48000, 41000, 67000, 85000, 73000, 54000],
                    borderColor: primary,
                    backgroundColor: primaryLight,
                    borderWidth: 2.5,
                    pointBackgroundColor: primary,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: { ...chartDefaults }
        });
    }

    // ---- Chart 2: Clientes por día (bar) ----
    const ctx2 = document.getElementById('chart2');
    if (ctx2) {
        new Chart(ctx2.getContext('2d'), {
            type: 'bar',
            data: {
                labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
                datasets: [{
                    label: 'Clientes',
                    data: [8, 14, 11, 19, 23, 18, 12],
                    backgroundColor: primaryLight,
                    borderColor: primary,
                    borderWidth: 2,
                    borderRadius: 8,
                    borderSkipped: false
                }]
            },
            options: { ...chartDefaults }
        });
    }

    // ---- Chart 3: Reservas por semana (line) ----
    const ctx3 = document.getElementById('chart3');
    if (ctx3) {
        new Chart(ctx3.getContext('2d'), {
            type: 'line',
            data: {
                labels: ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'],
                datasets: [{
                    label: 'Reservas',
                    data: [22, 35, 28, 41],
                    borderColor: accent,
                    backgroundColor: 'rgba(245, 158, 11, 0.12)',
                    borderWidth: 2.5,
                    pointBackgroundColor: accent,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: { ...chartDefaults }
        });
    }

    // ---- Chart 4: Calificaciones (doughnut) ----
    const ctx4 = document.getElementById('chart4');
    if (ctx4) {
        new Chart(ctx4.getContext('2d'), {
            type: 'doughnut',
            data: {
                labels: ['Excelente', 'Muy bueno', 'Bueno', 'Regular'],
                datasets: [{
                    data: [52, 28, 14, 6],
                    backgroundColor: [primary, accent, success, '#EF4444'],
                    borderWidth: 0,
                    hoverOffset: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            font: { family: 'Inter', size: 12, weight: '500' },
                            color: '#6B7280',
                            boxWidth: 12,
                            padding: 12
                        }
                    }
                },
                cutout: '65%'
            }
        });
    }
});
