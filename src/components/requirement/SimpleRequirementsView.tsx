import React, { useState } from 'react';
import { Plus, Edit2, Trash2, AlertTriangle, CheckCircle2, History } from 'lucide-react';
import { useProjects, useRequirements } from '@/context/DataContext';
import RequirementEditor from './RequirementEditor';
import RequirementAnalysisModal from './RequirementAnalysisModal';
import type { Requirement } from '@/types/data';

interface SimpleRequirementsViewProps {
  requirements: Requirement[];
}

const SimpleRequirementsView: React.FC<SimpleRequirementsViewProps> = ({ requirements }) => {
  const { currentProject, update: updateProject } = useProjects();
  const { currentRequirement, create: addNewRequirement, update: updateRequirement, remove: deleteRequirement } = useRequirements();
  const [editingRequirement, setEditingRequirement] = useState<string | null>(null);
  const [showAnalysis, setShowAnalysis] = useState<string | null>(null);

  if (!currentProject) return null;

  const handleDelete = (requirementId: string) => {
    if (confirm('Are you sure you want to delete this requirement?')) {
      deleteRequirement("requirements", requirementId);
    }
    const updatedRequirements: string[] = currentProject.requirements.filter((r: string) => r !== requirementId);
    updateProject("projects", currentProject.id, { requirements: updatedRequirements });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
      case 'review': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200';
      case 'approved': return 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-200';
      case 'implemented': return 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
      case 'medium': return 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-200';
      case 'high': return 'bg-orange-100 text-orange-800 dark:bg-orange-800 dark:text-orange-200';
      case 'critical': return 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  return (
    <div className="p-4">
      <div className="space-y-4">
        {requirements.map((requirement: Requirement) => (
          <div
            key={requirement.id}
            className="border border-gray-200 dark:border-dark-border rounded-lg p-4 hover:border-dark-accent transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="space-y-2 flex-1">
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(requirement.status)}`}>
                    {requirement.status}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(requirement.priority)}`}>
                    {requirement.priority}
                  </span>
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-200">
                    {requirement.type}
                  </span>
                </div>
                <p className="text-gray-900 dark:text-dark-text-primary">{requirement.content}</p>
              </div>
              <div className="flex items-center space-x-2 ml-4">
                {requirement.analysis && (
                  <button
                    onClick={() => setShowAnalysis(requirement.id)}
                    className="p-1 text-gray-400 hover:text-dark-accent transition-colors"
                    title="View Analysis"
                  >
                    <History className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => setEditingRequirement(requirement.id)}
                  className="p-1 text-gray-400 hover:text-dark-accent transition-colors"
                  title="Edit requirement"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(requirement.id)}
                  className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                  title="Delete requirement"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}

        <button
          onClick={() => {
            if (currentProject) {
              addNewRequirement("requirements", {
                content: '',
                type: 'functional',
                status: 'draft',
                priority: 'medium',
                metadata: {},
                links: [],
              });
            }
          }}
          className="flex items-center text-sm text-gray-500 dark:text-dark-text-secondary hover:text-dark-accent p-4 w-full border-2 border-dashed border-gray-200 dark:border-dark-border rounded-lg hover:border-dark-accent transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add New Requirement
        </button>
      </div>

      {editingRequirement && (
        <RequirementEditor
          onClose={() => setEditingRequirement(null)}
        />
      )}

      {showAnalysis && (
        <RequirementAnalysisModal
          requirement={currentRequirement as Requirement}
          onClose={() => setShowAnalysis(null)}
        />
      )}
    </div>
  );
};

export default SimpleRequirementsView;