import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useProjects } from '@/context/DataContext';
import type { ProjectType, Project, Requirement, TaskStatus } from '@/types/data';
import { useUser } from '@/context/UserContext';
import { on } from 'events';

interface NewDocumentModalProps {
  onClose: () => void;
  onSuccess: (project: Project) => void;
}

const NewDocumentModal: React.FC<NewDocumentModalProps> = ({ onClose, onSuccess }) => {
  const { create, isLoading, operationError } = useProjects();
  const { userData } = useUser();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'product' as ProjectType,
  });

  const userId = userData?.uid as string;
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const newDocument: Partial<Project> = {
        title: formData.title,
        description: formData.description,
        type: formData.type,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        permissions: {
          view: [userId], // Provide a default value if uid is undefined
          edit: [userId],
          admin: [userId],
          public: false
        }
      };

      const project = await create<Project>('projects', newDocument);
      onClose();
      onSuccess(project);
    } catch (error) {
      console.error('Failed to create document:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-dark-surface rounded-xl shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-dark-border">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-dark-text-primary">New Requirements Document</h2>
          <button
            onClick={onClose}
            className="text-gray-400 dark:text-dark-text-secondary hover:text-gray-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1">
              Document Title
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-md bg-white dark:bg-dark-bg-start text-gray-900 dark:text-dark-text-primary focus:ring-dark-accent focus:border-dark-accent"
              placeholder="e.g., Backup Camera System"
              disabled={isLoading}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1">
              Document Type
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as ProjectType }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-md bg-white dark:bg-dark-bg-start text-gray-900 dark:text-dark-text-primary focus:ring-dark-accent focus:border-dark-accent"
              disabled={isLoading}
            >
              <option value="product">Product</option>
              <option value="system">System</option>
              <option value="subsystem">Subsystem</option>
              <option value="component">Component</option>
              <option value="interface">Interface</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-md bg-white dark:bg-dark-bg-start text-gray-900 dark:text-dark-text-primary focus:ring-dark-accent focus:border-dark-accent"
              placeholder="Brief description of the document's purpose..."
              disabled={isLoading}
            />
          </div>

          {operationError && (
            <div className="text-red-600 text-sm">
              Error: {operationError.message}
            </div>
          )}
          
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-dark-text-secondary bg-white dark:bg-dark-surface border border-gray-300 dark:border-dark-border rounded-md hover:bg-gray-50 dark:hover:bg-dark-nav-hover/10"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-dark-accent hover:bg-dark-accent-hover rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading ? 'Creating...' : 'Create Document'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewDocumentModal;