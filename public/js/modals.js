document.addEventListener('DOMContentLoaded', () => {
    const gameCanvas = document.getElementById("game");

    const shopModal = document.querySelector('.btn-map.shop');
    const partyModal = document.querySelector('.btn-map.party');
    const helpModal = document.querySelector('.btn-map.help');

    function openModal(selector) {
        const modal = document.querySelector(selector);
        modal.style.display = 'flex';
        gameCanvas.focus();
    }

    shopModal.addEventListener('click', () => openModal('.modal.shop'));
    partyModal.addEventListener('click', () => openModal('.modal.party'));
    helpModal.addEventListener('click', () => openModal('.modal.help'));

    const closeButtons = document.querySelectorAll('.modal .close-btn');
    closeButtons.forEach(button => {
        button.addEventListener('click', () => {
            const modal = button.closest('.modal');
            modal.style.display = 'none';
            gameCanvas.focus();
        });
    });

    const modals = document.querySelectorAll('.modal');

    modals.forEach(modal => {
        modal.addEventListener('mousedown', (e) => {
            if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
                e.preventDefault();
            }
            gameCanvas.focus();
        });

        const header = modal.querySelector('.modal-header');
        if (!header) return;

        let isDragging = false;
        let startX, startY, initialLeft, initialTop;

        header.addEventListener('mousedown', (e) => {
            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;

            const rect = modal.getBoundingClientRect();
            initialLeft = rect.left;
            initialTop = rect.top;

            document.querySelectorAll('.modal').forEach(m => m.style.zIndex = "1000");
            modal.style.zIndex = "1001";
        });

        window.addEventListener('mousemove', (e) => {
            if (!isDragging) return;

            const dx = e.clientX - startX;
            const dy = e.clientY - startY;

            modal.style.left = `${initialLeft + dx}px`;
            modal.style.top = `${initialTop + dy}px`;
        });

        window.addEventListener('mouseup', () => {
            isDragging = false;
        });
    });
});