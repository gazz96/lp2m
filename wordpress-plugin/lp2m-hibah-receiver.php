<?php
/**
 * Plugin Name:  LP2M Hibah Receiver
 * Description:  REST API endpoint untuk menerima & melihat pendaftaran hibah LP2M.
 * Version:      2.0.0
 * Requires PHP: 7.4
 *
 * Endpoints:
 *   POST /wp-json/lp2m/v1/hibah       — Submit pendaftaran hibah
 *   GET  /wp-json/lp2m/v1/hibah       — List semua pendaftaran
 *   GET  /wp-json/lp2m/v1/hibah/{id}  — Detail satu pendaftaran
 *
 * All inputs sanitized: HTML stripped, whitelist validation,
 * strict type checks, rate limiting.
 */

defined( 'ABSPATH' ) || exit;

class LP2M_Hibah_Receiver {

	private string $table;

	public function __construct() {
		global $wpdb;
		$this->table = $wpdb->prefix . 'lp2m_hibah';
	}

	public function init(): void {
		register_activation_hook( __FILE__, [ $this, 'activate' ] );
		add_action( 'rest_api_init', [ $this, 'register_routes' ] );
	}

	/** ── Create custom table on plugin activation ── */
	public function activate(): void {
		global $wpdb;
		$charset = $wpdb->get_charset_collate();
		$sql     = "CREATE TABLE IF NOT EXISTS {$this->table} (
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
		dbDelta( $sql );
	}

	/** ── Register REST routes ── */
	public function register_routes(): void {
		// POST — submit pendaftaran.
		register_rest_route( 'lp2m/v1', '/hibah', [
			'methods'             => 'POST',
			'callback'            => [ $this, 'handle_submit' ],
			'permission_callback' => [ $this, 'check_rate_limit' ],
			'args'                => $this->get_post_args(),
		] );

		// GET — list semua pendaftaran.
		register_rest_route( 'lp2m/v1', '/hibah', [
			'methods'             => 'GET',
			'callback'            => [ $this, 'handle_list' ],
			'permission_callback' => '__return_true',
		] );

		// GET — detail satu pendaftaran.
		register_rest_route( 'lp2m/v1', '/hibah/(?P<id>\d+)', [
			'methods'             => 'GET',
			'callback'            => [ $this, 'handle_detail' ],
			'permission_callback' => '__return_true',
			'args'                => [
				'id' => [
					'required'          => true,
					'validate_callback' => function ( $param ) {
						return is_numeric( $param ) && (int) $param > 0;
					},
					'sanitize_callback' => 'absint',
				],
			],
		] );
	}

	/* ────────────────────────────────────────────────────────────
	 *  RATE LIMITING
	 * ──────────────────────────────────────────────────────────── */

	/**
	 * Rate-limit POST submissions to 5 per 15 minutes per IP.
	 *
	 * @return true|\WP_Error  True if allowed, WP_Error if rate-limited.
	 */
	public function check_rate_limit( \WP_REST_Request $request ): bool|\WP_Error {
		if ( 'GET' === $request->get_method() ) {
			return true;
		}

		$ip    = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
		$key   = 'lp2m_hibah_rate_' . md5( $ip );
		$count = (int) get_transient( $key );

		if ( $count >= 5 ) {
			return new \WP_Error(
				'rate_limit',
				'Terlalu banyak permintaan. Silakan coba lagi dalam 15 menit.',
				[ 'status' => 429 ]
			);
		}

		set_transient( $key, $count + 1, 15 * MINUTE_IN_SECONDS );
		return true;
	}

	/* ────────────────────────────────────────────────────────────
	 *  SANITIZATION
	 * ──────────────────────────────────────────────────────────── */

	/**
	 * Sanitize all input fields before processing.
	 *
	 * Strategy:
	 *   - Whitelist allowed field names (drop anything else)
	 *   - Strip all HTML tags from text fields
	 *   - Validate `jenis` against strict whitelist
	 *   - Regex-sanitize NIP (alphanumeric+dash+dot only)
	 *   - Regex-sanitize HP (digits+plus+dash only)
	 *   - Hard-trim `anggota` to 500 chars
	 */
	private function sanitize_input( array $params ): array {
		$allowed = [
			'nama', 'nip', 'jenis', 'prodi', 'skema', 'judul',
			'ringkasan', 'jml_tim', 'anggota', 'email', 'hp',
		];

		$clean = [];

		// Only allow declared fields — drop everything else.
		foreach ( $allowed as $field ) {
			$val = $params[ $field ] ?? '';

			// Normalize: scalar types only.
			if ( is_array( $val ) || is_object( $val ) ) {
				$val = '';
			}

			$clean[ $field ] = is_string( $val ) ? trim( $val ) : (string) $val;
		}

		// --- Strict whitelist for `jenis` ---
		$jenis_whitelist = [ 'Dosen', 'Mahasiswa', 'Tenaga Kependidikan' ];
		if ( ! in_array( $clean['jenis'], $jenis_whitelist, true ) ) {
			$clean['jenis'] = '';
		}

		// --- jml_tim: integer only ---
		if ( $clean['jml_tim'] !== '' ) {
			$clean['jml_tim'] = (string) absint( $clean['jml_tim'] );
		}

		// --- NIP: alphanumeric + dash + dot only ---
		$clean['nip'] = preg_replace( '/[^a-zA-Z0-9\-\.]/', '', $clean['nip'] );

		// --- HP: digits + plus + dash only ---
		$clean['hp'] = preg_replace( '/[^0-9\+\-]/', '', $clean['hp'] );

		// --- Email: WordPress sanitize ---
		$clean['email'] = sanitize_email( $clean['email'] );

		// --- Text fields: strip HTML tags ---
		$text_fields = [ 'nama', 'prodi', 'skema', 'judul', 'ringkasan', 'anggota' ];
		foreach ( $text_fields as $f ) {
			$clean[ $f ] = wp_strip_all_tags( $clean[ $f ], true );
		}

		// --- anggota: cap to 500 characters ---
		$clean['anggota'] = mb_substr( $clean['anggota'], 0, 500 );

		return $clean;
	}

