# Job Card Tracking System

A comprehensive WordPress plugin for managing job cards with real-time tracking, analytics, and reporting features.

## Features

- **Real-time Job Tracking**: Live updates and status changes
- **Dark/Light Theme**: Toggle between themes with persistent storage
- **Advanced Analytics**: Charts and performance metrics
- **Responsive Design**: Works on all devices
- **Search & Filtering**: Advanced filtering options
- **User Permissions**: Role-based access control
- **Export/Import**: Data export capabilities
- **Shortcode Support**: Easy frontend integration

## Installation

1. Download the plugin zip file
2. Upload to WordPress via Plugins → Add New → Upload Plugin
3. Activate the plugin
4. Access via "Job Tracking" in the admin menu

## Usage

### Admin Interface
- Navigate to "Job Tracking" in WordPress admin
- Create, edit, and manage job cards
- View analytics and reports
- Configure settings

### Frontend Display
Use the shortcode to display jobs on any page or post:

\`\`\`
[job_card_tracking]
\`\`\`

### Shortcode Attributes
- `view` - Display mode (grid/list)
- `department` - Filter by department
- `status` - Filter by status
- `show_create_button` - Show create button (true/false)

Example:
\`\`\`
[job_card_tracking view="grid" department="IT" status="pending"]
\`\`\`

## Requirements

- WordPress 5.0 or higher
- PHP 7.4 or higher
- MySQL 5.6 or higher

## Support

For support and documentation, visit the plugin settings page in your WordPress admin.

## Changelog

### Version 1.0.0
- Initial release
- Core job tracking functionality
- Dark/light theme support
- Analytics dashboard
- Responsive design
- Shortcode integration
