# mysecbrain.com - Habit Tracker MVP

A modern, minimalist habit tracking application built with Next.js, featuring a calendar-based progress system and comprehensive data management.

## ✨ Features

- **📅 Calendar Interface**: Visual habit tracking with color-coded days based on completion progress
- **✅ Daily Habits Modal**: Check/uncheck habits for each day with real-time progress updates
- **🎨 Modern Design**: Clean black & white theme with dark/light mode support
- **💾 Data Persistence**: Local storage with Zustand for seamless state management
- **📤 Export/Import**: Full backup and restore functionality for data portability
- **📱 Responsive**: Mobile-friendly design that works on all devices
- **🚀 Fast**: Built with Next.js for optimal performance

## 🛠️ Tech Stack

- **Frontend**: Next.js 15 + React + TypeScript
- **Styling**: Tailwind CSS with custom black/white palette
- **State Management**: Zustand with persistence
- **Date Handling**: date-fns for calendar operations
- **Deployment**: Vercel (recommended)

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd mysecbrain.com
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📱 Usage

### Creating Habits
1. Use the "Manage Habits" sidebar to add new habits
2. Enter habit names and click "Add Habit"
3. Edit or delete existing habits as needed

### Tracking Daily Progress
1. Click on any calendar day to open the habits modal
2. Check/uncheck completed habits for that day
3. Watch the calendar colors update in real-time
4. Progress percentage automatically calculates

### Data Management
- **Export**: Download a JSON backup of all your data
- **Import**: Restore from a previously exported backup file
- **Format**: Compatible with future modules (CRM, Wallet, Notebook)

### Theme Switching
- Click the theme toggle button (top-right corner)
- Automatically saves your preference
- Respects system dark/light mode preference

## 🎨 Design System

### Color Palette
- **Primary Colors**: Black (#000000) to White (#FFFFFF) with gray scales
- **Habit Progress**: 
  - 0%: Black (#000000)
  - 25%: Dark Gray (#404040)
  - 50%: Medium Gray (#737373)
  - 75%: Light Gray (#a3a3a3)
  - 100%: White (#FFFFFF)

### Typography
- **Font**: Inter (system fallbacks)
- **Weights**: Regular, Medium, Semibold, Bold
- **Responsive**: Scales appropriately across devices

## 🚀 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Deploy with one click
4. Configure custom domain (mysecbrain.com)

### Other Platforms
- **Netlify**: Compatible with Next.js
- **Railway**: Good for full-stack deployments
- **Self-hosted**: Docker support available

## 🔧 Development

### Project Structure
```
src/
├── app/                 # Next.js app directory
│   ├── page.tsx        # Main application page
│   ├── layout.tsx      # Root layout
│   └── globals.css     # Global styles
├── components/         # React components
│   ├── HabitCalendar.tsx    # Calendar grid
│   ├── HabitModal.tsx       # Daily habits modal
│   ├── HabitManager.tsx     # Habit CRUD operations
│   ├── DataManager.tsx      # Export/Import functionality
│   └── ThemeToggle.tsx      # Dark/light mode toggle
└── lib/               # Utilities and stores
    └── store.ts       # Zustand habit store
```

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 🎯 Roadmap

### Phase 1 (Current - MVP) ✅
- [x] Habit tracking with calendar interface
- [x] Dark/light theme support
- [x] Export/import functionality
- [x] Responsive design

### Phase 2 (Future)
- [ ] CRM Module
- [ ] Wallet/Finance Tracker
- [ ] Notebook/Notes System
- [ ] User authentication
- [ ] Cloud sync

### Phase 3 (Advanced)
- [ ] Habit streaks and analytics
- [ ] Social features and sharing
- [ ] Mobile app (React Native)
- [ ] API for third-party integrations

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- State management with [Zustand](https://github.com/pmndrs/zustand)
- Date utilities from [date-fns](https://date-fns.org/)

---

**Built with ❤️ for productivity enthusiasts**

*mysecbrain.com - Your Personal Productivity Hub*
