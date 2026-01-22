// ==============================================================================================================================
// ==============================================     passphrase_dialog_box.js     ==============================================
// ==============================================================================================================================
"use strict";

// Assurez-vous d'avoir inclus iziToast dans votre projet
// <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/izitoast/dist/css/iziToast.min.css">
// <script src="https://cdn.jsdelivr.net/npm/izitoast/dist/js/iziToast.min.js"></script>

class PassphraseDialogBox

function createCustomDialog(title, placeholder, callback) {
    // Créer un ID unique pour éviter les conflits
    const dialogId = 'custom-dialog-' + Date.now();
    
    // Créer le HTML de la boîte de dialogue
    const dialogHTML = `
        <div id="${dialogId}" style="max-width: 400px; margin: 0 auto;">
            <div style="margin-bottom: 15px;">
                <input type="text" 
                       id="${dialogId}-input" 
                       placeholder="${placeholder || 'Saisissez votre texte...'}" 
                       style="width: calc(100% - 20px); 
                              padding: 10px; 
                              margin: 10px; 
                              border: 1px solid #ddd; 
                              border-radius: 4px; 
                              font-size: 14px; 
                              box-sizing: border-box;">
            </div>
            <div style="text-align: right; margin: 10px;">
                <button type="button" 
                        id="${dialogId}-cancel" 
                        style="padding: 8px 16px; 
                               margin-right: 10px; 
                               background: #f5f5f5; 
                               border: 1px solid #ddd; 
                               border-radius: 4px; 
                               cursor: pointer; 
                               font-size: 14px;">
                    Annuler
                </button>
                <button type="button" 
                        id="${dialogId}-validate" 
                        style="padding: 8px 16px; 
                               background: #4CAF50; 
                               color: white; 
                               border: none; 
                               border-radius: 4px; 
                               cursor: pointer; 
                               font-size: 14px;">
                    Valider
                </button>
            </div>
        </div>
    `;

    // Créer la boîte de dialogue iziToast
    const toast = iziToast.show({
        title: title || 'Boîte de dialogue',
        message: dialogHTML,
        position: 'center',
        timeout: false,
        close: false,
        drag: false,
        overlay: true,
        backgroundColor: '#fff',
        theme: 'light',
        displayMode: 'once',
        onOpening: function() {
            // Focus sur le champ de saisie
            setTimeout(() => {
                document.getElementById(`${dialogId}-input`).focus();
            }, 100);
            
            // Gestionnaire pour le bouton Valider
            document.getElementById(`${dialogId}-validate`).addEventListener('click', function() {
                const inputValue = document.getElementById(`${dialogId}-input`).value;
                iziToast.hide({}, toast);
                if (callback && typeof callback === 'function') {
                    callback(inputValue);
                }
            });
            
            // Gestionnaire pour le bouton Annuler
            document.getElementById(`${dialogId}-cancel`).addEventListener('click', function() {
                iziToast.hide({}, toast);
                if (callback && typeof callback === 'function') {
                    callback(null);
                }
            });
            
            // Valider avec la touche Entrée
            document.getElementById(`${dialogId}-input`).addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    document.getElementById(`${dialogId}-validate`).click();
                }
            });
            
            // Annuler avec la touche Échap
            document.addEventListener('keydown', function escapeHandler(e) {
                if (e.key === 'Escape') {
                    document.getElementById(`${dialogId}-cancel`).click();
                    document.removeEventListener('keydown', escapeHandler);
                }
            });
        }
    });
}



// Exemple d'utilisation :
document.getElementById('open-dialog-btn').addEventListener('click', function() {
    createCustomDialog(
        'Saisissez votre texte',
        'Entrez quelque chose ici...',
        function(result) {
            if (result !== null) {
                console.log('Texte saisi:', result);
                iziToast.success({
                    title: 'Succès',
                    message: 'Vous avez saisi : ' + result,
                    position: 'topRight'
                });
            } else {
                console.log('Action annulée');
                iziToast.info({
                    title: 'Info',
                    message: 'Action annulée',
                    position: 'topRight'
                });
            }
        }
    );
});