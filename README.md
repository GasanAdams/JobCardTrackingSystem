# Job Card Tracking System

A comprehensive WordPress plugin for real-time job card tracking with analytics and reporting features.

## Features

- ✅ Real-time job card management
- ✅ Status tracking (Pending, In Progress, Completed, On Hold, Cancelled)
- ✅ Priority levels (Low, Medium, High, Urgent)
- ✅ Department-based organization
- ✅ Advanced search and filtering
- ✅ Dark/Light theme toggle
- ✅ Mobile responsive design
- ✅ Data export (CSV, JSON)
- ✅ Analytics dashboard
- ✅ Shortcode support for frontend display
- ✅ User permission management
- ✅ Auto-refresh functionality

## Installation

1. Download the plugin files
2. Upload to `/wp-content/plugins/job-card-tracking/`
3. Activate the plugin through the 'Plugins' menu in WordPress
4. Go to 'Job Tracking' in your admin menu to start using

## Usage

### Admin Interface
- Access via **Job Tracking** menu in WordPress admin
- Create, edit, and manage job cards
- View analytics and export data
- Configure settings and permissions

### Frontend Display
Use shortcodes to display job cards on any page or post:

\`\`\`
[job_card_tracking]
\`\`\`

#### Shortcode Parameters
- `view="grid"` - Display format (grid or list)
- `show_analytics="true"` - Show analytics overview
- `department="IT"` - Filter by specific department
- `status="pending"` - Filter by job status
- `show_create_button="false"` - Hide create button for read-only view

### Examples

**Project Dashboard:**
\`\`\`
[job_card_tracking show_analytics="true"]
\`\`\`

**Department View:**
\`\`\`
[job_card_tracking department="IT" show_create_button="false"]
\`\`\`

**Client Portal:**
\`\`\`
[job_card_tracking status="in-progress" show_create_button="false"]
\`\`\`

## User Permissions

- **Administrator**: Full access to all features
- **Editor**: Can create, edit, and delete job cards
- **Author**: Can create and edit their own job cards
- **Contributor/Subscriber**: View-only access

## Data Export

Export job data in multiple formats:
- **CSV**: Excel-compatible format
- **JSON**: Developer-friendly structured data

Access export functionality via:
- Quick export button in admin interface
- Advanced export page with filtering options

## Technical Requirements

- WordPress 5.0 or higher
- PHP 7.4 or higher
- MySQL 5.6 or higher

## Support

For support and feature requests, please contact the plugin developer.

## Changelog

### Version 1.0.0
- Initial release
- Core job tracking functionality
- Analytics dashboard
- Export capabilities
- Shortcode support
- Theme toggle
- Mobile responsive design
