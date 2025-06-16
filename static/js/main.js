/**
 * Main JavaScript utilities for ShareMeal application
 * Handles common functionality and UI interactions
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize common functionality
    initializeTooltips();
    initializeDropdowns();
    initializeAlerts();
    initializeFormValidation();
    initializeTimeUpdates();
    
    // Initialize specific page functionality
    const currentPage = getCurrentPage();
    switch(currentPage) {
        case 'post-food':
            initializePostFoodPage();
            break;
        case 'register':
            initializeRegisterPage();
            break;
        case 'food-details':
            initializeFoodDetailsPage();
            break;
    }
});

/**
 * Initialize Bootstrap tooltips
 */
function initializeTooltips() {
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
}

/**
 * Initialize Bootstrap dropdowns
 */
function initializeDropdowns() {
    const dropdownElementList = [].slice.call(document.querySelectorAll('.dropdown-toggle'));
    dropdownElementList.map(function (dropdownToggleEl) {
        return new bootstrap.Dropdown(dropdownToggleEl);
    });
}

/**
 * Initialize alert auto-dismiss
 */
function initializeAlerts() {
    // Auto-dismiss alerts after 5 seconds
    const alerts = document.querySelectorAll('.alert:not(.alert-permanent)');
    alerts.forEach(alert => {
        setTimeout(() => {
            const bsAlert = new bootstrap.Alert(alert);
            bsAlert.close();
        }, 5000);
    });
}

/**
 * Initialize form validation
 */
function initializeFormValidation() {
    const forms = document.querySelectorAll('.needs-validation');
    forms.forEach(form => {
        form.addEventListener('submit', function(event) {
            if (!form.checkValidity()) {
                event.preventDefault();
                event.stopPropagation();
            }
            form.classList.add('was-validated');
        }, false);
    });
}

/**
 * Initialize time-based updates
 */
function initializeTimeUpdates() {
    // Update relative times every minute
    setInterval(() => {
        updateRelativeTimes();
        checkExpiringItems();
    }, 60000);
    
    // Initial update
    updateRelativeTimes();
    checkExpiringItems();
}

/**
 * Update relative time displays
 */
function updateRelativeTimes() {
    const timeElements = document.querySelectorAll('[data-timestamp]');
    timeElements.forEach(element => {
        const timestamp = new Date(element.dataset.timestamp);
        element.textContent = getRelativeTime(timestamp);
    });
}

/**
 * Check for expiring items and update UI
 */
function checkExpiringItems() {
    const expiryElements = document.querySelectorAll('[data-expiry]');
    expiryElements.forEach(element => {
        const expiryTime = new Date(element.dataset.expiry);
        const now = new Date();
        const timeDiff = expiryTime - now;
        
        // Update styling based on time remaining
        element.classList.remove('text-warning', 'text-danger');
        
        if (timeDiff < 0) {
            element.classList.add('text-danger');
            element.innerHTML = '<i class="fas fa-exclamation-triangle me-1"></i>Expired';
        } else if (timeDiff < 2 * 60 * 60 * 1000) { // Less than 2 hours
            element.classList.add('text-danger');
            element.innerHTML = `<i class="fas fa-clock me-1"></i>Expires in ${formatTimeRemaining(timeDiff)}`;
        } else if (timeDiff < 24 * 60 * 60 * 1000) { // Less than 24 hours
            element.classList.add('text-warning');
            element.innerHTML = `<i class="fas fa-clock me-1"></i>Expires in ${formatTimeRemaining(timeDiff)}`;
        }
    });
}

/**
 * Get current page identifier
 */
function getCurrentPage() {
    const path = window.location.pathname;
    if (path.includes('post-food')) return 'post-food';
    if (path.includes('register')) return 'register';
    if (path.includes('food/')) return 'food-details';
    return 'other';
}

/**
 * Initialize post food page functionality
 */
function initializePostFoodPage() {
    // Set minimum expiry time to current time + 1 hour
    const expiryInput = document.getElementById('expiry_time');
    if (expiryInput) {
        const now = new Date();
        now.setHours(now.getHours() + 1);
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
        expiryInput.min = now.toISOString().slice(0, 16);
        
        // Set default value to 4 hours from now
        const defaultExpiry = new Date();
        defaultExpiry.setHours(defaultExpiry.getHours() + 4);
        defaultExpiry.setMinutes(defaultExpiry.getMinutes() - defaultExpiry.getTimezoneOffset());
        if (!expiryInput.value) {
            expiryInput.value = defaultExpiry.toISOString().slice(0, 16);
        }
    }
    
    // Initialize address autocomplete
    initializeAddressAutocomplete();
}

