// utils/calcMoyenne.js - Calcul des moyennes pondérées par matière
module.exports = function calcMoyenne(notes) {
  const matieres = {};
  notes.forEach((note) => {
    if (!matieres[note.matiere]) {
      matieres[note.matiere] = { somme: 0, coeffTotal: 0, coefficient: note.coefficient };
    }
    matieres[note.matiere].somme += note.valeur * note.coefficient;
    matieres[note.matiere].coeffTotal += note.coefficient;
  });
  return Object.entries(matieres).map(([matiere, data]) => ({
    matiere,
    moyenne: data.coeffTotal > 0 ? data.somme / data.coeffTotal : 0,
    coefficient: data.coefficient
  }));
};