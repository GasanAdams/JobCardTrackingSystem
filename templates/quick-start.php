<?php
// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}
?>

<div class="wrap">
    <h1><?php _e('Job Card Tracking - Quick Start Guide', 'job-card-tracking'); ?></h1>
    
    <div class="jct-quick-start">
        <div class="jct-step-container">
            <div class="jct-step">
                <div class="jct-step-number">1</div>
                <div class="jct-step-content">
                    <h3><?php _e('Create Your First Job Card', 'job-card-tracking'); ?></h3>
                    <p><?php _e('Go to Job Tracking → All Jobs and click "Create Job Card"', 'job-card-tracking'); ?></p>
                    <a href="<?php echo admin_url('admin.php?page=job-card-tracking'); ?>" class="button button-primary">
                        <?php _e('Go to Job Tracking', 'job-card-tracking'); ?>
                    </a>
                </div>
            </div>
            
            <div class="jct-step">
                <div class="jct-step-number">2</div>
                <div class="jct-step-content">
                    <h3><?php _e('Add to Your Website', 'job-card-tracking'); ?></h3>
                    <p><?php _e('Create a new page and add this shortcode:', 'job-card-tracking'); ?></p>
                    <code>[job_card_tracking]</code>
                    <a href="<?php echo admin_url('post-new.php?post_type=page'); ?>" class="button">
                        <?php _e('Create New Page', 'job-card-tracking'); ?>
                    </a>
                </div>
            </div>
            
            <div class="jct-step">
                <div class="jct-step-number">3</div>
                <div class="jct-step-content">
                    <h3><?php _e('Customize Settings', 'job-card-tracking'); ?></h3>
                    <p><?php _e('Configure the plugin settings to match your workflow', 'job-card-tracking'); ?></p>
                    <a href="<?php echo admin_url('admin.php?page=job-card-settings'); ?>" class="button">
                        <?php _e('Open Settings', 'job-card-tracking'); ?>
                    </a>
                </div>
            </div>
        </div>
        
        <div class="jct-examples-section">
            <h2><?php _e('Common Usage Examples', 'job-card-tracking'); ?></h2>
            
            <div class="jct-example-grid">
                <div class="jct-example-card">
                    <h4><?php _e('Project Dashboard', 'job-card-tracking'); ?></h4>
                    <p><?php _e('Full dashboard with analytics', 'job-card-tracking'); ?></p>
                    <code>[job_card_tracking show_analytics="true"]</code>
                </div>
                
                <div class="jct-example-card">
                    <h4><?php _e('Department View', 'job-card-tracking'); ?></h4>
                    <p><?php _e('Show only IT department jobs', 'job-card-tracking'); ?></p>
                    <code>[job_card_tracking department="IT"]</code>
                </div>
                
                <div class="jct-example-card">
                    <h4><?php _e('Client Portal', 'job-card-tracking'); ?></h4>
                    <p><?php _e('Read-only view for clients', 'job-card-tracking'); ?></p>
                    <code>[job_card_tracking show_create_button="false"]</code>
                </div>
                
                <div class="jct-example-card">
                    <h4><?php _e('Status Board', 'job-card-tracking'); ?></h4>
                    <p><?php _e('Show only in-progress jobs', 'job-card-tracking'); ?></p>
                    <code>[job_card_tracking status="in-progress"]</code>
                </div>
            </div>
        </div>
        
        <div class="jct-tips-section">
            <h2><?php _e('Pro Tips', 'job-card-tracking'); ?></h2>
            <div class="jct-tips-grid">
                <div class="jct-tip">
                    <span class="dashicons dashicons-lightbulb"></span>
                    <div>
                        <strong><?php _e('Keyboard Shortcuts', 'job-card-tracking'); ?></strong>
                        <p><?php _e('Use Ctrl+N to quickly create new jobs', 'job-card-tracking'); ?></p>
                    </div>
                </div>
                
                <div class="jct-tip">
                    <span class="dashicons dashicons-admin-appearance"></span>
                    <div>
                        <strong><?php _e('Dark Mode', 'job-card-tracking'); ?></strong>
                        <p><?php _e('Toggle between light and dark themes', 'job-card-tracking'); ?></p>
                    </div>
                </div>
                
                <div class="jct-tip">
                    <span class="dashicons dashicons-search"></span>
                    <div>
                        <strong><?php _e('Smart Search', 'job-card-tracking'); ?></strong>
                        <p><?php _e('Search by title, assignee, or job ID', 'job-card-tracking'); ?></p>
                    </div>
                </div>
                
                <div class="jct-tip">
                    <span class="dashicons dashicons-smartphone"></span>
                    <div>
                        <strong><?php _e('Mobile Ready', 'job-card-tracking'); ?></strong>
                        <p><?php _e('Works perfectly on all devices', 'job-card-tracking'); ?></p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<style>
.jct-quick-start {
    max-width: 1200px;
}

.jct-step-container {
    display: flex;
    gap: 30px;
    margin-bottom: 40px;
    flex-wrap: wrap;
}

.jct-step {
    flex: 1;
    min-width: 300px;
    background: #fff;
    border: 1px solid #ccd0d4;
    border-radius: 8px;
    padding: 25px;
    text-align: center;
    position: relative;
}

.jct-step-number {
    width: 40px;
    height: 40px;
    background: #0073aa;
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    font-weight: bold;
    margin: 0 auto 20px;
}

.jct-step h3 {
    color: #23282d;
    margin-bottom: 15px;
}

.jct-step p {
    color: #666;
    margin-bottom: 20px;
    line-height: 1.5;
}

.jct-step code {
    background: #f1f1f1;
    padding: 8px 12px;
    border-radius: 4px;
    display: block;
    margin: 15px 0;
    font-family: Consolas, Monaco, monospace;
}

.jct-examples-section {
    background: #f8f9fa;
    border-radius: 8px;
    padding: 30px;
    margin-bottom: 30px;
}

.jct-examples-section h2 {
    text-align: center;
    margin-bottom: 30px;
    color: #23282d;
}

.jct-example-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 20px;
}

.jct-example-card {
    background: white;
    border: 1px solid #ddd;
    border-radius: 6px;
    padding: 20px;
}

.jct-example-card h4 {
    color: #0073aa;
    margin-bottom: 10px;
}

.jct-example-card p {
    color: #666;
    margin-bottom: 15px;
    font-size: 14px;
}

.jct-example-card code {
    background: #f8f8f8;
    border: 1px solid #ddd;
    padding: 8px 12px;
    border-radius: 4px;
    display: block;
    font-size: 13px;
    font-family: Consolas, Monaco, monospace;
}

.jct-tips-section {
    background: #fff;
    border: 1px solid #ccd0d4;
    border-radius: 8px;
    padding: 30px;
}

.jct-tips-section h2 {
    text-align: center;
    margin-bottom: 30px;
    color: #23282d;
}

.jct-tips-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 20px;
}

.jct-tip {
    display: flex;
    align-items: flex-start;
    gap: 15px;
    padding: 15px;
    background: #f9f9f9;
    border-radius: 6px;
}

.jct-tip .dashicons {
    color: #0073aa;
    font-size: 24px;
    margin-top: 2px;
}

.jct-tip strong {
    color: #23282d;
    display: block;
    margin-bottom: 5px;
}

.jct-tip p {
    color: #666;
    margin: 0;
    font-size: 14px;
    line-height: 1.4;
}

@media (max-width: 768px) {
    .jct-step-container {
        flex-direction: column;
    }
    
    .jct-example-grid,
    .jct-tips-grid {
        grid-template-columns: 1fr;
    }
}
</style>
