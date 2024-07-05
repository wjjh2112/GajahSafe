// Function to change language
function changeLanguage(lang) {
    localStorage.setItem('preferredLanguage', lang);
    loadLanguage(lang);
    document.getElementById('languageModal').style.display = "none"; // Hide modal after language change

    // Update button styles
    updateLanguageButtons(lang);
}

// Function to load language JSON
async function loadLanguage(lang) {
    try {
        const response = await fetch(`languages/${lang}.json`);
        const translations = await response.json();
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            if (translations[key]) {
                element.textContent = translations[key];
            }
        });
    } catch (error) {
        console.error('Error loading language:', error);
    }
}

// Function to load the preferred language from localStorage
function loadPreferredLanguage() {
    const preferredLanguage = localStorage.getItem('preferredLanguage') || 'ms';
    loadLanguage(preferredLanguage);
    updateLanguageButtons(preferredLanguage);
}

// Function to update language buttons styles
function updateLanguageButtons(lang) {
    const enButton = document.getElementById('langBtnEn');
    const msButton = document.getElementById('langBtnMs');

    if (lang === 'en') {
        enButton.classList.add('active-language');
        enButton.classList.remove('inactive-language');
        msButton.classList.add('inactive-language');
        msButton.classList.remove('active-language');
    } else if (lang === 'ms') {
        msButton.classList.add('active-language');
        msButton.classList.remove('inactive-language');
        enButton.classList.add('inactive-language');
        enButton.classList.remove('active-language');
    }
}

// Call this function on page load
document.addEventListener('DOMContentLoaded', () => {
    loadPreferredLanguage();

    // Get the modal
    var modal = document.getElementById("languageModal");

    // Get the button that opens the modal
    var btn = document.getElementById("languageSwitchBtn");

    // Get the button that close the modal
    var closeLanguageModal = document.getElementById("closeLanguageModal");
    

    closeLanguageModal.onclick = function() {
        languageModal.style.display = "none";
    };

    // When the user clicks the button, open the modal 
    btn.onclick = function() {
        modal.style.display = "block";
    }

    // When the user clicks on <span> (x), close the modal
    span.onclick = function() {
        modal.style.display = "none";
    }

    // When the user clicks anywhere outside of the modal, close it
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }
});
