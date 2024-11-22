import React, { useState } from 'react';
import { Plus, X, Settings, Move } from 'lucide-react';
import { useRequirements, Column } from '../../context/RequirementsContext';

interface ColumnManagerProps {
  onClose: () => void;
}

const ColumnManager: React.FC<ColumnManagerProps> = ({ onClose }) => {
  const { currentDocument, addColumn, updateColumn, deleteColumn } = useRequirements();
  const [newColumn, setNewColumn] = useState<Omit<Column, 'id'>>({
    name: '',
    type: 'text',
    options: [],
    required: false,
    width: undefined
  });
  const [newOption, setNewOption] = useState('');

  if (!currentDocument) return null;

  const handleAddColumn = () => {
    if (newColumn.name.trim()) {
      addColumn(currentDocument.id, {
        ...newColumn,
        options: newColumn.type === 'select' || newColumn.type === 'multiselect' ? newColumn.options : undefined
      });
      setNewColumn({
        name: '',
        type: 'text',
        options: [],
        required: false,
        width: undefined
      });
    }
  };

  const handleAddOption = (columnId?: string) => {
    if (!newOption.trim()) return;

    if (columnId) {
      const column = currentDocument.columns.find(col => col.id === columnId);
      if (column) {
        updateColumn(currentDocument.id, columnId, {
          options: [...(column.options || []), newOption.trim()]
        });
      }
    } else {
      setNewColumn(prev => ({
        ...prev,
        options: [...(prev.options || []), newOption.trim()]
      }));
    }
    setNewOption('');
  };

  const handleRemoveOption = (columnId: string, optionToRemove: string) => {
    const column = currentDocument.columns.find(col => col.id === columnId);
    if (column) {
      updateColumn(currentDocument.id, columnId, {
        options: column.options?.filter(opt => opt !== optionToRemove)
      });
    }
  };

  const handleDeleteColumn = (columnId: string) => {
    if (confirm('Are you sure you want to delete this column? This action cannot be undone.')) {
      deleteColumn(currentDocument.id, columnId);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-dark-surface rounded-xl shadow-xl max-w-2xl w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-dark-border">
          <div className="flex items-center space-x-2">
            <Settings className="w-5 h-5 text-gray-400" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-dark-text-primary">Manage Columns</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 dark:text-dark-text-secondary hover:text-gray-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="space-y-6">
            {/* Existing Columns */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-700 dark:text-dark-text-secondary">Current Columns</h3>
              <div className="space-y-2">
                {currentDocument.columns.map((column) => (
                  <div
                    key={column.id}
                    className="flex items-center space-x-4 p-3 bg-gray-50 dark:bg-dark-bg-start rounded-lg"
                  >
                    <Move className="w-4 h-4 text-gray-400 cursor-move" />
                    <div className="flex-1 space-y-4">
                      <div className="grid grid-cols-4 gap-4">
                        <input
                          type="text"
                          value={column.name || ''}
                          onChange={(e) => updateColumn(currentDocument.id, column.id, { name: e.target.value })}
                          className="px-2 py-1 border border-gray-300 dark:border-dark-border rounded-md text-sm"
                        />
                        <select
                          value={column.type || 'text'}
                          onChange={(e) => updateColumn(currentDocument.id, column.id, { type: e.target.value as Column['type'] })}
                          className="px-2 py-1 border border-gray-300 dark:border-dark-border rounded-md text-sm"
                        >
                          <option value="text">Text</option>
                          <option value="date">Date</option>
                          <option value="select">Select</option>
                          <option value="multiselect">Multi-select</option>
                          <option value="number">Number</option>
                        </select>
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={column.required || false}
                            onChange={(e) => updateColumn(currentDocument.id, column.id, { required: e.target.checked })}
                            className="h-4 w-4 text-dark-accent rounded"
                          />
                          <span className="ml-2 text-sm text-gray-600 dark:text-dark-text-secondary">Required</span>
                        </div>
                        <button
                          onClick={() => handleDeleteColumn(column.id)}
                          className="text-red-600 hover:text-red-700 p-1"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      {(column.type === 'select' || column.type === 'multiselect') && (
                        <div className="pl-4">
                          <div className="flex flex-wrap gap-2 mb-2">
                            {column.options?.map(option => (
                              <span
                                key={option}
                                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                              >
                                {option}
                                <button
                                  onClick={() => handleRemoveOption(column.id, option)}
                                  className="ml-1 text-gray-400 hover:text-gray-600"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </span>
                            ))}
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="text"
                              value={newOption}
                              onChange={(e) => setNewOption(e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && handleAddOption(column.id)}
                              placeholder="Add option..."
                              className="px-2 py-1 text-sm border border-gray-300 dark:border-dark-border rounded-md"
                            />
                            <button
                              onClick={() => handleAddOption(column.id)}
                              className="px-2 py-1 text-sm text-dark-accent hover:text-dark-accent-hover"
                            >
                              Add
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Add New Column */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-700 dark:text-dark-text-secondary">Add New Column</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <input
                    type="text"
                    value={newColumn.name}
                    onChange={(e) => setNewColumn(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Column name"
                    className="px-3 py-2 border border-gray-300 dark:border-dark-border rounded-md"
                  />
                  <select
                    value={newColumn.type}
                    onChange={(e) => setNewColumn(prev => ({ ...prev, type: e.target.value as Column['type'] }))}
                    className="px-3 py-2 border border-gray-300 dark:border-dark-border rounded-md"
                  >
                    <option value="text">Text</option>
                    <option value="date">Date</option>
                    <option value="select">Select</option>
                    <option value="multiselect">Multi-select</option>
                    <option value="number">Number</option>
                  </select>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={newColumn.required}
                      onChange={(e) => setNewColumn(prev => ({ ...prev, required: e.target.checked }))}
                      className="h-4 w-4 text-dark-accent rounded"
                    />
                    <span className="ml-2 text-sm text-gray-600 dark:text-dark-text-secondary">Required</span>
                  </div>
                </div>

                {(newColumn.type === 'select' || newColumn.type === 'multiselect') && (
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-2">
                      {newColumn.options?.map(option => (
                        <span
                          key={option}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                        >
                          {option}
                          <button
                            onClick={() => setNewColumn(prev => ({
                              ...prev,
                              options: prev.options?.filter(opt => opt !== option) || []
                            }))}
                            className="ml-1 text-gray-400 hover:text-gray-600"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={newOption}
                        onChange={(e) => setNewOption(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddOption()}
                        placeholder="Add option..."
                        className="px-2 py-1 text-sm border border-gray-300 dark:border-dark-border rounded-md"
                      />
                      <button
                        onClick={() => handleAddOption()}
                        className="px-2 py-1 text-sm text-dark-accent hover:text-dark-accent-hover"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={handleAddColumn}
                disabled={!newColumn.name.trim()}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-dark-accent hover:bg-dark-accent-hover disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Column
              </button>
            </div>
          </div>
        </div>

        <div className="flex justify-end px-6 py-4 border-t border-gray-200 dark:border-dark-border">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-dark-text-secondary bg-white dark:bg-dark-surface border border-gray-300 dark:border-dark-border rounded-md hover:bg-gray-50 dark:hover:bg-dark-nav-hover/10"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default ColumnManager;