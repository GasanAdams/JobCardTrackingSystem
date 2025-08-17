<?php
// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}
?>

<div class="wrap jct-admin-container">
    <div class="jct-admin-header">
        <h1 class="jct-admin-title">
            <?php _e('Job Card Tracking System', 'job-card-tracking'); ?>
        </h1>
        <div class="jct-admin-actions">
            <button class="jct-admin-btn jct-refresh-btn">
                <span class="dashicons dashicons-update"></span>
                <?php _e('Refresh', 'job-card-tracking'); ?>
            </button>
            <button class="jct-admin-btn jct-admin-btn-secondary jct-export-btn" data-format="csv">
                <span class="dashicons dashicons-download"></span>
                <?php _e('Export CSV', 'job-card-tracking'); ?>
            </button>
            <button class="jct-admin-btn" id="jct-create-job-btn">
                <span class="dashicons dashicons-plus"></span>
                <?php _e('Add New Job', 'job-card-tracking'); ?>
            </button>
        </div>
    </div>

    <!-- Stats Dashboard -->
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

    <!-- Filters -->
    <div class="jct-admin-filters" style="background: white; padding: 15px; border: 1px solid #ddd; border-radius: 4px; margin-bottom: 20px;">
        <div style="display: flex; gap: 15px; align-items: center; flex-wrap: wrap;">
            <input type="text" class="jct-admin-search" placeholder="<?php _e('Search jobs...', 'job-card-tracking'); ?>" style="min-width: 250px;">
            
            <select class="jct-admin-filter" data-filter="status">
                <option value="all"><?php _e('All Statuses', 'job-card-tracking'); ?></option>
                <option value="pending"><?php _e('Pending', 'job-card-tracking'); ?></option>
                <option value="in-progress"><?php _e('In Progress', 'job-card-tracking'); ?></option>
                <option value="completed"><?php _e('Completed', 'job-card-tracking'); ?></option>
                <option value="on-hold"><?php _e('On Hold', 'job-card-tracking'); ?></option>
                <option value="cancelled"><?php _e('Cancelled', 'job-card-tracking'); ?></option>
            </select>
            
            <select class="jct-admin-filter" data-filter="priority">
                <option value="all"><?php _e('All Priorities', 'job-card-tracking'); ?></option>
                <option value="low"><?php _e('Low', 'job-card-tracking'); ?></option>
                <option value="medium"><?php _e('Medium', 'job-card-tracking'); ?></option>
                <option value="high"><?php _e('High', 'job-card-tracking'); ?></option>
                <option value="urgent"><?php _e('Urgent', 'job-card-tracking'); ?></option>
            </select>
            
            <input type="text" class="jct-admin-filter" data-filter="department" placeholder="<?php _e('Department...', 'job-card-tracking'); ?>">
        </div>
    </div>

    <!-- Bulk Actions -->
    <div class="tablenav top">
        <div class="alignleft actions bulkactions">
            <select name="action" id="bulk-action-selector-top">
                <option value="-1"><?php _e('Bulk Actions', 'job-card-tracking'); ?></option>
                <option value="delete"><?php _e('Delete', 'job-card-tracking'); ?></option>
                <option value="mark-completed"><?php _e('Mark as Completed', 'job-card-tracking'); ?></option>
                <option value="mark-pending"><?php _e('Mark as Pending', 'job-card-tracking'); ?></option>
            </select>
            <input type="submit" id="doaction" class="button action" value="<?php _e('Apply', 'job-card-tracking'); ?>" disabled>
        </div>
        <div class="alignright">
            <span class="jct-job-count">0 jobs</span>
        </div>
    </div>

    <!-- Jobs Table -->
    <div class="jct-admin-table">
        <table class="wp-list-table widefat fixed striped jct-admin-jobs-table">
            <thead>
                <tr>
                    <td class="check-column">
                        <input type="checkbox" id="cb-select-all-1">
                    </td>
                    <th><?php _e('Job ID', 'job-card-tracking'); ?></th>
                    <th><?php _e('Title', 'job-card-tracking'); ?></th>
                    <th><?php _e('Assignee', 'job-card-tracking'); ?></th>
                    <th><?php _e('Department', 'job-card-tracking'); ?></th>
                    <th><?php _e('Status', 'job-card-tracking'); ?></th>
                    <th><?php _e('Priority', 'job-card-tracking'); ?></th>
                    <th><?php _e('Due Date', 'job-card-tracking'); ?></th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td colspan="8" style="text-align: center; padding: 40px;">
                        <div class="jct-admin-loading" style="display: none;">
                            <?php _e('Loading jobs...', 'job-card-tracking'); ?>
                        </div>
                    </td>
                </tr>
            </tbody>
            <tfoot>
                <tr>
                    <td class="check-column">
                        <input type="checkbox" id="cb-select-all-2">
                    </td>
                    <th><?php _e('Job ID', 'job-card-tracking'); ?></th>
                    <th><?php _e('Title', 'job-card-tracking'); ?></th>
                    <th><?php _e('Assignee', 'job-card-tracking'); ?></th>
                    <th><?php _e('Department', 'job-card-tracking'); ?></th>
                    <th><?php _e('Status', 'job-card-tracking'); ?></th>
                    <th><?php _e('Priority', 'job-card-tracking'); ?></th>
                    <th><?php _e('Due Date', 'job-card-tracking'); ?></th>
                </tr>
            </tfoot>
        </table>
    </div>

    <!-- Bottom Bulk Actions -->
    <div class="tablenav bottom">
        <div class="alignleft actions bulkactions">
            <select name="action2" id="bulk-action-selector-bottom">
                <option value="-1"><?php _e('Bulk Actions', 'job-card-tracking'); ?></option>
                <option value="delete"><?php _e('Delete', 'job-card-tracking'); ?></option>
                <option value="mark-completed"><?php _e('Mark as Completed', 'job-card-tracking'); ?></option>
                <option value="mark-pending"><?php _e('Mark as Pending', 'job-card-tracking'); ?></option>
            </select>
            <input type="submit" id="doaction2" class="button action" value="<?php _e('Apply', 'job-card-tracking'); ?>" disabled>
        </div>
    </div>
</div>

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

<style>
.jct-overdue-row {
    background-color: #fef2f2 !important;
}

.jct-overdue-text {
    color: #dc2626 !important;
    font-weight: 600;
}

.row-actions {
    visibility: hidden;
    color: #ddd;
    font-size: 13px;
}

tr:hover .row-actions {
    visibility: visible;
}

.row-actions span {
    display: inline;
}

.row-actions a {
    color: #0073aa;
    text-decoration: none;
}

.row-actions a:hover {
    color: #005a87;
}
</style>
