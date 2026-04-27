document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('joinForm');
    const successMessage = document.getElementById('successMessage');
    const formWrapper = document.querySelector('.form-wrapper');

    // Status Field Toggling
    const statusStudent = document.getElementById('status-student');
    const statusWorking = document.getElementById('status-working');
    const fieldStudy = document.getElementById('field-study-topic');
    const fieldJob = document.getElementById('field-job-title');
    const fieldExpertise = document.getElementById('expertise-section');
    const inputStudy = document.getElementById('studyType');
    const inputJob = document.getElementById('jobTitle');

    const toggleStatusFields = () => {
        if (!statusStudent || !fieldStudy) return;
        if (statusStudent.checked) {
            fieldStudy.style.display = 'block';
            fieldJob.style.display = 'none';
            if (fieldExpertise) fieldExpertise.style.display = 'none';
            inputStudy.required = true;
            inputJob.required = false;
        } else {
            fieldStudy.style.display = 'none';
            fieldJob.style.display = 'block';
            if (fieldExpertise) fieldExpertise.style.display = '';
            inputStudy.required = false;
            inputJob.required = true;
        }
    };

    if (statusStudent && statusWorking) {
        statusStudent.addEventListener('change', toggleStatusFields);
        statusWorking.addEventListener('change', toggleStatusFields);
        toggleStatusFields(); // Run once to set initial state
    }

    // Custom Dropdown Logic
    const dropdown = document.getElementById('interestDropdown');
    
    if (dropdown) {
        const dropdownHeader = dropdown.querySelector('.dropdown-header');
        const dropdownList = dropdown.querySelector('.dropdown-list');
        const hiddenInput = document.getElementById('primaryInterestValue');
        const selectedValue = dropdown.querySelector('.selected-value');

        // Toggle dropdown
        dropdownHeader.addEventListener('click', () => {
            dropdown.classList.toggle('open');
        });

        // Handle selection
        dropdownList.querySelectorAll('li').forEach(item => {
            item.addEventListener('click', () => {
                // Remove previous selection
                dropdownList.querySelectorAll('li').forEach(li => li.classList.remove('selected'));
                
                // Add new selection
                item.classList.add('selected');
                const val = item.getAttribute('data-value');
                hiddenInput.value = val;
                selectedValue.textContent = val;
                
                dropdown.classList.add('has-value');
                dropdown.classList.remove('open');
            });
        });

        // Close when clicking outside
        document.addEventListener('click', (e) => {
            if (!dropdown.contains(e.target)) {
                dropdown.classList.remove('open');
            }
        });
    }

    // Form submission handling
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        // Get values for processing if needed
        const formData = new FormData(form);
        
        // Convert knowledge array into comma separated string for Google Sheets & WhatsApp
        const knowledgeItems = formData.getAll('knowledge');
        formData.set('knowledge', knowledgeItems.join(', '));
        
        const dataObj = Object.fromEntries(formData.entries());
        console.log('Submission Data:', dataObj);

        // WhatsApp message construction
        let waText = `*New Community Application*\n\n`;
        waText += `*Name:* ${dataObj.name}\n`;
        waText += `*WhatsApp:* +91 ${dataObj.whatsapp}\n`;
        waText += `*Location:* ${dataObj.place}\n`;
        waText += `*Status:* ${dataObj.status}\n`;
        if (dataObj.status === 'Student') {
            waText += `*Studying:* ${dataObj.study_type}\n`;
        } else {
            waText += `*Job Title:* ${dataObj.job_title}\n`;
            if (dataObj.knowledge) {
                waText += `*Expertise:* ${dataObj.knowledge}\n`;
            }
        }
        waText += `*Interest:* ${dataObj.primary_interest}\n`;

        const waUrl = `https://wa.me/917994219772?text=${encodeURIComponent(waText)}`;

        // Loading state
        const btn = document.getElementById('submitBtn');
        const originalContent = btn.innerHTML;
        btn.style.pointerEvents = 'none';
        btn.innerHTML = `
            <svg viewBox="0 0 50 50" style="width:24px;height:24px;animation:rotateBtn 2s linear infinite;">
                <circle cx="25" cy="25" r="20" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round" style="stroke-dasharray:1,200;stroke-dashoffset:0;animation:dashBtn 1.5s ease-in-out infinite;"></circle>
            </svg>
            <span class="btn-text">Processing...</span>
        `;
        
        // CSS for spinner injection
        if(!document.getElementById('spinner-anim')) {
            const style = document.createElement('style');
            style.id = 'spinner-anim';
            style.innerHTML = `
                @keyframes rotateBtn { 100% { transform: rotate(360deg); } }
                @keyframes dashBtn {
                    0% { stroke-dasharray: 1, 200; stroke-dashoffset: 0; }
                    50% { stroke-dasharray: 89, 200; stroke-dashoffset: -35px; }
                    100% { stroke-dasharray: 89, 200; stroke-dashoffset: -124px; }
                }
            `;
            document.head.appendChild(style);
        }

        // Send to Google Sheets Web App URL
        const scriptURL = 'https://script.google.com/macros/s/AKfycbxASk_xJADE3bvXtVr-jZj1_JG4q5uGYo41bogpZBwQhxq9_vD73lHiIGO1U4GuFi_z/exec';
        
        fetch(scriptURL, { 
            method: 'POST', 
            body: formData,
            mode: 'no-cors'
        })
        .then(() => {
            // Show success modal
            successMessage.classList.add('active');
            
            // Redirect to WhatsApp directly using window location to bypass popup blockers
            window.location.href = waUrl;
            
            // Revert button state and reset form
            setTimeout(() => {
                form.reset();
                if(typeof toggleStatusFields !== 'undefined') toggleStatusFields();
                
                // Clear custom dropdown state
                if (typeof dropdown !== 'undefined' && dropdown) {
                    dropdown.classList.remove('has-value', 'open');
                    const selectedValue = dropdown.querySelector('.selected-value');
                    if (selectedValue) selectedValue.textContent = '';
                    dropdown.querySelectorAll('li').forEach(li => li.classList.remove('selected'));
                    const hiddenInput = document.getElementById('primaryInterestValue');
                    if (hiddenInput) hiddenInput.value = '';
                }

                btn.innerHTML = originalContent;
                btn.style.pointerEvents = 'auto';
                
                // Reset inputs floating label state
                document.querySelectorAll('.input-group input').forEach(input => {
                    input.blur();
                });
            }, 1000);
        })
        .catch(error => {
            console.error('Submission Error:', error);
            // Fallback immediately to whatsapp over manual navigation
            window.location.href = waUrl;
            
            btn.innerHTML = originalContent;
            btn.style.pointerEvents = 'auto';
        });
    });

    // Make pills clickable via keyboard for accessibility
    const checkboxes = document.querySelectorAll('.custom-checkbox input');
    checkboxes.forEach(cb => {
        cb.addEventListener('keydown', (e) => {
            if(e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                cb.checked = !cb.checked;
            }
        });
    });
});
