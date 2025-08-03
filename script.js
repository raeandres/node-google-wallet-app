document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('passForm');
    const resultDiv = document.getElementById('result');
    
    // Form elements
    const guestNameInput = document.getElementById('guestName');
    const guestTypeSelect = document.getElementById('guestType');
    const companionsInput = document.getElementById('companions');
    const unitInput = document.getElementById('unit');
    const roomInput = document.getElementById('room');
    const parkingInput = document.getElementById('parking');
    const checkInInput = document.getElementById('checkIn');
    const checkOutInput = document.getElementById('checkOut');
    const petSelect = document.getElementById('pet');
    const amenitiesSelect = document.getElementById('amenities');
    
    // Preview elements
    const previewGuestName = document.getElementById('previewGuestName');
    const previewSubheader = document.getElementById('previewSubheader');
    const previewCompanions = document.getElementById('previewCompanions');
    const previewUnit = document.getElementById('previewUnit');
    const previewRoom = document.getElementById('previewRoom');
    const previewParking = document.getElementById('previewParking');
    const previewCheckIn = document.getElementById('previewCheckIn');
    const previewCheckOut = document.getElementById('previewCheckOut');
    const previewPet = document.getElementById('previewPet');
    const previewAmenities = document.getElementById('previewAmenities');
    
    // Format date for display
    function formatDate(dateString) {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: '2-digit',
            day: '2-digit',
            year: '2-digit'
        });
    }
    
    // Update preview in real-time
    function updatePreview() {
        previewGuestName.textContent = guestNameInput.value || 'Guest Name';
        previewSubheader.textContent = guestTypeSelect.value || 'Guest';
        previewCompanions.textContent = companionsInput.value || '0';
        previewUnit.textContent = unitInput.value || 'N/A';
        previewRoom.textContent = roomInput.value || 'N/A';
        previewParking.textContent = parkingInput.value || 'N/A';
        previewCheckIn.textContent = formatDate(checkInInput.value);
        previewCheckOut.textContent = formatDate(checkOutInput.value);
        previewPet.textContent = petSelect.value || 'NO';
        previewAmenities.textContent = amenitiesSelect.value || 'NO';
    }
    
    // Add event listeners for real-time preview updates
    [guestNameInput, guestTypeSelect, companionsInput, unitInput, roomInput, parkingInput, 
     checkInInput, checkOutInput, petSelect, amenitiesSelect].forEach(element => {
        element.addEventListener('input', updatePreview);
        element.addEventListener('change', updatePreview);
    });
    
    // Set default dates (today and tomorrow)
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    checkInInput.value = today.toISOString().split('T')[0];
    checkOutInput.value = tomorrow.toISOString().split('T')[0];
    updatePreview();
    
    // Form submission
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const submitBtn = form.querySelector('.submit-btn');
        const resultDiv = document.getElementById('result');
        
        // Show loading state
        submitBtn.disabled = true;
        submitBtn.textContent = 'Creating Pass...';
        resultDiv.style.display = 'none';
        
        try {
            // Collect form data
            const formData = new FormData(form);
            const userData = {};
            
            for (let [key, value] of formData.entries()) {
                if (key === 'petsAllowed' || key === 'amenitiesAccess') {
                    userData[key] = value === 'on';
                } else {
                    userData[key] = value || '';
                }
            }
            
            // Handle checkboxes that might not be in FormData if unchecked
            userData.petsAllowed = form.querySelector('#petsAllowed').checked;
            userData.amenitiesAccess = form.querySelector('#amenitiesAccess').checked;
            
            console.log('Sending user data:', userData);
            
            // Validate required fields on client side
            if (!userData.guestName || !userData.unitName) {
                throw new Error('Please fill in Guest Name and Unit Name fields');
            }
            
            // Format dates for the pass
            if (userData.checkIn) {
                userData.checkIn = formatDate(userData.checkIn);
            }
            if (userData.checkOut) {
                userData.checkOut = formatDate(userData.checkOut);
            }
            
            // Send request to server
            const response = await fetch('/api/create-pass', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData)
            });
            
            // Check if response is ok
            if (!response.ok) {
                const errorText = await response.text();
                console.error('Response not ok:', response.status, errorText);
                throw new Error(`Server error: ${response.status} - ${errorText}`);
            }
            
            // Check if response is JSON
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                const htmlResponse = await response.text();
                console.error('Expected JSON but got:', htmlResponse.substring(0, 200));
                throw new Error('Server returned HTML instead of JSON. Check server logs.');
            }
            
            const result = await response.json();
            
            if (result.success) {
                resultDiv.className = 'result success';
                resultDiv.innerHTML = `
                    <h3>✅ Pass Created Successfully!</h3>
                    <p>Your digital pass has been generated.</p>
                    <a href="${result.saveUrl}" target="_blank" class="wallet-button">
                        Add to Google Wallet
                    </a>
                    <div style="margin-top: 15px; font-size: 0.9rem; color: #666;">
                        <details>
                            <summary>Pass Details (for debugging)</summary>
                            <pre style="text-align: left; margin-top: 10px; background: #f5f5f5; padding: 10px; border-radius: 4px; overflow-x: auto;">${JSON.stringify(result.object, null, 2)}</pre>
                        </details>
                    </div>
                `;
            } else {
                throw new Error(result.error || 'Failed to create pass');
            }
            
        } catch (error) {
            console.error('Error:', error);
            resultDiv.className = 'result error';
            resultDiv.innerHTML = `
                <h3>❌ Error Creating Pass</h3>
                <p>${error.message}</p>
                <p style="font-size: 0.9rem; margin-top: 10px;">
                    Make sure your server environment variables are properly configured.
                </p>
            `;
        } finally {
            // Reset button state
            submitBtn.disabled = false;
            submitBtn.textContent = 'Create Google Wallet Pass';
            resultDiv.style.display = 'block';
        }
    });
    
    // Validate check-out date is after check-in date
    function validateDates() {
        const checkIn = new Date(checkInInput.value);
        const checkOut = new Date(checkOutInput.value);
        
        if (checkIn && checkOut && checkOut <= checkIn) {
            checkOutInput.setCustomValidity('Check-out date must be after check-in date');
        } else {
            checkOutInput.setCustomValidity('');
        }
    }
    
    checkInInput.addEventListener('change', validateDates);
    checkOutInput.addEventListener('change', validateDates);
});
