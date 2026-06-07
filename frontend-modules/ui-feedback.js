(function () {
    function getToastRegion() {
        return document.getElementById('toastRegion');
    }

    function showToast(message, type = 'info') {
        const region = getToastRegion();
        if (!region) return;

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.setAttribute('role', type === 'error' ? 'alert' : 'status');
        toast.textContent = message;
        region.appendChild(toast);

        window.setTimeout(() => {
            toast.classList.add('toast-leaving');
            toast.addEventListener('animationend', () => toast.remove(), { once: true });
        }, 3600);
    }

    function confirmAction(message, options = {}) {
        const dialog = document.getElementById('confirmDialog');
        const messageEl = document.getElementById('confirmDialogMessage');
        const confirmBtn = document.getElementById('confirmDialogConfirm');
        const cancelBtn = document.getElementById('confirmDialogCancel');
        if (!dialog || !messageEl || !confirmBtn || !cancelBtn) {
            showToast(message, 'info');
            return Promise.resolve(false);
        }

        messageEl.textContent = message;
        confirmBtn.textContent = options.confirmText || '确认';
        cancelBtn.textContent = options.cancelText || '取消';
        dialog.classList.remove('hidden');
        confirmBtn.focus();

        return new Promise((resolve) => {
            function cleanup(result) {
                dialog.classList.add('hidden');
                confirmBtn.removeEventListener('click', onConfirm);
                cancelBtn.removeEventListener('click', onCancel);
                dialog.removeEventListener('click', onBackdrop);
                document.removeEventListener('keydown', onKeydown);
                resolve(result);
            }

            function onConfirm() {
                cleanup(true);
            }

            function onCancel() {
                cleanup(false);
            }

            function onBackdrop(event) {
                if (event.target === dialog) cleanup(false);
            }

            function onKeydown(event) {
                if (event.key === 'Escape') cleanup(false);
            }

            confirmBtn.addEventListener('click', onConfirm);
            cancelBtn.addEventListener('click', onCancel);
            dialog.addEventListener('click', onBackdrop);
            document.addEventListener('keydown', onKeydown);
        });
    }

    window.MemoryFeedback = {
        showToast,
        confirmAction
    };
})();
