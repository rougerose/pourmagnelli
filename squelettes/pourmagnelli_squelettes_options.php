<?php

if (!defined('_ECRIRE_INC_VERSION')) {
	return;
}

// Zcore
if (!isset($GLOBALS['z_blocs'])) {
	$GLOBALS['z_blocs'] = ['content', 'head', 'head_js', 'header', 'footer'];
}

// Premier niveau d'intertitre
$GLOBALS['debut_intertitre'] = '<h2>';
$GLOBALS['fin_intertitre'] = '</h2>';

// Sommaire : ne pas ajouter de section autour des intertitres
define('SOMMAIRE_GENERER_SECTIONS', false);

// DEBUG
// define('_INTERDIRE_COMPACTE_HEAD_ECRIRE', true);
// error_reporting(E_ALL ^ E_NOTICE);
// ini_set('display_errors', 'On');
// define('SPIP_ERREUR_REPORT', E_ALL);
// define('_LOG_FILELINE', true);
// define('_LOG_FILTRE_GRAVITE', 8);
// define('_DEBUG_SLOW_QUERIES', true);
// define('_BOUCLE_PROFILER', 5000);
