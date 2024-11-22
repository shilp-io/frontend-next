import React, { useEffect, useState } from 'react';
import { ChevronRight, FileText, FolderTree, Plus, Book } from 'lucide-react';
import { useProjects, useRegulations } from '@/context/DataContext';
import RegulationDocumentModal from '@/components/regulation/RegulationDocumentModal';
import type { Project, Regulation } from '@/types/data';
import { useUser } from '@/context/UserContext';
import { WhereFilterOp } from 'firebase/firestore';

interface DocumentHierarchyProps {
  documents: Project[];
};

const DocumentHierarchy: React.FC<DocumentHierarchyProps> = ({ documents }) => {
  const { userData }  = useUser();
  const { query, isLoading, operationError, currentProject, setCurrentProject } = useRegulations();
  const [showRegulationModal, setShowRegulationModal] = useState(false);
  const [regulations, setRegulations] = useState<Regulation[]>([]);

	useEffect(() => {
		const loadDocuments = async () => {
			try {
				const queryConfig = userData
					? [
							{
								field: "createdBy",
								operator: "==" as WhereFilterOp,
								value: userData.uid as string,
							},
					  ]
					: [];

				const { items } = await query<Regulation>("regulations", queryConfig);
				console.log("Documents:", items);
				setRegulations(items);
			} catch (error) {
				console.error("Failed to load documents:", error);
			}
		};

		loadDocuments();
	}, [userData, query]);

	if (isLoading) {
		return (
			<div className="max-w-7xl mx-auto px-6 py-12 text-center">
				<div className="animate-pulse">
					Loading requirements documents...
				</div>
			</div>
		);
	}

	if (operationError) {
		return (
			<div className="max-w-7xl mx-auto px-6 py-12 text-center">
				<div className="text-red-600">
					Error: {operationError.message}
				</div>
				<button
					onClick={() => window.location.reload()}
					className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
				>
					Retry
				</button>
			</div>
		);
	}
  const documentsByType = {
    product: documents.filter(doc => doc.type === 'product') || [],
    system: documents.filter(doc => doc.type === 'system') || [],
    subsystem: documents.filter(doc => doc.type === 'subsystem') || [],
    component: documents.filter(doc => doc.type === 'component') || [],
    interface: documents.filter(doc => doc.type === 'interface') || [],
  };

  const renderDocumentNode = (doc: any) => (
    <button
      key={doc.id}
      onClick={() => setCurrentProject(doc.id)}
      className={`flex items-center space-x-2 w-full px-3 py-2 text-left rounded-md transition-colors ${
        currentProject?.id === doc.id
          ? 'bg-gray-100 dark:bg-gray-800/40 text-gray-900 dark:text-gray-100'
          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/20'
      }`}
    >
      <FileText className="w-4 h-4" />
      <span className="truncate">{doc.title}</span>
    </button>
  );

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-dark-surface rounded-lg shadow-sm">
        <div className="p-4 border-b border-gray-200 dark:border-dark-border">
          <div className="flex items-center justify-between">
            <button className={`flex items-center space-x-2 w-full px-3 py-2 text-left rounded-md transition-colors 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/20'
      }`} onClick={() => setCurrentProject(null)}>
              <FolderTree className="w-5 h-5" />
              <h3 className="font-medium">Document Hierarchy</h3>
            </button>
          </div>
        </div>
        <div className="p-4 space-y-4">
          {/* Products */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-sm font-medium text-gray-500 dark:text-dark-text-secondary">
              <span>Products</span>
              <ChevronRight className="w-4 h-4" />
            </div>
            <div className="ml-4 space-y-1">
              {documentsByType.product.map(renderDocumentNode)}
            </div>
          </div>

          {/* Systems */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-sm font-medium text-gray-500 dark:text-dark-text-secondary">
              <span>Systems</span>
              <ChevronRight className="w-4 h-4" />
            </div>
            <div className="ml-4 space-y-1">
              {documentsByType.system.map(renderDocumentNode)}
            </div>
          </div>

          {/* Subsystems */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-sm font-medium text-gray-500 dark:text-dark-text-secondary">
              <span>Subsystems</span>
              <ChevronRight className="w-4 h-4" />
            </div>
            <div className="ml-4 space-y-1">
              {documentsByType.subsystem.map(renderDocumentNode)}
            </div>
          </div>

          {/* Components */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-sm font-medium text-gray-500 dark:text-dark-text-secondary">
              <span>Components</span>
              <ChevronRight className="w-4 h-4" />
            </div>
            <div className="ml-4 space-y-1">
              {documentsByType.component.map(renderDocumentNode)}
            </div>
          </div>

          {/* Interfaces */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-sm font-medium text-gray-500 dark:text-dark-text-secondary">
              <span>Interfaces</span>
              <ChevronRight className="w-4 h-4" />
            </div>
            <div className="ml-4 space-y-1">
              {documentsByType.interface.map(renderDocumentNode)}
            </div>
          </div>
        </div>
      </div>

      {/* Regulation Documents Section */}
      <div className="bg-white dark:bg-dark-surface rounded-lg shadow-sm">
        <div className="p-4 border-b border-gray-200 dark:border-dark-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-gray-700 dark:text-dark-text-primary">
              <Book className="w-5 h-5" />
              <h3 className="font-medium">Regulation Documents</h3>
            </div>
            <button
              onClick={() => setShowRegulationModal(true)}
              className="p-1 text-gray-400 dark:text-dark-text-secondary hover:text-dark-accent dark:hover:text-dark-accent transition-colors"
              title="Add regulation document"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="p-4">
          {regulations.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-dark-text-secondary text-center py-2">
              No regulation documents added
            </p>
          ) : (
            <div className="space-y-2">
              {regulations.map(doc => (
                <div
                  key={doc.id}
                  className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 dark:text-dark-text-secondary hover:bg-gray-50 dark:hover:bg-gray-800/20 rounded-md"
                >
                  <Book className="w-4 h-4 text-gray-400 dark:text-dark-text-secondary" />
                  <span className="truncate">{doc.title}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showRegulationModal && (
        <RegulationDocumentModal onClose={() => setShowRegulationModal(false)} />
      )}
    </div>
  );
};

export default DocumentHierarchy;