const SECURE_PASSWORD = "mike123"; // Mikes Admin Passwort
let isAdminActive = false;

// Standard-Fallback-Datenstruktur
let appData = {
    adminName: "Mike Weshlove",
    raenge: [
        { name: "Management", features: "Volle Rechte, administrative Weisungsbefugnis" },
        { name: "Partner Media", features: "Priorisierter Support, eigene Auto-Skins, Sponsoring-Pakete" },
        { name: "Underground Creator", features: "Keine Warteschlange beim Joinen, Streamer-Rolle auf Discord" }
    ],
    regeln: [
        "Backseat-Gaming und Meta-Gaming durch den Chat müssen aktiv unterbunden werden.",
        "OOC-Beleidigungen oder toxisches Verhalten im Stream führen zum sofortigen Entzug des Ranges.",
        "Server-Fehler (Bugs) dürfen im Stream nicht vorgeführt werden – direkte Meldung ans Management."
    ],
    medias: [
        { name: "Mike Weshlove", platform: "Twitch", rang: "Management" },
        { name: "GamerBro", platform: "YouTube", rang: "Partner Media" }
    ]
};

// LocalStorage Initialisierung
if (localStorage.getItem('mediaHubData')) {
    appData = JSON.parse(localStorage.getItem('mediaHubData'));
} else {
    saveDataToStorage();
}

function saveDataToStorage() {
    localStorage.setItem('mediaHubData', JSON.stringify(appData));
}

