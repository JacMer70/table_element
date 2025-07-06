document.addEventListener('DOMContentLoaded', () => {
    // Sélectionne tous les champs de saisie pour le filtrage
    const filterInputs = document.querySelectorAll('.filter-input');
    // Sélectionne toutes les lignes (tr) dans le corps du tableau
    let tableRows = document.querySelectorAll('#data-table tbody tr'); // On utilise 'let' car la liste des lignes va changer


    /**
     * Fonction pour filtrer le tableau en fonction des valeurs des champs de saisie.
     */
    function filterTable() {
        // Crée un tableau des valeurs de filtre, converties en minuscules pour une comparaison insensible à la casse.
        const filterValues = Array.from(filterInputs).map(input => input.value.toLowerCase());

        // Parcourt chaque ligne du tableau
        tableRows.forEach(row => {
            // Récupère toutes les cellules (td) de la ligne actuelle
            const cells = row.querySelectorAll('td');
            let rowIsVisible = true;

            // Parcourt chaque cellule de la ligne pour la comparer au filtre correspondant
            for (let i = 0; i < cells.length; i++) {
                const cellText = cells[i].textContent.toLowerCase();
                const filterText = filterValues[i];

                // Si le texte du filtre n'est pas inclus dans le texte de la cellule, la ligne ne doit pas être visible.
                if (filterText && !cellText.includes(filterText)) {
                    rowIsVisible = false;
                    break; // Inutile de vérifier les autres cellules de cette ligne
                }
            }

            // Affiche ou masque la ligne en fonction du résultat du filtre
            row.style.display = rowIsVisible ? '' : 'none';
        });
    }

    // Ajoute un écouteur d'événement 'input' à chaque champ de filtre.
    filterInputs.forEach(input => {
        input.addEventListener('input', filterTable);
    });
    
    // --- GESTION DE L'AJOUT D'UNE NOUVELLE LIGNE ---

    const addRowElement = document.getElementById('add-row');
    const addInputs = addRowElement.querySelectorAll('.add-input');
    const tableBody = document.querySelector('#data-table tbody');

    /**
     * Crée et ajoute une nouvelle ligne au tableau à partir des données saisies.
     */
   function addNewRow() { // MODIFIÉE pour ajouter le bouton Edit
        const values = Array.from(addInputs).map(input => input.value.trim());

        // On vérifie si au moins un champ a été rempli pour éviter d'ajouter des lignes vides.
        const isRowEmpty = values.every(value => value === '');
        if (isRowEmpty) {
            return; // Si tous les champs sont vides, on ne fait rien.
        }

        // 1. Créer la nouvelle ligne (tr) et ses cellules (td)
        const newTr = document.createElement('tr');
        values.forEach(value => {
            const newTd = document.createElement('td');
            newTd.textContent = value;
            newTr.appendChild(newTd);
        });
        // Ajouter la cellule d'action avec le bouton
        const actionTd = document.createElement('td');
        const editButton = document.createElement('button');
        editButton.textContent = 'Edit';
        editButton.classList.add('edit-btn');
        actionTd.appendChild(editButton);
        newTr.appendChild(actionTd);

        // 2. Ajouter la nouvelle ligne au corps du tableau
        tableBody.appendChild(newTr);

        // 3. Mettre à jour la liste des lignes pour que le filtre s'applique aux nouvelles données
        tableRows = document.querySelectorAll('#data-table tbody tr');

        // 4. Vider les champs de saisie de la ligne d'ajout
        addInputs.forEach(input => (input.value = ''));

        // 5. Appliquer les filtres actuels pour voir si la nouvelle ligne doit être affichée
        filterTable();

        // 6. Remettre le focus sur le premier champ pour une saisie rapide
        addInputs[0].focus();
    }

    // Écouteur d'événement pour la touche "Entrée" sur la ligne d'ajout
    addRowElement.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault(); // Empêche le comportement par défaut (ex: soumission de formulaire)
            addNewRow();
        }
    });

    // --- GESTION DE L'ÉDITION DES LIGNES ---

    /**
     * Gère le passage entre le mode affichage et le mode édition pour une ligne.
     * @param {HTMLTableRowElement} row - La ligne (tr) à modifier.
     */
    function toggleRowEditState(row) {
        const button = row.querySelector('button');
        const isSaving = button.classList.contains('save-btn');
        
        // Sélectionne toutes les cellules de données (toutes sauf la dernière avec le bouton)
        const dataCells = Array.from(row.children).slice(0, -1);

        if (isSaving) {
            // Mode "Sauvegarder" : on enregistre les données et on repasse en mode affichage.
            dataCells.forEach(cell => {
                const input = cell.querySelector('input.edit-input');
                if (input) {
                    cell.textContent = input.value; // Remplace l'input par sa valeur texte
                }
            });
            button.textContent = 'Edit';
            button.classList.replace('save-btn', 'edit-btn');
        } else {
            // Mode "Édition" : on transforme le texte en champs de saisie.
            dataCells.forEach(cell => {
                const currentValue = cell.textContent;
                // Remplace le contenu de la cellule par un input contenant la valeur actuelle
                cell.innerHTML = `<input type="text" class="edit-input" value="${currentValue.replace(/"/g, '&quot;')}">`;
            });
            button.textContent = 'Save';
            button.classList.replace('edit-btn', 'save-btn');
            // Met le focus sur le premier champ de la ligne
            if (row.querySelector('input.edit-input')) {
                row.querySelector('input.edit-input').focus();
            }
        }
    }

    // Utilise la délégation d'événements sur le corps du tableau pour gérer tous les clics
    tableBody.addEventListener('click', (event) => {
        const button = event.target.closest('button.edit-btn, button.save-btn');
        if (button) {
            const row = button.closest('tr');
            toggleRowEditState(row);
        }
    });  
});

