const toastQueue = [];
let currentToast = null;

export function showToast(message, duration = 3000, type = "info") {
    toastQueue.push({ message, duration, type });
    
    if (!currentToast) {
        displayNextToast();
    }
}

function displayNextToast() {
    if (toastQueue.length === 0) {
        currentToast = null;
        return;
    }

    const { message, duration, type } = toastQueue.shift();
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    currentToast = toast;

    setTimeout(() => toast.classList.add('toast-show'), 10);

    setTimeout(() => {
        toast.classList.remove('toast-show');
        setTimeout(() => {
            if (toast.parentElement) {
                toast.parentElement.removeChild(toast);
            }
            displayNextToast();
        }, 300);
    }, duration);
}

export const ToastType = {
    INFO: "info",
    SUCCESS: "success",
    WARNING: "warning",
    ERROR: "error",
    PARTY: "party"
};
