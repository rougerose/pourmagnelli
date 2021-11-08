<?php

if (!defined('_ECRIRE_INC_VERSION')) {
	return;
}

if (!isset($GLOBALS['z_blocs'])) {
	$GLOBALS['z_blocs'] = array(
		'content',
		'head',
		'head_js',
		'header',
		'footer',
	);
}
