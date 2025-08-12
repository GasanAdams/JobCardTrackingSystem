<div id="jct-frontend-container" class="jct-container">
    <div class="jct-header">
        <h2>Job Card Tracking System</h2>
        <div class="jct-controls">
            <button id="jct-theme-toggle" class="jct-btn jct-btn-secondary">
                <span class="dashicons dashicons-admin-appearance"></span>
                Toggle Theme
            </button>
            <?php if (current_user_can('edit_posts')): ?>
            <button id="jct-create-job" class="jct-btn jct-btn-primary">
                <span class="dashicons dashicons-plus"></span>
                Create Job
            </button>
            <?php endif; ?>
        </div>
    </div>
    
     Stats Overview 
    <div class="jct-stats-overview">
        <div class="jct-stat-item">
            <div class="jct-stat-icon">
                <span class="dashicons dashicons-groups"></span>
            </div>
            <div class="jct-stat-info">
                <span class="jct-stat-number" id="frontend-total-jobs">0</span>
                <span class="jct-stat-label">Total Jobs</span>
            </div>
        </div>
        <div class="jct-stat-item">
            <div class="jct-stat-icon pending">
                <span class="dashicons dashicons-clock"></span>
            </div>
            <div class="jct-stat-info">
                <span class="jct-stat-number" id="frontend-pending-jobs">0</span>
                <span class="jct-stat-label">Pending</span>
            </div>
        </div>
        <div class="jct-stat-item">
            <div class="jct-stat-icon in-progress">
                <span class="dashicons dashicons-update"></span>
            </div>
            <div class="jct-stat-info">
                <span class="jct-stat-number" id="frontend-in-progress-jobs">0</span>
                <span class="jct-stat-label">In Progress</span>
            </div>
        </div>
        <div class="jct-stat-item">
            <div class="jct-stat-icon completed">
                <span class="dashicons dashicons-yes"></span>
            </div>
            <div class="jct-stat-info">
                <span class="jct-stat-number" id="frontend-completed-jobs">0</span>
                <span class="jct-stat-label">Completed</span>
            </div>
        </div>
    </div>
    
     Filters 
    <div class="jct-filters-section">
        <div class="jct-search-box">
            <input type="text" id="frontend-search" placeholder="Search jobs..." class="jct-search-input">
            <span class="dashicons dashicons-search"></span>
        </div>
        <select id="frontend-status-filter" class="jct-filter-select">
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="on-hold">On Hold</option>
            <option value="cancelled">Cancelled</option>
        </select>
        <select id="frontend-priority-filter" class="jct-filter-select">
            <option value="all">All Priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
        </select>
    </div>
    
     Jobs Display 
    <div id="jct-frontend-jobs" class="jct-jobs-display">
         Jobs will be loaded here 
    </div>
    
     Loading indicator 
    <div id="jct-loading" class="jct-loading" style="display: none;">
        <div class="jct-spinner"></div>
        <span>Loading jobs...</span>
    </div>
</div>

<style>
.jct-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
}

.jct-stats-overview {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 15px;
    margin-bottom: 30px;
}

.jct-stat-item {
    background: var(--jct-light);
    border: 1px solid var(--jct-border);
    border-radius: 8px;
    padding: 15px;
    display: flex;
    align-items: center;
    gap: 12px;
}

.jct-filters-section {
    display: flex;
    gap: 15px;
    margin-bottom: 30px;
    flex-wrap: wrap;
}

.jct-search-box {
    position: relative;
    flex: 1;
    min-width: 250px;
}

.jct-search-input {
    width: 100%;
    padding: 10px 40px 10px 15px;
    border: 1px solid var(--jct-border);
    border-radius: 5px;
    background: var(--jct-light);
    color: var(--jct-text);
}

.jct-search-box .dashicons {
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: var(--jct-text-light);
}

.jct-filter-select {
    padding: 10px 15px;
    border: 1px solid var(--jct-border);
    border-radius: 5px;
    background: var(--jct-light);
    color: var(--jct-text);
    min-width: 150px;
}

.jct-jobs-display {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 20px;
}

.jct-loading {
    text-align: center;
    padding: 40px;
    color: var(--jct-text-light);
}

