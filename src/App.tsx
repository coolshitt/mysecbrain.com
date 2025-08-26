import React, { useState, useEffect } from 'react';
import { ModuleType } from './types';
import { moduleStorage } from './utils/storage';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import HabitsModule from './components/modules/HabitsModule';

function App() {
  const [currentModule, setCurrentModule] = useState<ModuleType>('habits');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const savedModule = moduleStorage.getCurrentModule();
    setCurrentModule(savedModule);
  }, []);

  const handleModuleChange = (moduleId: ModuleType) => {
    setCurrentModule(moduleId);
    moduleStorage.setCurrentModule(moduleId);
    setSidebarOpen(false);
  };

  const renderModule = () => {
    switch (currentModule) {
      case 'habits':
        return <HabitsModule />;
      case 'tasks':
        return (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <div className="text-4xl mb-4">📝</div>
              <p>Tasks & Projects module coming soon...</p>
            </div>
          </div>
        );
      case 'finance':
        return (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <div className="text-4xl mb-4">💰</div>
              <p>Wallet module coming soon...</p>
            </div>
          </div>
        );
      default:
        return <HabitsModule />;
    }
  };

  return (
    <div className="h-screen bg-white text-black flex flex-col">
      <Header 
        currentModule={currentModule}
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
      />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          isOpen={sidebarOpen}
          currentModule={currentModule}
          onModuleChange={handleModuleChange}
          onClose={() => setSidebarOpen(false)}
        />
        
        <main className="flex-1 overflow-auto">
          {renderModule()}
        </main>
      </div>
    </div>
  );
}

export default App;