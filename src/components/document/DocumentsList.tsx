import React, { useState } from 'react';
import { FileText, ChevronRight } from 'lucide-react';
import { useProjects } from '@/context/DataContext';
import type { Project } from '@/types/data';

interface DocumentsListProps {
  viewMode: 'grid' | 'list';
  projects: Project[];
  onClickDocument: (documentId: string) => void;
}

const DocumentsList: React.FC<DocumentsListProps> = ({ viewMode, projects, onClickDocument }) => {
  const { setCurrentProject } = useProjects();
  if (viewMode === 'grid') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map((doc) => (
          <button
            key={doc.id}
            onClick={() => setCurrentProject(doc.id)}
            className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:border-red-200 transition-colors text-left"
          >
            <div className="flex items-start space-x-4">
              <FileText className="w-8 h-8 text-red-600 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-gray-900">{doc.title}</h3>
                <p className="text-sm text-gray-500 mt-1">{doc.description}</p>
                <div className="flex items-center space-x-2 mt-4">
                  <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {doc.type}
                  </span>
                  <span className="text-xs text-gray-500">
                    {doc.requirements?.length || 0} requirements
                  </span>
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {projects.map((doc) => (
        <button
          key={doc.id}
          onClick={() => setCurrentProject(doc.id)}
          className="w-full bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:border-red-200 transition-colors"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <FileText className="w-6 h-6 text-red-600" />
              <div className="text-left">
                <h3 className="font-medium text-gray-900">{doc.title}</h3>
                <p className="text-sm text-gray-500">{doc.description}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  {doc.type}
                </span>
                <p className="text-sm text-gray-500 mt-1">
                  {doc.requirements?.length || 0} requirements
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>
          </div>
        </button>
      ))}
    </div>
  );
};

export default DocumentsList;