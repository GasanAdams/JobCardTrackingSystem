<?php
// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

// Handle form submission
if (isset($_POST['submit']) && wp_verify_nonce($_POST['jct_settings_nonce'], 'jct_settings')) {
    // Save settings
    update_option('jct_default_priority', sanitize_text_field($_POST['default_priority']));
    update_option('jct_auto_refresh', intval($_POST['auto_refresh']));
    update_option('jct_items_per_page', intval($_POST['items_per_page']));
    update_option('jct_enable_notifications', isset($_POST['enable_notifications']) ? 1 : 0);
    update_option('jct_default_department', sanitize_text_field($_POST['default_department']));
    
    echo '<div class="notice notice-success"><p>' . __('Settings saved successfully!', 'job-card-tracking') . '</p></div>';
}

// Get current settings
$default_priority = get_option('jct_default_priority', 'medium');
$auto_refresh = get_option('jct_auto_refresh', 30);
$items_per_page = get_option('jct_items_per_page', 20);
$enable_notifications = get_option('jct_enable_notifications', 1);
$default_department = get_option('jct_default_department', '');
?>

<div class="wrap">
    <h1><?php _e('Job Card Tracking Settings', 'job-card-tracking'); ?></h1>
    
    <form method="post" action="">
        <?php wp_nonce_field('jct_settings', 'jct_settings_nonce'); ?>
        
        <table class="form-table">
            <tr>
                <th scope="row">
                    <label for="default_priority"><?php _e('Default Priority', 'job-card-tracking'); ?></label>
                </th>
                <td>
                    <select name="default_priority" id="default_priority">
                        <option value="low" <?php selected($default_priority, 'low'); ?>><?php _e('Low', 'job-card-tracking'); ?></option>
                        <option value="medium" <?php selected($default_priority, 'medium'); ?>><?php _e('Medium', 'job-card-tracking'); ?></option>
                        <option value="high" <?php selected($default_priority, 'high'); ?>><?php _e('High', 'job-card-tracking'); ?></option>
                        <option value="urgent" <?php selected($default_priority, 'urgent'); ?>><?php _e('Urgent', 'job-card-tracking'); ?></option>
                    </select>
                    <p class="description"><?php _e('Default priority for new job cards', 'job-card-tracking'); ?></p>
                </td>
            </tr>
            
            <tr>
                <th scope="row">
                    <label for="auto_refresh"><?php _e('Auto Refresh Interval', 'job-card-tracking'); ?></label>
                </th>
                <td>
                    <input type="number" name="auto_refresh" id="auto_refresh" value="<?php echo esc_attr($auto_refresh); ?>" min="10" max="300" class="small-text">
                    <span><?php _e('seconds', 'job-card-tracking'); ?></span>
                    <p class="description"><?php _e('How often to automatically refresh job data (10-300 seconds)', 'job-card-tracking'); ?></p>
                </td>
            </tr>
            
            <tr>
                <th scope="row">
                    <label for="items_per_page"><?php _e('Items Per Page', 'job-card-tracking'); ?></label>
                </th>
                <td>
                    <input type="number" name="items_per_page" id="items_per_page" value="<?php echo esc_attr($items_per_page); ?>" min="5" max="100" class="small-text">
                    <p class="description"><?php _e('Number of job cards to display per page (5-100)', 'job-card-tracking'); ?></p>
                </td>
            </tr>
            
            <tr>
                <th scope="row">
                    <label for="default_department"><?php _e('Default Department', 'job-card-tracking'); ?></label>
                </th>
                <td>
                    <input type="text" name="default_department" id="default_department" value="<?php echo esc_attr($default_department); ?>" class="regular-text">
                    <p class="description"><?php _e('Default department for new job cards', 'job-card-tracking'); ?></p>
                </td>
            </tr>
            
            <tr>
                <th scope="row"><?php _e('Notifications', 'job-card-tracking'); ?></th>
                <td>
                    <fieldset>
                        <label for="enable_notifications">
                            <input type="checkbox" name="enable_notifications" id="enable_notifications" value="1" <?php checked($enable_notifications, 1); ?>>
                            <?php _e('Enable browser notifications for job updates', 'job-card-tracking'); ?>
                        </label>
                    </fieldset>
                </td>
            </tr>
        </table>
        
        <h2><?php _e('Shortcode Usage', 'job-card-tracking'); ?></h2>
        <table class="form-table">
            <tr>
                <th scope="row"><?php _e('Basic Shortcode', 'job-card-tracking'); ?></th>
                <td>
                    <code>[job_card_tracking]</code>
                    <p class="description"><?php _e('Display the job tracking system with default settings', 'job-card-tracking'); ?></p>
                </td>
            </tr>
            <tr>
                <th scope="row"><?php _e('Advanced Shortcode', 'job-card-tracking'); ?></th>
                <td>
                    <code>[job_card_tracking view="grid" department="IT" status="pending" show_create_button="true"]</code>
                    <p class="description"><?php _e('Available attributes: view (grid/list), department, status, show_create_button (true/false)', 'job-card-tracking'); ?></p>
                </td>
            </tr>
        </table>
        
        <?php submit_button(); ?>
    </form>
    
    <h2><?php _e('System Information', 'job-card-tracking'); ?></h2>
    <table class="form-table">
        <tr>
            <th scope="row"><?php _e('Plugin Version', 'job-card-tracking'); ?></th>
            <td><?php echo JCT_VERSION; ?></td>
        </tr>
        <tr>
            <th scope="row"><?php _e('Database Version', 'job-card-tracking'); ?></th>
            <td><?php echo get_option('jct_db_version', '1.0'); ?></td>
        </tr>
        <tr>
            <th scope="row"><?php _e('Total Jobs', 'job-card-tracking'); ?></th>
            <td>
                <?php
                global $wpdb;
                $table_name = $wpdb->prefix . 'job_cards';
                $total_jobs = $wpdb->get_var("SELECT COUNT(*) FROM $table_name");
                echo intval($total_jobs);
                ?>
            </td>
        </tr>
    </table>
</div>
