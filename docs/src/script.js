const container = document.getElementById('button-container');
const menuToggle = document.getElementById('menuToggle');
const sidebar = document.getElementById('sidebar');
const themeSwitch = document.getElementById('themeSwitch');
const voiceSwitch = document.getElementById('voiceSwitch');

// --- SPRACH-ERKENNUNG (DEUTSCH / ENGLISCH) ---
// Erkennt die Systemsprache des Browsers (z.B. 'de', 'de-DE', 'en', 'en-US')
const userLang = (navigator.language || navigator.userLanguage).toLowerCase();
const isGerman = userLang.startsWith('de');

// Übersetzungsobjekt für die statischen Seitentexte
const translations = {
    de: {
        title: "ROBLOX MENÜ",
        lightmode: "Light Mode",
        voice: "Voice Sprachausgabe",
        copyright: "Alle Rechte vorbehalten.",
        error: "Fehler beim Laden. Starte das Projekt über einen lokalen Server (CORS)."
    },
    en: {
        title: "ROBLOX MENU",
        lightmode: "Light Mode",
        voice: "Voice Speech",
        copyright: "All rights reserved.",
        error: "Error loading content. Please start the project via a local server (CORS)."
    }
};

// Texte auf der Seite basierend auf der erkannten Sprache anpassen
const currentLang = isGerman ? 'de' : 'en';
document.getElementById('text-title').innerText = translations[currentLang].title;
document.getElementById('text-lightmode').innerText = translations[currentLang].lightmode;
document.getElementById('text-voice').innerText = translations[currentLang].voice;
document.getElementById('text-copyright').innerText = translations[currentLang].copyright;


// --- MENÜ (OPEN/CLOSE) LOGIK ---
menuToggle.addEventListener('click', () => {
    menuToggle.classList.toggle('open');
    sidebar.classList.toggle('open');
});

document.addEventListener('click', (e) => {
    if (!sidebar.contains(e.target) && !menuToggle.contains(e.target)) {
        menuToggle.classList.remove('open');
        sidebar.classList.remove('open');
    }
});

// --- SETTINGS (DARK/LIGHT & VOICE) LOGIK ---
const savedTheme = localStorage.getItem('theme') || 'dark';
const savedVoice = localStorage.getItem('voiceActive') !== 'false';

if (savedTheme === 'light') {
    document.documentElement.setAttribute('data-theme', 'light');
    themeSwitch.checked = true;
}
voiceSwitch.checked = savedVoice;

themeSwitch.addEventListener('change', () => {
    if (themeSwitch.checked) {
        document.documentElement.setAttribute('data-theme', 'light');
        localStorage.setItem('theme', 'light');
    } else {
        document.documentElement.removeAttribute('data-theme');
        localStorage.setItem('theme', 'dark');
    }
});

voiceSwitch.addEventListener('change', () => {
    localStorage.setItem('voiceActive', voiceSwitch.checked);
});

// --- BUTTON LADEN LOGIK ---
async function loadButtons() {
    try {
        const response = await fetch('./Data.json');
        
        if (!response.ok) {
            throw new Error('Fehler beim Laden');
        }
        
        const buttonData = await response.json();

        buttonData.forEach(item => {
            const btn = document.createElement('button');
            btn.className = 'roblox-btn';

            if (item.image && item.image.trim().length > 0) {
                const img = document.createElement('img');
                img.src = item.image;
                img.alt = item.text;
                btn.appendChild(img);
                btn.style.justifyContent = "flex-start";
            }

            const textSpan = document.createElement('span');
            textSpan.innerText = item.text;
            btn.appendChild(textSpan);

            btn.addEventListener('click', () => {
                const navigate = () => {
                    if (item.url && item.url.trim() !== "") {
                        window.location.href = item.url;
                    }
                };

                if (voiceSwitch.checked && 'speechSynthesis' in window && item.voice) {
                    window.speechSynthesis.cancel();

                    const utterance = new SpeechSynthesisUtterance(item.voice);
                    
                    // Passt das Vorlesen an: Deutsch bei deutscher Systemsprache, sonst Englisch
                    utterance.lang = isGerman ? 'de-DE' : 'en-US'; 
                    utterance.rate = 1.0;     
                    utterance.pitch = 0.8;    

                    utterance.onend = navigate;
                    setTimeout(navigate, 3000);

                    window.speechSynthesis.speak(utterance);
                } else {
                    navigate();
                }
            });

            container.appendChild(btn);
        });

    } catch (error) {
        console.error(error);
        container.innerHTML = `<p class="error-msg">${translations[currentLang].error}</p>`;
    }
}

loadButtons();
