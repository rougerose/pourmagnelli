<?php

if (!defined('_ECRIRE_INC_VERSION')) {
	return;
}

/**
 * Récupérer le sommaire d'un article, adapté pour le menu
 * et le squelette menus/pourmagnelli_article_sommaire.html
 *
 * Cette fonction vient remplacer la fonction sommaire_recenser
 * du plugin Sommaire, qui ne peut plus être appelée directement.
 */
function recuperer_sommaire_menu($texte) {
	$sommaire = [];
	$ancres_vues = [];

	preg_match_all(',(<h([123456])[^>]*>)(.*)(</h\\2>),Uims', $texte, $matches, PREG_SET_ORDER);

	if (!count($matches)) {
		return $sommaire;
	}

	$currentpos = 0;

	foreach ($matches as $m) {
		if ($pos = strpos($texte, $m[0], $currentpos) !== false) {
			$titre = $m[3];
			$ancre = sommaire_intertitre_ancre($titre, $m, $ancres_vues);
			$ancres_vues[] = $ancre;

			$sommaire[] = [
				'titre' => $titre,
				'id' => $ancre,
			];
		}
	}
	return $sommaire;
}
