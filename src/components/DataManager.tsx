'use client';

import { useRef } from 'react';
import { useHabitStore } from '@/lib/store';

export default function DataManager() {
  const { exportData, importData } = useHabitStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleExport = () => {
    const data = exportData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mysecbrain-habits-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (data.habits && data.habit_entries) {
          if (confirm('This will overwrite your current data. Are you sure?')) {
            importData(data);
            alert('Data imported successfully!');
          }
        } else {
          alert('Invalid file format. Please use a valid export file.');
        }
      } catch (error) {
        alert('Error reading file. Please check the file format.');
      }
    };
    reader.readAsText(file);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  return (
    <div className="bg-white dark:bg-primary-900 rounded-lg shadow-lg p-6">
      <h3 className="text-xl font-bold text-primary-900 dark:text-primary-100 mb-4">
        Data Management
      </h3>
      
      <div className="space-y-4">
        {/* Export Section */}
        <div>
          <h4 className="text-lg font-semibold text-primary-800 dark:text-primary-200 mb-2">
            Export Data
          </h4>
          <p className="text-sm text-primary-600 dark:text-primary-400 mb-3">
            Download a backup of all your habits and tracking data as a JSON file.
          </p>
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Export Data</span>
          </button>
        </div>
        
        {/* Import Section */}
        <div>
          <h4 className="text-lg font-semibold text-primary-800 dark:text-primary-200 mb-2">
            Import Data
          </h4>
          <p className="text-sm text-primary-600 dark:text-primary-400 mb-3">
            Restore your data from a previously exported backup file.
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
            </svg>
            <span>Import Data</span>
          </button>
        </div>
        
        {/* Info Section */}
        <div className="mt-6 p-4 bg-primary-50 dark:bg-primary-800 rounded-lg">
          <h4 className="text-sm font-semibold text-primary-800 dark:text-primary-200 mb-2">
            💡 Data Format
          </h4>
          <p className="text-xs text-primary-600 dark:text-primary-400">
            The export file contains all your habits and daily tracking entries. 
            This format is designed to work across all future modules (CRM, Wallet, Notebook) 
            for comprehensive data portability.
          </p>
        </div>
      </div>
    </div>
  );
}
