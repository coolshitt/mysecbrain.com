# MySecBrain - Habit Tracker

A modern, minimalist habit tracking application built with vanilla JavaScript, featuring a clean black & white design with light/dark mode support.

## 🏗️ Project Structure

```
mysecbrain.com/
├── index.html          # Main HTML file
├── css/               # Stylesheets
│   ├── styles.css     # Main styles and layout
│   ├── themes.css     # Theme system (light/dark)
│   └── responsive.css # Responsive design rules
├── js/                # JavaScript modules
│   ├── utils.js       # Utility functions
│   ├── storage.js     # Data persistence layer
│   ├── calendar.js    # Calendar management
│   ├── habits.js      # Habits and progress tracking
│   └── app.js         # Main application controller
└── README.md          # This file
```

## 🚀 Features

- **Interactive Calendar**: Click any day to manage habits
- **Progress Tracking**: Visual indicators and progress bars
- **Data Persistence**: All data saved locally using localStorage
- **Export/Import**: Backup and restore functionality
- **Theme Toggle**: Light/dark mode with smooth transitions
- **Responsive Design**: Works perfectly on all devices
- **Modular Architecture**: Clean, maintainable code structure

## 🎯 Core Modules

### 1. **Utils** (`js/utils.js`)
Utility functions for common operations:
- Date formatting and manipulation
- Progress calculations
- File download utilities
- Alert and confirmation dialogs

### 2. **Storage** (`js/storage.js`)
Data persistence layer:
- localStorage management with prefixing
- Error handling and fallbacks
- Storage size monitoring
- Default data management

### 3. **Calendar** (`js/calendar.js`)
Calendar rendering and navigation:
- Month navigation (previous/next)
- Date selection handling
- Progress indicator management
- Responsive grid layout

### 4. **Habits** (`js/habits.js`)
Habit management and tracking:
- Habit CRUD operations
- Completion status tracking
- Progress calculations
- Modal management

### 5. **App** (`js/app.js`)
Main application controller:
- Module coordination
- Event handling
- Theme management
- Data import/export

## 🛠️ Development

### Prerequisites
- Modern web browser with ES6+ support
- No build tools required (vanilla JavaScript)

### Local Development
1. Clone the repository
2. Open `index.html` in your browser
3. Start developing!

### Adding New Modules
The modular structure makes it easy to add new features:

1. **Create a new module file** in `js/` directory
2. **Add the script tag** to `index.html`
3. **Initialize the module** in `app.js`
4. **Set up callbacks** for module communication

### Example: Adding a Notes Module
```javascript
// js/notes.js
class NotesManager {
    constructor() {
        this.notes = {};
    }
    
    addNote(date, note) {
        // Implementation
    }
}

// In app.js
this.notes = new NotesManager();
```

## 🎨 Styling

### CSS Architecture
- **`styles.css`**: Core layout and component styles
- **`themes.css`**: CSS variables and theme switching
- **`responsive.css`**: Mobile-first responsive design

### Design System
- **Colors**: Strictly black, white, and grayscale
- **Typography**: System font stack for optimal performance
- **Spacing**: Consistent 8px grid system
- **Transitions**: Smooth 0.3s ease animations

## 📱 Responsive Design

- **Mobile First**: Designed for mobile devices first
- **Breakpoints**: 768px (mobile), 1024px (tablet), 1025px+ (desktop)
- **Touch Friendly**: Optimized for touch interactions
- **Flexible Layout**: Adapts to all screen sizes

## 💾 Data Management

### Storage Structure
```javascript
{
    "mysecbrain_habits": ["habit1", "habit2", ...],
    "mysecbrain_completions": {
        "2024-01-01": [true, false, true, ...],
        "2024-01-02": [false, true, false, ...]
    },
    "mysecbrain_theme": "light"
}
```

### Export/Import
- **Export**: Downloads JSON file with all data
- **Import**: Restores data from JSON file
- **Validation**: Ensures data integrity
- **Backup**: Easy data backup and restoration

## 🔧 Customization

### Adding New Habits
Edit the `DEFAULT_HABITS` array in `js/storage.js`:
```javascript
const DEFAULT_HABITS = [
    'Exercise for 30 minutes',
    'Read for 20 minutes',
    'Your new habit here',
    // ... more habits
];
```

### Theme Customization
Modify CSS variables in `css/themes.css`:
```css
:root {
    --bg-primary: #ffffff;
    --accent-color: #000000;
    /* ... more variables */
}
```

## 🚀 Deployment

### Static Hosting
The app is ready for any static hosting service:
- **GitHub Pages**: Push to repository and enable Pages
- **Vercel**: Connect repository for automatic deployment
- **Netlify**: Drag and drop deployment
- **Traditional Hosting**: Upload files to web server

### Domain Configuration
Point your domain (mysecbrain.com) to the hosting service of your choice.

## 🔮 Future Enhancements

The modular architecture makes it easy to add:
- **Notes Module**: Daily journaling and notes
- **Goals Module**: Long-term goal tracking
- **Analytics Module**: Progress insights and statistics
- **Social Module**: Share progress with friends
- **Reminders Module**: Push notifications and reminders

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is open source and available under the MIT License.

## 🆘 Support

For questions or issues:
1. Check the code comments for implementation details
2. Review the modular structure for understanding
3. Open an issue on GitHub

---

**Built with ❤️ for better habit tracking and personal development.**
