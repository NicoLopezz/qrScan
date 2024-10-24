document.addEventListener("DOMContentLoaded", () => {
    function updateTimeAndDate() {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const timeString = `${hours}:${minutes}`;
        const day = String(now.getDate()).padStart(2, '0');
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const year = now.getFullYear();
        const dateString = `${day}/${month}/${year}`;

        document.getElementById('time').textContent = timeString;
        document.getElementById('date').textContent = dateString;
    }

    updateTimeAndDate();
    setInterval(updateTimeAndDate, 60000);
});
