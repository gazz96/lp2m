<?php
/**
 * Plugin Name:  LP2M Hibah Receiver
 * Description:  REST API endpoint untuk menerima pendaftaran hibah LP2M dari frontend Vue.
 * Version:      1.0.0
 * Requires PHP: 7.4
 */

defined('ABSPATH') || exit;

class LP2M_Hibah_Receiver {

    private string $table;

    public function __construct() {
        global $wpdb;
        $this->table = $wpdb->prefix . 'lp2m_hibah';
    }

    public function init(): void {
        register_activation_hook(__FILE__, [$this, 'activate']);
        add_action('rest_api_init', [$this, 'register_routes']);
    }

    /** Buat custom table saat plugin aktif */
    public function activate(): void {
        global $wpdb;
        $charset = $wpdb->get_charset_collate();
        $sql = "CREATE TABLE IF NOT EXISTS {$this->table} (
            id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            reg_no VARCHAR(20) NOT NULL UNIQUE,
            nama VARCHAR(255) NOT NULL,
            nip VARCHAR(30) NOT NULL,
            jenis VARCHAR(30) NOT NULL,
            prodi VARCHAR(255) NOT NULL,
            skema VARCHAR(255) NOT NULL,
            judul TEXT NOT NULL,
            ringkasan TEXT NOT NULL,
            jml_tim VARCHAR(5) DEFAULT '',
            anggota TEXT DEFAULT '',
            email VARCHAR(255) NOT NULL,
            hp VARCHAR(30) NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_reg_no (reg_no),
            INDEX idx_skema (skema)
        ) $charset;";
        require_once ABSPATH . 'wp-admin/includes/upgrade.php';
        dbDelta($sql);
    }

    /** Register REST route */
    public function register_routes(): void {
        register_rest_route('lp2m/v1', '/hibah', [
            'methods'             => 'POST',
            'callback'            => [$this, 'handle_submit'],
            'permission_callback' => '__return_true',
            'args'                => $this->get_args(),
        ]);
    }

    /** Validasi & simpan submission */
    public function handle_submit(\WP_REST_Request $request): \WP_REST_Response {
        $params = $request->get_params();

        // --- Validasi required fields ---
        $required = ['nama', 'nip', 'jenis', 'prodi', 'skema', 'judul', 'ringkasan', 'email', 'hp'];
        $errors = [];
        foreach ($required as $field) {
            if (empty(trim($params[$field] ?? ''))) {
                $errors[$field] = "Kolom $field wajib diisi.";
            }
        }
        if (!empty($params['email']) && !is_email($params['email'])) {
            $errors['email'] = 'Format email tidak valid.';
        }
        if ($errors) {
            return new \WP_REST_Response(['success' => false, 'errors' => $errors], 400);
        }

        // --- Generate nomor registrasi ---
        global $wpdb;
        $year = date('Y');
        // Cari nomor terakhir tahun ini
        $last = $wpdb->get_var($wpdb->prepare(
            "SELECT reg_no FROM {$this->table} WHERE reg_no LIKE %s ORDER BY id DESC LIMIT 1",
            "LP2M-{$year}-%"
        ));
        if ($last) {
            $seq = (int) substr($last, -5) + 1;
        } else {
            $seq = 1;
        }
        $reg_no = sprintf('LP2M-%s-%05d', $year, $seq);

        // --- Simpan ---
        $inserted = $wpdb->insert($this->table, [
            'reg_no'    => $reg_no,
            'nama'      => sanitize_text_field($params['nama']),
            'nip'       => sanitize_text_field($params['nip']),
            'jenis'     => sanitize_text_field($params['jenis']),
            'prodi'     => sanitize_text_field($params['prodi']),
            'skema'     => sanitize_text_field($params['skema']),
            'judul'     => sanitize_text_field($params['judul']),
            'ringkasan' => sanitize_textarea_field($params['ringkasan']),
            'jml_tim'   => sanitize_text_field($params['jml_tim'] ?? ''),
            'anggota'   => sanitize_text_field($params['anggota'] ?? ''),
            'email'     => sanitize_email($params['email']),
            'hp'        => sanitize_text_field($params['hp']),
        ]);

        if ($inserted === false) {
            return new \WP_REST_Response(['success' => false, 'message' => 'Gagal menyimpan data.'], 500);
        }

        // --- Kirim email notifikasi ---
        $admin_email = get_option('admin_email');
        $subject = sprintf('[LP2M] Pendaftaran Hibah Baru — %s', $reg_no);
        $body = sprintf(
            "Nomor Registrasi: %s\nNama: %s\nNIP: %s\nSkema: %s\nJudul: %s\nEmail: %s\nWhatsApp: %s\n\nCek dashboard: %s/wp-admin/",
            $reg_no, $params['nama'], $params['nip'], $params['skema'],
            $params['judul'], $params['email'], $params['hp'],
            get_site_url()
        );
        wp_mail($admin_email, $subject, $body);

        return new \WP_REST_Response([
            'success' => true,
            'reg_no'  => $reg_no,
            'message' => 'Pendaftaran berhasil dikirim.',
        ], 201);
    }

    private function get_args(): array {
        return [
            'nama'      => ['required' => true, 'sanitize_callback' => 'sanitize_text_field'],
            'nip'       => ['required' => true, 'sanitize_callback' => 'sanitize_text_field'],
            'jenis'     => ['required' => true, 'sanitize_callback' => 'sanitize_text_field'],
            'prodi'     => ['required' => true, 'sanitize_callback' => 'sanitize_text_field'],
            'skema'     => ['required' => true, 'sanitize_callback' => 'sanitize_text_field'],
            'judul'     => ['required' => true, 'sanitize_callback' => 'sanitize_text_field'],
            'ringkasan' => ['required' => true, 'sanitize_callback' => 'sanitize_textarea_field'],
            'email'     => ['required' => true, 'sanitize_callback' => 'sanitize_email'],
            'hp'        => ['required' => true, 'sanitize_callback' => 'sanitize_text_field'],
            'jml_tim'   => ['required' => false],
            'anggota'   => ['required' => false],
        ];
    }
}

(new LP2M_Hibah_Receiver())->init();
