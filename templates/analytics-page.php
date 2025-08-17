<?php
// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}
?>

<div class="wrap jct-admin-container">
    <div class="jct-admin-header">
        <h1 class="jct-admin-title">
            <?php _e('Job Analytics', 'job-card-tracking'); ?>
        </h1>
        <div class="jct-admin-actions">
            <button class="jct-admin-btn jct-refresh-btn">
                <span class="dashicons dashicons-update"></span>
                <?php _e('Refresh', 'job-card-tracking'); ?>
            </button>
            <button class="jct-admin-btn jct-admin-btn-secondary jct-export-btn" data-format="csv">
                <span class="dashicons dashicons-download"></span>
                <?php _e('Export Report', 'job-card-tracking'); ?>
            </button>
        </div>
    </div>

    <!-- Overview Stats -->
    <div class="jct-admin-stats">
        <div class="jct-admin-stat-card jct-admin-stat-total">
            <span class="jct-admin-stat-number">0</span>
            <div class="jct-admin-stat-label"><?php _e('Total Jobs', 'job-card-tracking'); ?></div>
        </div>
        <div class="jct-admin-stat-card jct-admin-stat-pending">
            <span class="jct-admin-stat-number">0</span>
            <div class="jct-admin-stat-label"><?php _e('Pending', 'job-card-tracking'); ?></div>
        </div>
        <div class="jct-admin-stat-card jct-admin-stat-in-progress">
            <span class="jct-admin-stat-number">0</span>
            <div class="jct-admin-stat-label"><?php _e('In Progress', 'job-card-tracking'); ?></div>
        </div>
        <div class="jct-admin-stat-card jct-admin-stat-completed">
            <span class="jct-admin-stat-number">0</span>
            <div class="jct-admin-stat-label"><?php _e('Completed', 'job-card-tracking'); ?></div>
        </div>
        <div class="jct-admin-stat-card jct-admin-stat-overdue">
            <span class="jct-admin-stat-number">0</span>
            <div class="jct-admin-stat-label"><?php _e('Overdue', 'job-card-tracking'); ?></div>
        </div>
    </div>

    <!-- Charts and Analytics -->
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px;">
        <!-- Status Distribution -->
        <div style="background: white; border: 1px solid #ddd; border-radius: 4px; padding: 20px;">
            <h3 style="margin-top: 0;"><?php _e('Status Distribution', 'job-card-tracking'); ?></h3>
            <div id="jct-status-chart" style="height: 300px; display: flex; align-items: center; justify-content: center; color: #666;">
                <?php _e('Loading chart...', 'job-card-tracking'); ?>
            </div>
        </div>

        <!-- Priority Distribution -->
        <div style="background: white; border: 1px solid #ddd; border-radius: 4px; padding: 20px;">
            <h3 style="margin-top: 0;"><?php _e('Priority Distribution', 'job-card-tracking'); ?></h3>
            <div id="jct-priority-chart" style="height: 300px; display: flex; align-items: center; justify-content: center; color: #666;">
                <?php _e('Loading chart...', 'job-card-tracking'); ?>
            </div>
        </div>
    </div>

    <!-- Department Performance -->
    <div style="background: white; border: 1px solid #ddd; border-radius: 4px; padding: 20px; margin-bottom: 30px;">
        <h3 style="margin-top: 0;"><?php _e('Department Performance', 'job-card-tracking'); ?></h3>
        <div id="jct-department-stats">
            <p style="text-align: center; color: #666; padding: 40px;">
                <?php _e('Loading department statistics...', 'job-card-tracking'); ?>
            </p>
        </div>
    </div>

    <!-- Recent Activity -->
    <div style="background: white; border: 1px solid #ddd; border-radius: 4px; padding: 20px;">
        <h3 style="margin-top: 0;"><?php _e('Recent Activity', 'job-card-tracking'); ?></h3>
        <div id="jct-recent-activity">
            <p style="text-align: center; color: #666; padding: 40px;">
                <?php _e('Loading recent activity...', 'job-card-tracking'); ?>
            </p>
        </div>
    </div>
</div>

