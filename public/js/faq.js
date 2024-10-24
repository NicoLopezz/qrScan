document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll('.faq-question').forEach(question => {
        question.addEventListener('click', function() {
            const faqItem = this.parentNode;
            const answer = faqItem.querySelector('.faq-answer');
            const icon = this.querySelector('i');

            faqItem.classList.toggle('active');
            if (faqItem.classList.contains('active')) {
                answer.style.display = 'block';
                icon.classList.replace('fa-chevron-down', 'fa-chevron-up');
            } else {
                answer.style.display = 'none';
                icon.classList.replace('fa-chevron-up', 'fa-chevron-down');
            }
        });
    });
});
