<?php
/**
 * Plugin Name: Next.js Preview & Revalidation
 * Description: Synchronise WordPress avec le frontend Next.js : revalidation à la demande lors des publications et bouton de preview pour les brouillons.
 * Version: 1.0.0
 * Author: Les Doléances
 * Text Domain: nextjs-preview
 */

if (!defined('ABSPATH')) {
    exit;
}

// ─── Constantes ───────────────────────────────────────────────────
define('NEXTJS_PREVIEW_VERSION', '1.0.0');

// ─── Page de réglages ─────────────────────────────────────────────
add_action('admin_menu', function () {
    add_options_page(
        'Next.js Preview & Revalidation',
        'Next.js Preview',
        'manage_options',
        'nextjs-preview',
        'nextjs_preview_settings_page'
    );
});

add_action('admin_init', function () {
    register_setting('nextjs_preview_settings', 'nextjs_site_url', [
        'type' => 'string',
        'sanitize_callback' => 'esc_url_raw',
        'default' => '',
    ]);
    register_setting('nextjs_preview_settings', 'nextjs_webhook_secret', [
        'type' => 'string',
        'sanitize_callback' => 'sanitize_text_field',
        'default' => '',
    ]);
    register_setting('nextjs_preview_settings', 'nextjs_revalidate_enabled', [
        'type' => 'boolean',
        'default' => true,
    ]);
    register_setting('nextjs_preview_settings', 'nextjs_preview_enabled', [
        'type' => 'boolean',
        'default' => true,
    ]);
});

function nextjs_preview_settings_page() {
    $site_url = get_option('nextjs_site_url', '');
    $secret = get_option('nextjs_webhook_secret', '');
    $revalidate_enabled = get_option('nextjs_revalidate_enabled', true);
    $preview_enabled = get_option('nextjs_preview_enabled', true);
    ?>
    <div class="wrap">
        <h1>Next.js Preview & Revalidation</h1>
        <form method="post" action="options.php">
            <?php settings_fields('nextjs_preview_settings'); ?>
            <table class="form-table">
                <tr>
                    <th scope="row"><label for="nextjs_site_url">URL du site Next.js</label></th>
                    <td>
                        <input type="url" id="nextjs_site_url" name="nextjs_site_url"
                               value="<?php echo esc_attr($site_url); ?>"
                               class="regular-text" placeholder="https://www.lesdoleances.fr" />
                        <p class="description">URL de base du site Next.js (sans slash final).</p>
                    </td>
                </tr>
                <tr>
                    <th scope="row"><label for="nextjs_webhook_secret">Secret partagé</label></th>
                    <td>
                        <input type="text" id="nextjs_webhook_secret" name="nextjs_webhook_secret"
                               value="<?php echo esc_attr($secret); ?>"
                               class="regular-text" />
                        <p class="description">
                            Doit correspondre à la variable <code>WORDPRESS_WEBHOOK_SECRET</code> dans Next.js.
                            <br>
                            <button type="button" class="button button-secondary" onclick="document.getElementById('nextjs_webhook_secret').value = crypto.randomUUID();">
                                Générer un secret
                            </button>
                        </p>
                    </td>
                </tr>
                <tr>
                    <th scope="row">Revalidation automatique</th>
                    <td>
                        <label>
                            <input type="checkbox" name="nextjs_revalidate_enabled" value="1"
                                <?php checked($revalidate_enabled); ?> />
                            Revalider le cache Next.js lors des publications/modifications
                        </label>
                    </td>
                </tr>
                <tr>
                    <th scope="row">Preview (brouillons)</th>
                    <td>
                        <label>
                            <input type="checkbox" name="nextjs_preview_enabled" value="1"
                                <?php checked($preview_enabled); ?> />
                            Ajouter le bouton "Aperçu Next.js" dans l'éditeur
                        </label>
                    </td>
                </tr>
            </table>
            <?php submit_button('Enregistrer'); ?>
        </form>

        <hr>
        <h2>Test de connexion</h2>
        <p>
            <button type="button" class="button button-secondary" id="nextjs-test-btn">
                Tester la connexion
            </button>
            <span id="nextjs-test-result" style="margin-left: 10px;"></span>
        </p>
        <script>
        document.getElementById('nextjs-test-btn').addEventListener('click', async function() {
            const result = document.getElementById('nextjs-test-result');
            result.textContent = 'Test en cours...';
            result.style.color = '';
            try {
                const res = await fetch(ajaxurl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: 'action=nextjs_test_connection&_wpnonce=<?php echo wp_create_nonce("nextjs_test_connection"); ?>',
                });
                const data = await res.json();
                if (data.success) {
                    result.textContent = '✅ ' + data.data;
                    result.style.color = 'green';
                } else {
                    result.textContent = '❌ ' + data.data;
                    result.style.color = 'red';
                }
            } catch (e) {
                result.textContent = '❌ Erreur AJAX : ' + e.message;
                result.style.color = 'red';
            }
        });
        </script>

        <hr>
        <h2>Journal des dernières revalidations</h2>
        <?php
        $log = get_option('nextjs_revalidation_log', []);
        if (empty($log)) {
            echo '<p>Aucune revalidation enregistrée.</p>';
        } else {
            echo '<table class="widefat striped"><thead><tr><th>Date</th><th>Type</th><th>Slug</th><th>Action</th><th>Résultat</th></tr></thead><tbody>';
            foreach (array_reverse($log) as $entry) {
                printf(
                    '<tr><td>%s</td><td>%s</td><td>%s</td><td>%s</td><td>%s</td></tr>',
                    esc_html($entry['date']),
                    esc_html($entry['post_type']),
                    esc_html($entry['slug']),
                    esc_html($entry['action']),
                    esc_html($entry['result'])
                );
            }
            echo '</tbody></table>';
        }
        ?>
    </div>
    <?php
}

