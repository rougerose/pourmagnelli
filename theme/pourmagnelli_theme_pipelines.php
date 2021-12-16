<?php

if (!defined('_ECRIRE_INC_VERSION')) {
	return;
}

function pourmagnelli_theme_insert_head($flux) {
	if ($js = find_in_path('dist/js/pourmagnelli.js')) {
		$flux .= "\n";
		$flux .= '<script src="' . $js . '" type="text/javascript"></script>';
	}
	return $flux;
}
