document.addEventListener('DOMContentLoaded', () => {
    // --- SÉLECTION DES ÉLÉMENTS PRINCIPAUX ---
    const table = document.getElementById('data-table');
    const tableHead = table.querySelector('thead');
    const tableBody = table.querySelector('tbody');
    const addRowElement = document.getElementById('add-row');
    const tableControls = document.getElementById('table-controls');
    // État pour suivre le tri actuel
    let sortState = {
        columnIndex: -1,
        direction: 'asc'
    };

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
        saveState(); // Sauvegarder l'état
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
            saveState(); // Sauvegarder l'état
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

        // Rend la nouvelle colonne triable
        tableHead.querySelectorAll('tr:first-child th').forEach(th => {
            if (!th.classList.contains('sortable')) initializeSortForHeader(th);

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
            // Réinitialiser l'état du tri car les index ont changé
            sortState = { columnIndex: -1, direction: 'asc' };
            updateSortIndicators();
            saveState(); // Sauvegarder l'état
        }
    }

    /**
     * Trie le tableau en fonction d'une colonne.
     * @param {number} columnIndex - L'index de la colonne à trier.
     */
    function sortTableByColumn(columnIndex) {
        const currentDirection = sortState.columnIndex === columnIndex ? (sortState.direction === 'asc' ? 'desc' : 'asc') : 'asc';
        sortState = { columnIndex, direction: currentDirection };

        const rows = Array.from(tableBody.querySelectorAll('tr'));

        const sortedRows = rows.sort((a, b) => {
            const cellA = a.children[columnIndex]?.textContent.trim() || '';
            const cellB = b.children[columnIndex]?.textContent.trim() || '';

            const isNumeric = !isNaN(parseFloat(cellA)) && isFinite(cellA) && !isNaN(parseFloat(cellB)) && isFinite(cellB);

            let comparison = 0;
            if (isNumeric) {
                comparison = parseFloat(cellA) - parseFloat(cellB);
            } else {
                comparison = cellA.localeCompare(cellB, undefined, { sensitivity: 'base' });
            }

            return comparison * (currentDirection === 'asc' ? 1 : -1);
        });

        tableBody.innerHTML = '';
        sortedRows.forEach(row => tableBody.appendChild(row));

        updateSortIndicators();
        saveState(); // Sauvegarder l'état
    }

    /** Met à jour les classes CSS sur les en-têtes pour montrer l'état du tri. */
    function updateSortIndicators() {
        tableHead.querySelectorAll('tr:first-child th').forEach((th, index) => {
            th.classList.remove('sorted-asc', 'sorted-desc');
            if (index === sortState.columnIndex) {
                th.classList.add(sortState.direction === 'asc' ? 'sorted-asc' : 'sorted-desc');
            }
        });
    }

    /** Ajoute les éléments nécessaires pour le tri à une cellule d'en-tête. */
    function initializeSortForHeader(th) {
        if (th.textContent.trim() === 'Actions' || th.querySelector('.sort-icons')) return;

        th.classList.add('sortable');
        const iconContainer = document.createElement('span');
        iconContainer.classList.add('sort-icons');
        iconContainer.innerHTML = `<span class="sort-asc">▲</span><span class="sort-desc">▼</span>`;
        th.appendChild(iconContainer);
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
            saveState(); // Sauvegarder l'état        
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
                saveState(); // Sauvegarder l'état
            }
        }
    });  

    // Gère la saisie dans les filtres
    tableHead.addEventListener('input', event => {
        if (event.target.classList.contains('filter-input')) {
            filterTable();
        }
    });


    // Gère les clics sur les en-têtes (tri et suppression de colonne)
    tableHead.addEventListener('click', event => {
        // Gère la suppression de colonne (uniquement en mode édition)
        if (event.target.classList.contains('delete-col-btn')) {
            deleteColumn(event.target);
            return; // Action exclusive
        }

        // Gère le tri (uniquement si pas en mode édition)
        const toggleBtn = document.getElementById('toggle-headers-btn');
        if (toggleBtn.textContent !== 'Sauvegarder les en-têtes') {
            const headerCell = event.target.closest('th.sortable');
            if (headerCell) {
                const colIndex = Array.from(headerCell.parentElement.children).indexOf(headerCell);
                sortTableByColumn(colIndex);
            }
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

    // --- GESTION DE LA PERSISTANCE DES DONNÉES ---

    /**
     * Sauvegarde l'état actuel du tableau (en-têtes et données) dans le localStorage.
     */
    function saveState() {
        const currentHeaders = Array.from(tableHead.querySelectorAll('tr:first-child th:not(:last-child)'))
                                    .map(th => {
                                        const input = th.querySelector('.header-edit-input');
                                        return input ? input.value : th.textContent.trim();
                                    });

        const currentData = Array.from(tableBody.querySelectorAll('tr')).map(row => {
            const rowData = {};
            Array.from(row.children).slice(0, -1).forEach((cell, index) => {
                const input = cell.querySelector('input.edit-input');
                rowData[currentHeaders[index]] = input ? input.value : cell.textContent.trim();
            });
            return rowData;
        });

        const state = {
            headers: currentHeaders,
            data: currentData
        };

        localStorage.setItem('dataTableState', JSON.stringify(state));
    }

    /**
     * Charge l'état du tableau depuis le localStorage au chargement de la page.
     */
    function loadState() {
        const savedStateJSON = localStorage.getItem('dataTableState');
        if (!savedStateJSON) return;

        try {
            const state = JSON.parse(savedStateJSON);
            if (!state.headers || !state.data) return;

            // Vider le contenu actuel pour le reconstruire
            tableHead.innerHTML = '';
            tableBody.innerHTML = '';

            // Reconstruire les en-têtes et la ligne de filtre
            const headerRow = document.createElement('tr');
            const filterRow = document.createElement('tr');
            filterRow.className = 'filter-row';

            state.headers.forEach(headerText => {
                headerRow.innerHTML += `<th>${headerText}</th>`;
                filterRow.innerHTML += `<th><input type="text" class="filter-input" placeholder="Filtrer par ${headerText}..."></th>`;
            });
            headerRow.innerHTML += '<th>Actions</th>';
            filterRow.innerHTML += '<th></th>';
            tableHead.appendChild(headerRow);
            tableHead.appendChild(filterRow);

            // Reconstruire le corps du tableau
            state.data.forEach(rowData => {
                const tr = document.createElement('tr');
                let cellsHtml = '';
                state.headers.forEach(header => {
                    cellsHtml += `<td>${rowData[header] || ''}</td>`;
                });
                cellsHtml += `<td><button class="edit-btn">Edit</button><button class="delete-btn">Delete</button></td>`;
                tr.innerHTML = cellsHtml;
                tableBody.appendChild(tr);
            });

        } catch (e) {
            console.error("Erreur lors du chargement de l'état du tableau :", e);
            localStorage.removeItem('dataTableState'); // Supprimer l'état corrompu
        }
    }

    // Charger l'état au démarrage
    loadState();   

    // Initialisation du tri sur les en-têtes existants
    tableHead.querySelectorAll('tr:first-child th').forEach(th => initializeSortForHeader(th));
});

