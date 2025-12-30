document.addEventListener('DOMContentLoaded', () => {
    const gameCanvas = document.getElementById("game");

    const shopModal = document.querySelector('.btn-map.shop');

    function openModal(selector) {
        const modal = document.querySelector(selector);
        modal.style.display = 'flex';
        gameCanvas.focus();
    }

    shopModal.addEventListener('click', () => openModal('.modal.shop'));

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
            const isFormField = e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA';
            if (!isFormField) {
                e.preventDefault();
                gameCanvas.focus();
            }
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

    function activateTab(group, target) {
        const buttons = group.querySelectorAll('[data-tab-target]');
        const panels = group.querySelectorAll('[data-tab-panel]');

        buttons.forEach(btn => {
            const isActive = btn.dataset.tabTarget === target;
            btn.classList.toggle('is-active', isActive);
        });

        panels.forEach(panel => {
            const isVisible = panel.dataset.tabPanel === target;
            panel.hidden = !isVisible;
        });
    }

    function setupTabs() {
        const tabGroups = document.querySelectorAll('[data-tabs]');

        tabGroups.forEach(group => {
            const buttons = group.querySelectorAll('[data-tab-target]');
            if (!buttons.length) return;

            buttons.forEach(button => {
                button.addEventListener('click', (e) => {
                    e.preventDefault();
                    const target = button.dataset.tabTarget;
                    activateTab(group, target);
                });
            });

            const initial = group.querySelector('[data-tab-target].is-active');
            if (initial) {
                activateTab(group, initial.dataset.tabTarget);
            } else if (buttons.length > 0) {
                activateTab(group, buttons[0].dataset.tabTarget);
            }
        });
    }

    setupTabs();
});