.jct-spinner {
    border: 3px solid var(--jct-border);
    border-top: 3px solid var(--jct-primary);
    border-radius: 50%;
    width: 30px;
    height: 30px;
    animation: spin 1s linear infinite;
    margin: 0 auto 10px;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

.jct-btn {
    padding: 8px 16px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 5px;
    text-decoration: none;
    font-size: 14px;
    transition: all 0.3s ease;
}

.jct-btn-primary {
    background: var(--jct-primary);
    color: white;
}

.jct-btn-secondary {
    background: var(--jct-secondary);
    color: var(--jct-text);
    border: 1px solid var(--jct-border);
}

.jct-btn:hover {
    opacity: 0.9;
    transform: translateY(-1px);
}

@media (max-width: 768px) {
    .jct-stats-overview {
        grid-template-columns: 1fr;
    }
    
    .jct-jobs-display {
        grid-template-columns: 1fr;
    }
    
    .jct-filters-section {
        flex-direction: column;
    }
    
    .jct-header {
        flex-direction: column;
        gap: 15px;
        text-align: center;
    }
}
</style>

<script>
// Initialize frontend functionality
jQuery(document).ready(function($) {
    // Load jobs on page load
    loadFrontendJobs();
    
    // Bind events for frontend
    $('#frontend-search').on('input', debounce(loadFrontendJobs, 300));
    $('#frontend-status-filter, #frontend-priority-filter').on('change', loadFrontendJobs);
    
    function loadFrontendJobs() {
        $('#jct-loading').show();
        $('#jct-frontend-jobs').hide();
        
        const search = $('#frontend-search').val();
        const status = $('#frontend-status-filter').val();
        const priority = $('#frontend-priority-filter').val();
        
        $.ajax({
            url: jct_ajax.ajax_url,
            type: 'GET',
            data: {
                action: 'jct_get_jobs',
                nonce: jct_ajax.nonce,
                search: search,
                status: status,
                priority: priority
            },
            success: function(response) {
                $('#jct-loading').hide();
                $('#jct-frontend-jobs').show();
                
                if (response.success) {
                    renderFrontendJobs(response.data);
                    updateFrontendStats(response.data);
                }
            },
            error: function() {
                $('#jct-loading').hide();
                $('#jct-frontend-jobs').html('<div class="jct-error">Error loading jobs. Please try again.</div>').show();
            }
        });
    }
    
    function renderFrontendJobs(jobs) {
        const container = $('#jct-frontend-jobs');
        
        if (jobs.length === 0) {
            container.html('<div class="jct-no-jobs">No jobs found matching your criteria.</div>');
            return;
        }
        
        const jobsHtml = jobs.map(job => createFrontendJobCard(job)).join('');
        container.html(jobsHtml);
    }
    
    function createFrontendJobCard(job) {
        const isOverdue = new Date() > new Date(job.due_date) && job.status !== 'completed';
        const tags = job.tags ? job.tags.split(',') : [];
        
        const tagsHtml = tags.map(tag => 
            `<span class="jct-tag">${tag.trim()}</span>`
        ).join('');
        
        return `
            <div class="jct-job-card ${isOverdue ? 'overdue' : ''}">
                <div class="jct-job-header">
                    <div>
                        <h3 class="jct-job-title">${job.title}</h3>
                        <div class="jct-job-id">${job.job_id}</div>
                    </div>
                    <span class="jct-priority-badge ${job.priority}">${job.priority}</span>
                </div>
                
                <div class="jct-job-description">${job.description || ''}</div>
                
                <div class="jct-job-meta">
                    <div>
                        <div class="jct-job-assignee">${job.assignee}</div>
                        <div class="jct-job-department">${job.department || ''}</div>
                    </div>
                    <div class="jct-status-badge ${job.status}">${job.status.replace('-', ' ')}</div>
                </div>
                
                <div class="jct-job-footer">
                    <div>Due: ${formatDate(job.due_date)}</div>
                    <div>${job.actual_hours ? job.actual_hours + 'h' : 'Est: ' + job.estimated_hours + 'h'}</div>
                </div>
                
                ${tagsHtml ? `<div class="jct-job-tags">${tagsHtml}</div>` : ''}
                ${isOverdue ? '<div class="jct-overdue-indicator"><span class="dashicons dashicons-warning"></span> Overdue</div>' : ''}
            </div>
        `;
    }
    
    function updateFrontendStats(jobs) {
        const stats = {
            total: jobs.length,
            pending: jobs.filter(job => job.status === 'pending').length,
            inProgress: jobs.filter(job => job.status === 'in-progress').length,
            completed: jobs.filter(job => job.status === 'completed').length
        };
        
        $('#frontend-total-jobs').text(stats.total);
        $('#frontend-pending-jobs').text(stats.pending);
        $('#frontend-in-progress-jobs').text(stats.inProgress);
        $('#frontend-completed-jobs').text(stats.completed);
    }
    
    function formatDate(dateString) {
        if (!dateString) return 'Not set';
        const date = new Date(dateString);
        return date.toLocaleDateString();
    }
    
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
});
</script>
