<?php
// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

// Get shortcode attributes
$view = isset($atts['view']) ? $atts['view'] : 'grid';
$show_analytics = isset($atts['show_analytics']) ? $atts['show_analytics'] === 'true' : false;
$show_create_button = isset($atts['show_create_button']) ? $atts['show_create_button'] === 'true' : true;
?>

<div class="jct-container jct-frontend">
    <div class="jct-header">
        <div class="jct-logo">
            <img src="<?php echo JCT_PLUGIN_URL; ?>assets/images/carbon-bros-logo.png" alt="Carbon Bros" onerror="this.style.display='none'">
            <h1><?php _e('Job Tracking Dashboard', 'job-card-tracking'); ?></h1>
        </div>
        <div class="jct-header-actions">
            <!-- Auto-refresh Controls -->
            <div class="jct-auto-refresh">
                <button class="jct-auto-refresh-btn" type="button">
                    <span class="dashicons dashicons-controls-pause"></span>
                    <span><?php _e('Auto-refresh', 'job-card-tracking'); ?></span>
                    <div class="jct-auto-refresh-indicator"></div>
                    <span class="jct-auto-refresh-countdown"></span>
                </button>
                <div class="jct-auto-refresh-dropdown">
                    <a href="#" class="jct-auto-refresh-option" data-interval="0">
                        <?php _e('Off', 'job-card-tracking'); ?>
                    </a>
                    <a href="#" class="jct-auto-refresh-option" data-interval="120000">
                        <?php _e('Every 2 minutes', 'job-card-tracking'); ?>
                    </a>
                    <a href="#" class="jct-auto-refresh-option" data-interval="300000">
                        <?php _e('Every 5 minutes', 'job-card-tracking'); ?>
                    </a>
                    <a href="#" class="jct-auto-refresh-option" data-interval="600000">
                        <?php _e('Every 10 minutes', 'job-card-tracking'); ?>
                    </a>
                </div>
            </div>
            
            <button class="jct-theme-toggle" type="button" title="<?php _e('Toggle Theme', 'job-card-tracking'); ?>">
                <span class="dashicons dashicons-lightbulb"></span>
            </button>
            
            <?php if ($show_create_button && current_user_can('edit_posts')): ?>
            <a href="#" class="jct-btn" id="jct-create-job-btn">
                <span class="dashicons dashicons-plus"></span>
                <?php _e('Create Job', 'job-card-tracking'); ?>
            </a>
            <?php endif; ?>
        </div>
    </div>

    <?php if ($show_analytics): ?>
    <!-- Stats Cards -->
    <div class="jct-stats">
        <div class="jct-stat-card jct-stat-total">
            <span class="jct-stat-number">0</span>
            <span class="jct-stat-label"><?php _e('Total Jobs', 'job-card-tracking'); ?></span>
        </div>
        <div class="jct-stat-card jct-stat-pending">
            <span class="jct-stat-number">0</span>
            <span class="jct-stat-label"><?php _e('Pending', 'job-card-tracking'); ?></span>
        </div>
        <div class="jct-stat-card jct-stat-in-progress">
            <span class="jct-stat-number">0</span>
            <span class="jct-stat-label"><?php _e('In Progress', 'job-card-tracking'); ?></span>
        </div>
        <div class="jct-stat-card jct-stat-completed">
            <span class="jct-stat-number">0</span>
            <span class="jct-stat-label"><?php _e('Completed', 'job-card-tracking'); ?></span>
        </div>
        <div class="jct-stat-card jct-stat-overdue">
            <span class="jct-stat-number">0</span>
            <span class="jct-stat-label"><?php _e('Overdue', 'job-card-tracking'); ?></span>
        </div>
    </div>
    <?php endif; ?>

    <!-- Mobile Filters Panel -->
    <div class="jct-mobile-panel" style="display: none;">
        <div class="jct-mobile-panel-content">
            <div class="jct-mobile-panel-header">
                <h3><?php _e('Filters & Settings', 'job-card-tracking'); ?></h3>
                <button class="jct-mobile-panel-close">&times;</button>
            </div>
            
            <!-- Mobile Auto-refresh -->
            <div class="jct-mobile-auto-refresh">
                <h4><?php _e('Auto-refresh', 'job-card-tracking'); ?></h4>
                <div class="jct-mobile-auto-refresh-controls">
                    <button class="jct-auto-refresh-option" data-interval="0"><?php _e('Off', 'job-card-tracking'); ?></button>
                    <button class="jct-auto-refresh-option" data-interval="120000"><?php _e('2 min', 'job-card-tracking'); ?></button>
                    <button class="jct-auto-refresh-option" data-interval="300000"><?php _e('5 min', 'job-card-tracking'); ?></button>
                    <button class="jct-auto-refresh-option" data-interval="600000"><?php _e('10 min', 'job-card-tracking'); ?></button>
                </div>
                <div class="jct-mobile-auto-refresh-status">Off</div>
            </div>
            
            <div class="jct-mobile-filters">
                <h4><?php _e('Filters', 'job-card-tracking'); ?></h4>
                <input type="text" class="jct-search-input" placeholder="<?php _e('Search jobs...', 'job-card-tracking'); ?>">
                
                <select class="jct-status-filter">
                    <option value="all"><?php _e('All Status', 'job-card-tracking'); ?></option>
                    <option value="pending"><?php _e('Pending', 'job-card-tracking'); ?></option>
                    <option value="in-progress"><?php _e('In Progress', 'job-card-tracking'); ?></option>
                    <option value="completed"><?php _e('Completed', 'job-card-tracking'); ?></option>
                    <option value="on-hold"><?php _e('On Hold', 'job-card-tracking'); ?></option>
                    <option value="cancelled"><?php _e('Cancelled', 'job-card-tracking'); ?></option>
                </select>
                
                <select class="jct-priority-filter">
                    <option value="all"><?php _e('All Priority', 'job-card-tracking'); ?></option>
                    <option value="low"><?php _e('Low', 'job-card-tracking'); ?></option>
                    <option value="medium"><?php _e('Medium', 'job-card-tracking'); ?></option>
                    <option value="high"><?php _e('High', 'job-card-tracking'); ?></option>
                    <option value="urgent"><?php _e('Urgent', 'job-card-tracking'); ?></option>
                </select>
                
                <input type="text" class="jct-department-filter" placeholder="<?php _e('Department...', 'job-card-tracking'); ?>">
            </div>
        </div>
    </div>

    <!-- Controls -->
    <div class="jct-controls">
        <div class="jct-filters jct-desktop-filters">
            <input type="text" class="jct-search-input" placeholder="<?php _e('Search jobs...', 'job-card-tracking'); ?>">
            
            <select class="jct-status-filter">
                <option value="all"><?php _e('All Status', 'job-card-tracking'); ?></option>
                <option value="pending"><?php _e('Pending', 'job-card-tracking'); ?></option>
                <option value="in-progress"><?php _e('In Progress', 'job-card-tracking'); ?></option>
                <option value="completed"><?php _e('Completed', 'job-card-tracking'); ?></option>
                <option value="on-hold"><?php _e('On Hold', 'job-card-tracking'); ?></option>
                <option value="cancelled"><?php _e('Cancelled', 'job-card-tracking'); ?></option>
            </select>
            
            <select class="jct-priority-filter">
                <option value="all"><?php _e('All Priority', 'job-card-tracking'); ?></option>
                <option value="low"><?php _e('Low', 'job-card-tracking'); ?></option>
                <option value="medium"><?php _e('Medium', 'job-card-tracking'); ?></option>
                <option value="high"><?php _e('High', 'job-card-tracking'); ?></option>
                <option value="urgent"><?php _e('Urgent', 'job-card-tracking'); ?></option>
            </select>
            
            <input type="text" class="jct-department-filter" placeholder="<?php _e('Department...', 'job-card-tracking'); ?>">
        </div>
        
        <div class="jct-controls-right">
            <button class="jct-mobile-filters-btn jct-btn-secondary">
                <span class="dashicons dashicons-filter"></span>
                <?php _e('Filters', 'job-card-tracking'); ?>
            </button>
            
            <div class="jct-view-toggles">
                <button class="jct-view-toggle <?php echo $view === 'grid' ? 'active' : ''; ?>" data-view="grid">
                    <span class="dashicons dashicons-grid-view"></span>
                </button>
                <button class="jct-view-toggle <?php echo $view === 'list' ? 'active' : ''; ?>" data-view="list">
                    <span class="dashicons dashicons-list-view"></span>
                </button>
            </div>
        </div>
    </div>

    <!-- Loading Indicator -->
    <div class="jct-loading" style="display: none;">
        <p><?php _e('Loading jobs...', 'job-card-tracking'); ?></p>
    </div>

    <!-- Jobs Container -->
    <div class="jct-jobs-container">
        <!-- Jobs will be loaded here via AJAX -->
    </div>
