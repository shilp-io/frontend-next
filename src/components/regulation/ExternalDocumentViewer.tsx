import React from 'react';
import { Worker, Viewer } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import DocViewer from "react-doc-viewer";
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';

interface ExternalDocumentViewerProps {
  document: {
    url: string;
    type: string;
  };
  onClose: () => void;
}

const ExternalDocumentViewer: React.FC<ExternalDocumentViewerProps> = ({ document, onClose }) => {
  const defaultLayoutPluginInstance = defaultLayoutPlugin();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-dark-surface rounded-xl shadow-xl w-full max-w-6xl h-[90vh] flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-dark-border flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-dark-text-primary">Document Viewer</h2>
          <button
            onClick={onClose}
            className="text-gray-500 dark:text-dark-text-secondary hover:text-gray-700 dark:hover:text-dark-text-primary"
          >
            Close
          </button>
        </div>
        
        <div className="flex-1 overflow-hidden p-4">
          {document.type.includes('pdf') ? (
            <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
              <div style={{ height: '100%' }}>
                <Viewer
                  fileUrl={document.url}
                  plugins={[defaultLayoutPluginInstance]}
                  theme={document.type.includes('dark') ? 'dark' : 'light'}
                />
              </div>
            </Worker>
          ) : (
            <DocViewer
              documents={[{ uri: document.url }]}
              style={{ height: '100%' }}
              config={{
                header: {
                  disableHeader: true,
                  disableFileName: true,
                  retainURLParams: false
                }
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ExternalDocumentViewer;