<script>
jQuery(document).ready(function($) {
    // Load analytics data
    loadAnalyticsData();
    
    function loadAnalyticsData() {
        $.ajax({
            url: jct_ajax.ajax_url,
            type: 'GET',
            data: {
                action: 'jct_get_stats',
                nonce: jct_ajax.nonce
            },
            success: function(response) {
                if (response.success) {
                    updateAnalyticsDisplay(response.data);
                }
            },
            error: function(xhr, status, error) {
                console.error('Failed to load analytics:', error);
            }
        });
    }
    
    function updateAnalyticsDisplay(stats) {
        // Update overview stats
        $('.jct-admin-stat-total .jct-admin-stat-number').text(stats.total || 0);
        $('.jct-admin-stat-pending .jct-admin-stat-number').text(stats.pending || 0);
        $('.jct-admin-stat-in-progress .jct-admin-stat-number').text(stats.in_progress || 0);
        $('.jct-admin-stat-completed .jct-admin-stat-number').text(stats.completed || 0);
        $('.jct-admin-stat-overdue .jct-admin-stat-number').text(stats.overdue || 0);
        
        // Update status chart
        updateStatusChart(stats);
        
        // Update priority chart
        updatePriorityChart(stats);
        
        // Update department stats
        updateDepartmentStats(stats.departments || []);
    }
    
    function updateStatusChart(stats) {
        const statusData = [
            { label: 'Pending', value: stats.pending || 0, color: '#fbbf24' },
            { label: 'In Progress', value: stats.in_progress || 0, color: '#3b82f6' },
            { label: 'Completed', value: stats.completed || 0, color: '#10b981' },
            { label: 'On Hold', value: stats.on_hold || 0, color: '#6b7280' },
            { label: 'Cancelled', value: stats.cancelled || 0, color: '#ef4444' }
        ];
        
        renderSimpleChart('#jct-status-chart', statusData);
    }
    
    function updatePriorityChart(stats) {
        const priorityData = stats.priorities ? stats.priorities.map(p => ({
            label: p.priority.charAt(0).toUpperCase() + p.priority.slice(1),
            value: parseInt(p.count),
            color: getPriorityColor(p.priority)
        })) : [];
        
        renderSimpleChart('#jct-priority-chart', priorityData);
    }
    
    function updateDepartmentStats(departments) {
        let html = '';
        
        if (departments.length === 0) {
            html = '<p style="text-align: center; color: #666; padding: 20px;">No department data available.</p>';
        } else {
            html = '<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">';
            departments.forEach(dept => {
                html += `
                    <div style="border: 1px solid #e5e7eb; border-radius: 4px; padding: 15px; text-align: center;">
                        <div style="font-size: 24px; font-weight: 600; color: #0073aa; margin-bottom: 5px;">
                            ${dept.count}
                        </div>
                        <div style="font-size: 14px; color: #666;">
                            ${dept.department || 'Unassigned'}
                        </div>
                    </div>
                `;
            });
            html += '</div>';
        }
        
        $('#jct-department-stats').html(html);
    }
    
    function renderSimpleChart(selector, data) {
        const total = data.reduce((sum, item) => sum + item.value, 0);
        
        if (total === 0) {
            $(selector).html('<p style="color: #666;">No data available</p>');
            return;
        }
        
        let html = '<div style="display: flex; flex-direction: column; gap: 10px;">';
        
        data.forEach(item => {
            const percentage = ((item.value / total) * 100).toFixed(1);
            html += `
                <div style="display: flex; align-items: center; gap: 10px;">
                    <div style="width: 16px; height: 16px; background-color: ${item.color}; border-radius: 2px;"></div>
                    <div style="flex: 1; display: flex; justify-content: space-between;">
                        <span>${item.label}</span>
                        <span style="font-weight: 600;">${item.value} (${percentage}%)</span>
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        $(selector).html(html);
    }
    
    function getPriorityColor(priority) {
        const colors = {
            'low': '#3b82f6',
            'medium': '#fbbf24',
            'high': '#ef4444',
            'urgent': '#dc2626'
        };
        return colors[priority] || '#6b7280';
    }
    
    // Refresh button
    $('.jct-refresh-btn').on('click', function() {
        loadAnalyticsData();
    });
});
</script>
