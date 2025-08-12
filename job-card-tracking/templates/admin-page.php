<?php
// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}
?>

<div class="wrap">
    <h1><?php _e('Job Card Tracking System', 'job-card-tracking'); ?></h1>
    
    <div id="jct-admin-container">
        <!-- Header with controls -->
        <div class="jct-header">
            <div class="jct-theme-toggle">
                <button id="jct-theme-toggle" class="button">
                    <span class="dashicons dashicons-admin-appearance"></span>
                    <?php _e('Toggle Theme', 'job-card-tracking'); ?>
                </button>
            </div>
            <div class="jct-header-actions">
                <button id="jct-refresh-jobs" class="button">
                    <span class="dashicons dashicons-update"></span>
                    <?php _e('Refresh', 'job-card-tracking'); ?>
                </button>
                <button id="jct-create-job" class="button button-primary">
                    <span class="dashicons dashicons-plus"></span>
                    <?php _e('Create Job Card', 'job-card-tracking'); ?>
                </button>
            </div>
        </div>
        
        <!-- Stats Cards -->
        <div class="jct-stats-grid">
            <div class="jct-stat-card">
                <div class="jct-stat-icon">
                    <span class="dashicons dashicons-groups"></span>
                </div>
                <div class="jct-stat-content">
                    <div class="jct-stat-number" id="total-jobs">0</div>
                    <div class="jct-stat-label"><?php _e('Total Jobs', 'job-card-tracking'); ?></div>
                </div>
            </div>
            <div class="jct-stat-card">
                <div class="jct-stat-icon pending">
                    <span class="dashicons dashicons-clock"></span>
                </div>
                <div class="jct-stat-content">
                    <div class="jct-stat-number" id="pending-jobs">0</div>
                    <div class="jct-stat-label"><?php _e('Pending', 'job-card-tracking'); ?></div>
                </div>
            </div>
            <div class="jct-stat-card">
                <div class="jct-stat-icon in-progress">
                    <span class="dashicons dashicons-update"></span>
                </div>
                <div class="jct-stat-content">
                    <div class="jct-stat-number" id="in-progress-jobs">0</div>
                    <div class="jct-stat-label"><?php _e('In Progress', 'job-card-tracking'); ?></div>
                </div>
            </div>
            <div class="jct-stat-card">
                <div class="jct-stat-icon completed">
                    <span class="dashicons dashicons-yes"></span>
                </div>
                <div class="jct-stat-content">
                    <div class="jct-stat-number" id="completed-jobs">0</div>
                    <div class="jct-stat-label"><?php _e('Completed', 'job-card-tracking'); ?></div>
                </div>
            </div>
            <div class="jct-stat-card">
                <div class="jct-stat-icon overdue">
                    <span class="dashicons dashicons-warning"></span>
                </div>
                <div class="jct-stat-content">
                    <div class="jct-stat-number" id="overdue-jobs">0</div>
                    <div class="jct-stat-label"><?php _e('Overdue', 'job-card-tracking'); ?></div>
                </div>
            </div>
        </div>
        
        <!-- Filters -->
        <div class="jct-filters">
            <div class="jct-filter-group">
                <label for="jct-search"><?php _e('Search:', 'job-card-tracking'); ?></label>
                <input type="text" id="jct-search" placeholder="<?php _e('Search jobs...', 'job-card-tracking'); ?>" class="regular-text">
            </div>
            <div class="jct-filter-group">
                <label for="jct-status-filter"><?php _e('Status:', 'job-card-tracking'); ?></label>
                <select id="jct-status-filter">
                    <option value="all"><?php _e('All Statuses', 'job-card-tracking'); ?></option>
                    <option value="pending"><?php _e('Pending', 'job-card-tracking'); ?></option>
                    <option value="in-progress"><?php _e('In Progress', 'job-card-tracking'); ?></option>
                    <option value="completed"><?php _e('Completed', 'job-card-tracking'); ?></option>
                    <option value="on-hold"><?php _e('On Hold', 'job-card-tracking'); ?></option>
                    <option value="cancelled"><?php _e('Cancelled', 'job-card-tracking'); ?></option>
                </select>
            </div>
            <div class="jct-filter-group">
                <label for="jct-priority-filter"><?php _e('Priority:', 'job-card-tracking'); ?></label>
                <select id="jct-priority-filter">
                    <option value="all"><?php _e('All Priorities', 'job-card-tracking'); ?></option>
                    <option value="low"><?php _e('Low', 'job-card-tracking'); ?></option>
                    <option value="medium"><?php _e('Medium', 'job-card-tracking'); ?></option>
                    <option value="high"><?php _e('High', 'job-card-tracking'); ?></option>
                    <option value="urgent"><?php _e('Urgent', 'job-card-tracking'); ?></option>
                </select>
            </div>
            <div class="jct-filter-group">
                <label for="jct-department-filter"><?php _e('Department:', 'job-card-tracking'); ?></label>
                <select id="jct-department-filter">
                    <option value=""><?php _e('All Departments', 'job-card-tracking'); ?></option>
                </select>
            </div>
        </div>
        
        <!-- Loading indicator -->
        <div id="jct-loading" class="jct-loading" style="display: none;">
            <div class="jct-spinner"></div>
            <span><?php _e('Loading jobs...', 'job-card-tracking'); ?></span>
        </div>
        
        <!-- Job Cards Container -->
        <div id="jct-jobs-container" class="jct-jobs-grid">
            <!-- Jobs will be loaded here via AJAX -->
        </div>
        
        <!-- Pagination -->
        <div id="jct-pagination" class="jct-pagination" style="display: none;">
            <button id="jct-prev-page" class="button" disabled>
                <span class="dashicons dashicons-arrow-left-alt2"></span>
                <?php _e('Previous', 'job-card-tracking'); ?>
            </button>
            <span id="jct-page-info"></span>
            <button id="jct-next-page" class="button">
                <?php _e('Next', 'job-card-tracking'); ?>
                <span class="dashicons dashicons-arrow-right-alt2"></span>
            </button>
        </div>
    </div>
    
    <!-- Create Job Modal -->
    <div id="jct-create-modal" class="jct-modal" style="display: none;">
        <div class="jct-modal-content">
            <div class="jct-modal-header">
                <h2><?php _e('Create New Job Card', 'job-card-tracking'); ?></h2>
                <span class="jct-close">&times;</span>
            </div>
            <form id="jct-create-form">
                <table class="form-table">
                    <tr>
                        <th><label for="job-title"><?php _e('Title', 'job-card-tracking'); ?> *</label></th>
                        <td><input type="text" id="job-title" name="title" class="regular-text" required></td>
                    </tr>
                    <tr>
                        <th><label for="job-description"><?php _e('Description', 'job-card-tracking'); ?></label></th>
                        <td><textarea id="job-description" name="description" rows="3" class="large-text"></textarea></td>
                    </tr>
                    <tr>
                        <th><label for="job-priority"><?php _e('Priority', 'job-card-tracking'); ?></label></th>
                        <td>
                            <select id="job-priority" name="priority">
                                <option value="low"><?php _e('Low', 'job-card-tracking'); ?></option>
                                <option value="medium" selected><?php _e('Medium', 'job-card-tracking'); ?></option>
                                <option value="high"><?php _e('High', 'job-card-tracking'); ?></option>
                                <option value="urgent"><?php _e('Urgent', 'job-card-tracking'); ?></option>
                            </select>
                        </td>
                    </tr>
                    <tr>
                        <th><label for="job-assignee"><?php _e('Assignee', 'job-card-tracking'); ?> *</label></th>
                        <td><input type="text" id="job-assignee" name="assignee" class="regular-text" required></td>
                    </tr>
                    <tr>
                        <th><label for="job-department"><?php _e('Department', 'job-card-tracking'); ?></label></th>
                        <td><input type="text" id="job-department" name="department" class="regular-text"></td>
                    </tr>
                    <tr>
                        <th><label for="job-estimated-hours"><?php _e('Estimated Hours', 'job-card-tracking'); ?></label></th>
                        <td><input type="number" id="job-estimated-hours" name="estimated_hours" min="0" step="0.5"></td>
                    </tr>
                    <tr>
                        <th><label for="job-due-date"><?php _e('Due Date', 'job-card-tracking'); ?></label></th>
                        <td><input type="datetime-local" id="job-due-date" name="due_date"></td>
                    </tr>
                    <tr>
                        <th><label for="job-tags"><?php _e('Tags', 'job-card-tracking'); ?></label></th>
                        <td>
                            <input type="text" id="job-tags" name="tags" class="regular-text" placeholder="<?php _e('comma, separated, tags', 'job-card-tracking'); ?>">
                            <p class="description"><?php _e('Separate multiple tags with commas', 'job-card-tracking'); ?></p>
                        </td>
                    </tr>
                </table>
                <p class="submit">
                    <button type="submit" class="button button-primary">
                        <span class="dashicons dashicons-plus"></span>
                        <?php _e('Create Job Card', 'job-card-tracking'); ?>
                    </button>
                    <button type="button" class="button jct-cancel">
                        <?php _e('Cancel', 'job-card-tracking'); ?>
                    </button>
                </p>
            </form>
        </div>
    </div>
    
    <!-- Edit Job Modal -->
    <div id="jct-edit-modal" class="jct-modal" style="display: none;">
        <div class="jct-modal-content">
            <div class="jct-modal-header">
                <h2><?php _e('Edit Job Card', 'job-card-tracking'); ?></h2>
                <span class="jct-close">&times;</span>
            </div>
            <form id="jct-edit-form">
                <input type="hidden" id="edit-job-id" name="job_id">
                <table class="form-table">
                    <tr>
                        <th><label for="edit-job-title"><?php _e('Title', 'job-card-tracking'); ?> *</label></th>
                        <td><input type="text" id="edit-job-title" name="title" class="regular-text" required></td>
                    </tr>
                    <tr>
                        <th><label for="edit-job-description"><?php _e('Description', 'job-card-tracking'); ?></label></th>
                        <td><textarea id="edit-job-description" name="description" rows="3" class="large-text"></textarea></td>
                    </tr>
                    <tr>
                        <th><label for="edit-job-status"><?php _e('Status', 'job-card-tracking'); ?></label></th>
                        <td>
                            <select id="edit-job-status" name="status">
                                <option value="pending"><?php _e('Pending', 'job-card-tracking'); ?></option>
                                <option value="in-progress"><?php _e('In Progress', 'job-card-tracking'); ?></option>
                                <option value="completed"><?php _e('Completed', 'job-card-tracking'); ?></option>
                                <option value="on-hold"><?php _e('On Hold', 'job-card-tracking'); ?></option>
                                <option value="cancelled"><?php _e('Cancelled', 'job-card-tracking'); ?></option>
                            </select>
                        </td>
                    </tr>
                    <tr>
                        <th><label for="edit-job-priority"><?php _e('Priority', 'job-card-tracking'); ?></label></th>
                        <td>
                            <select id="edit-job-priority" name="priority">
                                <option value="low"><?php _e('Low', 'job-card-tracking'); ?></option>
                                <option value="medium"><?php _e('Medium', 'job-card-tracking'); ?></option>
                                <option value="high"><?php _e('High', 'job-card-tracking'); ?></option>
                                <option value="urgent"><?php _e('Urgent', 'job-card-tracking'); ?></option>
                            </select>
                        </td>
                    </tr>
                    <tr>
                        <th><label for="edit-job-assignee"><?php _e('Assignee', 'job-card-tracking'); ?> *</label></th>
                        <td><input type="text" id="edit-job-assignee" name="assignee" class="regular-text" required></td>
                    </tr>
                    <tr>
                        <th><label for="edit-job-department"><?php _e('Department', 'job-card-tracking'); ?></label></th>
                        <td><input type="text" id="edit-job-department" name="department" class="regular-text"></td>
                    </tr>
                    <tr>
                        <th><label for="edit-job-estimated-hours"><?php _e('Estimated Hours', 'job-card-tracking'); ?></label></th>
                        <td><input type="number" id="edit-job-estimated-hours" name="estimated_hours" min="0" step="0.5"></td>
                    </tr>
                    <tr>
                        <th><label for="edit-job-actual-hours"><?php _e('Actual Hours', 'job-card-tracking'); ?></label></th>
                        <td><input type="number" id="edit-job-actual-hours" name="actual_hours" min="0" step="0.5"></td>
                    </tr>
                    <tr>
                        <th><label for="edit-job-due-date"><?php _e('Due Date', 'job-card-tracking'); ?></label></th>
                        <td><input type="datetime-local" id="edit-job-due-date" name="due_date"></td>
                    </tr>
                    <tr>
                        <th><label for="edit-job-tags"><?php _e('Tags', 'job-card-tracking'); ?></label></th>
                        <td><input type="text" id="edit-job-tags" name="tags" class="regular-text"></td>
                    </tr>
                </table>
                <p class="submit">
                    <button type="submit" class="button button-primary">
                        <span class="dashicons dashicons-update"></span>
                        <?php _e('Update Job Card', 'job-card-tracking'); ?>
                    </button>
                    <button type="button" class="button jct-cancel">
                        <?php _e('Cancel', 'job-card-tracking'); ?>
                    </button>
                </p>
            </form>
        </div>
    </div>
</div>