	/* ────────────────────────────────────────────────────────────
	 *  HANDLERS
	 * ──────────────────────────────────────────────────────────── */

	/**
	 * POST: Submit pendaftaran hibah.
	 *
	 * @return \WP_REST_Response
	 */
	public function handle_submit( \WP_REST_Request $request ): \WP_REST_Response {
		$params = $this->sanitize_input( $request->get_params() );

		// --- Validate required fields ---
		$labels = [
			'nama'      => 'Nama Lengkap & Gelar',
			'nip'       => 'NIDN / NIDK / NIM',
			'jenis'     => 'Jenis Pengusul',
			'prodi'     => 'Program Studi / Unit Kerja',
			'skema'     => 'Skema Hibah',
			'judul'     => 'Judul Usulan',
			'ringkasan' => 'Ringkasan Usulan',
			'email'     => 'Email Aktif',
			'hp'        => 'Nomor WhatsApp',
		];

		$errors = [];
		foreach ( $labels as $field => $label ) {
			if ( '' === trim( $params[ $field ] ) ) {
				$errors[ $field ] = $label . ' wajib diisi.';
			}
		}

		// Email format validation.
		if ( '' !== $params['email'] && ! is_email( $params['email'] ) ) {
			$errors['email'] = 'Format email tidak valid.';
		}

		// HP minimum 10 digit.
		$hp_digits = preg_replace( '/[^0-9]/', '', $params['hp'] );
		if ( strlen( $hp_digits ) < 10 ) {
			$errors['hp'] = 'Nomor WhatsApp minimal 10 digit.';
		}

		if ( ! empty( $errors ) ) {
			return new \WP_REST_Response(
				[ 'success' => false, 'errors' => $errors ],
				400
			);
		}

		// --- Generate unique registration number ---
		global $wpdb;
		$year = date( 'Y' );
		$last = $wpdb->get_var( $wpdb->prepare(
			"SELECT reg_no FROM {$this->table} WHERE reg_no LIKE %s ORDER BY id DESC LIMIT 1",
			"LP2M-{$year}-%"
		) );
		$seq    = $last ? ( (int) substr( $last, -5 ) + 1 ) : 1;
		$reg_no = sprintf( 'LP2M-%s-%05d', $year, $seq );

		// --- Insert ---
		$inserted = $wpdb->insert( $this->table, [
			'reg_no'    => $reg_no,
			'nama'      => $params['nama'],
			'nip'       => $params['nip'],
			'jenis'     => $params['jenis'],
			'prodi'     => $params['prodi'],
			'skema'     => $params['skema'],
			'judul'     => $params['judul'],
			'ringkasan' => $params['ringkasan'],
			'jml_tim'   => $params['jml_tim'],
			'anggota'   => $params['anggota'],
			'email'     => $params['email'],
			'hp'        => $params['hp'],
		] );

		if ( false === $inserted ) {
			return new \WP_REST_Response(
				[ 'success' => false, 'message' => 'Gagal menyimpan data. Silakan coba lagi.' ],
				500
			);
		}

		// --- Email notification to admin ---
		$this->send_admin_email( $params, $reg_no );

		return new \WP_REST_Response( [
			'success' => true,
			'reg_no'  => $reg_no,
			'message' => 'Pendaftaran berhasil dikirim. Nomor registrasi Anda: ' . $reg_no,
		], 201 );
	}

