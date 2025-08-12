<?php
if (!defined('ABSPATH')) {
    exit;
}
?>

<div class="wrap">
    <h1><?php _e('Job Analytics', 'job-card-tracking'); ?></h1>
    
    <div class="jct-analytics-container">
        <div class="jct-analytics-header">
            <div class="jct-date-range">
                <label for="analytics-date-from"><?php _e('From:', 'job-card-tracking'); ?></label>
                <input type="date" id="analytics-date-from" value="<?php echo date('Y-m-d', strtotime('-30 days')); ?>">
                
                <label for="analytics-date-to"><?php _e('To:', 'job-card-tracking'); ?></label>
                <input type="date" id="analytics-date-to" value="<?php echo date('Y-m-d'); ?>">
                
                <button id="update-analytics" class="button button-primary">
                    <?php _e('Update Analytics', 'job-card-tracking'); ?>
                </button>
            </div>
        </div>
        
        <div class="jct-analytics-grid">
            <div class="jct-analytics-card">
                <h3><?php _e('Completion Rate', 'job-card-tracking'); ?></h3>
                <div class="jct-metric">
                    <span id="completion-rate">0%</span>
                </div>
            </div>
            
            <div class="jct-analytics-card">
                <h3><?php _e('Average Completion Time', 'job-card-tracking'); ?></h3>
                <div class="jct-metric">
                    <span id="avg-completion-time">0h</span>
                </div>
            </div>
            
            <div class="jct-analytics-card">
                <h3><?php _e('Overdue Rate', 'job-card-tracking'); ?></h3>
                <div class="jct-metric">
                    <span id="overdue-rate">0%</span>
                </div>
            </div>
            
            <div class="jct-analytics-card">
                <h3><?php _e('Productivity Score', 'job-card-tracking'); ?></h3>
                <div class="jct-metric">
                    <span id="productivity-score">0</span>
                </div>
            </div>
        </div>
        
        <div class="jct-charts-section">
            <div class="jct-chart-container">
                <h3><?php _e('Jobs by Status', 'job-card-tracking'); ?></h3>
                <canvas id="status-chart"></canvas>
            </div>
            
            <div class="jct-chart-container">
                <h3><?php _e('Jobs by Priority', 'job-card-tracking'); ?></h3>
                <canvas id="priority-chart"></canvas>
            </div>
            
            <div class="jct-chart-container">
                <h3><?php _e('Jobs by Department', 'job-card-tracking'); ?></h3>
                <canvas id="department-chart"></canvas>
            </div>
        </div>
    </div>
</div>
