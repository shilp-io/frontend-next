import React, { useState, useRef } from 'react';
import { Upload, X, FileText, FileSpreadsheet, File } from 'lucide-react';
import { useRequirements, useRegulations, useProjects } from '@/context/DataContext';

interface ExternalDocumentUploadProps {
  onClose: () => void;
}

const ExternalDocumentUpload: React.FC<ExternalDocumentUploadProps> = ({ onClose }) => {
  const { currentProject, update } = useProjects();
  const { currentRequirement } = useRequirements();
  const { create } = useRegulations();
  const [dragActive, setDragActive] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    setFiles(prev => [...prev, ...droppedFiles]);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...selectedFiles]);
    }
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newTag.trim()) {
      setTags(prev => [...new Set([...prev, newTag.trim()])]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(prev => prev.filter(tag => tag !== tagToRemove));
  };

  const removeFile = (fileToRemove: File) => {
    setFiles(prev => prev.filter(file => file !== fileToRemove));
  };

  const handleUpload = async () => {
    if (!currentProject || files.length === 0) return;

    try {
      for (const file of files) {
        await create('regulations', {
          projectId: currentProject.id,
          type: file.type,
          name: file.name,
          size: file.size,
        });
      }
      onClose();
    } catch (error) {
      console.error('Error uploading files:', error);
    }
  };

  const getFileIcon = (type: string) => {
    if (type.includes('pdf')) return <FileText className="w-6 h-6 text-red-500" />;
    if (type.includes('sheet') || type.includes('excel')) return <FileSpreadsheet className="w-6 h-6 text-green-500" />;
    return <File className="w-6 h-6 text-blue-500" />;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-dark-surface rounded-xl shadow-xl max-w-2xl w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-dark-border">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-dark-text-primary">Upload External Documents</h2>
          <button onClick={onClose} className="text-gray-400 dark:text-dark-text-secondary hover:text-gray-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Drop Zone */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center ${
              dragActive
                ? 'border-dark-accent bg-dark-accent/5'
                : 'border-gray-300 dark:border-dark-border'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileInput}
              className="hidden"
              accept=".pdf,.doc,.docx,.xls,.xlsx"
            />
            
            <Upload className="w-12 h-12 text-gray-400 dark:text-dark-text-secondary mx-auto mb-4" />
            <p className="text-gray-600 dark:text-dark-text-secondary mb-2">
              Drag and drop files here, or{' '}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-dark-accent hover:text-dark-accent-hover"
              >
                browse
              </button>
            </p>
            <p className="text-sm text-gray-500 dark:text-dark-text-secondary">
              Supported formats: PDF, Word, Excel
            </p>
          </div>

          {/* File List */}
          {files.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-700 dark:text-dark-text-secondary">Selected Files</h3>
              <div className="space-y-2">
                {files.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-dark-bg-start rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      {getFileIcon(file.type)}
                      <div>
                        <p className="text-sm font-medium text-gray-700 dark:text-dark-text-primary">{file.name}</p>
                        <p className="text-xs text-gray-500 dark:text-dark-text-secondary">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => removeFile(file)}
                      className="text-gray-400 dark:text-dark-text-secondary hover:text-red-500 dark:hover:text-red-400"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-700 dark:text-dark-text-secondary">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {tags.map(tag => (
                <span
                  key={tag}
                  className="inline-flex items-center px-2.5 py-1.5 rounded-full text-xs font-medium bg-dark-accent/10 text-dark-accent"
                >
                  {tag}
                  <button
                    onClick={() => removeTag(tag)}
                    className="ml-1.5 text-dark-accent hover:text-dark-accent-hover"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              <input
                type="text"
                value={newTag}
                onChange={e => setNewTag(e.target.value)}
                onKeyDown={handleAddTag}
                placeholder="Add tags..."
                className="px-2.5 py-1.5 text-sm border-none focus:ring-0 bg-transparent text-gray-700 dark:text-dark-text-primary placeholder-gray-400 dark:placeholder-dark-text-secondary"
              />
            </div>
          </div>
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
              onClick={handleUpload}
              disabled={files.length === 0}
              className="px-4 py-2 text-sm font-medium text-white bg-dark-accent hover:bg-dark-accent-hover disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed rounded-lg transition-colors"
            >
              Upload Files
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExternalDocumentUpload;