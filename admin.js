document.addEventListener('DOMContentLoaded', () => {
    // ACTIVE DEPLOYMENT SCRIPT URL FROM USER
    const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxASk_xJADE3bvXtVr-jZj1_JG4q5uGYo41bogpZBwQhxq9_vD73lHiIGO1U4GuFi_z/exec'; 
    
    // Auth Nodes
    const loginGate = document.getElementById('loginGate');
    const dashboard = document.getElementById('dashboard');
    const loginForm = document.getElementById('adminLoginForm');
    
    // Database Storage Memory State
    let rawData = [];

    // Check Auto-auth from Session Cache Memory
    if (sessionStorage.getItem('metaAdmin') === '#meta') {
        showDashboard();
    }

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const user = document.getElementById('adminUsername').value;
        const pass = document.getElementById('adminPassword').value;

        // Hardcoded Credential Validation Layer
        if (user === 'meta' && pass === '#meta') {
            sessionStorage.setItem('metaAdmin', pass);
            document.getElementById('loginError').style.display = 'none';
            document.getElementById('adminPassword').value = '';
            showDashboard();
        } else {
            document.getElementById('loginError').style.display = 'block';
            document.getElementById('adminPassword').value = '';
        }
    });

    document.getElementById('logoutBtn').addEventListener('click', () => {
        sessionStorage.removeItem('metaAdmin');
        dashboard.style.display = 'none';
        loginGate.style.display = 'block';
    });

    function showDashboard() {
        loginGate.style.display = 'none';
        dashboard.style.display = 'flex';
        loadData();
    }

    document.getElementById('refreshBtn').addEventListener('click', loadData);

    async function loadData() {
        const tbody = document.getElementById('tableBody');
        tbody.innerHTML = '<tr><td colspan="7" class="loading-cell">Securely establishing proxy stream to Google Servers...</td></tr>';
        const refreshBtn = document.getElementById('refreshBtn');
        refreshBtn.innerText = 'Syncing...';
        
        try {
            // Using standard Fetch GET. Google natively handles cross origin wrapper outputs for doGet calls!
            const res = await fetch(SCRIPT_URL);
            const dataObj = await res.json();
            
            if (dataObj.result === 'success') {
                rawData = dataObj.data; // Capture sheet dump internally
                renderDashboard(rawData);
            } else {
                throw new Error("Bad Pipeline Status: " + dataObj.error);
            }
        } catch (e) {
            console.error("Pipeline Warning: ", e);
            tbody.innerHTML = `<tr><td colspan="7" class="loading-cell" style="color:#fecaca!important">Server Blocked Data Extrapolation - Review console for error details.</td></tr>`;
        } finally {
            refreshBtn.innerText = '↺ Refresh Lead Sync';
        }
    }

    function renderDashboard(dataArray) {
        // Computational Mathematics Layer
        let stats = {
            total: dataArray.length,
            dm: 0, gd: 0, wd: 0, cc: 0, others: 0,
            students: 0, workers: 0
        };

        dataArray.forEach(item => {
            const intRaw = String(item.interest || '').trim();
            if (intRaw === 'Digital Marketing') stats.dm++;
            else if (intRaw === 'Graphic Designing') stats.gd++;
            else if (intRaw === 'Web Development') stats.wd++;
            else if (intRaw === 'Content Creation') stats.cc++;
            else if (intRaw === 'Others') stats.others++;
            
            const statusRaw = String(item.status || '').trim();
            if (statusRaw === 'Student') stats.students++;
            else if (statusRaw === 'Working Pro') stats.workers++;
        });

        // DOM Mapping Overwrites
        document.getElementById('stat-total').textContent = stats.total;
        
        // Counter Animations via intervals 
        animateValue('stat-dm', stats.dm);
        animateValue('stat-gd', stats.gd);
        animateValue('stat-wd', stats.wd);
        animateValue('stat-cc', stats.cc);
        animateValue('stat-others', stats.others);
        animateValue('stat-students', stats.students);
        animateValue('stat-workers', stats.workers);

        renderTable(dataArray);
    }
    
    function animateValue(id, endValue) {
        const obj = document.getElementById(id);
        obj.innerHTML = 0;
        let startTimestamp = null;
        const duration = 800; // ms
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            obj.innerHTML = Math.floor(progress * endValue);
            if (progress < 1) {
                window.requestAnimationFrame(step);
            } else {
                obj.innerHTML = endValue;
            }
        };
        window.requestAnimationFrame(step);
    }

    function renderTable(dataArray) {
        const tbody = document.getElementById('tableBody');
        if (dataArray.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="loading-cell">No subscriber history active.</td></tr>';
            return;
        }

        // Reversal sorts display (newest submissions map to the highest ID) output
        const sortedDesc = [...dataArray].reverse();

        let html = '';
        sortedDesc.forEach(item => {
            // Safe logic for bad timestamping
            let friendlyDate = '-';
            if (item.timestamp) {
                friendlyDate = new Date(item.timestamp).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit'});
            }

            const statusBadge = item.status === 'Student' 
                ? `<span class="badge primary">Student</span>` 
                : `<span class="badge secondary">Working Pro</span>`;
                
            let cleanedWA = (item.whatsapp || '').toString();
            if (cleanedWA.length > 5) {
                cleanedWA = `+91 ` + cleanedWA.replace(/\D/g,'').slice(-10); // Standardize output visualization
            }
            
            html += `
                <tr>
                    <td style="color:var(--text-muted)">${friendlyDate}</td>
                    <td><strong>${item.name || '-'}</strong></td>
                    <td><a href="tel:${item.whatsapp}" style="color:var(--primary);text-decoration:none;">${item.whatsapp || '-'}</a></td>
                    <td>${item.place || '-'}</td>
                    <td>${statusBadge} <br><small style="color:var(--text-muted);display:block;margin-top:4px;">${item.context_field || ''}</small></td>
                    <td style="font-weight:500;">${item.interest || '-'}</td>
                    <td style="max-width:220px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; color:var(--text-muted);" title="${item.knowledge}">${item.knowledge || '-'}</td>
                    <td>
                        <button class="action-btn danger mini delete-row-btn" data-row="${item.row_index}" title="Remove Entry">✕</button>
                    </td>
                </tr>
            `;
        });
        tbody.innerHTML = html;

        // Attach local targeted deletion mappings
        document.querySelectorAll('.delete-row-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                if(confirm('Acknowledge: Are you certain you want to permanently delete this specific record from your servers?')) {
                    const exactRowMap = btn.getAttribute('data-row');
                    const stashHtml = btn.innerHTML;
                    btn.innerHTML = '...';
                    btn.disabled = true;

                    const rowFormData = new FormData();
                    rowFormData.append('action', 'delete_row');
                    rowFormData.append('password', '#meta');
                    rowFormData.append('row_index', exactRowMap);

                    try {
                        await fetch(SCRIPT_URL, {
                            method: 'POST',
                            body: rowFormData,
                            mode: 'no-cors'
                        });

                        alert('Entity manually disconnected. Dashboard resyncing.');
                        loadData(); // Recompute whole table
                    } catch (err) {
                        alert('Entity termination failed to resolve.');
                        btn.innerHTML = stashHtml;
                        btn.disabled = false;
                    }
                }
            });
        });
    }

    // Compound Client-side Search Engine Map Filter (Text + Dropdown)
    function applyDataFilters() {
        const queryTerm = document.getElementById('searchInput').value.toLowerCase().trim();
        const categorySelection = document.getElementById('categoryFilter').value;

        const filteredArrayObj = rawData.filter(item => {
            // First pass: Category Sorting Match
            let passesCategory = true;
            if (categorySelection !== 'All') {
                passesCategory = (item.interest === categorySelection);
            }

            // Second pass: Text Free-form Query Match
            let passesText = true;
            if (queryTerm !== '') {
                passesText = (item.name && item.name.toLowerCase().includes(queryTerm)) ||
                             (item.whatsapp && String(item.whatsapp).toLowerCase().includes(queryTerm)) ||
                             (item.place && item.place.toLowerCase().includes(queryTerm)) ||
                             (item.context_field && item.context_field.toLowerCase().includes(queryTerm)) ||
                             (item.interest && item.interest.toLowerCase().includes(queryTerm));
            }

            return passesCategory && passesText;
        });

        window.activeFilteredData = filteredArrayObj; // Bind to global state for VCF exports
        renderTable(filteredArrayObj);
    }

    document.getElementById('searchInput').addEventListener('input', applyDataFilters);
    document.getElementById('categoryFilter').addEventListener('change', applyDataFilters);

    // Wipe Security Wipe Protection Pipeline
    document.getElementById('clearDataBtn').addEventListener('click', async () => {
        // High alert blocker verification to stop accidental presses
        if(confirm('SECURITY ALERT: Are you completely certain you want to purge all active lead logs from your targeted servers? This is absolutely non-reversible.')) {
            
            const btn = document.getElementById('clearDataBtn');
            const cachedString = btn.innerHTML;
            btn.textContent = 'Command Verifying...';
            btn.disabled = true;

            const secureFormData = new FormData();
            secureFormData.append('action', 'clear');
            secureFormData.append('password', '#meta'); // Verification payload

            try {
                // Post command logic. no-cors disables reading JSON block.
                await fetch(SCRIPT_URL, {
                    method: 'POST',
                    body: secureFormData,
                    mode: 'no-cors'
                });
                
                // Set explicit timeout block. Google requires physical server time to compute deletion loops
                setTimeout(() => {
                    alert('Command effectively relayed successfully. System will attempt reload sequence now.');
                    btn.innerHTML = cachedString;
                    btn.disabled = false;
                    loadData();
                    document.getElementById('searchInput').value = '';
                }, 2000);

            } catch (e) {
                alert('Pipeline Failure Disconnection Warning.');
                btn.innerHTML = cachedString;
                btn.disabled = false;
            }
        }
    });

    // Universally Standardized VCF Execution Format Logic
    document.getElementById('downloadVcfBtn').addEventListener('click', () => {
        // Pull current active table dataset to ensure we only export filtered views!
        const targetData = window.activeFilteredData || rawData;
        
        if(targetData.length === 0) {
            return alert('Data mapping extraction requires an active data volume baseline.');
        }
        
        const prefixVal = document.getElementById('vcfPrefix').value.trim();
        let vcfBody = "";
        
        targetData.forEach(item => {
            // Null check bypass for corrupt entries missing essential properties
            if(!item.name || !item.whatsapp) return;
            
            // Generate prefix logic
            const spacedPrefix = prefixVal ? `${prefixVal} ` : '';
            const finalName = `${spacedPrefix}${item.name} - ${item.place || 'Unknown Location'}`;
            
            // Clean number specifically
            const phone = String(item.whatsapp).replace(/[^0-9+]/g, '');
            const title = item.job_title || item.study_type || item.status || 'Member';
            
            // Generate standard compliant array map payload string architecture
            vcfBody += `BEGIN:VCARD\r\nVERSION:3.0\r\nFN:${finalName}\r\nTEL;TYPE=CELL:${phone}\r\nORG:Meta Ads Community\r\nTITLE:${title}\r\nNOTE:${item.interest}\r\nEND:VCARD\r\n`;
        });

        // Trigger memory blob compiler execution block
        const blobCache = new Blob([vcfBody], {type: "text/vcard"});
        const dynamicWinURL = window.URL || window.webkitURL;
        const blobURLOutput = dynamicWinURL.createObjectURL(blobCache);
        
        // Native auto-clicker download stream
        const anchorRelay = document.createElement("a");
        anchorRelay.style.display = "none";
        anchorRelay.href = blobURLOutput;
        anchorRelay.download = `Filtered_Contacts_Extraction_${new Date().toISOString().split('T')[0]}.vcf`;
        document.body.appendChild(anchorRelay);
        anchorRelay.click();
        
        // Cleanup cache layer
        setTimeout(() => {
            document.body.removeChild(anchorRelay);
            dynamicWinURL.revokeObjectURL(blobURLOutput);
        }, 200);
    });
});
