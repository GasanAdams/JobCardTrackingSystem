<?php
// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}
?>

<div class="wrap">
    <h1><?php _e('Job Card Tracking - Usage Guide', 'job-card-tracking'); ?></h1>
    
    <div class="jct-usage-guide">
        <div class="jct-guide-section">
            <h2><?php _e('1. Admin Dashboard Usage', 'job-card-tracking'); ?></h2>
            <div class="jct-guide-content">
                <h3><?php _e('Accessing the Admin Dashboard', 'job-card-tracking'); ?></h3>
                <p><?php _e('Navigate to <strong>Job Tracking</strong> in your WordPress admin menu (left sidebar).', 'job-card-tracking'); ?></p>
                
                <h3><?php _e('Creating Job Cards', 'job-card-tracking'); ?></h3>
                <ol>
                    <li><?php _e('Click the <strong>"Create Job Card"</strong> button', 'job-card-tracking'); ?></li>
                    <li><?php _e('Fill in the required fields (Title and Assignee)', 'job-card-tracking'); ?></li>
                    <li><?php _e('Set priority, department, estimated hours, and due date', 'job-card-tracking'); ?></li>
                    <li><?php _e('Add tags for better organization', 'job-card-tracking'); ?></li>
                    <li><?php _e('Click "Create Job Card" to save', 'job-card-tracking'); ?></li>
                </ol>
                
                <h3><?php _e('Managing Job Status', 'job-card-tracking'); ?></h3>
                <ul>
                    <li><?php _e('<strong>Pending</strong>: Job is waiting to be started', 'job-card-tracking'); ?></li>
                    <li><?php _e('<strong>In Progress</strong>: Job is currently being worked on', 'job-card-tracking'); ?></li>
                    <li><?php _e('<strong>Completed</strong>: Job has been finished', 'job-card-tracking'); ?></li>
                    <li><?php _e('<strong>On Hold</strong>: Job is temporarily paused', 'job-card-tracking'); ?></li>
                    <li><?php _e('<strong>Cancelled</strong>: Job has been cancelled', 'job-card-tracking'); ?></li>
                </ul>
                
                <h3><?php _e('Using Filters and Search', 'job-card-tracking'); ?></h3>
                <ul>
                    <li><?php _e('Use the search box to find jobs by title, description, or assignee', 'job-card-tracking'); ?></li>
                    <li><?php _e('Filter by status, priority, or department', 'job-card-tracking'); ?></li>
                    <li><?php _e('Click "Refresh" to update the job list', 'job-card-tracking'); ?></li>
                </ul>
            </div>
        </div>
        
        <div class="jct-guide-section">
            <h2><?php _e('2. Frontend Display with Shortcodes', 'job-card-tracking'); ?></h2>
            <div class="jct-guide-content">
                <h3><?php _e('Basic Shortcode Usage', 'job-card-tracking'); ?></h3>
                <p><?php _e('Add this shortcode to any page, post, or widget:', 'job-card-tracking'); ?></p>
                <code>[job_card_tracking]</code>
                
                <h3><?php _e('Shortcode Attributes', 'job-card-tracking'); ?></h3>
                <table class="wp-list-table widefat fixed striped">
                    <thead>
                        <tr>
                            <th><?php _e('Attribute', 'job-card-tracking'); ?></th>
                            <th><?php _e('Options', 'job-card-tracking'); ?></th>
                            <th><?php _e('Description', 'job-card-tracking'); ?></th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td><code>view</code></td>
                            <td>grid, list</td>
                            <td><?php _e('Display layout (default: grid)', 'job-card-tracking'); ?></td>
                        </tr>
                        <tr>
                            <td><code>status</code></td>
                            <td>all, pending, in-progress, completed, on-hold, cancelled</td>
                            <td><?php _e('Filter by job status (default: all)', 'job-card-tracking'); ?></td>
                        </tr>
                        <tr>
                            <td><code>department</code></td>
                            <td>Any department name</td>
                            <td><?php _e('Filter by specific department', 'job-card-tracking'); ?></td>
                        </tr>
                        <tr>
                            <td><code>show_create_button</code></td>
                            <td>true, false</td>
                            <td><?php _e('Show create job button (default: true)', 'job-card-tracking'); ?></td>
                        </tr>
                        <tr>
                            <td><code>show_analytics</code></td>
                            <td>true, false</td>
                            <td><?php _e('Show analytics section (default: false)', 'job-card-tracking'); ?></td>
                        </tr>
                    </tbody>
                </table>
                
                <h3><?php _e('Shortcode Examples', 'job-card-tracking'); ?></h3>
                <div class="jct-code-examples">
                    <h4><?php _e('Show all jobs in grid view:', 'job-card-tracking'); ?></h4>
                    <code>[job_card_tracking]</code>
                    
                    <h4><?php _e('Show only pending jobs:', 'job-card-tracking'); ?></h4>
                    <code>[job_card_tracking status="pending"]</code>
                    
                    <h4><?php _e('Show IT department jobs in list view:', 'job-card-tracking'); ?></h4>
                    <code>[job_card_tracking view="list" department="IT"]</code>
                    
                    <h4><?php _e('Read-only view (no create button):', 'job-card-tracking'); ?></h4>
                    <code>[job_card_tracking show_create_button="false"]</code>
                    
                    <h4><?php _e('Dashboard with analytics:', 'job-card-tracking'); ?></h4>
                    <code>[job_card_tracking show_analytics="true"]</code>
                </div>
            </div>
        </div>
        
        <div class="jct-guide-section">
            <h2><?php _e('3. User Permissions', 'job-card-tracking'); ?></h2>
            <div class="jct-guide-content">
                <h3><?php _e('Permission Levels', 'job-card-tracking'); ?></h3>
                <ul>
                    <li><strong><?php _e('Administrator', 'job-card-tracking'); ?></strong>: <?php _e('Full access to all features', 'job-card-tracking'); ?></li>
                    <li><strong><?php _e('Editor', 'job-card-tracking'); ?></strong>: <?php _e('Can create, edit, and delete job cards', 'job-card-tracking'); ?></li>
                    <li><strong><?php _e('Author', 'job-card-tracking'); ?></strong>: <?php _e('Can create and edit their own job cards', 'job-card-tracking'); ?></li>
                    <li><strong><?php _e('Contributor', 'job-card-tracking'); ?></strong>: <?php _e('Can view job cards only', 'job-card-tracking'); ?></li>
                    <li><strong><?php _e('Subscriber', 'job-card-tracking'); ?></strong>: <?php _e('Can view job cards only', 'job-card-tracking'); ?></li>
                </ul>
                
                <h3><?php _e('Customizing Permissions', 'job-card-tracking'); ?></h3>
                <p><?php _e('You can modify user capabilities using a plugin like "User Role Editor" or add custom code to your theme\'s functions.php:', 'job-card-tracking'); ?></p>
                <pre><code>// Allow subscribers to create job cards
