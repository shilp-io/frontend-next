import React from 'react';
import { X, CheckCircle2, AlertTriangle, History } from 'lucide-react';
import type { Requirement } from '@/types/data';

interface RequirementAnalysisModalProps {
  requirement: Requirement;
  onClose: () => void;
}

const RequirementAnalysisModal: React.FC<RequirementAnalysisModalProps> = ({ requirement, onClose }) => {
  if (!requirement.analysis) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-dark-surface rounded-xl shadow-xl max-w-2xl w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-dark-border">
          <div className="flex items-center space-x-2">
            <History className="w-5 h-5 text-dark-accent" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-dark-text-primary">
              Requirement Analysis History
            </h2>
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
            <h3 className="text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-2">
              Original Requirement
            </h3>
            <p className="text-gray-900 dark:text-dark-text-primary bg-gray-50 dark:bg-dark-bg-start p-3 rounded-lg">
              {requirement.content}
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-700 dark:text-dark-text-secondary">
              Alternative Formats
            </h3>
            <div className="space-y-3">
              <div className="bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-dark-text-secondary">
                    EARS Format
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    requirement.analysis.selectedFormat === 'EARS'
                      ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                  }`}>
                    {requirement.analysis.selectedFormat === 'EARS' ? 'Selected' : 'Alternative'}
                  </span>
                </div>
                <p className="text-gray-900 dark:text-dark-text-primary">
                  {requirement.analysis.rewrittenEARS}
                </p>
              </div>

              <div className="bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-dark-text-secondary">
                    INCOSE Format
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    requirement.analysis.selectedFormat === 'INCOSE'
                      ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                  }`}>
                    {requirement.analysis.selectedFormat === 'INCOSE' ? 'Selected' : 'Alternative'}
                  </span>
                </div>
                <p className="text-gray-900 dark:text-dark-text-primary">
                  {requirement.analysis.rewrittenINCOSE}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="flex items-center text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-3">
                <CheckCircle2 className="w-4 h-4 text-green-600 mr-2" />
                Analysis Feedback
              </h3>
              <ul className="space-y-2">
                {requirement.analysis.feedback.map((item, index) => (
                  <li
                    key={index}
                    className="flex items-start space-x-2 text-sm text-gray-600 dark:text-dark-text-secondary"
                  >
                    <span className="text-green-600">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="flex items-center text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-3">
                <AlertTriangle className="w-4 h-4 text-amber-600 mr-2" />
                Compliance Issues
              </h3>
              <ul className="space-y-2">
                {requirement.analysis.complianceIssues.map((issue, index) => (
                  <li
                    key={index}
                    className="flex items-start space-x-2 text-sm text-gray-600 dark:text-dark-text-secondary"
                  >
                    <span className="text-amber-600">•</span>
                    <span>{issue}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequirementAnalysisModal;