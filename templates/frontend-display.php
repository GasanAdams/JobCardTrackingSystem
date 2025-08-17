<?php
// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

// Get shortcode attributes
$view = $atts['view'] ?? 'grid';
$show_analytics = $atts['show_analytics'] === 'true';
$show_create_button = $atts['show_create_button'] === 'true';
?>

<div class="jct-container">
    <!-- Header -->
    <div class="jct-header">
        <h1 class="jct-title"><?php _e('Job Tracking Dashboard', 'job-card-tracking'); ?></h1>
        <div class="jct-header-actions">
            <!-- Auto-refresh control -->
            <div class="jct-auto-refresh">
                <button class="jct-auto-refresh-btn">
                    <span class="dashicons dashicons-controls-pause"></span>
                    <span><?php _e('Auto-refresh', 'job-card-tracking'); ?></span>
                    <span class="jct-auto-refresh-countdown" style="display: none;">1:30</span>
                </button>
                <div class="jct-auto-refresh-dropdown">
                    <button class="jct-auto-refresh-option" data-interval="0">
                        <?php _e('Off', 'job-card-tracking'); ?>
                    </button>
                    <button class="jct-auto-refresh-option" data-interval="30000">
                        <?php _e('30 seconds', 'job-card-tracking'); ?>
                    </button>
                    <button class="jct-auto-refresh-option" data-interval="60000">
                        <?php _e('1 minute', 'job-card-tracking'); ?>
                    </button>
                    <button class="jct-auto-refresh-option" data-interval="300000">
                        <?php _e('5 minutes', 'job-card-tracking'); ?>
                    </button>
                    <button class="jct-auto-refresh-option" data-interval="600000">
                        <?php _e('10 minutes', 'job-card-tracking'); ?>
                    </button>
                </div>
            </div>

            <!-- Theme toggle -->
            <button class="jct-theme-toggle" title="<?php _e('Toggle dark/light theme', 'job-card-tracking'); ?>">
                <span class="dashicons dashicons-lightbulb"></span>
            </button>

            <?php if ($show_create_button): ?>
            <!-- Create job button -->
            <button id="jct-create-job-btn" class="jct-btn jct-btn-primary">
                <span class="dashicons dashicons-plus"></span>
                <?php _e('Create Job', 'job-card-tracking'); ?>
            </button>
            <?php endif; ?>
        </div>
    </div>

    <?php if ($show_analytics): ?>
    <!-- Stats Dashboard -->
    <div class="jct-stats">
        <div class="jct-stat-card jct-stat-total">
            <span class="jct-stat-number">0</span>
            <div class="jct-stat-label"><?php _e('Total Jobs', 'job-card-tracking'); ?></div>
        </div>
        <div class="jct-stat-card jct-stat-pending">
            <span class="jct-stat-number">0</span>
            <div class="jct-stat-label"><?php _e('Pending', 'job-card-tracking'); ?></div>
        </div>
        <div class="jct-stat-card jct-stat-in-progress">
            <span class="jct-stat-number">0</span>
            <div class="jct-stat-label"><?php _e('In Progress', 'job-card-tracking'); ?></div>
        </div>
        <div class="jct-stat-card jct-stat-completed">
            <span class="jct-stat-number">0</span>
            <div class="jct-stat-label"><?php _e('Completed', 'job-card-tracking'); ?></div>
        </div>
        <div class="jct-stat-card jct-stat-overdue">
            <span class="jct-stat-number">0</span>
            <div class="jct-stat-label"><?php _e('Overdue', 'job-card-tracking'); ?></div>
        </div>
    </div>
    <?php endif; ?>

    <!-- Controls -->
    <div class="jct-controls">
        <!-- Search -->
        <input type="text" class="jct-search-input" placeholder="<?php _e('Search jobs...', 'job-card-tracking'); ?>">
        
        <!-- Filters -->
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
        
        <!-- View toggles -->
        <div class="jct-view-toggles">
            <button class="jct-view-toggle <?php echo $view === 'grid' ? 'active' : ''; ?>" data-view="grid" title="<?php _e('Grid View', 'job-card-tracking'); ?>">
                <span class="dashicons dashicons-grid-view"></span>
            </button>
            <button class="jct-view-toggle <?php echo $view === 'list' ? 'active' : ''; ?>" data-view="list" title="<?php _e('List View', 'job-card-tracking'); ?>">
                <span class="dashicons dashicons-list-view"></span>
            </button>
        </div>
    </div>

    <!-- Loading indicator -->
    <div class="jct-loading" style="display: none;">
        <p><?php _e('Loading jobs...', 'job-card-tracking'); ?></p>
    </div>

    <!-- Jobs container -->
    <div class="jct-jobs-container">
        <div class="jct-no-jobs">
            <p><?php _e('Loading jobs...', 'job-card-tracking'); ?></p>
        </div>
    </div>
</div>

<?php if ($show_create_button): ?>
<!-- Create Job Modal -->
<div id="jct-create-job-modal" class="jct-modal" style="display: none;">
    <div class="jct-modal-content">
        <div class="jct-modal-header">
            <h2 class="jct-modal-title"><?php _e('Create New Job', 'job-card-tracking'); ?></h2>
            <button class="jct-modal-close">&times;</button>
        </div>
        <div class="jct-modal-body">
            <form class="jct-create-job-form">
                <div class="jct-form-group">
                    <label class="jct-form-label" for="jct-job-title"><?php _e('Job Title', 'job-card-tracking'); ?> *</label>
                    <input type="text" id="jct-job-title" name="title" class="jct-form-input" required>
                </div>
                
                <div class="jct-form-group">
                    <label class="jct-form-label" for="jct-job-description"><?php _e('Description', 'job-card-tracking'); ?></label>
                    <textarea id="jct-job-description" name="description" class="jct-form-textarea"></textarea>
                </div>
                
                <div class="jct-form-row">
                    <div class="jct-form-group">
                        <label class="jct-form-label" for="jct-job-assignee"><?php _e('Assignee', 'job-card-tracking'); ?> *</label>
                        <input type="text" id="jct-job-assignee" name="assignee" class="jct-form-input" required>
                    </div>
                    
                    <div class="jct-form-group">
                        <label class="jct-form-label" for="jct-job-department"><?php _e('Department', 'job-card-tracking'); ?></label>
                        <input type="text" id="jct-job-department" name="department" class="jct-form-input">
                    </div>
                </div>
                
                <div class="jct-form-row">
                    <div class="jct-form-group">
                        <label class="jct-form-label" for="jct-job-priority"><?php _e('Priority', 'job-card-tracking'); ?></label>
                        <select id="jct-job-priority" name="priority" class="jct-form-select">
                            <option value="low"><?php _e('Low', 'job-card-tracking'); ?></option>
                            <option value="medium" selected><?php _e('Medium', 'job-card-tracking'); ?></option>
                            <option value="high"><?php _e('High', 'job-card-tracking'); ?></option>
                            <option value="urgent"><?php _e('Urgent', 'job-card-tracking'); ?></option>
                        </select>
                    </div>
                    
                    <div class="jct-form-group">
                        <label class="jct-form-label" for="jct-job-estimated-hours"><?php _e('Estimated Hours', 'job-card-tracking'); ?></label>
                        <input type="number" id="jct-job-estimated-hours" name="estimated_hours" class="jct-form-input" min="0" step="0.5">
                    </div>
                </div>
                
                <div class="jct-form-row">
                    <div class="jct-form-group">
                        <label class="jct-form-label" for="jct-job-due-date"><?php _e('Due Date', 'job-card-tracking'); ?></label>
                        <input type="datetime-local" id="jct-job-due-date" name="due_date" class="jct-form-input">
                    </div>
                    
                    <div class="jct-form-group">
                        <label class="jct-form-label" for="jct-job-tags"><?php _e('Tags', 'job-card-tracking'); ?></label>
                        <input type="text" id="jct-job-tags" name="tags" class="jct-form-input" placeholder="<?php _e('Comma separated tags', 'job-card-tracking'); ?>">
                    </div>
                </div>
                
                <div style="display: flex; gap: 1rem; justify-content: flex-end; margin-top: 2rem;">
                    <button type="button" class="jct-btn jct-modal-close"><?php _e('Cancel', 'job-card-tracking'); ?></button>
                    <button type="submit" class="jct-btn jct-btn-primary"><?php _e('Create Job', 'job-card-tracking'); ?></button>
                </div>
            </form>
        </div>
    </div>
</div>
<?php endif; ?>
