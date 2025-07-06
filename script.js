document.addEventListener('DOMContentLoaded', () => {
    // --- SÉLECTION DES ÉLÉMENTS PRINCIPAUX ---
    const table = document.getElementById('data-table');
    const tableHead = table.querySelector('thead');
    const tableBody = table.querySelector('tbody');
    const addRowElement = document.getElementById('add-row');
    const tableControls = document.getElementById('table-controls');


    /**
     * Filtre le tableau en fonction des valeurs des champs de saisie.
     */
    function filterTable() {
        // Crée un tableau des valeurs de filtre, converties en minuscules pour une comparaison insensible à la casse.
        const filterInputs = table.querySelectorAll('.filter-input');
        const filterValues = Array.from(filterInputs).map(input => input.value.toLowerCase());
        const tableRows = tableBody.querySelectorAll('tr');

        // Parcourt chaque ligne du tableau
        tableRows.forEach(row => {
            // Récupère toutes les cellules (td) de la ligne actuelle
            const cells = row.querySelectorAll('td');
            let rowIsVisible = true;

            // Parcourt chaque cellule de la ligne pour la comparer au filtre correspondant
            for (let i = 0; i < filterValues.length; i++) {
                const cellText = cells[i]?.textContent.toLowerCase() || '';
                const filterText = filterValues[i];

                // Si un filtre est actif et ne correspond pas, on masque la ligne.
                if (filterText && !cellText.includes(filterText)) {
                    rowIsVisible = false;
                    break; // Inutile de vérifier les autres cellules de cette ligne
                }
            }

            // Affiche ou masque la ligne en fonction du résultat du filtre
            row.style.display = rowIsVisible ? '' : 'none';
        });
    }

    /**
     * Crée et ajoute une nouvelle ligne au tableau à partir des données saisies.
     */
    function addNewRow() {
        const addInputs = addRowElement.querySelectorAll('.add-input');
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
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.classList.add('delete-btn');
        actionTd.appendChild(editButton);
        actionTd.appendChild(deleteButton);
        newTr.appendChild(actionTd);

        // 2. Ajouter la nouvelle ligne au corps du tableau
        tableBody.appendChild(newTr);


        // 4. Vider les champs de saisie de la ligne d'ajout
        addInputs.forEach(input => (input.value = ''));

        // 5. Appliquer les filtres actuels pour voir si la nouvelle ligne doit être affichée
        filterTable();

        // 6. Remettre le focus sur le premier champ pour une saisie rapide
        addInputs[0].focus();
    }

    /**
     * Gère le passage entre le mode affichage et le mode édition pour une ligne.
     * @param {HTMLTableRowElement} row - La ligne (tr) à modifier.
     */
    function toggleRowEditState(row) {
        const button = row.querySelector('button.edit-btn, button.save-btn');
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

    /**
     * Ajoute une nouvelle colonne à l'ensemble du tableau.
     */
    function addColumn() {
        const headerName = prompt("Entrez le nom du nouvel en-tête :", "Nouvelle Colonne");
        if (!headerName || headerName.trim() === '') return;

        table.querySelectorAll('tr').forEach(row => {
            let newCell;
            if (row.parentElement.tagName === 'THEAD') {
                if (row.classList.contains('filter-row')) {
                    newCell = document.createElement('th');
                    newCell.innerHTML = `<input type="text" class="filter-input" placeholder="Filtrer...">`;
                } else {
                    newCell = document.createElement('th');
                    newCell.textContent = headerName;
                }
            } else if (row.parentElement.tagName === 'TBODY') {
                newCell = document.createElement('td');
            } else if (row.parentElement.tagName === 'TFOOT') {
                newCell = document.createElement('td');
                newCell.innerHTML = `<input type="text" class="add-input" placeholder="Ajouter...">`;
            }

            if (newCell) {
                // Insère la nouvelle cellule avant la dernière cellule (Actions)
                row.insertBefore(newCell, row.lastElementChild);
            }
        });
    }

    /**
     * Supprime une colonne du tableau à un index donné.
     */
    function deleteColumn(deleteButton) {
        const headerCell = deleteButton.closest('th');
        const colIndex = Array.from(headerCell.parentElement.children).indexOf(headerCell);

        if (colIndex > -1 && confirm(`Êtes-vous sûr de vouloir supprimer la colonne "${headerCell.textContent.trim()}" ?`)) {
            table.querySelectorAll('tr').forEach(row => {
                if (row.children[colIndex]) {
                    row.children[colIndex].remove();
                }
            });
        }
    }

    /**
     * Gère le passage entre le mode affichage et le mode édition pour les en-têtes.
     */
    function toggleHeaderEditState(button) {
        const isSaving = button.textContent === 'Sauvegarder les en-têtes';
        const headerCells = tableHead.querySelectorAll('tr:first-child th:not(:last-child)');

        if (isSaving) {
            // Mode "Sauvegarder"
            headerCells.forEach(cell => {
                const input = cell.querySelector('input.header-edit-input');
                cell.textContent = input.value; // Le bouton de suppression est automatiquement retiré avec innerHTML
            });
            button.textContent = 'Éditer les en-têtes';
        } else {
            // Mode "Édition"
            headerCells.forEach(cell => {
                const currentValue = cell.textContent;
                cell.innerHTML = `<input type="text" class="header-edit-input" value="${currentValue.replace(/"/g, '&quot;')}">
                                  <button class="delete-col-btn" title="Supprimer la colonne">X</button>`;
            });
            button.textContent = 'Sauvegarder les en-têtes';
        }
    }

    // --- ÉCOUTEURS D'ÉVÉNEMENTS (DÉLÉGATION) ---

    // Gère les clics sur les boutons "Edit", "Save" dans le corps du tableau
 
    tableBody.addEventListener('click', (event) => {
        const target = event.target;
        const row = target.closest('tr');

        if (target.closest('button.edit-btn, button.save-btn')) {
            toggleRowEditState(row);
        } else if (target.closest('button.delete-btn')) {
            // Demande de confirmation avant de supprimer
            if (confirm('Êtes-vous sûr de vouloir supprimer cette ligne ?')) {
                row.remove();
                // Optionnel : vous pourriez ici appeler une fonction pour sauvegarder l'état du tableau
            }
        }
    });  

    // Gère la saisie dans les filtres et la suppression de colonnes dans l'en-tête
    tableHead.addEventListener('input', event => {
        if (event.target.classList.contains('filter-input')) {
            filterTable();
        }
    });
    tableHead.addEventListener('click', event => {
        if (event.target.classList.contains('delete-col-btn')) {
            deleteColumn(event.target);
        }
    });

    // Gère l'ajout de ligne avec la touche "Entrée"
    addRowElement.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            addNewRow();
        }
    });

    // Gère les clics sur les boutons de contrôle globaux
    tableControls.addEventListener('click', (event) => {
        const button = event.target.closest('button');
        if (!button) return;

        if (button.id === 'add-col-btn') addColumn();
        if (button.id === 'toggle-headers-btn') toggleHeaderEditState(button);
    });    
});