	/**
	 * GET: List all hibah registrations (paginated).
	 *
	 * Query params: per_page (default 20, max 100), page (default 1).
	 *
	 * @return \WP_REST_Response
	 */
	public function handle_list( \WP_REST_Request $request ): \WP_REST_Response {
		global $wpdb;

		$per_page = (int) ( $request->get_param( 'per_page' ) ?? 20 );
		$per_page = max( 1, min( $per_page, 100 ) );

		$page   = (int) ( $request->get_param( 'page' ) ?? 1 );
		$page   = max( 1, $page );
		$offset = ( $page - 1 ) * $per_page;

		// phpcs:disable WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		$total = (int) $wpdb->get_var( "SELECT COUNT(*) FROM {$this->table}" );
		$items = $wpdb->get_results(
			$wpdb->prepare(
				"SELECT id, reg_no, nama, jenis, prodi, skema, judul, email, hp, created_at
				 FROM {$this->table}
				 ORDER BY created_at DESC
				 LIMIT %d OFFSET %d",
				$per_page,
				$offset
			),
			ARRAY_A
		);
		// phpcs:enable

		return new \WP_REST_Response( [
			'success'     => true,
			'data'        => $items ?: [],
			'total'       => $total,
			'page'        => $page,
			'per_page'    => $per_page,
			'total_pages' => (int) ceil( $total / $per_page ),
		], 200 );
	}

	/**
	 * GET: Detail satu pendaftaran by ID.
	 *
	 * @return \WP_REST_Response
	 */
	public function handle_detail( \WP_REST_Request $request ): \WP_REST_Response {
		global $wpdb;

		$id   = (int) $request->get_param( 'id' );
		$item = $wpdb->get_row(
			$wpdb->prepare( "SELECT * FROM {$this->table} WHERE id = %d", $id ),
			ARRAY_A
		);

		if ( ! $item ) {
			return new \WP_REST_Response(
				[ 'success' => false, 'message' => 'Data tidak ditemukan.' ],
				404
			);
		}

		return new \WP_REST_Response( [ 'success' => true, 'data' => $item ], 200 );
	}

	/* ────────────────────────────────────────────────────────────
	 *  HELPERS
	 * ──────────────────────────────────────────────────────────── */

	/**
	 * Send admin email notification for new registration.
	 */
	private function send_admin_email( array $params, string $reg_no ): void {
		$admin_email = get_option( 'admin_email' );
		if ( empty( $admin_email ) ) {
			return;
		}

		wp_mail(
			$admin_email,
			sprintf( '[LP2M] Pendaftaran Hibah Baru — %s', $reg_no ),
			sprintf(
				"Nomor Registrasi: %s\nNama: %s\nNIP/NIDN: %s\nJenis: %s\nSkema: %s\nJudul: %s\nEmail: %s\nWhatsApp: %s\n\nCek dashboard: %s/wp-admin/",
				$reg_no,
				$params['nama'],
				$params['nip'],
				$params['jenis'],
				$params['skema'],
				$params['judul'],
				$params['email'],
				$params['hp'],
				get_site_url()
			)
		);
	}

	/* ────────────────────────────────────────────────────────────
	 *  REST ARGS (POST validation + sanitization at WP layer)
	 * ──────────────────────────────────────────────────────────── */

	private function get_post_args(): array {
		return [
			'nama'      => [
				'required'          => true,
				'sanitize_callback' => function ( $v ) {
					return wp_strip_all_tags( trim( (string) $v ), true );
				},
			],
			'nip'       => [
				'required'          => true,
				'sanitize_callback' => function ( $v ) {
					return preg_replace( '/[^a-zA-Z0-9\-\.]/', '', trim( (string) $v ) );
				},
			],
			'jenis'     => [
				'required'          => true,
				'sanitize_callback' => function ( $v ) {
					$allowed = [ 'Dosen', 'Mahasiswa', 'Tenaga Kependidikan' ];
					$v       = trim( (string) $v );
					return in_array( $v, $allowed, true ) ? $v : '';
				},
			],
			'prodi'     => [
				'required'          => true,
				'sanitize_callback' => function ( $v ) {
					return wp_strip_all_tags( trim( (string) $v ), true );
				},
			],
			'skema'     => [
				'required'          => true,
				'sanitize_callback' => function ( $v ) {
					return wp_strip_all_tags( trim( (string) $v ), true );
				},
			],
			'judul'     => [
				'required'          => true,
				'sanitize_callback' => function ( $v ) {
					return wp_strip_all_tags( trim( (string) $v ), true );
				},
			],
			'ringkasan' => [
				'required'          => true,
				'sanitize_callback' => function ( $v ) {
					return wp_strip_all_tags( trim( (string) $v ), true );
				},
			],
			'email'     => [
				'required'          => true,
				'sanitize_callback' => 'sanitize_email',
			],
			'hp'        => [
				'required'          => true,
				'sanitize_callback' => function ( $v ) {
					return preg_replace( '/[^0-9\+\-]/', '', trim( (string) $v ) );
				},
			],
			'jml_tim'   => [
				'required'          => false,
				'sanitize_callback' => function ( $v ) {
					return (string) absint( $v );
				},
			],
			'anggota'   => [
				'required'          => false,
				'sanitize_callback' => function ( $v ) {
					$v = wp_strip_all_tags( trim( (string) $v ), true );
					return mb_substr( $v, 0, 500 );
				},
			],
		];
	}
}

( new LP2M_Hibah_Receiver() )->init();
