# mysecbrain

**The world's most productive web app** - A minimal, distraction-free productivity platform focused on deep work, life management, and progress tracking.

## 🌟 Vision

mysecbrain eliminates the distractions caused by cluttered apps like Notion, helping users focus on what truly matters: building consistent habits, managing life effectively, and tracking meaningful progress.

## 🎨 Design Philosophy

- **Minimal Black & White Design**: Clean, distraction-free interface
- **Focus-First UX**: Every element designed for productivity
- **Progressive Enhancement**: Start simple, scale with your needs

## 📦 Current Features

### 🔹 Habits Module

- **Monthly Calendar View**: Visualize your entire month at a glance
- **Visual Progress Tracking**: 
  - 0% progress = Black cell
  - 100% progress = White cell  
  - Gradual gray shades for partial completion
- **Day Detail View**: Click any day to manage specific habits
- **Smart Progress Calculation**: Automatic percentage tracking
- **Habit Management**: Add, delete, and organize your habits

### 🔹 Data Management

- **Local Storage Persistence**: Your data stays on your device
- **Backup Export**: Download your complete progress history
- **Data Import**: Restore from backup files
- **Future-Proof Format**: Ready for upcoming modules

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone and setup**:
   ```bash
   git clone <repository-url>
   cd mysecbrain
   npm install
   ```

2. **Start development server**:
   ```bash
   npm run dev
   ```

3. **Open in browser**: Visit `http://localhost:3000`

### Production Build
```bash
npm run build
npm run preview
```

## 🏗️ Architecture

### Modular Design
- **Scalable Module System**: Easy to add new productivity modules
- **TypeScript First**: Type-safe development
- **Component-Based**: Reusable UI components
- **Clean Data Layer**: Structured storage and backup system

### Tech Stack
- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS (optimized for black/white theme)
- **Build**: Vite (fast development and builds)
- **State**: React hooks + Local Storage
- **Icons**: Lucide React
- **Date**: date-fns utilities

### Project Structure
```
src/
├── components/
│   ├── layout/           # Header, Sidebar, core layout
│   └── modules/          # Feature modules
│       └── habits/       # Habits module components
├── types/                # TypeScript interfaces
├── utils/                # Storage, date utilities
└── main.tsx             # App entry point
```

## 📱 How to Use

### Getting Started with Habits

1. **Add Your First Habit**:
   - Click "Add Habit" in the header
   - Enter habit name (e.g., "Drink 8 glasses of water")
   - Optionally add a description
   - Click "Add Habit"

2. **Track Daily Progress**:
   - Click on any day in the calendar
   - Check/uncheck habits as you complete them
   - Watch the calendar cell change color based on your progress

3. **Monitor Your Trends**:
   - Black cells = 0% completion
   - Gray cells = partial completion
   - White cells = 100% completion
   - Glance at the month to see your consistency patterns

### Data Management

- **Export Backup**: Sidebar → "Export Backup" (downloads JSON file)
- **Import Backup**: Sidebar → "Import Backup" (upload JSON file)
- **Module Navigation**: Sidebar → Switch between modules

## 🔮 Upcoming Modules

- **📝 Tasks & Projects**: Personal task and project management
- **💰 Wallet**: Finance and expense tracking
- **📊 Analytics**: Advanced progress insights
- **🎯 Goals**: Long-term goal setting and tracking

## 🎯 Core Principles

1. **Distraction-Free**: No unnecessary UI elements or notifications
2. **Data Ownership**: Your data stays local and exportable
3. **Progressive Disclosure**: Advanced features revealed as needed
4. **Consistent Design**: Black/white theme throughout all modules
5. **Performance First**: Fast, responsive, minimal bloat

## 🛠️ Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Adding New Modules

1. Create module folder: `src/components/modules/[module-name]/`
2. Add module to types: `src/types/index.ts`
3. Register in storage: `src/utils/storage.ts`
4. Add to App routing: `src/App.tsx`

### Contributing

This is a personal productivity project focused on the creator's vision of minimal, effective productivity tools.

## 📊 Current Status

- ✅ **Module 1: Habits** - Complete and functional
- 🔄 **Data Management** - Export/Import working
- ⏳ **Module 2: Tasks** - In planning
- ⏳ **Module 3: Finance** - In planning

## 💭 Philosophy

> "The best productivity app is the one that gets out of your way and lets you focus on building the life you want."

mysecbrain is built on the belief that productivity tools should enhance your life, not complicate it. Every feature is carefully considered to ensure it adds genuine value without introducing distraction.

---

**Version**: 1.0.0  
**Focus**: Deep work, life management, habit building  
**Design**: Minimal black & white interface
