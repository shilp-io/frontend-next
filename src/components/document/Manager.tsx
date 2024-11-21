import React, { useState, useEffect } from 'react';
import { Plus, FolderPlus, Search, Filter, Grid, List } from 'lucide-react';
import NewDocumentModal from './NewDocumentModal';
import { useProjects } from '@/context/DataContext';
import type { Requirement } from '@/types/data';
import { WhereFilterOp } from 'firebase/firestore';

const RequirementsManager: React.FC = () => {
  const { query, isLoading, operationError } = useProjects();
  const [showNewDocument, setShowNewDocument] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [documents, setDocuments] = useState<Requirement[]>([]);

  useEffect(() => {
    const loadDocuments = async () => {
      try {
        const queryConfig = searchQuery ? [{
          field: 'title',
          operator: '>=' as WhereFilterOp,
          value: searchQuery
        }] : [];

        const { items } = await query<Requirement>('projects', queryConfig);
        console.log('Documents:', items);
        setDocuments(items);
      } catch (error) {
        console.error('Failed to load documents:', error);
      }
    };

    loadDocuments();
  }, [searchQuery, query]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-12 text-center">
        <div className="animate-pulse">Loading requirements documents...</div>
      </div>
    );
  }

  if (operationError) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-12 text-center">
        <div className="text-red-600">Error: {operationError.message}</div>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6">
      {/* Header Section */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Requirements Documents</h1>
          <p className="text-sm text-gray-500 mt-1">Manage and organize your system requirements</p>
        </div>
        <button
          onClick={() => setShowNewDocument(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Document
        </button>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-red-500 focus:border-red-500 sm:text-sm"
              placeholder="Search documents..."
            />
          </div>
          <div className="flex items-center space-x-2">
            <button className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </button>
            <div className="border-l border-gray-300 h-6 mx-2" />
            <div className="flex items-center bg-gray-100 rounded-md p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-md ${
                  viewMode === 'grid'
                    ? 'bg-white shadow-sm text-red-600'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
                aria-label="Grid view"
              >
                <Grid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-md ${
                  viewMode === 'list'
                    ? 'bg-white shadow-sm text-red-600'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
                aria-label="List view"
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Empty State or Documents List */}
      {documents.length === 0 ? (
        <div className="text-center bg-white rounded-xl shadow-sm p-12">
          <FolderPlus className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No documents yet</h2>
          <p className="text-gray-500 mb-8 max-w-md mx-auto">
            Create your first requirements document to start managing and linking requirements across your systems.
          </p>
          <button
            onClick={() => setShowNewDocument(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create New Document
          </button>
        </div>
      ) : (
        <div className={viewMode === 'grid' ? 'grid grid-cols-3 gap-4' : 'space-y-4'}>
          {documents.map((doc) => (
            <div 
              key={`doc-${doc.id}`} 
              className="bg-white rounded-lg shadow-sm p-4"
            >
              <h3 className="text-lg font-semibold">{doc.title}</h3>
              <p className="text-sm text-gray-500 mt-1">{doc.description}</p>
            </div>
          ))}
        </div>
      )}

      {/* New Document Modal */}
      {showNewDocument && (
        <NewDocumentModal onClose={() => setShowNewDocument(false)} />
      )}
    </div>
  );
};

export default RequirementsManager;