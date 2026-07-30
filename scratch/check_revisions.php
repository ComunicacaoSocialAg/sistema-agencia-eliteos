<?php
require_once __DIR__ . '/wp-load.php';
header('Content-Type: text/plain; charset=utf-8');

$post_id = 28;
$revisions = wp_get_post_revisions($post_id);

echo "=== REVISÕES DA HOME (ID $post_id) ===\n\n";
foreach ($revisions as $revision) {
    echo "Revision ID: " . $revision->ID . "\n";
    echo "Date: " . $revision->post_date . "\n";
    echo "Author: " . $revision->post_author . "\n";
    echo "Title: " . $revision->post_title . "\n";
    echo "Length: " . strlen($revision->post_content) . " bytes\n";
    echo "----------------------------------------\n";
}
?>
