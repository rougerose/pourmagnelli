<?php

if (!defined('_ECRIRE_INC_VERSION')) {
	return;
}

// Zcore
if (!isset($GLOBALS['z_blocs'])) {
	$GLOBALS['z_blocs'] = array(
		'content',
		'head',
		'head_js',
		'header',
		'footer',
	);
}

// Premier niveau d'intertitre
$GLOBALS['debut_intertitre'] = '<h2>';
$GLOBALS['fin_intertitre'] = '</h2>';
