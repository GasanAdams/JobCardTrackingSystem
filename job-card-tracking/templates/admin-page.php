<?php
// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}
?>

<div class="wrap jct-container">
    <div class="jct-header">
        <div class="jct-logo">
            <img src="<?php echo JCT_PLUGIN_URL; ?>assets/images/carbon-bros-logo.png" alt="Carbon Bros" onerror="this.style.display='none'">
            <h1><?php _e('Job Card Tracking System', 'job-card-tracking'); ?></h1>
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
            
            <a href="#" class="jct-btn" id="jct-create-job-btn">
                <span class="dashicons dashicons-plus"></span>
                <?php _e('Create Job', 'job-card-tracking'); ?>
            </a>
        </div>
    </div>

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

    <!-- Controls -->
    <div class="jct-controls">
        <div class="jct-filters">
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
        
        <div class="jct-view-toggles">
            <button class="jct-view-toggle active" data-view="grid">
                <span class="dashicons dashicons-grid-view"></span>
            </button>
            <button class="jct-view-toggle" data-view="list">
                <span class="dashicons dashicons-list-view"></span>
            </button>
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

    <!-- Create Job Modal -->
    <div id="jct-create-job-modal" class="jct-modal" style="display: none;">
        <div class="jct-modal-content">
            <div class="jct-modal-header">
                <h2><?php _e('Create New Job', 'job-card-tracking'); ?></h2>
                <button class="jct-modal-close">&times;</button>
            </div>
            <div class="jct-modal-body">
                <form class="jct-create-job-form">
                    <div class="jct-form-group">
                        <label for="jct-job-title"><?php _e('Title', 'job-card-tracking'); ?> *</label>
                        <input type="text" id="jct-job-title" name="title" required>
                    </div>
                    
                    <div class="jct-form-group">
                        <label for="jct-job-description"><?php _e('Description', 'job-card-tracking'); ?></label>
                        <textarea id="jct-job-description" name="description" rows="4"></textarea>
                    </div>
                    
                    <div class="jct-form-row">
                        <div class="jct-form-group">
                            <label for="jct-job-assignee"><?php _e('Assignee', 'job-card-tracking'); ?> *</label>
                            <input type="text" id="jct-job-assignee" name="assignee" required>
                        </div>
                        
                        <div class="jct-form-group">
                            <label for="jct-job-department"><?php _e('Department', 'job-card-tracking'); ?></label>
                            <input type="text" id="jct-job-department" name="department">
                        </div>
                    </div>
                    
                    <div class="jct-form-row">
                        <div class="jct-form-group">
                            <label for="jct-job-priority"><?php _e('Priority', 'job-card-tracking'); ?></label>
                            <select id="jct-job-priority" name="priority">
                                <option value="low"><?php _e('Low', 'job-card-tracking'); ?></option>
                                <option value="medium" selected><?php _e('Medium', 'job-card-tracking'); ?></option>
                                <option value="high"><?php _e('High', 'job-card-tracking'); ?></option>
                                <option value="urgent"><?php _e('Urgent', 'job-card-tracking'); ?></option>
                            </select>
                        </div>
                        
                        <div class="jct-form-group">
                            <label for="jct-job-estimated-hours"><?php _e('Estimated Hours', 'job-card-tracking'); ?></label>
                            <input type="number" id="jct-job-estimated-hours" name="estimated_hours" min="0" step="0.5">
                        </div>
                    </div>
                    
                    <div class="jct-form-row">
                        <div class="jct-form-group">
                            <label for="jct-job-due-date"><?php _e('Due Date', 'job-card-tracking'); ?></label>
                            <input type="datetime-local" id="jct-job-due-date" name="due_date">
                        </div>
                        
                        <div class="jct-form-group">
                            <label for="jct-job-tags"><?php _e('Tags', 'job-card-tracking'); ?></label>
                            <input type="text" id="jct-job-tags" name="tags" placeholder="<?php _e('Comma separated tags', 'job-card-tracking'); ?>">
                        </div>
                    </div>
                    
                    <div class="jct-form-actions">
                        <button type="button" class="jct-btn-secondary jct-modal-close"><?php _e('Cancel', 'job-card-tracking'); ?></button>
                        <button type="submit" class="jct-btn"><?php _e('Create Job', 'job-card-tracking'); ?></button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</div>

<style>
/* Modal Styles */
.jct-modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.5);
    z-index: 10000;
    display: flex;
    align-items: center;
    justify-content: center;
}

.jct-modal-content {
    background: var(--jct-background);
    border-radius: var(--jct-border-radius);
    max-width: 600px;
    width: 90%;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: var(--jct-shadow-hover);
}

.jct-modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px;
    border-bottom: 1px solid var(--jct-border);
}

.jct-modal-header h2 {
    margin: 0;
    color: var(--jct-text);
}

.jct-modal-close {
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    color: var(--jct-text-light);
    padding: 0;
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.jct-modal-close:hover {
    color: var(--jct-text);
}

.jct-modal-body {
    padding: 20px;
}

.jct-form-group {
    margin-bottom: 20px;
}

.jct-form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
}

.jct-form-group label {
    display: block;
    margin-bottom: 5px;
    font-weight: 600;
    color: var(--jct-text);
}

.jct-form-group input,
.jct-form-group textarea,
.jct-form-group select {
    width: 100%;
    padding: 10px;
    border: 1px solid var(--jct-border);
    border-radius: var(--jct-border-radius);
    background: var(--jct-background);
    color: var(--jct-text);
    font-size: 14px;
}

.jct-form-group input:focus,
.jct-form-group textarea:focus,
.jct-form-group select:focus {
    outline: none;
    border-color: var(--jct-primary);
    box-shadow: 0 0 0 2px rgba(0,0,0,0.1);
}

.jct-form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 15px;
    margin-top: 30px;
    padding-top: 20px;
    border-top: 1px solid var(--jct-border);
}

@media (max-width: 768px) {
    .jct-form-row {
        grid-template-columns: 1fr;
        gap: 0;
    }
    
    .jct-modal-content {
        width: 95%;
        margin: 20px;
    }
    
    .jct-form-actions {
        flex-direction: column;
    }
}
</style>

<script>
jQuery(document).ready(function($) {
    // Modal functionality
    $('#jct-create-job-btn').on('click', function(e) {
        e.preventDefault();
        $('#jct-create-job-modal').show();
    });
    
    $('.jct-modal-close').on('click', function() {
        $('#jct-create-job-modal').hide();
    });
    
    $(document).on('click', function(e) {
        if ($(e.target).hasClass('jct-modal')) {
            $('.jct-modal').hide();
        }
    });
});
</script>
