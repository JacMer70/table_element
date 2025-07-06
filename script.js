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
    function addNewRow() {
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
});