// ─── Test de connexion via AJAX (server-side, pas de CORS) ────────

add_action('wp_ajax_nextjs_test_connection', function () {
    check_ajax_referer('nextjs_test_connection');

    if (!current_user_can('manage_options')) {
        wp_send_json_error('Permissions insuffisantes.');
    }

    $site_url = get_option('nextjs_site_url', '');
    $secret = get_option('nextjs_webhook_secret', '');

    if (empty($site_url) || empty($secret)) {
        wp_send_json_error('URL ou secret non configurés.');
    }

    $response = wp_remote_post($site_url . '/api/revalidate', [
        'timeout' => 10,
        'headers' => [
            'Content-Type'     => 'application/json',
            'x-webhook-secret' => $secret,
        ],
        'body' => wp_json_encode([
            'post_type' => 'test',
            'slug'      => 'test',
            'action'    => 'test',
        ]),
    ]);

    if (is_wp_error($response)) {
        wp_send_json_error('Impossible de joindre ' . $site_url . ' — ' . $response->get_error_message());
    }

    $code = wp_remote_retrieve_response_code($response);
    if ($code === 200) {
        wp_send_json_success('Connexion réussie ! (HTTP ' . $code . ')');
    } else {
        wp_send_json_error('Erreur HTTP ' . $code . ' — vérifiez le secret et l\'URL.');
    }
});

// ─── Revalidation à la demande ────────────────────────────────────

/**
 * Envoie un webhook au frontend Next.js pour revalider le cache.
 */