add_action('init', function() {
    $role = get_role('subscriber');
    $role->add_cap('edit_posts');
});</code></pre>
            </div>
        </div>
        
        <div class="jct-guide-section">
            <h2><?php _e('4. Theme Integration', 'job-card-tracking'); ?></h2>
            <div class="jct-guide-content">
                <h3><?php _e('Dark/Light Mode Toggle', 'job-card-tracking'); ?></h3>
                <p><?php _e('The plugin includes automatic dark/light mode switching. Users can toggle themes using the theme button, and their preference is saved.', 'job-card-tracking'); ?></p>
                
                <h3><?php _e('Custom Styling', 'job-card-tracking'); ?></h3>
                <p><?php _e('Add custom CSS to your theme to override plugin styles:', 'job-card-tracking'); ?></p>
                <pre><code>/* Custom job card styling */
.jct-job-card {
    border-radius: 10px;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

/* Custom priority colors */
.jct-priority-badge.urgent {
    background-color: #ff4444;
    color: white;
}</code></pre>
            </div>
        </div>
        
        <div class="jct-guide-section">
            <h2><?php _e('5. Common Use Cases', 'job-card-tracking'); ?></h2>
            <div class="jct-guide-content">
                <h3><?php _e('Project Management Dashboard', 'job-card-tracking'); ?></h3>
                <p><?php _e('Create a dedicated page for project management:', 'job-card-tracking'); ?></p>
                <ol>
                    <li><?php _e('Create a new page called "Project Dashboard"', 'job-card-tracking'); ?></li>
                    <li><?php _e('Add the shortcode: <code>[job_card_tracking show_analytics="true"]</code>', 'job-card-tracking'); ?></li>
                    <li><?php _e('Set page permissions for team members', 'job-card-tracking'); ?></li>
                </ol>
                
                <h3><?php _e('Department-Specific Views', 'job-card-tracking'); ?></h3>
                <p><?php _e('Create separate pages for different departments:', 'job-card-tracking'); ?></p>
                <ul>
                    <li><?php _e('IT Department: <code>[job_card_tracking department="IT"]</code>', 'job-card-tracking'); ?></li>
                    <li><?php _e('Marketing: <code>[job_card_tracking department="Marketing"]</code>', 'job-card-tracking'); ?></li>
                    <li><?php _e('HR: <code>[job_card_tracking department="HR"]</code>', 'job-card-tracking'); ?></li>
                </ul>
                
                <h3><?php _e('Client Portal', 'job-card-tracking'); ?></h3>
                <p><?php _e('Create a client-facing view:', 'job-card-tracking'); ?></p>
                <code>[job_card_tracking show_create_button="false" status="in-progress"]</code>
                
                <h3><?php _e('Team Task Board', 'job-card-tracking'); ?></h3>
                <p><?php _e('Create a Kanban-style board for team collaboration:', 'job-card-tracking'); ?></p>
                <code>[job_card_tracking view="grid"]</code>
            </div>
        </div>
        
        <div class="jct-guide-section">
            <h2><?php _e('6. Advanced Features', 'job-card-tracking'); ?></h2>
            <div class="jct-guide-content">
                <h3><?php _e('Real-time Updates', 'job-card-tracking'); ?></h3>
                <p><?php _e('The system automatically refreshes job data every 30 seconds when users are actively viewing the page.', 'job-card-tracking'); ?></p>
                
                <h3><?php _e('Keyboard Shortcuts', 'job-card-tracking'); ?></h3>
                <ul>
                    <li><strong>Ctrl/Cmd + N</strong>: <?php _e('Create new job card', 'job-card-tracking'); ?></li>
                    <li><strong>Ctrl/Cmd + R</strong>: <?php _e('Refresh job list', 'job-card-tracking'); ?></li>
                    <li><strong>Escape</strong>: <?php _e('Close modal dialogs', 'job-card-tracking'); ?></li>
                </ul>
                
                <h3><?php _e('Mobile Responsiveness', 'job-card-tracking'); ?></h3>
                <p><?php _e('The plugin is fully responsive and works on all devices. On mobile devices, the layout automatically adjusts for better usability.', 'job-card-tracking'); ?></p>
                
                <h3><?php _e('Search and Filtering', 'job-card-tracking'); ?></h3>
                <p><?php _e('Advanced search capabilities include:', 'job-card-tracking'); ?></p>
                <ul>
                    <li><?php _e('Search by job title, description, assignee, or job ID', 'job-card-tracking'); ?></li>
                    <li><?php _e('Filter by status, priority, and department', 'job-card-tracking'); ?></li>
                    <li><?php _e('Real-time search results (no page refresh needed)', 'job-card-tracking'); ?></li>
                </ul>
            </div>
        </div>
        
        <div class="jct-guide-section">
            <h2><?php _e('7. Troubleshooting', 'job-card-tracking'); ?></h2>
            <div class="jct-guide-content">
                <h3><?php _e('Common Issues', 'job-card-tracking'); ?></h3>
                
                <h4><?php _e('Jobs not loading:', 'job-card-tracking'); ?></h4>
                <ul>
                    <li><?php _e('Check if JavaScript is enabled in your browser', 'job-card-tracking'); ?></li>
                    <li><?php _e('Ensure you have proper user permissions', 'job-card-tracking'); ?></li>
                    <li><?php _e('Try refreshing the page', 'job-card-tracking'); ?></li>
                </ul>
                
                <h4><?php _e('Create button not showing:', 'job-card-tracking'); ?></h4>
                <ul>
                    <li><?php _e('Check if your user role has "edit_posts" capability', 'job-card-tracking'); ?></li>
                    <li><?php _e('Verify the shortcode includes <code>show_create_button="true"</code>', 'job-card-tracking'); ?></li>
                </ul>
                
                <h4><?php _e('Styling issues:', 'job-card-tracking'); ?></h4>
                <ul>
                    <li><?php _e('Clear your browser cache', 'job-card-tracking'); ?></li>
                    <li><?php _e('Check for theme conflicts', 'job-card-tracking'); ?></li>
                    <li><?php _e('Ensure plugin CSS files are loading', 'job-card-tracking'); ?></li>
                </ul>
                
                <h3><?php _e('Getting Help', 'job-card-tracking'); ?></h3>
                <p><?php _e('If you need additional help:', 'job-card-tracking'); ?></p>
                <ul>
                    <li><?php _e('Check the plugin settings page for configuration options', 'job-card-tracking'); ?></li>
                    <li><?php _e('Review the browser console for JavaScript errors', 'job-card-tracking'); ?></li>
                    <li><?php _e('Contact your site administrator', 'job-card-tracking'); ?></li>
                </ul>
            </div>
        </div>
    </div>
</div>

<style>
.jct-usage-guide {
    max-width: 1200px;
}

.jct-guide-section {
    background: #fff;
    border: 1px solid #ccd0d4;
    border-radius: 4px;
    margin-bottom: 20px;
    padding: 20px;
}

.jct-guide-section h2 {
    color: #23282d;
    border-bottom: 2px solid #0073aa;
    padding-bottom: 10px;
    margin-bottom: 20px;
}

.jct-guide-section h3 {
    color: #0073aa;
    margin-top: 25px;
    margin-bottom: 15px;
}

.jct-guide-section h4 {
    color: #555;
    margin-top: 20px;
    margin-bottom: 10px;
}

.jct-guide-content {
    line-height: 1.6;
}

.jct-guide-content code {
    background: #f1f1f1;
    padding: 2px 6px;
    border-radius: 3px;
    font-family: Consolas, Monaco, monospace;
}

.jct-guide-content pre {
    background: #f8f8f8;
    border: 1px solid #ddd;
    border-radius: 4px;
    padding: 15px;
    overflow-x: auto;
    margin: 15px 0;
}

.jct-guide-content pre code {
    background: none;
    padding: 0;
}

.jct-code-examples {
    background: #f9f9f9;
    border-left: 4px solid #0073aa;
    padding: 15px;
    margin: 15px 0;
}

.jct-code-examples h4 {
    margin-top: 15px;
    margin-bottom: 5px;
    color: #0073aa;
}

.jct-code-examples h4:first-child {
    margin-top: 0;
}

.jct-code-examples code {
    display: block;
    margin-bottom: 15px;
    background: #fff;
    padding: 8px 12px;
    border: 1px solid #ddd;
    border-radius: 3px;
}

.jct-guide-content ul, .jct-guide-content ol {
    margin: 15px 0;
    padding-left: 25px;
}

.jct-guide-content li {
    margin-bottom: 8px;
}

.jct-guide-content table {
    margin: 15px 0;
}

.jct-guide-content table th {
    background: #f1f1f1;
    font-weight: 600;
}

.jct-guide-content table td code {
    font-weight: 600;
    color: #0073aa;
}
</style>
