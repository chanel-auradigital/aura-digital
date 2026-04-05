<?php
/**
 * {DESCRIPCION}
 * Cliente: {CLIENTE}
 * USO: https://{DOMAIN}/{FILENAME}?key={SECRET_KEY}
 */
error_reporting(E_ALL);
ini_set('display_errors', 1);

$SECRET_KEY = '{SECRET_KEY}';
if (!isset($_GET['key']) || $_GET['key'] !== $SECRET_KEY) {
    die('Acceso denegado');
}

require_once dirname(__FILE__) . '/wp-load.php';
global $wpdb;

header('Content-Type: text/html; charset=utf-8');
echo "<html><body style='font-family:monospace;padding:2em;background:#2A1F1A;color:#EFEBE3;max-width:1100px;margin:0 auto;font-size:13px'>";
echo "<h1 style='color:#C07A5A'>{TITULO}</h1><hr>";

$upload_dir = wp_upload_dir();

// ============================================================
// TU CODIGO AQUI
// ============================================================



// ============================================================
// LIMPIAR CACHE (siempre al final)
// ============================================================
echo "<h2 style='color:#C07A5A'>Cache</h2>";

$wpdb->query("DELETE FROM {$wpdb->postmeta} WHERE meta_key = '_elementor_css'");
$wpdb->query("DELETE FROM {$wpdb->options} WHERE option_name = '_elementor_global_css'");
$wpdb->query("DELETE FROM {$wpdb->options} WHERE option_name LIKE '_transient_elementor%'");
$wpdb->query("DELETE FROM {$wpdb->options} WHERE option_name LIKE '_transient_timeout_elementor%'");

$css_dir = $upload_dir['basedir'] . '/elementor/css/';
if (is_dir($css_dir)) {
    $del = 0;
    foreach (glob($css_dir . '*') as $f) {
        if (is_file($f) && unlink($f)) $del++;
    }
    echo "<p style='color:#8bc48b'>OK {$del} CSS eliminados</p>";
}
if (function_exists('litespeed_purge_all')) {
    litespeed_purge_all();
    echo "<p style='color:#8bc48b'>OK LiteSpeed purgado</p>";
}

echo "<hr>";
echo "<p style='color:#e8a87c'>Regenera CSS: wp-admin - Elementor - Tools - Regenerate CSS</p>";
echo "<p style='color:#e8a87c'>Ctrl+Shift+R en el navegador</p>";
echo "<p><a href='https://{DOMAIN}/?v=" . time() . "' target='_blank' style='color:#C07A5A;font-weight:bold'>Ver sitio</a></p>";
echo "</body></html>";
?>
