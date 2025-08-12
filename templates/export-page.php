<?php
if (!defined('ABSPATH')) {
    exit;
}
?>

<div class="wrap">
    <h1><?php _e('Export Job Data', 'job-card-tracking'); ?></h1>
    
    <div class="jct-export-container">
        <div class="jct-export-form">
            <h2><?php _e('Export Options', 'job-card-tracking'); ?></h2>
            
            <form id="jct-export-form">
                <table class="form-table">
                    <tr>
                        <th scope="row">
                            <label for="export-format"><?php _e('Export Format', 'job-card-tracking'); ?></label>
                        </th>
                        <td>
                            <select id="export-format" name="format">
                                <option value="csv"><?php _e('CSV (Excel Compatible)', 'job-card-tracking'); ?></option>
                                <option value="json"><?php _e('JSON (Developer Format)', 'job-card-tracking'); ?></option>
                            </select>
                        </td>
                    </tr>
                    
                    <tr>
                        <th scope="row">
                            <label for="export-status"><?php _e('Status Filter', 'job-card-tracking'); ?></label>
                        </th>
                        <td>
                            <select id="export-status" name="status">
                                <option value="all"><?php _e('All Statuses', 'job-card-tracking'); ?></option>
                                <option value="pending"><?php _e('Pending', 'job-card-tracking'); ?></option>
                                <option value="in-progress"><?php _e('In Progress', 'job-card-tracking'); ?></option>
                                <option value="completed"><?php _e('Completed', 'job-card-tracking'); ?></option>
                                <option value="on-hold"><?php _e('On Hold', 'job-card-tracking'); ?></option>
                                <option value="cancelled"><?php _e('Cancelled', 'job-card-tracking'); ?></option>
                            </select>
                        </td>
                    </tr>
                    
                    <tr>
                        <th scope="row">
                            <label for="export-priority"><?php _e('Priority Filter', 'job-card-tracking'); ?></label>
                        </th>
                        <td>
                            <select id="export-priority" name="priority">
                                <option value="all"><?php _e('All Priorities', 'job-card-tracking'); ?></option>
                                <option value="low"><?php _e('Low', 'job-card-tracking'); ?></option>
                                <option value="medium"><?php _e('Medium', 'job-card-tracking'); ?></option>
                                <option value="high"><?php _e('High', 'job-card-tracking'); ?></option>
                                <option value="urgent"><?php _e('Urgent', 'job-card-tracking'); ?></option>
                            </select>
                        </td>
                    </tr>
                    
                    <tr>
                        <th scope="row">
                            <label for="export-department"><?php _e('Department Filter', 'job-card-tracking'); ?></label>
                        </th>
                        <td>
                            <input type="text" id="export-department" name="department" class="regular-text" placeholder="<?php _e('Leave empty for all departments', 'job-card-tracking'); ?>">
                        </td>
                    </tr>
                    
                    <tr>
                        <th scope="row">
                            <label for="export-search"><?php _e('Search Filter', 'job-card-tracking'); ?></label>
                        </th>
                        <td>
                            <input type="text" id="export-search" name="search" class="regular-text" placeholder="<?php _e('Search in title, description, assignee...', 'job-card-tracking'); ?>">
                        </td>
                    </tr>
                </table>
                
                <p class="submit">
                    <button type="button" id="preview-export" class="button">
                        <span class="dashicons dashicons-visibility"></span>
                        <?php _e('Preview Export', 'job-card-tracking'); ?>
                    </button>
                    <button type="submit" class="button button-primary">
                        <span class="dashicons dashicons-download"></span>
                        <?php _e('Export Job Cards', 'job-card-tracking'); ?>
                    </button>
                </p>
            </form>
        </div>
        
        <div class="jct-export-preview" id="export-preview" style="display: none;">
            <h3><?php _e('Export Preview', 'job-card-tracking'); ?></h3>
            <div id="preview-content"></div>
        </div>
    </div>
</div>
