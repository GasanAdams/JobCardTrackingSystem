<div class="wrap">
    <h1>Job Card Tracking System</h1>
    
    <div id="jct-admin-container">
         Theme Toggle 
        <div class="jct-header">
            <div class="jct-theme-toggle">
                <button id="jct-theme-toggle" class="button">
                    <span class="dashicons dashicons-admin-appearance"></span>
                    Toggle Theme
                </button>
            </div>
            <button id="jct-create-job" class="button button-primary">
                <span class="dashicons dashicons-plus"></span>
                Create Job Card
            </button>
        </div>
        
         Stats Cards 
        <div class="jct-stats-grid">
            <div class="jct-stat-card">
                <div class="jct-stat-icon">
                    <span class="dashicons dashicons-groups"></span>
                </div>
                <div class="jct-stat-content">
                    <div class="jct-stat-number" id="total-jobs">0</div>
                    <div class="jct-stat-label">Total Jobs</div>
                </div>
            </div>
            <div class="jct-stat-card">
                <div class="jct-stat-icon pending">
                    <span class="dashicons dashicons-clock"></span>
                </div>
                <div class="jct-stat-content">
                    <div class="jct-stat-number" id="pending-jobs">0</div>
                    <div class="jct-stat-label">Pending</div>
                </div>
            </div>
            <div class="jct-stat-card">
                <div class="jct-stat-icon in-progress">
                    <span class="dashicons dashicons-update"></span>
                </div>
                <div class="jct-stat-content">
                    <div class="jct-stat-number" id="in-progress-jobs">0</div>
                    <div class="jct-stat-label">In Progress</div>
                </div>
            </div>
            <div class="jct-stat-card">
                <div class="jct-stat-icon completed">
                    <span class="dashicons dashicons-yes"></span>
                </div>
                <div class="jct-stat-content">
                    <div class="jct-stat-number" id="completed-jobs">0</div>
                    <div class="jct-stat-label">Completed</div>
                </div>
            </div>
        </div>
        
         Filters 
        <div class="jct-filters">
            <input type="text" id="jct-search" placeholder="Search jobs..." class="regular-text">
            <select id="jct-status-filter">
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="on-hold">On Hold</option>
                <option value="cancelled">Cancelled</option>
            </select>
            <select id="jct-priority-filter">
                <option value="all">All Priorities</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
            </select>
        </div>
        
         Job Cards Container 
        <div id="jct-jobs-container" class="jct-jobs-grid">
             Jobs will be loaded here via AJAX 
        </div>
    </div>
    
     Create Job Modal 
    <div id="jct-create-modal" class="jct-modal" style="display: none;">
        <div class="jct-modal-content">
            <div class="jct-modal-header">
                <h2>Create New Job Card</h2>
                <span class="jct-close">&times;</span>
            </div>
            <form id="jct-create-form">
                <table class="form-table">
                    <tr>
                        <th><label for="job-title">Title</label></th>
                        <td><input type="text" id="job-title" name="title" class="regular-text" required></td>
                    </tr>
                    <tr>
                        <th><label for="job-description">Description</label></th>
                        <td><textarea id="job-description" name="description" rows="3" class="large-text"></textarea></td>
                    </tr>
                    <tr>
                        <th><label for="job-priority">Priority</label></th>
                        <td>
                            <select id="job-priority" name="priority">
                                <option value="low">Low</option>
                                <option value="medium" selected>Medium</option>
                                <option value="high">High</option>
                                <option value="urgent">Urgent</option>
                            </select>
                        </td>
                    </tr>
                    <tr>
                        <th><label for="job-assignee">Assignee</label></th>
                        <td><input type="text" id="job-assignee" name="assignee" class="regular-text" required></td>
                    </tr>
                    <tr>
                        <th><label for="job-department">Department</label></th>
                        <td><input type="text" id="job-department" name="department" class="regular-text"></td>
                    </tr>
                    <tr>
                        <th><label for="job-estimated-hours">Estimated Hours</label></th>
                        <td><input type="number" id="job-estimated-hours" name="estimated_hours" min="0" step="0.5"></td>
                    </tr>
                    <tr>
                        <th><label for="job-due-date">Due Date</label></th>
                        <td><input type="datetime-local" id="job-due-date" name="due_date"></td>
                    </tr>
                    <tr>
                        <th><label for="job-tags">Tags</label></th>
                        <td><input type="text" id="job-tags" name="tags" class="regular-text" placeholder="comma, separated, tags"></td>
                    </tr>
                </table>
                <p class="submit">
                    <button type="submit" class="button button-primary">Create Job Card</button>
                    <button type="button" class="button jct-cancel">Cancel</button>
                </p>
            </form>
        </div>
    </div>
</div>
