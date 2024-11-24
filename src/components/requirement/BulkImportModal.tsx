import React, { useState } from 'react';
import { X, Upload, AlertTriangle } from 'lucide-react';
import { useData } from '@/context/DataContext';

interface BulkImportModalProps {
  onClose: () => void;
}

const BulkImportModal: React.FC<BulkImportModalProps> = ({ onClose }) => {
  const { create: addRequirement, currentProject } = useData();
  const [text, setText] = useState('');
  const [separator, setSeparator] = useState('line');
  const [preview, setPreview] = useState<string[]>([]);

  if (!currentProject) return null;

  const handleTextChange = (value: string) => {
    setText(value);
    const requirements = separator === 'line' 
      ? value.split('\n').filter(line => line.trim())
      : value.split(separator).filter(req => req.trim());
    setPreview(requirements);
  };

  const handleImport = () => {
    preview.forEach(content => {
      addRequirement('requirements', {
        content,
        type: 'functional',
        status: 'draft',
        priority: 'medium',
      });
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-dark-surface rounded-xl shadow-xl max-w-2xl w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-dark-border">
          <div className="flex items-center space-x-2">
            <Upload className="w-5 h-5 text-dark-accent" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-dark-text-primary">Bulk Import Requirements</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 dark:text-dark-text-secondary hover:text-gray-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-2">
              Separator
            </label>
            <div className="flex items-center space-x-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  value="line"
                  checked={separator === 'line'}
                  onChange={(e) => setSeparator(e.target.value)}
                  className="text-dark-accent focus:ring-dark-accent"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-dark-text-secondary">New Line</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  value=";"
                  checked={separator === ';'}
                  onChange={(e) => setSeparator(e.target.value)}
                  className="text-dark-accent focus:ring-dark-accent"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-dark-text-secondary">Semicolon (;)</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  value="|"
                  checked={separator === '|'}
                  onChange={(e) => setSeparator(e.target.value)}
                  className="text-dark-accent focus:ring-dark-accent"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-dark-text-secondary">Pipe (|)</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-2">
              Paste Requirements
            </label>
            <textarea
              value={text}
              onChange={(e) => handleTextChange(e.target.value)}
              rows={8}
              className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg bg-white dark:bg-dark-bg-start text-gray-900 dark:text-dark-text-primary focus:ring-dark-accent focus:border-dark-accent"
              placeholder={`Paste your requirements here...${separator === 'line' ? '\nEach line will be a new requirement' : `\nRequirements separated by "${separator}"`}`}
            />
          </div>

          {preview.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-2">
                Preview ({preview.length} requirements)
              </h3>
              <div className="max-h-48 overflow-y-auto border border-gray-200 dark:border-dark-border rounded-lg">
                <ul className="divide-y divide-gray-200 dark:divide-dark-border">
                  {preview.map((req, index) => (
                    <li key={index} className="p-3 text-sm text-gray-700 dark:text-dark-text-secondary">
                      {req}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {text && preview.length === 0 && (
            <div className="flex items-center space-x-2 text-amber-600 dark:text-amber-500">
              <AlertTriangle className="w-5 h-5" />
              <p className="text-sm">No valid requirements found. Check your separator setting.</p>
            </div>
          )}
        </div>

        <div className="flex justify-end px-6 py-4 border-t border-gray-200 dark:border-dark-border">
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-dark-text-secondary bg-white dark:bg-dark-surface border border-gray-300 dark:border-dark-border rounded-lg hover:bg-gray-50 dark:hover:bg-dark-nav-hover/10"
            >
              Cancel
            </button>
            <button
              onClick={handleImport}
              disabled={preview.length === 0}
              className="px-4 py-2 text-sm font-medium text-white bg-dark-accent hover:bg-dark-accent-hover disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed rounded-lg"
            >
              Import {preview.length} Requirements
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkImportModal;