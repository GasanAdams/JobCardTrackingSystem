<?php
if (!defined('ABSPATH')) {
    exit;
}

$show_create_button = $atts['show_create_button'] === 'true' && current_user_can('edit_posts');
?>

<div id="jct-frontend-container" class="jct-container" data-view="<?php echo esc_attr($atts['view']); ?>">
    <div class="jct-header">
        <h2><?php _e('Job Card Tracking System', 'job-card-tracking'); ?></h2>
        <div class="jct-controls">
            <button id="jct-theme-toggle" class="jct-btn jct-btn-secondary">
                <span class="dashicons dashicons-admin-appearance"></span>
                <?php _e('Toggle Theme', 'job-card-tracking'); ?>
            </button>
            <?php if ($show_create_button): ?>
            <button id="jct-create-job" class="jct-btn jct-btn-primary">
                <span class="dashicons dashicons-plus"></span>
                <?php _e('Create Job', 'job-card-tracking'); ?>
            </button>
            <?php endif; ?>
        </div>
    </div>
    
    <div class="jct-stats-overview">
        <div class="jct-stat-item">
            <div class="jct-stat-icon">
                <span class="dashicons dashicons-groups"></span>
            </div>
            <div class="jct-stat-info">
                <span class="jct-stat-number" id="frontend-total-jobs">0</span>
                <span class="jct-stat-label"><?php _e('Total Jobs', 'job-card-tracking'); ?></span>
            </div>
        </div>
        <div class="jct-stat-item">
            <div class="jct-stat-icon pending">
                <span class="dashicons dashicons-clock"></span>
            </div>
            <div class="jct-stat-info">
                <span class="jct-stat-number" id="frontend-pending-jobs">0</span>
                <span class="jct-stat-label"><?php _e('Pending', 'job-card-tracking'); ?></span>
            </div>
        </div>
        <div class="jct-stat-item">
            <div class="jct-stat-icon in-progress">
                <span class="dashicons dashicons-update"></span>
            </div>
            <div class="jct-stat-info">
                <span class="jct-stat-number" id="frontend-in-progress-jobs">0</span>
                <span class="jct-stat-label"><?php _e('In Progress', 'job-card-tracking'); ?></span>
            </div>
        </div>
        <div class="jct-stat-item">
            <div class="jct-stat-icon completed">
                <span class="dashicons dashicons-yes"></span>
            </div>
            <div class="jct-stat-info">
                <span class="jct-stat-number" id="frontend-completed-jobs">0</span>
                <span class="jct-stat-label"><?php _e('Completed', 'job-card-tracking'); ?></span>
            </div>
        </div>
    </div>
    
    <div class="jct-filters-section">
        <div class="jct-search-box">
            <input type="text" id="frontend-search" placeholder="<?php _e('Search jobs...', 'job-card-tracking'); ?>" class="jct-search-input">
            <span class="dashicons dashicons-search"></span>
        </div>
        <select id="frontend-status-filter" class="jct-filter-select">
            <option value="all"><?php _e('All Statuses', 'job-card-tracking'); ?></option>
            <option value="pending"><?php _e('Pending', 'job-card-tracking'); ?></option>
            <option value="in-progress"><?php _e('In Progress', 'job-card-tracking'); ?></option>
            <option value="completed"><?php _e('Completed', 'job-card-tracking'); ?></option>
            <option value="on-hold"><?php _e('On Hold', 'job-card-tracking'); ?></option>
            <option value="cancelled"><?php _e('Cancelled', 'job-card-tracking'); ?></option>
        </select>
        <select id="frontend-priority-filter" class="jct-filter-select">
            <option value="all"><?php _e('All Priorities', 'job-card-tracking'); ?></option>
            <option value="low"><?php _e('Low', 'job-card-tracking'); ?></option>
            <option value="medium"><?php _e('Medium', 'job-card-tracking'); ?></option>
            <option value="high"><?php _e('High', 'job-card-tracking'); ?></option>
            <option value="urgent"><?php _e('Urgent', 'job-card-tracking'); ?></option>
        </select>
        <select id="frontend-department-filter" class="jct-filter-select">
            <option value=""><?php _e('All Departments', 'job-card-tracking'); ?></option>
        </select>
    </div>
    
    <div id="jct-frontend-jobs" class="jct-jobs-display">
    </div>
    
    <div id="jct-loading" class="jct-loading" style="display: none;">
        <div class="jct-spinner"></div>
        <span><?php _e('Loading jobs...', 'job-card-tracking'); ?></span>
    </div>
    
    <div id="jct-no-jobs" class="jct-no-jobs" style="display: none;">
        <div class="jct-no-jobs-icon">
            <span class="dashicons dashicons-clipboard"></span>
        </div>
        <h3><?php _e('No Jobs Found', 'job-card-tracking'); ?></h3>
        <p><?php _e('No jobs match your current search criteria.', 'job-card-tracking'); ?></p>
    </div>
</div>

<?php if ($show_create_button): ?>
<div id="jct-create-modal" class="jct-modal" style="display: none;">
    <div class="jct-modal-content">
        <div class="jct-modal-header">
            <h2><?php _e('Create New Job Card', 'job-card-tracking'); ?></h2>
            <span class="jct-close">&times;</span>
        </div>
        <form id="jct-create-form">
            <div class="jct-form-grid">
                <div class="jct-form-group">
                    <label for="job-title"><?php _e('Title', 'job-card-tracking'); ?> *</label>
                    <input type="text" id="job-title" name="title" required>
                </div>
                <div class="jct-form-group">
                    <label for="job-assignee"><?php _e('Assignee', 'job-card-tracking'); ?> *</label>
                    <input type="text" id="job-assignee" name="assignee" required>
                </div>
                <div class="jct-form-group jct-form-group-full">
                    <label for="job-description"><?php _e('Description', 'job-card-tracking'); ?></label>
                    <textarea id="job-description" name="description" rows="3"></textarea>
                </div>
                <div class="jct-form-group">
                    <label for="job-priority"><?php _e('Priority', 'job-card-tracking'); ?></label>
                    <select id="job-priority" name="priority">
                        <option value="low"><?php _e('Low', 'job-card-tracking'); ?></option>
                        <option value="medium" selected><?php _e('Medium', 'job-card-tracking'); ?></option>
                        <option value="high"><?php _e('High', 'job-card-tracking'); ?></option>
                        <option value="urgent"><?php _e('Urgent', 'job-card-tracking'); ?></option>
                    </select>
                </div>
                <div class="jct-form-group">
                    <label for="job-department"><?php _e('Department', 'job-card-tracking'); ?></label>
                    <input type="text" id="job-department" name="department">
                </div>
                <div class="jct-form-group">
                    <label for="job-estimated-hours"><?php _e('Estimated Hours', 'job-card-tracking'); ?></label>
                    <input type="number" id="job-estimated-hours" name="estimated_hours" min="0" step="0.5">
                </div>
                <div class="jct-form-group">
                    <label for="job-due-date"><?php _e('Due Date', 'job-card-tracking'); ?></label>
                    <input type="datetime-local" id="job-due-date" name="due_date">
                </div>
                <div class="jct-form-group jct-form-group-full">
                    <label for="job-tags"><?php _e('Tags', 'job-card-tracking'); ?></label>
                    <input type="text" id="job-tags" name="tags" placeholder="<?php _e('comma, separated, tags', 'job-card-tracking'); ?>">
                </div>
            </div>
            <div class="jct-form-actions">
                <button type="submit" class="jct-btn jct-btn-primary">
                    <span class="dashicons dashicons-plus"></span>
                    <?php _e('Create Job Card', 'job-card-tracking'); ?>
                </button>
                <button type="button" class="jct-btn jct-btn-secondary jct-cancel">
                    <?php _e('Cancel', 'job-card-tracking'); ?>
                </button>
            </div>
        </form>
    </div>
</div>
<?php endif; ?>
