// Contact Form Submission Handler
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('inquiryForm');
    const formMessage = document.getElementById('form-message');
    const submitBtn = document.getElementById('submit-btn');

    // Clear error messages
    function clearErrors() {
        document.querySelectorAll('.error-message').forEach(el => {
            el.textContent = '';
        });
    }

    // Show error message for a field
    function showError(fieldId, message) {
        const errorEl = document.getElementById(fieldId + '-error');
        if (errorEl) {
            errorEl.textContent = message;
        }
    }

    // Client-side validation
    function validateForm() {
        clearErrors();
        let isValid = true;

        const parentName = document.getElementById('parent-name').value.trim();
        const childName = document.getElementById('child-name').value.trim();
        const childAge = parseInt(document.getElementById('child-age').value);
        const email = document.getElementById('email').value.trim();
        const phone = document.getElementById('phone').value.trim();

        if (!parentName || parentName.length < 2) {
            showError('parent-name', 'Please enter parent/guardian name (at least 2 characters)');
            isValid = false;
        }

        if (!childName || childName.length < 2) {
            showError('child-name', 'Please enter child\'s name (at least 2 characters)');
            isValid = false;
        }

        if (!childAge || childAge < 2 || childAge > 12) {
            showError('child-age', 'Please enter a valid age between 2 and 12');
            isValid = false;
        }

        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            showError('email', 'Please enter a valid email address');
            isValid = false;
        }

        if (!phone || phone.length < 10) {
            showError('phone', 'Please enter a valid phone number');
            isValid = false;
        }

        return isValid;
    }

    if (form) {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Clear previous messages
            formMessage.textContent = '';
            formMessage.className = 'form-message';
            clearErrors();
            
            // Client-side validation
            if (!validateForm()) {
                formMessage.textContent = 'Please correct the errors in the form.';
                formMessage.className = 'form-message error';
                formMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                return;
            }
            
            // Disable submit button and add loading state
            submitBtn.disabled = true;
            submitBtn.classList.add('loading');
            submitBtn.textContent = 'Sending...';
            
            // Collect form data
            const formData = {
                parentName: document.getElementById('parent-name').value.trim(),
                childName: document.getElementById('child-name').value.trim(),
                childAge: parseInt(document.getElementById('child-age').value),
                email: document.getElementById('email').value.trim(),
                phone: document.getElementById('phone').value.trim(),
                preferredProgram: document.getElementById('interest').value,
                message: document.getElementById('message').value.trim()
            };
            
            try {
                // Determine API endpoint (use relative path in production)
                const apiUrl = window.location.hostname === 'localhost' 
                    ? 'http://localhost:3000/api/inquiry'
                    : '/api/inquiry';
                
                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData)
                });
                
                const data = await response.json();
                
                if (response.ok) {
                    // Success
                    formMessage.textContent = data.message || 'Thank you! Your inquiry has been sent successfully. We will contact you within 24 hours.';
                    formMessage.className = 'form-message success';
                    form.reset();
                    clearErrors();
                } else {
                    // Error from server
                    let errorMsg = data.error || 'There was an error sending your inquiry. Please try again.';
                    
                    // Handle validation errors from server
                    if (data.errors && Array.isArray(data.errors)) {
                        data.errors.forEach(err => {
                            const fieldName = err.param || err.field;
                            if (fieldName) {
                                const fieldId = fieldName.replace(/([A-Z])/g, '-$1').toLowerCase();
                                showError(fieldId, err.msg || err.message);
                            }
                        });
                        errorMsg = 'Please correct the errors in the form.';
                    }
                    
                    formMessage.textContent = errorMsg;
                    formMessage.className = 'form-message error';
                }
            } catch (error) {
                // Network or other error
                formMessage.textContent = 'Unable to send inquiry. Please check your connection and try again.';
                formMessage.className = 'form-message error';
                console.error('Error:', error);
            } finally {
                // Re-enable submit button and remove loading state
                submitBtn.disabled = false;
                submitBtn.classList.remove('loading');
                submitBtn.textContent = 'Send Inquiry';
                
                // Scroll to message
                formMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        });

        // Real-time validation on blur
        const inputs = form.querySelectorAll('input[required], select[required]');
        inputs.forEach(input => {
            input.addEventListener('blur', function() {
                if (this.value.trim() === '' && this.hasAttribute('required')) {
                    const fieldId = this.id;
                    showError(fieldId, 'This field is required');
                } else {
                    const errorEl = document.getElementById(this.id + '-error');
                    if (errorEl) {
                        errorEl.textContent = '';
                    }
                }
            });
        });
    }
});