/**
 * Initialize register page functionality
 */
function initializeRegisterPage() {
    // Pre-fill user type from URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    const userType = urlParams.get('type');
    const userTypeSelect = document.getElementById('user_type');
    
    if (userType && userTypeSelect) {
        userTypeSelect.value = userType;
    }
    
    // Initialize address autocomplete
    initializeAddressAutocomplete();
}

/**
 * Initialize food details page functionality
 */
function initializeFoodDetailsPage() {
    // Initialize request form if present
    const requestForm = document.getElementById('requestForm');
    if (requestForm) {
        requestForm.addEventListener('submit', function(e) {
            const submitBtn = requestForm.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Sending Request...';
        });
    }
}

/**
 * Initialize address autocomplete
 */
function initializeAddressAutocomplete() {
    const addressInputs = document.querySelectorAll('input[name="address"], input[name="pickup_location"]');
    
    if (typeof google !== 'undefined' && google.maps && google.maps.places) {
        addressInputs.forEach(input => {
            const autocomplete = new google.maps.places.Autocomplete(input, {
                types: ['address']
            });
            
            autocomplete.addListener('place_changed', function() {
                const place = autocomplete.getPlace();
                if (place.geometry) {
                    // Update hidden coordinate fields if they exist
                    const latInput = document.getElementById('latitude');
                    const lngInput = document.getElementById('longitude');
                    
                    if (latInput && lngInput) {
                        latInput.value = place.geometry.location.lat();
                        lngInput.value = place.geometry.location.lng();
                        
                        // Update status indicator
                        const statusElement = document.getElementById('locationStatus');
                        if (statusElement) {
                            statusElement.innerHTML = '<i class="fas fa-check text-success"></i> Location set from address';
                        }
                    }
                }
            });
        });
    }
}

/**
 * Get relative time string
 */
function getRelativeTime(date) {
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    
    return date.toLocaleDateString();
}

/**
 * Format time remaining
 */
function formatTimeRemaining(milliseconds) {
    const hours = Math.floor(milliseconds / (1000 * 60 * 60));
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
        return `${hours}h ${minutes}m`;
    } else {
        return `${minutes}m`;
    }
}

/**
 * Location utilities
 */
const LocationUtils = {
    /**
     * Get current user location
     */
    getCurrentLocation: function() {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Geolocation not supported'));
                return;
            }
            
            const options = {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 600000 // 10 minutes
            };
            
            navigator.geolocation.getCurrentPosition(resolve, reject, options);
        });
    },
    
    /**
     * Update location status indicator
     */
    updateLocationStatus: function(status, type = 'info') {
        const statusElement = document.getElementById('locationStatus');
        if (statusElement) {
            const icons = {
                loading: 'fas fa-spinner fa-spin',
                success: 'fas fa-check',
                error: 'fas fa-exclamation-triangle',
                info: 'fas fa-info-circle'
            };
            
            const colors = {
                loading: 'text-info',
                success: 'text-success',
                error: 'text-danger',
                info: 'text-info'
            };
            
            statusElement.innerHTML = `<i class="${icons[type]} ${colors[type]} me-1"></i>${status}`;
        }
    }
};

/**
 * Form utilities
 */
const FormUtils = {
    /**
     * Serialize form data to object
     */
    serializeForm: function(form) {
        const formData = new FormData(form);
        const data = {};
        
        for (let [key, value] of formData.entries()) {
            data[key] = value;
        }
        
        return data;
    },
    
    /**
     * Show form loading state
     */
    setFormLoading: function(form, loading = true) {
        const submitBtn = form.querySelector('button[type="submit"]');
        const inputs = form.querySelectorAll('input, select, textarea');
        
        if (loading) {
            submitBtn.disabled = true;
            submitBtn.dataset.originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Processing...';
            
            inputs.forEach(input => input.disabled = true);
        } else {
            submitBtn.disabled = false;
            submitBtn.innerHTML = submitBtn.dataset.originalText || 'Submit';
            
            inputs.forEach(input => input.disabled = false);
        }
    }
};

