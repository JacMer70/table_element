document.addEventListener('DOMContentLoaded', () => {
    // Sélectionne tous les champs de saisie pour le filtrage
    const filterInputs = document.querySelectorAll('.filter-input');
    // Sélectionne toutes les lignes (tr) dans le corps du tableau
    const tableRows = document.querySelectorAll('#data-table tbody tr');

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
});