</div>

<style>
/* Frontend specific styles */
.jct-frontend {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* Mobile Panel */
.jct-mobile-panel {
    position: fixed;
    top: 0;
    right: -100%;
    width: 300px;
    height: 100vh;
    background: var(--jct-background);
    border-left: 1px solid var(--jct-border);
    z-index: 1000;
    transition: right 0.3s ease;
    overflow-y: auto;
}

.jct-mobile-panel.open {
    right: 0;
}

.jct-mobile-panel-content {
    padding: 20px;
}

.jct-mobile-panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding-bottom: 15px;
    border-bottom: 1px solid var(--jct-border);
}

.jct-mobile-panel-header h3 {
    margin: 0;
    color: var(--jct-text);
}

.jct-mobile-panel-close {
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    color: var(--jct-text-light);
}

.jct-mobile-filters h4 {
    margin: 0 0 15px 0;
    color: var(--jct-text);
}

.jct-mobile-filters input,
.jct-mobile-filters select {
    width: 100%;
    margin-bottom: 15px;
    padding: 10px;
    border: 1px solid var(--jct-border);
    border-radius: var(--jct-border-radius);
    background: var(--jct-background);
    color: var(--jct-text);
}

.jct-mobile-filters-btn {
    display: none;
}

.jct-controls-right {
    display: flex;
    align-items: center;
    gap: 15px;
}

/* Mobile Responsive */
@media (max-width: 768px) {
    .jct-desktop-filters {
        display: none;
    }
    
    .jct-mobile-filters-btn {
        display: flex;
    }
    
    .jct-controls {
        justify-content: flex-end;
    }
}
</style>

<script>
jQuery(document).ready(function($) {
    // Mobile panel functionality
    $('.jct-mobile-filters-btn').on('click', function() {
        $('.jct-mobile-panel').addClass('open');
    });
    
    $('.jct-mobile-panel-close').on('click', function() {
        $('.jct-mobile-panel').removeClass('open');
    });
    
    // Close panel when clicking outside
    $(document).on('click', function(e) {
        if (!$(e.target).closest('.jct-mobile-panel, .jct-mobile-filters-btn').length) {
            $('.jct-mobile-panel').removeClass('open');
        }
    });
});
</script>
