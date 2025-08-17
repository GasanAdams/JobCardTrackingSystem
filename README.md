# Job Card Tracking System

A comprehensive WordPress plugin for tracking job cards with real-time updates, auto-refresh functionality, and Carbon Bros branding.

## Features

- **Real-time Job Tracking**: Create, update, and manage job cards
- **Auto-refresh System**: Automatic updates every 2, 5, or 10 minutes
- **Dark/Light Theme**: Toggle between themes with localStorage persistence
- **Mobile Responsive**: Optimized for all devices
- **WordPress Integration**: Full WordPress admin and frontend support
- **Carbon Bros Branding**: Professional black and white aesthetic
- **Advanced Filtering**: Search by status, priority, department
- **Analytics Dashboard**: Performance metrics and charts
- **Export Functionality**: Export job data in multiple formats

## Installation

### Method 1: Manual Upload

1. Download all plugin files
2. Create a folder called `job-card-tracking`
3. Upload the folder to `/wp-content/plugins/`
4. Activate the plugin in WordPress admin

### Method 2: ZIP Upload

1. Create a ZIP file of the `job-card-tracking` folder
2. Go to WordPress Admin > Plugins > Add New > Upload Plugin
3. Upload the ZIP file and activate

## Usage

### Admin Dashboard
Access the job tracking system via **Job Tracking** in the WordPress admin menu.

### Frontend Display
Use the shortcode `[job_card_tracking]` to display the system on any page or post.

#### Shortcode Parameters:
- `view="grid|list"` - Display mode (default: grid)
- `show_analytics="true|false"` - Show statistics (default: false)
- `show_create_button="true|false"` - Show create button (default: true)

### Auto-refresh Options
- **Off**: No automatic refreshing
- **Every 2 minutes**: Refreshes every 2 minutes
- **Every 5 minutes**: Refreshes every 5 minutes
- **Every 10 minutes**: Refreshes every 10 minutes

## Requirements

- WordPress 5.0 or higher
- PHP 7.4 or higher
- MySQL 5.6 or higher

## Support

For support and documentation, visit [Carbon Bros](https://carbonbros.com)

## License

GPL v2 or later
