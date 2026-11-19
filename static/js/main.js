// TestFusion Global UI Interactions
document.addEventListener('DOMContentLoaded', function() {
    // Auto-dismiss alerts after 5 seconds if desired
    const alerts = document.querySelectorAll('.alert');
    alerts.forEach(function(alert) {
        setTimeout(function() {
            if (alert && alert.parentElement) {
                alert.style.transition = 'opacity 0.4s ease';
                alert.style.opacity = '0';
                setTimeout(() => alert.remove(), 400);
            }
        }, 5000);
    });
});
