<?php
/**
 * Plugin Name: UltraKey AI Chatbot
 * Description: A premium, glassmorphic AI chatbot powered by Gemini 3 Flash.
 * Version: 1.0.1
 * Author: UltraKey
 */

if ( ! defined( 'ABSPATH' ) ) exit;

class UltraKeyChatbot {
    public function __construct() {
        add_action('admin_menu', [$this, 'add_settings_page']);
        add_action('admin_init', [$this, 'register_settings']);
        add_action('wp_footer', [$this, 'inject_chatbot_assets']);
    }

    public function add_settings_page() {
        add_options_page(
            'UltraKey AI Settings',
            'UltraKey AI',
            'manage_options',
            'ultrakey-chatbot',
            [$this, 'settings_page_html']
        );
    }

    public function register_settings() {
        register_setting('ultrakey_settings_group', 'ultrakey_api_key');
    }

    public function settings_page_html() {
        ?>
        <div class="wrap">
            <h1>UltraKey AI Chatbot Settings</h1>
            <p>Welcome! Configure your UltraKey AI instance here.</p>
            <form method="post" action="options.php">
                <?php
                settings_fields('ultrakey_settings_group');
                do_settings_sections('ultrakey-chatbot');
                ?>
                <table class="form-table">
                    <tr valign="top">
                    <th scope="row">Gemini API Key</th>
                    <td>
                        <input type="password" name="ultrakey_api_key" value="<?php echo esc_attr(get_option('ultrakey_api_key')); ?>" class="regular-text" />
                        <p class="description">Get your free key from <a href="https://aistudio.google.com/app/apikey" target="_blank">Google AI Studio</a>.</p>
                    </td>
                    </tr>
                </table>
                <?php submit_button(); ?>
            </form>
            <hr>
            <p><i>Note: The chatbot appears automatically in the bottom-right corner of your site after activation and API key setup.</i></p>
        </div>
        <?php
    }

    public function inject_chatbot_assets() {
        $api_key = get_option('ultrakey_api_key');
        $plugin_url = plugin_dir_url(__FILE__);
        ?>
        <!-- UltraKey AI Chatbot Integration -->
        <div id="ultrakey-root"></div>

        <script>
            window.ultrakeySettings = {
                apiKey: '<?php echo esc_js($api_key); ?>',
                rootUrl: '<?php echo esc_js($plugin_url); ?>'
            };
        </script>

        <!-- External Libraries -->
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
        
        <style>
            #ultrakey-root { font-family: 'Inter', sans-serif; position: relative; z-index: 2147483647; }
            .glass-effect { background: rgba(15, 23, 42, 0.95) !important; backdrop-filter: blur(20px) !important; }
            @keyframes pulse-ring { 0% { transform: scale(1); opacity: 0.5; } 50% { transform: scale(1.3); opacity: 0; } 100% { transform: scale(1); opacity: 0; } }
            .animate-ring { animation: pulse-ring 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite !important; }
        </style>

        <script type="importmap">
        {
            "imports": {
                "react": "https://esm.sh/react@19.0.0",
                "react-dom": "https://esm.sh/react-dom@19.0.0",
                "react-dom/client": "https://esm.sh/react-dom@19.0.0/client",
                "@google/genai": "https://esm.sh/@google/genai@1.40.0"
            }
        }
        </script>
        
        <script type="module" src="<?php echo $plugin_url; ?>index.tsx"></script>
        <?php
    }
}

new UltraKeyChatbot();
