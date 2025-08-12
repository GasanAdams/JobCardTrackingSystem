<?php
// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}
?>

<div class="wrap">
    <h1><?php _e('Job Analytics Dashboard', 'job-card-tracking'); ?></h1>
    
    <div id="jct-analytics-container">
        <!-- Date Range Selector -->
        <div class="jct-analytics-header">
            <div class="jct-date-range">
                <label for="jct-date-range"><?php _e('Date Range:', 'job-card-tracking'); ?></label>
                <select id="jct-date-range">
                    <option value="7"><?php _e('Last 7 days', 'job-card-tracking'); ?></option>
                    <option value="30" selected><?php _e('Last 30 days', 'job-card-tracking'); ?></option>
                    <option value="90"><?php _e('Last 90 days', 'job-card-tracking'); ?></option>
                    <option value="365"><?php _e('Last year', 'job-card-tracking'); ?></option>
                </select>
            </div>
            <button id="jct-refresh-analytics" class="button">
                <span class="dashicons dashicons-update"></span>
                <?php _e('Refresh Data', 'job-card-tracking'); ?>
            </button>
        </div>
        
        <!-- Key Metrics -->
        <div class="jct-metrics-grid">
            <div class="jct-metric-card">
                <div class="jct-metric-icon completion-rate">
                    <span class="dashicons dashicons-chart-pie"></span>
                </div>
                <div class="jct-metric-content">
                    <div class="jct-metric-number" id="completion-rate">0%</div>
                    <div class="jct-metric-label"><?php _e('Completion Rate', 'job-card-tracking'); ?></div>
                </div>
            </div>
            <div class="jct-metric-card">
                <div class="jct-metric-icon avg-time">
                    <span class="dashicons dashicons-clock"></span>
                </div>
                <div class="jct-metric-content">
                    <div class="jct-metric-number" id="avg-completion-time">0h</div>
                    <div class="jct-metric-label"><?php _e('Avg. Completion Time', 'job-card-tracking'); ?></div>
                </div>
            </div>
            <div class="jct-metric-card">
                <div class="jct-metric-icon overdue-rate">
                    <span class="dashicons dashicons-warning"></span>
                </div>
                <div class="jct-metric-content">
                    <div class="jct-metric-number" id="overdue-rate">0%</div>
                    <div class="jct-metric-label"><?php _e('Overdue Rate', 'job-card-tracking'); ?></div>
                </div>
            </div>
            <div class="jct-metric-card">
                <div class="jct-metric-icon productivity">
                    <span class="dashicons dashicons-chart-line"></span>
                </div>
                <div class="jct-metric-content">
                    <div class="jct-metric-number" id="productivity-score">0</div>
                    <div class="jct-metric-label"><?php _e('Productivity Score', 'job-card-tracking'); ?></div>
                </div>
            </div>
        </div>
        
        <!-- Charts Section -->
        <div class="jct-charts-grid">
            <!-- Status Distribution Chart -->
            <div class="jct-chart-card">
                <div class="jct-chart-header">
                    <h3><?php _e('Status Distribution', 'job-card-tracking'); ?></h3>
                </div>
                <div class="jct-chart-content">
                    <canvas id="status-chart" width="400" height="200"></canvas>
                </div>
            </div>
            
            <!-- Priority Distribution Chart -->
            <div class="jct-chart-card">
                <div class="jct-chart-header">
                    <h3><?php _e('Priority Distribution', 'job-card-tracking'); ?></h3>
                </div>
                <div class="jct-chart-content">
                    <canvas id="priority-chart" width="400" height="200"></canvas>
                </div>
            </div>
            
            <!-- Department Performance Chart -->
            <div class="jct-chart-card jct-chart-card-full">
                <div class="jct-chart-header">
                    <h3><?php _e('Department Performance', 'job-card-tracking'); ?></h3>
                </div>
                <div class="jct-chart-content">
                    <canvas id="department-chart" width="800" height="300"></canvas>
                </div>
            </div>
            
            <!-- Completion Trends Chart -->
            <div class="jct-chart-card jct-chart-card-full">
                <div class="jct-chart-header">
                    <h3><?php _e('Completion Trends', 'job-card-tracking'); ?></h3>
                </div>
                <div class="jct-chart-content">
                    <canvas id="trends-chart" width="800" height="300"></canvas>
                </div>
            </div>
        </div>
        
        <!-- Top Performers Section -->
        <div class="jct-performers-section">
            <div class="jct-performers-card">
                <h3><?php _e('Top Performers', 'job-card-tracking'); ?></h3>
                <div id="top-performers" class="jct-performers-list">
                    <!-- Will be populated via JavaScript -->
                </div>
            </div>
            <div class="jct-performers-card">
                <h3><?php _e('Department Summary', 'job-card-tracking'); ?></h3>
                <div id="department-summary" class="jct-department-list">
                    <!-- Will be populated via JavaScript -->
                </div>
            </div>
        </div>
    </div>
</div>

<script>
// Analytics JavaScript will be loaded via the admin script
</script>
