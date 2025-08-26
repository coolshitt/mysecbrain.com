import React from 'react';
import { Menu } from 'lucide-react';
import { ModuleType } from '../../types';

interface HeaderProps {
  currentModule: ModuleType;
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ currentModule, onMenuClick }) => {
  const getModuleName = (module: ModuleType): string => {
    switch (module) {
      case 'habits': return 'Habits';
      case 'tasks': return 'Tasks & Projects';
      case 'finance': return 'Wallet';
      default: return 'mysecbrain';
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <button
          onClick={onMenuClick}
          className="p-2 hover:bg-gray-100 rounded-md transition-colors"
          aria-label="Toggle menu"
        >
          <Menu size={20} />
        </button>
        
        <div className="flex items-center space-x-3">
          <h1 className="text-xl font-semibold">mysecbrain</h1>
          <span className="text-gray-400">|</span>
          <span className="text-gray-600">{getModuleName(currentModule)}</span>
        </div>
      </div>

      <div className="text-sm text-gray-500">
        {new Date().toLocaleDateString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })}
      </div>
    </header>
  );
};

export default Header;