// Seitenwechsel-Logik (Single Page Application)
function switchPage(pageId, element) {
    document.querySelectorAll('.dashboard-page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    
    document.getElementById(`page-${pageId}`).classList.add('active');
    element.classList.add('active');
    
    const titles = { medias: "Medias Übersicht", raenge: "Ränge & Rechte", regeln: "Regelwerk" };
    document.getElementById('page-title').innerText = titles[pageId];
}

// Login Modal Steuerung
function openLoginModal() {
    if (isAdminActive) {
        isAdminActive = false;
        document.getElementById('login-btn').innerHTML = `<i class="fa-solid fa-lock"></i> Als Mike anmelden`;
        document.getElementById('login-btn').classList.remove('btn-danger');
        renderDashboard();
    } else {
        document.getElementById('login-modal').classList.add('active');
        document.getElementById('admin-password-input').focus();
    }
}

function closeLoginModal() {
    document.getElementById('login-modal').classList.remove('active');
    document.getElementById('admin-password-input').value = "";
}

function verifyAdminLogin() {
    const input = document.getElementById('admin-password-input').value;
    if (input === SECURE_PASSWORD) {
        isAdminActive = true;
        document.getElementById('login-btn').innerHTML = `<i class="fa-solid fa-lock-open"></i> Abmelden (Mike)`;
        document.getElementById('login-btn').classList.add('btn-danger');
        closeLoginModal();
        renderDashboard();
    } else {
        alert("Ungültiges Passwort! Zugriff verweigert.");
    }
}

// Dashboard Rendering-Engine
function renderDashboard() {
    // Admin Formular-Einblendungen
    document.querySelectorAll('.admin-form-block').forEach(block => {
        if (isAdminActive) block.classList.add('visible');
        else block.classList.remove('visible');
    });

    // Statistiken & Admin-Namen aktualisieren
    document.getElementById('stat-count-medias').innerText = appData.medias.length;
    document.getElementById('stat-count-raenge').innerText = appData.raenge.length;
    document.getElementById('stat-count-regeln').innerText = appData.regeln.length;
    document.getElementById('current-admin').innerText = appData.adminName;

    // 1. Tabelle: Medias zeichnen
    const tableBody = document.getElementById('table-body-medias');
    tableBody.innerHTML = "";
    appData.medias.forEach((m, idx) => {
        const platformClass = m.platform.toLowerCase();
        tableBody.innerHTML += `
            <tr>
                <td><strong>${m.name}</strong></td>
                <td><span class="platform-tag ${platformClass}">${m.platform}</span></td>
                <td>${m.rang}</td>
                <td class="action-cell ${isAdminActive ? 'visible' : ''}">
                    <button class="btn-icon-delete" onclick="removeItem('medias', ${idx})"><i class="fa-solid fa-trash-can"></i></button>
                </td>
            </tr>
        `;
    });

    // Dropdown-Liste für Ränge im Media-Formular neu aufbauen
    const rangSelect = document.getElementById('input-media-rang');
    rangSelect.innerHTML = "";
    appData.raenge.forEach(r => {
        rangSelect.innerHTML += `<option value="${r.name}">${r.name}</option>`;
    });

    // 2. Liste: Ränge zeichnen
    const listRaenge = document.getElementById('list-raenge');
    listRaenge.innerHTML = "";
    appData.raenge.forEach((r, idx) => {
        listRaenge.innerHTML += `
            <li>
                <div class="list-content">
                    <h4><i class="fa-solid fa-crown" style="color: gold; margin-right: 6px;"></i> ${r.name}</h4>
                    <p>${r.features}</p>
                </div>
                ${isAdminActive ? `<button class="btn-icon-delete" onclick="removeItem('raenge', ${idx})"><i class="fa-solid fa-trash-can"></i></button>` : ''}
            </li>
        `;
    });

    // 3. Liste: Regeln zeichnen
    const listRegeln = document.getElementById('list-regeln');
    listRegeln.innerHTML = "";
    appData.regeln.forEach((reg, idx) => {
        listRegeln.innerHTML += `
            <li>
                <div class="list-content">
                    <p><strong style="color: var(--accent); margin-right: 8px;">§${idx + 1}</strong> ${reg}</p>
                </div>
                ${isAdminActive ? `<button class="btn-icon-delete" onclick="removeItem('regeln', ${idx})"><i class="fa-solid fa-trash-can"></i></button>` : ''}
            </li>
        `;
    });
    
    // Tabellen-Aktions-Header (Löschen) ein- oder ausblenden
    document.querySelector('.head-action').style.display = isAdminActive ? 'table-cell' : 'none';
}

// SPEICHER-OPERATIONEN (ADMIN ONLY)
function submitMedia() {
    const name = document.getElementById('input-media-name').value.trim();
    const platform = document.getElementById('input-media-platform').value;
    const rang = document.getElementById('input-media-rang').value;

    if (!name) return alert("Bitte trag einen Namen ein.");
    appData.medias.push({ name, platform, rang });
    executeDataUpdate();
    document.getElementById('input-media-name').value = "";
}

function submitRang() {
    const name = document.getElementById('input-rang-name').value.trim();
    const features = document.getElementById('input-rang-features').value.trim();

    if (!name || !features) return alert("Bitte fülle alle Rang-Felder aus.");
    appData.raenge.push({ name, features });
    executeDataUpdate();
    document.getElementById('input-rang-name').value = "";
    document.getElementById('input-rang-features').value = "";
}

function submitRegel() {
    const text = document.getElementById('input-regel-text').value.trim();
    if (!text) return alert("Das Regelfeld darf nicht leer sein.");
    appData.regeln.push(text);
    executeDataUpdate();
    document.getElementById('input-regel-text').value = "";
}

function submitAdminName() {
    const newAdmin = document.getElementById('input-admin-name').value.trim();
    if (!newAdmin) return alert("Bitte gib einen Adminnamen ein.");
    appData.adminName = newAdmin;
    executeDataUpdate();
    document.getElementById('input-admin-name').value = "";
}

function removeItem(category, index) {
    if (confirm("Möchtest du diesen Eintrag wirklich unwiderruflich löschen?")) {
        appData[category].splice(index, 1);
        executeDataUpdate();
    }
}

function executeDataUpdate() {
    saveDataToStorage();
    renderDashboard();
}

// App initial starten
renderDashboard();