/**
 * UI utilities
 */
const UIUtils = {
    /**
     * Show toast notification
     */
    showToast: function(message, type = 'info') {
        // Create toast element if it doesn't exist
        let toastContainer = document.getElementById('toastContainer');
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.id = 'toastContainer';
            toastContainer.className = 'toast-container position-fixed top-0 end-0 p-3';
            toastContainer.style.zIndex = '9999';
            document.body.appendChild(toastContainer);
        }
        
        const toastId = 'toast-' + Date.now();
        const toastHtml = `
            <div id="${toastId}" class="toast" role="alert">
                <div class="toast-header">
                    <i class="fas fa-info-circle text-${type} me-2"></i>
                    <strong class="me-auto">ShareMeal</strong>
                    <button type="button" class="btn-close" data-bs-dismiss="toast"></button>
                </div>
                <div class="toast-body">
                    ${message}
                </div>
            </div>
        `;
        
        toastContainer.insertAdjacentHTML('beforeend', toastHtml);
        
        const toastElement = document.getElementById(toastId);
        const toast = new bootstrap.Toast(toastElement);
        toast.show();
        
        // Remove from DOM after it's hidden
        toastElement.addEventListener('hidden.bs.toast', function() {
            toastElement.remove();
        });
    },
    
    /**
     * Confirm action with modal
     */
    confirmAction: function(title, message, confirmText = 'Confirm', cancelText = 'Cancel') {
        return new Promise((resolve) => {
            // Create modal if it doesn't exist
            let confirmModal = document.getElementById('confirmModal');
            if (!confirmModal) {
                const modalHtml = `
                    <div class="modal fade" id="confirmModal" tabindex="-1">
                        <div class="modal-dialog">
                            <div class="modal-content">
                                <div class="modal-header">
                                    <h5 class="modal-title" id="confirmModalTitle"></h5>
                                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                                </div>
                                <div class="modal-body" id="confirmModalBody"></div>
                                <div class="modal-footer">
                                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" id="confirmModalCancel"></button>
                                    <button type="button" class="btn btn-primary" id="confirmModalConfirm"></button>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
                document.body.insertAdjacentHTML('beforeend', modalHtml);
                confirmModal = document.getElementById('confirmModal');
            }
            
            // Update modal content
            document.getElementById('confirmModalTitle').textContent = title;
            document.getElementById('confirmModalBody').textContent = message;
            document.getElementById('confirmModalCancel').textContent = cancelText;
            document.getElementById('confirmModalConfirm').textContent = confirmText;
            
            // Set up event listeners
            const confirmBtn = document.getElementById('confirmModalConfirm');
            const cancelBtn = document.getElementById('confirmModalCancel');
            
            const handleConfirm = () => {
                resolve(true);
                cleanupModal();
            };
            
            const handleCancel = () => {
                resolve(false);
                cleanupModal();
            };
            
            const cleanupModal = () => {
                confirmBtn.removeEventListener('click', handleConfirm);
                cancelBtn.removeEventListener('click', handleCancel);
                confirmModal.removeEventListener('hidden.bs.modal', handleCancel);
            };
            
            confirmBtn.addEventListener('click', handleConfirm);
            cancelBtn.addEventListener('click', handleCancel);
            confirmModal.addEventListener('hidden.bs.modal', handleCancel);
            
            // Show modal
            const modal = new bootstrap.Modal(confirmModal);
            modal.show();
        });
    }
};

// Make utilities available globally
window.LocationUtils = LocationUtils;
window.FormUtils = FormUtils;
window.UIUtils = UIUtils;

// Global functions for backward compatibility
window.getCurrentLocation = function() {
    LocationUtils.updateLocationStatus('Getting location...', 'loading');
    
    LocationUtils.getCurrentLocation()
        .then(position => {
            const latInput = document.getElementById('latitude');
            const lngInput = document.getElementById('longitude');
            
            if (latInput && lngInput) {
                latInput.value = position.coords.latitude;
                lngInput.value = position.coords.longitude;
                LocationUtils.updateLocationStatus('Location captured', 'success');
            }
        })
        .catch(error => {
            console.error('Geolocation error:', error);
            LocationUtils.updateLocationStatus('Location access denied', 'error');
        });
};

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { LocationUtils, FormUtils, UIUtils };
}