function nextjs_trigger_revalidation($post_id, $action = 'publish') {
    if (!get_option('nextjs_revalidate_enabled', true)) {
        return;
    }

    $site_url = get_option('nextjs_site_url', '');
    $secret = get_option('nextjs_webhook_secret', '');

    if (empty($site_url) || empty($secret)) {
        return;
    }

    $post = get_post($post_id);
    if (!$post) {
        return;
    }

    // Ignorer les révisions et les auto-drafts
    if (wp_is_post_revision($post_id) || $post->post_status === 'auto-draft') {
        return;
    }

    // Récupérer les slugs des catégories associées
    $category_slugs = [];
    $categories = get_the_category($post_id);
    if ($categories) {
        $category_slugs = array_map(function ($cat) {
            return $cat->slug;
        }, $categories);
    }

    $payload = [
        'post_id'    => $post_id,
        'post_type'  => $post->post_type,
        'slug'       => $post->post_name,
        'action'     => $action,
        'categories' => $category_slugs,
    ];

    $response = wp_remote_post($site_url . '/api/revalidate', [
        'timeout' => 10,
        'headers' => [
            'Content-Type'     => 'application/json',
            'x-webhook-secret' => $secret,
        ],
        'body' => wp_json_encode($payload),
    ]);

    // Logger le résultat
    $result = is_wp_error($response)
        ? 'Erreur: ' . $response->get_error_message()
        : 'HTTP ' . wp_remote_retrieve_response_code($response);

    $log = get_option('nextjs_revalidation_log', []);
    $log[] = [
        'date'      => current_time('mysql'),
        'post_type' => $post->post_type,
        'slug'      => $post->post_name,
        'action'    => $action,
        'result'    => $result,
    ];

    // Garder seulement les 50 dernières entrées
    if (count($log) > 50) {
        $log = array_slice($log, -50);
    }

    update_option('nextjs_revalidation_log', $log);
}

// Hooks WordPress pour déclencher la revalidation
add_action('publish_post', function ($post_id) {
    nextjs_trigger_revalidation($post_id, 'publish');
});

add_action('publish_page', function ($post_id) {
    nextjs_trigger_revalidation($post_id, 'publish');
});

add_action('publish_groupe_local', function ($post_id) {
    nextjs_trigger_revalidation($post_id, 'publish');
});

add_action('save_post', function ($post_id, $post, $update) {
    if ($post->post_status === 'publish' && $update) {
        nextjs_trigger_revalidation($post_id, 'update');
    }
}, 10, 3);

add_action('trashed_post', function ($post_id) {
    nextjs_trigger_revalidation($post_id, 'delete');
});

// ─── Preview des brouillons ───────────────────────────────────────

/**
 * Remplace l'URL de preview WordPress par l'URL du frontend Next.js.
 */
add_filter('preview_post_link', function ($preview_link, $post) {
    if (!get_option('nextjs_preview_enabled', true)) {
        return $preview_link;
    }

    $site_url = get_option('nextjs_site_url', '');
    $secret = get_option('nextjs_webhook_secret', '');

    if (empty($site_url) || empty($secret)) {
        return $preview_link;
    }

    return add_query_arg([
        'secret'    => $secret,
        'slug'      => $post->post_name,
        'post_type' => $post->post_type,
    ], $site_url . '/api/draft');
}, 10, 2);

// ─── Bandeau d'information en mode preview ────────────────────────

/**
 * Ajoute une meta box dans l'éditeur pour informer de l'URL de preview.
 */
add_action('add_meta_boxes', function () {
    if (!get_option('nextjs_preview_enabled', true)) {
        return;
    }

    $post_types = ['post', 'page', 'groupe_local'];
    foreach ($post_types as $post_type) {
        add_meta_box(
            'nextjs_preview_info',
            '🔗 Preview Next.js',
            'nextjs_preview_meta_box',
            $post_type,
            'side',
            'high'
        );
    }
});

function nextjs_preview_meta_box($post) {
    $site_url = get_option('nextjs_site_url', '');
    $secret = get_option('nextjs_webhook_secret', '');

    if (empty($site_url) || empty($secret)) {
        echo '<p>⚠️ Configurez le plugin dans <a href="' . admin_url('options-general.php?page=nextjs-preview') . '">Réglages → Next.js Preview</a>.</p>';
        return;
    }

    $preview_url = add_query_arg([
        'secret'    => $secret,
        'slug'      => $post->post_name ?: 'draft-' . $post->ID,
        'post_type' => $post->post_type,
    ], $site_url . '/api/draft');

    echo '<p><a href="' . esc_url($preview_url) . '" target="_blank" class="button button-primary" style="width:100%;text-align:center;">
        Aperçu sur le site ↗
    </a></p>';
    echo '<p class="description">Ouvre le brouillon directement sur le frontend Next.js.</p>';
}
