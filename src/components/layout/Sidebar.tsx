import React, { useState } from 'react';
import { X, Download, Upload, Settings } from 'lucide-react';
import { ModuleType, Module } from '../../types';
import { moduleStorage, backupStorage } from '../../utils/storage';

interface SidebarProps {
  isOpen: boolean;
  currentModule: ModuleType;
  onModuleChange: (module: ModuleType) => void;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, currentModule, onModuleChange, onClose }) => {
  const [modules] = useState<Module[]>(moduleStorage.getModules());

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const backupData = JSON.parse(e.target?.result as string);
        const success = backupStorage.importData(backupData);
        if (success) {
          alert('Data imported successfully! Please refresh the page to see changes.');
          window.location.reload();
        } else {
          alert('Failed to import data. Please check the file format.');
        }
      } catch (error) {
        alert('Invalid backup file format.');
      }
    };
    reader.readAsText(file);
    
    // Reset the input
    event.target.value = '';
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-20 z-40 lg:hidden"
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-72 bg-white border-r border-gray-200 z-50 lg:static lg:z-auto transform transition-transform duration-200 ease-in-out">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="font-semibold text-lg">Navigation</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4">
          {/* Modules */}
          <div className="mb-8">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
              Modules
            </h3>
            <nav className="space-y-1">
              {modules.map((module) => (
                <button
                  key={module.id}
                  onClick={() => onModuleChange(module.id)}
                  disabled={!module.isEnabled}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md text-left transition-colors ${
                    currentModule === module.id
                      ? 'bg-black text-white'
                      : module.isEnabled
                      ? 'hover:bg-gray-100 text-gray-700'
                      : 'text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <span className="text-lg">{module.icon}</span>
                  <span className="font-medium">{module.name}</span>
                  {!module.isEnabled && (
                    <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">
                      Soon
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          {/* Data Management */}
          <div className="mb-8">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
              Data Management
            </h3>
            <div className="space-y-2">
              <button
                onClick={backupStorage.downloadBackup}
                className="w-full flex items-center space-x-3 px-3 py-2 rounded-md hover:bg-gray-100 text-gray-700 transition-colors"
              >
                <Download size={16} />
                <span>Export Backup</span>
              </button>
              
              <label className="w-full flex items-center space-x-3 px-3 py-2 rounded-md hover:bg-gray-100 text-gray-700 transition-colors cursor-pointer">
                <Upload size={16} />
                <span>Import Backup</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Footer */}
          <div className="text-xs text-gray-400 border-t border-gray-200 pt-4">
            <p>mysecbrain v1.0.0</p>
            <p className="mt-1">Focus on what matters</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;