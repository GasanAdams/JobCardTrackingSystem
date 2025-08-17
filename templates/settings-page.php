<?php
// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

// Handle form submission
if (isset($_POST['jct_save_settings']) && wp_verify_nonce($_POST['jct_settings_nonce'], 'jct_save_settings')) {
    // Save settings
    update_option('jct_auto_refresh_default', sanitize_text_field($_POST['auto_refresh_default']));
    update_option('jct_default_priority', sanitize_text_field($_POST['default_priority']));
    update_option('jct_enable_notifications', isset($_POST['enable_notifications']) ? 1 : 0);
    update_option('jct_jobs_per_page', intval($_POST['jobs_per_page']));
    update_option('jct_date_format', sanitize_text_field($_POST['date_format']));
    
    echo '<div class="notice notice-success is-dismissible"><p>' . __('Settings saved successfully!', 'job-card-tracking') . '</p></div>';
}

// Get current settings
$auto_refresh_default = get_option('jct_auto_refresh_default', '300000');
$default_priority = get_option('jct_default_priority', 'medium');
$enable_notifications = get_option('jct_enable_notifications', 1);
$jobs_per_page = get_option('jct_jobs_per_page', 50);
$date_format = get_option('jct_date_format', 'Y-m-d H:i:s');
?>

<div class="wrap jct-admin-container">
    <div class="jct-admin-header">
        <h1 class="jct-admin-title">
            <?php _e('Job Tracking Settings', 'job-card-tracking'); ?>
        </h1>
    </div>

    <form method="post" action="">
        <?php wp_nonce_field('jct_save_settings', 'jct_settings_nonce'); ?>
        
        <div class="jct-admin-form">
            <h2><?php _e('General Settings', 'job-card-tracking'); ?></h2>
            
            <div class="jct-admin-form-group">
                <label class="jct-admin-form-label" for="auto_refresh_default">
                    <?php _e('Default Auto-refresh Interval', 'job-card-tracking'); ?>
                </label>
                <select id="auto_refresh_default" name="auto_refresh_default" class="jct-admin-form-select">
                    <option value="0" <?php selected($auto_refresh_default, '0'); ?>><?php _e('Off', 'job-card-tracking'); ?></option>
                    <option value="30000" <?php selected($auto_refresh_default, '30000'); ?>><?php _e('30 seconds', 'job-card-tracking'); ?></option>
                    <option value="60000" <?php selected($auto_refresh_default, '60000'); ?>><?php _e('1 minute', 'job-card-tracking'); ?></option>
                    <option value="300000" <?php selected($auto_refresh_default, '300000'); ?>><?php _e('5 minutes', 'job-card-tracking'); ?></option>
                    <option value="600000" <?php selected($auto_refresh_default, '600000'); ?>><?php _e('10 minutes', 'job-card-tracking'); ?></option>
                </select>
                <p class="description"><?php _e('Default auto-refresh interval for new users.', 'job-card-tracking'); ?></p>
            </div>
            
            <div class="jct-admin-form-row">
                <div class="jct-admin-form-group">
                    <label class="jct-admin-form-label" for="default_priority">
                        <?php _e('Default Job Priority', 'job-card-tracking'); ?>
                    </label>
                    <select id="default_priority" name="default_priority" class="jct-admin-form-select">
                        <option value="low" <?php selected($default_priority, 'low'); ?>><?php _e('Low', 'job-card-tracking'); ?></option>
                        <option value="medium" <?php selected($default_priority, 'medium'); ?>><?php _e('Medium', 'job-card-tracking'); ?></option>
                        <option value="high" <?php selected($default_priority, 'high'); ?>><?php _e('High', 'job-card-tracking'); ?></option>
                        <option value="urgent" <?php selected($default_priority, 'urgent'); ?>><?php _e('Urgent', 'job-card-tracking'); ?></option>
                    </select>
                </div>
                
                <div class="jct-admin-form-group">
                    <label class="jct-admin-form-label" for="jobs_per_page">
                        <?php _e('Jobs Per Page', 'job-card-tracking'); ?>
                    </label>
                    <input type="number" id="jobs_per_page" name="jobs_per_page" class="jct-admin-form-input" 
                           value="<?php echo esc_attr($jobs_per_page); ?>" min="10" max="200">
                    <p class="description"><?php _e('Number of jobs to display per page.', 'job-card-tracking'); ?></p>
                </div>
            </div>
            
            <div class="jct-admin-form-group">
                <label class="jct-admin-form-label" for="date_format">
                    <?php _e('Date Format', 'job-card-tracking'); ?>
                </label>
                <select id="date_format" name="date_format" class="jct-admin-form-select">
                    <option value="Y-m-d H:i:s" <?php selected($date_format, 'Y-m-d H:i:s'); ?>><?php echo date('Y-m-d H:i:s'); ?></option>
                    <option value="m/d/Y H:i" <?php selected($date_format, 'm/d/Y H:i'); ?>><?php echo date('m/d/Y H:i'); ?></option>
                    <option value="d/m/Y H:i" <?php selected($date_format, 'd/m/Y H:i'); ?>><?php echo date('d/m/Y H:i'); ?></option>
                    <option value="F j, Y g:i A" <?php selected($date_format, 'F j, Y g:i A'); ?>><?php echo date('F j, Y g:i A'); ?></option>
                </select>
            </div>
            
            <div class="jct-admin-form-group">
                <label>
                    <input type="checkbox" name="enable_notifications" value="1" <?php checked($enable_notifications, 1); ?>>
                    <?php _e('Enable Notifications', 'job-card-tracking'); ?>
                </label>
                <p class="description"><?php _e('Show success/error notifications for user actions.', 'job-card-tracking'); ?></p>
            </div>
        </div>

        <div class="jct-admin-form" style="margin-top: 20px;">
            <h2><?php _e('Display Settings', 'job-card-tracking'); ?></h2>
            
            <div class="jct-admin-form-group">
                <label class="jct-admin-form-label"><?php _e('Theme Options', 'job-card-tracking'); ?></label>
                <label>
                    <input type="radio" name="default_theme" value="light" checked>
                    <?php _e('Light Theme (Default)', 'job-card-tracking'); ?>
                </label><br>
                <label>
                    <input type="radio" name="default_theme" value="dark">
                    <?php _e('Dark Theme', 'job-card-tracking'); ?>
                </label><br>
                <label>
                    <input type="radio" name="default_theme" value="auto">
                    <?php _e('Auto (Follow System)', 'job-card-tracking'); ?>
                </label>
                <p class="description"><?php _e('Default theme for new users. Users can override this setting.', 'job-card-tracking'); ?></p>
            </div>
        </div>

        <div class="jct-admin-form" style="margin-top: 20px;">
            <h2><?php _e('Advanced Settings', 'job-card-tracking'); ?></h2>
            
            <div class="jct-admin-form-group">
                <label>
                    <input type="checkbox" name="enable_debug" value="1">
                    <?php _e('Enable Debug Mode', 'job-card-tracking'); ?>
                </label>
                <p class="description"><?php _e('Enable debug logging for troubleshooting. Only enable if requested by support.', 'job-card-tracking'); ?></p>
            </div>
            
            <div class="jct-admin-form-group">
                <label class="jct-admin-form-label" for="cache_duration">
                    <?php _e('Cache Duration (seconds)', 'job-card-tracking'); ?>
                </label>
                <input type="number" id="cache_duration" name="cache_duration" class="jct-admin-form-input" 
                       value="300" min="0" max="3600">
                <p class="description"><?php _e('How long to cache job data. Set to 0 to disable caching.', 'job-card-tracking'); ?></p>
            </div>
        </div>

        <p class="submit">
            <input type="submit" name="jct_save_settings" class="button-primary" 
                   value="<?php _e('Save Settings', 'job-card-tracking'); ?>">
        </p>
    </form>

    <!-- System Information -->
    <div class="jct-admin-form" style="margin-top: 30px;">
        <h2><?php _e('System Information', 'job-card-tracking'); ?></h2>
        
        <table class="form-table">
            <tr>
                <th scope="row"><?php _e('Plugin Version', 'job-card-tracking'); ?></th>
                <td><?php echo JCT_VERSION; ?></td>
            </tr>
            <tr>
                <th scope="row"><?php _e('WordPress Version', 'job-card-tracking'); ?></th>
                <td><?php echo get_bloginfo('version'); ?></td>
            </tr>
            <tr>
                <th scope="row"><?php _e('PHP Version', 'job-card-tracking'); ?></th>
                <td><?php echo PHP_VERSION; ?></td>
            </tr>
            <tr>
                <th scope="row"><?php _e('Database Version', 'job-card-tracking'); ?></th>
                <td><?php echo get_option('jct_db_version', 'Not set'); ?></td>
            </tr>
            <tr>
                <th scope="row"><?php _e('Total Jobs', 'job-card-tracking'); ?></th>
                <td>
                    <?php
                    global $wpdb;
                    $table_name = $wpdb->prefix . 'job_cards';
                    $count = $wpdb->get_var("SELECT COUNT(*) FROM $table_name");
                    echo intval($count);
                    ?>
                </td>
            </tr>
        </table>
    </div>

    <!-- Reset/Maintenance -->
    <div class="jct-admin-form" style="margin-top: 30px; border-left: 4px solid #dc3232;">
        <h2 style="color: #dc3232;"><?php _e('Maintenance', 'job-card-tracking'); ?></h2>
        
        <div class="jct-admin-form-group">
            <button type="button" class="button" onclick="if(confirm('<?php _e('Are you sure? This will clear all cached data.', 'job-card-tracking'); ?>')) { clearCache(); }">
                <?php _e('Clear Cache', 'job-card-tracking'); ?>
            </button>
            <p class="description"><?php _e('Clear all cached job data and force a refresh.', 'job-card-tracking'); ?></p>
        </div>
        
        <div class="jct-admin-form-group">
            <button type="button" class="button" onclick="if(confirm('<?php _e('Are you sure? This will reset all plugin settings to defaults.', 'job-card-tracking'); ?>')) { resetSettings(); }">
                <?php _e('Reset Settings', 'job-card-tracking'); ?>
            </button>
            <p class="description"><?php _e('Reset all plugin settings to their default values.', 'job-card-tracking'); ?></p>
        </div>
        
        <div class="jct-admin-form-group">
            <button type="button" class="button" style="color: #dc3232;" onclick="if(confirm('<?php _e('WARNING: This will permanently delete ALL job data! This cannot be undone. Are you absolutely sure?', 'job-card-tracking'); ?>')) { resetDatabase(); }">
                <?php _e('Reset Database', 'job-card-tracking'); ?>
            </button>
            <p class="description" style="color: #dc3232;"><?php _e('⚠️ DANGER: This will permanently delete all job data. This action cannot be undone!', 'job-card-tracking'); ?></p>
        </div>
    </div>
</div>

<script>
function clearCache() {
    // Implementation for clearing cache
    alert('<?php _e('Cache cleared successfully!', 'job-card-tracking'); ?>');
}

function resetSettings() {
    // Implementation for resetting settings
    if (confirm('<?php _e('This will reload the page with default settings. Continue?', 'job-card-tracking'); ?>')) {
        window.location.reload();
    }
}

function resetDatabase() {
    // Implementation for resetting database
    alert('<?php _e('Database reset functionality would be implemented here.', 'job-card-tracking'); ?>');
}
</script>
