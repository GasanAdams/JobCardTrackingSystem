<?php
/**
 * Plugin Name: Job Card Tracking System
 * Plugin URI: https://carbonbros.com/job-card-tracking
 * Description: A comprehensive real-time job card tracking system with analytics, reporting features, and auto-refresh functionality. Includes dark/light mode, real-time updates, and advanced filtering.
 * Version: 1.0.0
 * Author: Carbon Bros
 * Author URI: https://carbonbros.com
 * License: GPL v2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: job-card-tracking
 * Domain Path: /languages
 * Requires at least: 5.0
 * Tested up to: 6.4
 * Requires PHP: 7.4
 * Network: false
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
        
        // AJAX handlers - both logged in and non-logged in users
        add_action('wp_ajax_jct_create_job', array($this, 'ajax_create_job'));
        add_action('wp_ajax_nopriv_jct_create_job', array($this, 'ajax_create_job'));
        
        add_action('wp_ajax_jct_update_job_status', array($this, 'ajax_update_job_status'));
        add_action('wp_ajax_nopriv_jct_update_job_status', array($this, 'ajax_update_job_status'));
        
        add_action('wp_ajax_jct_get_jobs', array($this, 'ajax_get_jobs'));
        add_action('wp_ajax_nopriv_jct_get_jobs', array($this, 'ajax_get_jobs'));
        
        add_action('wp_ajax_jct_delete_job', array($this, 'ajax_delete_job'));
        add_action('wp_ajax_nopriv_jct_delete_job', array($this, 'ajax_delete_job'));
        
        add_action('wp_ajax_jct_get_stats', array($this, 'ajax_get_stats'));
        add_action('wp_ajax_nopriv_jct_get_stats', array($this, 'ajax_get_stats'));
        
        add_action('wp_ajax_jct_export_jobs', array($this, 'ajax_export_jobs'));
        
        // Database setup
        register_activation_hook(__FILE__, array($this, 'create_tables'));
        register_deactivation_hook(__FILE__, array($this, 'deactivate_plugin'));
    }
    
    public function init() {
        load_plugin_textdomain('job-card-tracking', false, dirname(plugin_basename(__FILE__)) . '/languages');
    }
    
    public function enqueue_scripts() {
        wp_enqueue_script('jct-main', JCT_PLUGIN_URL . 'assets/js/job-tracking.js', array('jquery'), JCT_VERSION, true);
        wp_enqueue_style('jct-styles', JCT_PLUGIN_URL . 'assets/css/job-tracking.css', array(), JCT_VERSION);
        
        wp_localize_script('jct-main', 'jct_ajax', array(
            'ajax_url' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('jct_nonce'),
            'can_edit' => true, // Allow all users for frontend
            'can_delete' => true
        ));
    }
    
    public function enqueue_admin_scripts($hook) {
        if (strpos($hook, 'job-card-tracking') !== false) {
            wp_enqueue_script('jct-admin', JCT_PLUGIN_URL . 'assets/js/admin.js', array('jquery'), JCT_VERSION, true);
            wp_enqueue_style('jct-admin-styles', JCT_PLUGIN_URL . 'assets/css/admin.css', array(), JCT_VERSION);
            
            wp_localize_script('jct-admin', 'jct_ajax', array(
                'ajax_url' => admin_url('admin-ajax.php'),
                'nonce' => wp_create_nonce('jct_nonce'),
                'can_edit' => current_user_can('edit_posts'),
                'can_delete' => current_user_can('delete_posts')
            ));
        }
    }
    
    public function add_admin_menu() {
        add_menu_page(
            __('Job Card Tracking', 'job-card-tracking'),
            __('Job Tracking', 'job-card-tracking'),
            'manage_options',
            'job-card-tracking',
            array($this, 'admin_page'),
            'dashicons-clipboard',
            30
        );
        
        add_submenu_page(
            'job-card-tracking',
            __('All Jobs', 'job-card-tracking'),
            __('All Jobs', 'job-card-tracking'),
            'manage_options',
            'job-card-tracking',
            array($this, 'admin_page')
        );
        
        add_submenu_page(
            'job-card-tracking',
            __('Analytics', 'job-card-tracking'),
            __('Analytics', 'job-card-tracking'),
            'manage_options',
            'job-card-analytics',
            array($this, 'analytics_page')
        );
        
        add_submenu_page(
            'job-card-tracking',
            __('Settings', 'job-card-tracking'),
            __('Settings', 'job-card-tracking'),
            'manage_options',
            'job-card-settings',
            array($this, 'settings_page')
        );
    }
    
    public function admin_page() {
        include JCT_PLUGIN_PATH . 'templates/admin-page.php';
    }
    
    public function analytics_page() {
        include JCT_PLUGIN_PATH . 'templates/analytics-page.php';
    }
    
    public function settings_page() {
        include JCT_PLUGIN_PATH . 'templates/settings-page.php';
    }
    
    public function render_shortcode($atts) {
        $atts = shortcode_atts(array(
            'view' => 'grid',
            'show_analytics' => 'false',
            'department' => '',
            'status' => 'all',
            'show_create_button' => 'true'
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
            estimated_hours decimal(5,2) DEFAULT 0,
            actual_hours decimal(5,2) DEFAULT 0,
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            due_date datetime,
            tags text,
            created_by bigint(20) DEFAULT 0,
            PRIMARY KEY (id),
            UNIQUE KEY job_id (job_id),
            KEY status (status),
            KEY priority (priority),
            KEY department (department),
            KEY assignee (assignee)
        ) $charset_collate;";
        
        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
        dbDelta($sql);
        
        add_option('jct_db_version', '1.0');
        $this->add_sample_data();
    }
    
    private function add_sample_data() {
        global $wpdb;
        $table_name = $wpdb->prefix . 'job_cards';
        
        $count = $wpdb->get_var("SELECT COUNT(*) FROM $table_name");
        if ($count > 0) {
            return;
        }
        
        $current_user_id = 1; // Default to admin user
        
        $sample_jobs = array(
            array(
                'job_id' => 'JOB-001',
                'title' => 'Server Maintenance',
                'description' => 'Routine server maintenance and updates for production servers',
                'status' => 'in-progress',
                'priority' => 'high',
                'assignee' => 'John Smith',
                'department' => 'IT',
                'estimated_hours' => 8.0,
                'actual_hours' => 5.5,
                'due_date' => date('Y-m-d H:i:s', strtotime('+2 days')),
                'tags' => 'maintenance,server,critical',
                'created_by' => $current_user_id
            ),
            array(
                'job_id' => 'JOB-002',
                'title' => 'Database Backup',
                'description' => 'Weekly database backup and verification process',
                'status' => 'completed',
                'priority' => 'medium',
                'assignee' => 'Sarah Johnson',
                'department' => 'IT',
                'estimated_hours' => 4.0,
                'actual_hours' => 3.5,
                'due_date' => date('Y-m-d H:i:s', strtotime('+1 day')),
                'tags' => 'backup,database,routine',
                'created_by' => $current_user_id
            ),
            array(
                'job_id' => 'JOB-003',
                'title' => 'Equipment Inspection',
                'description' => 'Monthly safety inspection of manufacturing equipment',
                'status' => 'pending',
                'priority' => 'urgent',
                'assignee' => 'Mike Wilson',
                'department' => 'Manufacturing',
                'estimated_hours' => 6.0,
                'due_date' => date('Y-m-d H:i:s', strtotime('+1 day')),
                'tags' => 'inspection,safety,equipment',
                'created_by' => $current_user_id
            ),
            array(
                'job_id' => 'JOB-004',
                'title' => 'Network Security Audit',
                'description' => 'Quarterly network security assessment and vulnerability testing',
                'status' => 'on-hold',
                'priority' => 'high',
                'assignee' => 'Lisa Chen',
                'department' => 'Security',
                'estimated_hours' => 12.0,
                'actual_hours' => 2.0,
                'due_date' => date('Y-m-d H:i:s', strtotime('+5 days')),
                'tags' => 'security,audit,network',
                'created_by' => $current_user_id
            ),
            array(
                'job_id' => 'JOB-005',
                'title' => 'Software Update Deployment',
                'description' => 'Deploy latest software updates across all workstations',
                'status' => 'completed',
                'priority' => 'medium',
                'assignee' => 'John Smith',
                'department' => 'IT',
                'estimated_hours' => 6.0,
                'actual_hours' => 7.0,
                'due_date' => date('Y-m-d H:i:s', strtotime('-1 day')),
                'tags' => 'software,deployment,update',
                'created_by' => $current_user_id
            )
        );
        
        foreach ($sample_jobs as $job) {
            $wpdb->insert($table_name, $job);
        }
    }
    
    public function deactivate_plugin() {
        wp_clear_scheduled_hook('jct_cleanup_jobs');
    }
    
    // AJAX Handlers
    public function ajax_create_job() {
        // Check nonce
        $nonce = isset($_POST['nonce']) ? $_POST['nonce'] : '';
        if (!wp_verify_nonce($nonce, 'jct_nonce')) {
            wp_send_json_error('Security check failed');
            return;
        }
        
        global $wpdb;
        $table_name = $wpdb->prefix . 'job_cards';
        
        $title = sanitize_text_field($_POST['title'] ?? '');
        $description = sanitize_textarea_field($_POST['description'] ?? '');
        $priority = sanitize_text_field($_POST['priority'] ?? 'medium');
        $assignee = sanitize_text_field($_POST['assignee'] ?? '');
        $department = sanitize_text_field($_POST['department'] ?? '');
        $estimated_hours = floatval($_POST['estimated_hours'] ?? 0);
        $due_date = sanitize_text_field($_POST['due_date'] ?? '');
        $tags = sanitize_text_field($_POST['tags'] ?? '');
        
        if (empty($title) || empty($assignee)) {
            wp_send_json_error('Title and Assignee are required fields');
            return;
        }
        
        // Generate unique job ID
        $job_count = $wpdb->get_var("SELECT COUNT(*) FROM $table_name") + 1;
        $job_id = 'JOB-' . str_pad($job_count, 3, '0', STR_PAD_LEFT);
        
        while ($wpdb->get_var($wpdb->prepare("SELECT COUNT(*) FROM $table_name WHERE job_id = %s", $job_id)) > 0) {
            $job_count++;
            $job_id = 'JOB-' . str_pad($job_count, 3, '0', STR_PAD_LEFT);
        }
        
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
                'due_date' => $due_date ? $due_date : null,
                'tags' => $tags,
                'created_by' => get_current_user_id() ?: 1
            ),
            array('%s', '%s', '%s', '%s', '%s', '%s', '%f', '%s', '%s', '%d')
        );
        
        if ($result) {
            wp_send_json_success(array(
                'message' => 'Job created successfully',
                'job_id' => $job_id
            ));
        } else {
            wp_send_json_error('Failed to create job: ' . $wpdb->last_error);
        }
    }
    
    public function ajax_update_job_status() {
        // Check nonce
        $nonce = isset($_POST['nonce']) ? $_POST['nonce'] : '';
        if (!wp_verify_nonce($nonce, 'jct_nonce')) {
            wp_send_json_error('Security check failed');
            return;
        }
        
        global $wpdb;
        $table_name = $wpdb->prefix . 'job_cards';
        
        $job_id = sanitize_text_field($_POST['job_id'] ?? '');
        $status = sanitize_text_field($_POST['status'] ?? '');
        
        if (empty($job_id) || empty($status)) {
            wp_send_json_error('Job ID and status are required');
            return;
        }
        
        $valid_statuses = array('pending', 'in-progress', 'completed', 'on-hold', 'cancelled');
        if (!in_array($status, $valid_statuses)) {
            wp_send_json_error('Invalid status');
            return;
        }
        
        // Check if job exists
        $job_exists = $wpdb->get_var($wpdb->prepare("SELECT COUNT(*) FROM $table_name WHERE job_id = %s", $job_id));
        if (!$job_exists) {
            wp_send_json_error('Job not found');
            return;
        }
        
        $result = $wpdb->update(
            $table_name,
            array('status' => $status),
            array('job_id' => $job_id),
            array('%s'),
            array('%s')
        );
        
        if ($result !== false) {
            wp_send_json_success('Status updated successfully');
        } else {
            wp_send_json_error('Failed to update status: ' . $wpdb->last_error);
        }
    }
    
    public function ajax_get_jobs() {
        // Check nonce
        $nonce = isset($_GET['nonce']) ? $_GET['nonce'] : '';
        if (!wp_verify_nonce($nonce, 'jct_nonce')) {
            wp_send_json_error('Security check failed');
            return;
        }
        
        global $wpdb;
        $table_name = $wpdb->prefix . 'job_cards';
        
        $search = sanitize_text_field($_GET['search'] ?? '');
        $status = sanitize_text_field($_GET['status'] ?? 'all');
        $priority = sanitize_text_field($_GET['priority'] ?? 'all');
        $department = sanitize_text_field($_GET['department'] ?? '');
        $limit = intval($_GET['limit'] ?? 50);
        $offset = intval($_GET['offset'] ?? 0);
        
        $where_conditions = array('1=1');
        $prepare_values = array();
        
        if (!empty($search)) {
            $where_conditions[] = "(title LIKE %s OR description LIKE %s OR assignee LIKE %s OR job_id LIKE %s)";
            $search_term = '%' . $wpdb->esc_like($search) . '%';
            $prepare_values = array_merge($prepare_values, array($search_term, $search_term, $search_term, $search_term));
        }
        
        if ($status !== 'all') {
            $where_conditions[] = "status = %s";
            $prepare_values[] = $status;
        }
        
        if ($priority !== 'all') {
            $where_conditions[] = "priority = %s";
            $prepare_values[] = $priority;
        }
        
        if (!empty($department)) {
            $where_conditions[] = "department = %s";
            $prepare_values[] = $department;
        }
        
        $where_clause = implode(' AND ', $where_conditions);
        
        $sql = "SELECT * FROM $table_name WHERE $where_clause ORDER BY created_at DESC LIMIT %d OFFSET %d";
        $prepare_values[] = $limit;
        $prepare_values[] = $offset;
        
        if (!empty($prepare_values)) {
            $jobs = $wpdb->get_results($wpdb->prepare($sql, $prepare_values));
        } else {
            $jobs = $wpdb->get_results("SELECT * FROM $table_name ORDER BY created_at DESC LIMIT $limit OFFSET $offset");
        }
        
        $count_sql = "SELECT COUNT(*) FROM $table_name WHERE $where_clause";
        if (!empty($prepare_values)) {
            $count_prepare_values = array_slice($prepare_values, 0, -2);
            $total = $wpdb->get_var($wpdb->prepare($count_sql, $count_prepare_values));
        } else {
            $total = $wpdb->get_var("SELECT COUNT(*) FROM $table_name");
        }
        
        wp_send_json_success(array(
            'jobs' => $jobs,
            'total' => intval($total),
            'limit' => $limit,
            'offset' => $offset
        ));
    }
    
    public function ajax_delete_job() {
        // Check nonce
        $nonce = isset($_POST['nonce']) ? $_POST['nonce'] : '';
        if (!wp_verify_nonce($nonce, 'jct_nonce')) {
            wp_send_json_error('Security check failed');
            return;
        }
        
        global $wpdb;
        $table_name = $wpdb->prefix . 'job_cards';
        
        $job_id = sanitize_text_field($_POST['job_id'] ?? '');
        
        if (empty($job_id)) {
            wp_send_json_error('Job ID is required');
            return;
        }
        
        $result = $wpdb->delete(
            $table_name,
            array('job_id' => $job_id),
            array('%s')
        );
        
        if ($result) {
            wp_send_json_success('Job deleted successfully');
        } else {
            wp_send_json_error('Failed to delete job');
        }
    }
    
    public function ajax_get_stats() {
        // Check nonce
        $nonce = isset($_GET['nonce']) ? $_GET['nonce'] : '';
        if (!wp_verify_nonce($nonce, 'jct_nonce')) {
            wp_send_json_error('Security check failed');
            return;
        }
        
        global $wpdb;
        $table_name = $wpdb->prefix . 'job_cards';
        
        $stats = array(
            'total' => intval($wpdb->get_var("SELECT COUNT(*) FROM $table_name")),
            'pending' => intval($wpdb->get_var("SELECT COUNT(*) FROM $table_name WHERE status = 'pending'")),
            'in_progress' => intval($wpdb->get_var("SELECT COUNT(*) FROM $table_name WHERE status = 'in-progress'")),
            'completed' => intval($wpdb->get_var("SELECT COUNT(*) FROM $table_name WHERE status = 'completed'")),
            'on_hold' => intval($wpdb->get_var("SELECT COUNT(*) FROM $table_name WHERE status = 'on-hold'")),
            'cancelled' => intval($wpdb->get_var("SELECT COUNT(*) FROM $table_name WHERE status = 'cancelled'")),
            'overdue' => intval($wpdb->get_var("SELECT COUNT(*) FROM $table_name WHERE due_date < NOW() AND status != 'completed'")),
            'departments' => $wpdb->get_results("SELECT department, COUNT(*) as count FROM $table_name WHERE department != '' GROUP BY department"),
            'priorities' => $wpdb->get_results("SELECT priority, COUNT(*) as count FROM $table_name GROUP BY priority")
        );
        
        wp_send_json_success($stats);
    }

    public function ajax_export_jobs() {
        // Check nonce
        $nonce = isset($_GET['nonce']) ? $_GET['nonce'] : '';
        if (!wp_verify_nonce($nonce, 'jct_nonce')) {
            wp_send_json_error('Security check failed');
            return;
        }
        
        if (!current_user_can('export')) {
            wp_send_json_error('Unauthorized access');
            return;
        }
        
        $format = sanitize_text_field($_GET['format'] ?? 'csv');
        $filters = array(
            'status' => sanitize_text_field($_GET['status'] ?? 'all'),
            'priority' => sanitize_text_field($_GET['priority'] ?? 'all'),
            'department' => sanitize_text_field($_GET['department'] ?? ''),
            'search' => sanitize_text_field($_GET['search'] ?? '')
        );
        
        $jobs = $this->get_jobs_for_export($filters);
        
        switch ($format) {
            case 'csv':
                $this->export_csv($jobs);
                break;
            case 'json':
                $this->export_json($jobs);
                break;
            default:
                wp_send_json_error('Invalid export format');
        }
    }

    private function get_jobs_for_export($filters) {
        global $wpdb;
        $table_name = $wpdb->prefix . 'job_cards';
        
        $where_conditions = array('1=1');
        $prepare_values = array();
        
        if (!empty($filters['search'])) {
            $where_conditions[] = "(title LIKE %s OR description LIKE %s OR assignee LIKE %s OR job_id LIKE %s)";
            $search_term = '%' . $wpdb->esc_like($filters['search']) . '%';
            $prepare_values = array_merge($prepare_values, array($search_term, $search_term, $search_term, $search_term));
        }
        
        if ($filters['status'] !== 'all') {
            $where_conditions[] = "status = %s";
            $prepare_values[] = $filters['status'];
        }
        
        if ($filters['priority'] !== 'all') {
            $where_conditions[] = "priority = %s";
            $prepare_values[] = $filters['priority'];
        }
        
        if (!empty($filters['department'])) {
            $where_conditions[] = "department = %s";
            $prepare_values[] = $filters['department'];
        }
        
        $where_clause = implode(' AND ', $where_conditions);
        $sql = "SELECT * FROM $table_name WHERE $where_clause ORDER BY created_at DESC";
        
        if (!empty($prepare_values)) {
            return $wpdb->get_results($wpdb->prepare($sql, $prepare_values));
        } else {
            return $wpdb->get_results($sql);
        }
    }

    private function export_csv($jobs) {
        $filename = 'job-cards-export-' . date('Y-m-d-H-i-s') . '.csv';
        
        header('Content-Type: text/csv');
        header('Content-Disposition: attachment; filename="' . $filename . '"');
        header('Pragma: no-cache');
        header('Expires: 0');
        
        $output = fopen('php://output', 'w');
        
        $headers = array(
            'Job ID', 'Title', 'Description', 'Status', 'Priority', 
            'Assignee', 'Department', 'Estimated Hours', 'Actual Hours',
            'Created Date', 'Updated Date', 'Due Date', 'Tags'
        );
        
        fputcsv($output, $headers);
        
        foreach ($jobs as $job) {
            $row = array(
                $job->job_id,
                $job->title,
                $job->description,
                ucfirst(str_replace('-', ' ', $job->status)),
                ucfirst($job->priority),
                $job->assignee,
                $job->department,
                $job->estimated_hours,
                $job->actual_hours,
                $job->created_at,
                $job->updated_at,
                $job->due_date,
                $job->tags
            );
            fputcsv($output, $row);
        }
        
        fclose($output);
        exit;
    }

    private function export_json($jobs) {
        $filename = 'job-cards-export-' . date('Y-m-d-H-i-s') . '.json';
        
        header('Content-Type: application/json');
        header('Content-Disposition: attachment; filename="' . $filename . '"');
        header('Pragma: no-cache');
        header('Expires: 0');
        
        $export_data = array(
            'export_date' => current_time('mysql'),
            'total_jobs' => count($jobs),
            'jobs' => array()
        );
        
        foreach ($jobs as $job) {
            $export_data['jobs'][] = array(
                'job_id' => $job->job_id,
                'title' => $job->title,
                'description' => $job->description,
                'status' => $job->status,
                'priority' => $job->priority,
                'assignee' => $job->assignee,
                'department' => $job->department,
                'estimated_hours' => floatval($job->estimated_hours),
                'actual_hours' => floatval($job->actual_hours),
                'created_at' => $job->created_at,
                'updated_at' => $job->updated_at,
                'due_date' => $job->due_date,
                'tags' => $job->tags ? explode(',', $job->tags) : array()
            );
        }
        
        echo json_encode($export_data, JSON_PRETTY_PRINT);
        exit;
    }
}

// Initialize the plugin
new JobCardTrackingPlugin();
?>
