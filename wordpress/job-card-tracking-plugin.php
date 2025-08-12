<?php
/**
 * Plugin Name: Job Card Tracking System
 * Plugin URI: https://yourwebsite.com/job-card-tracking
 * Description: A comprehensive real-time job card tracking system with analytics and reporting features.
 * Version: 1.0.0
 * Author: Your Name
 * License: GPL v2 or later
 * Text Domain: job-card-tracking
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

// Define plugin constants
define('JCT_PLUGIN_URL', plugin_dir_url(__FILE__));
define('JCT_PLUGIN_PATH', plugin_dir_path(__FILE__));
define('JCT_VERSION', '1.0.0');

class JobCardTrackingPlugin {
    
    public function __construct() {
        add_action('init', array($this, 'init'));
        add_action('wp_enqueue_scripts', array($this, 'enqueue_scripts'));
        add_action('admin_enqueue_scripts', array($this, 'enqueue_admin_scripts'));
        add_shortcode('job_card_tracking', array($this, 'render_shortcode'));
        
        // Admin menu
        add_action('admin_menu', array($this, 'add_admin_menu'));
        
        // AJAX handlers
        add_action('wp_ajax_jct_create_job', array($this, 'ajax_create_job'));
        add_action('wp_ajax_jct_update_job_status', array($this, 'ajax_update_job_status'));
        add_action('wp_ajax_jct_get_jobs', array($this, 'ajax_get_jobs'));
        
        // Database setup
        register_activation_hook(__FILE__, array($this, 'create_tables'));
    }
    
    public function init() {
        // Initialize plugin
    }
    
    public function enqueue_scripts() {
        wp_enqueue_script('jct-main', JCT_PLUGIN_URL . 'assets/js/job-tracking.js', array('jquery'), JCT_VERSION, true);
        wp_enqueue_style('jct-styles', JCT_PLUGIN_URL . 'assets/css/job-tracking.css', array(), JCT_VERSION);
        
        // Localize script for AJAX
        wp_localize_script('jct-main', 'jct_ajax', array(
            'ajax_url' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('jct_nonce')
        ));
    }
    
    public function enqueue_admin_scripts($hook) {
        if (strpos($hook, 'job-card-tracking') !== false) {
            wp_enqueue_script('jct-admin', JCT_PLUGIN_URL . 'assets/js/admin.js', array('jquery'), JCT_VERSION, true);
            wp_enqueue_style('jct-admin-styles', JCT_PLUGIN_URL . 'assets/css/admin.css', array(), JCT_VERSION);
        }
    }
    
    public function add_admin_menu() {
        add_menu_page(
            'Job Card Tracking',
            'Job Tracking',
            'manage_options',
            'job-card-tracking',
            array($this, 'admin_page'),
            'dashicons-clipboard',
            30
        );
        
        add_submenu_page(
            'job-card-tracking',
            'Analytics',
            'Analytics',
            'manage_options',
            'job-card-analytics',
            array($this, 'analytics_page')
        );
    }
    
    public function admin_page() {
        include JCT_PLUGIN_PATH . 'templates/admin-page.php';
    }
    
    public function analytics_page() {
        include JCT_PLUGIN_PATH . 'templates/analytics-page.php';
    }
    
    public function render_shortcode($atts) {
        $atts = shortcode_atts(array(
            'view' => 'grid',
            'show_analytics' => 'false',
            'department' => '',
            'status' => 'all'
        ), $atts);
        
        ob_start();
        include JCT_PLUGIN_PATH . 'templates/frontend-display.php';
        return ob_get_clean();
    }
    
    public function create_tables() {
        global $wpdb;
        
        $table_name = $wpdb->prefix . 'job_cards';
        
        $charset_collate = $wpdb->get_charset_collate();
        
        $sql = "CREATE TABLE $table_name (
            id mediumint(9) NOT NULL AUTO_INCREMENT,
            job_id varchar(20) NOT NULL,
            title varchar(255) NOT NULL,
            description text,
            status varchar(20) DEFAULT 'pending',
            priority varchar(20) DEFAULT 'medium',
            assignee varchar(100),
            department varchar(100),
            estimated_hours int(11) DEFAULT 0,
            actual_hours int(11) DEFAULT 0,
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            due_date datetime,
            tags text,
            PRIMARY KEY (id),
            UNIQUE KEY job_id (job_id)
        ) $charset_collate;";
        
        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
        dbDelta($sql);
    }
    
    public function ajax_create_job() {
        check_ajax_referer('jct_nonce', 'nonce');
        
        if (!current_user_can('edit_posts')) {
            wp_die('Unauthorized');
        }
        
        global $wpdb;
        $table_name = $wpdb->prefix . 'job_cards';
        
        $title = sanitize_text_field($_POST['title']);
        $description = sanitize_textarea_field($_POST['description']);
        $priority = sanitize_text_field($_POST['priority']);
        $assignee = sanitize_text_field($_POST['assignee']);
        $department = sanitize_text_field($_POST['department']);
        $estimated_hours = intval($_POST['estimated_hours']);
        $due_date = sanitize_text_field($_POST['due_date']);
        $tags = sanitize_text_field($_POST['tags']);
        
        // Generate job ID
        $job_count = $wpdb->get_var("SELECT COUNT(*) FROM $table_name") + 1;
        $job_id = 'JOB-' . str_pad($job_count, 3, '0', STR_PAD_LEFT);
        
        $result = $wpdb->insert(
            $table_name,
            array(
                'job_id' => $job_id,
                'title' => $title,
                'description' => $description,
                'priority' => $priority,
                'assignee' => $assignee,
                'department' => $department,
                'estimated_hours' => $estimated_hours,
                'due_date' => $due_date,
                'tags' => $tags
            )
        );
        
        if ($result) {
            wp_send_json_success(array('message' => 'Job created successfully', 'job_id' => $job_id));
        } else {
            wp_send_json_error('Failed to create job');
        }
    }
    
    public function ajax_update_job_status() {
        check_ajax_referer('jct_nonce', 'nonce');
        
        if (!current_user_can('edit_posts')) {
            wp_die('Unauthorized');
        }
        
        global $wpdb;
        $table_name = $wpdb->prefix . 'job_cards';
        
        $job_id = sanitize_text_field($_POST['job_id']);
        $status = sanitize_text_field($_POST['status']);
        
        $result = $wpdb->update(
            $table_name,
            array('status' => $status),
            array('job_id' => $job_id)
        );
        
        if ($result !== false) {
            wp_send_json_success('Status updated successfully');
        } else {
            wp_send_json_error('Failed to update status');
        }
    }
    
    public function ajax_get_jobs() {
        check_ajax_referer('jct_nonce', 'nonce');
        
        global $wpdb;
        $table_name = $wpdb->prefix . 'job_cards';
        
        $search = sanitize_text_field($_GET['search'] ?? '');
        $status = sanitize_text_field($_GET['status'] ?? 'all');
        $priority = sanitize_text_field($_GET['priority'] ?? 'all');
        
        $where_conditions = array('1=1');
        
        if (!empty($search)) {
            $where_conditions[] = $wpdb->prepare(
                "(title LIKE %s OR description LIKE %s OR assignee LIKE %s)",
                '%' . $wpdb->esc_like($search) . '%',
                '%' . $wpdb->esc_like($search) . '%',
                '%' . $wpdb->esc_like($search) . '%'
            );
        }
        
        if ($status !== 'all') {
            $where_conditions[] = $wpdb->prepare("status = %s", $status);
        }
        
        if ($priority !== 'all') {
            $where_conditions[] = $wpdb->prepare("priority = %s", $priority);
        }
        
        $where_clause = implode(' AND ', $where_conditions);
        
        $jobs = $wpdb->get_results("SELECT * FROM $table_name WHERE $where_clause ORDER BY created_at DESC");
        
        wp_send_json_success($jobs);
    }
}

// Initialize the plugin
new JobCardTrackingPlugin();
?>
