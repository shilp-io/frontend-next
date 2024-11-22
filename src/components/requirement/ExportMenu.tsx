import React, { useState } from 'react';
import { FileDown, FileText, FileSpreadsheet, X } from 'lucide-react';
import { useData } from '@/context/DataContext';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';

interface ExportMenuProps {
  onClose: () => void;
}

const ExportMenu: React.FC<ExportMenuProps> = ({ onClose }) => {
  const { currentProject } = useData();
  const [exporting, setExporting] = useState(false);

  if (!currentProject) return null;

  const exportToPDF = () => {
    setExporting(true);
    try {
      const doc = new jsPDF();
      
      // Add title
      doc.setFontSize(20);
      doc.text(currentProject.title, 20, 20);
      
      // Add description
      doc.setFontSize(12);
      doc.text(currentProject.description || '', 20, 30);
      
      // Add requirements
      let yPos = 50;
      currentProject.requirements.forEach((req, index) => {
        if (yPos > 270) {
          doc.addPage();
          yPos = 20;
        }
        
        doc.setFontSize(11);
        doc.setFont(undefined, 'bold');
        doc.text(`Requirement ${index + 1}`, 20, yPos);
        yPos += 7;
        
        doc.setFont(undefined, 'normal');
        doc.text(`Type: ${req.type} | Priority: ${req.priority} | Status: ${req.status}`, 20, yPos);
        yPos += 7;
        
        // Split long content into multiple lines
        const contentLines = doc.splitTextToSize(req.content, 170);
        doc.text(contentLines, 20, yPos);
        yPos += (contentLines.length * 7) + 10;
      });
      
      doc.save(`${currentProject.title.toLowerCase().replace(/\s+/g, '-')}-requirements.pdf`);
    } catch (error) {
      console.error('Error exporting to PDF:', error);
    }
    setExporting(false);
  };

  const exportToExcel = () => {
    setExporting(true);
    try {
      const workbook = XLSX.utils.book_new();
      
      // Prepare headers and requirements data
      const headers = [
        'Requirement',
        'Type',
        'Status',
        'Priority',
        ...currentProject.columns.map(col => col.name)
      ];
      
      const requirementsData = currentProject.requirements.map(req => {
        const row: Record<string, any> = {
          'Requirement': req.content,
          'Type': req.type,
          'Status': req.status,
          'Priority': req.priority,
        };
        
        // Add custom column values
        currentProject.columns.forEach(col => {
          row[col.name] = req.metadata[col.id] || '';
        });
        
        return row;
      });
      
      // Create worksheet with headers
      const worksheet = XLSX.utils.json_to_sheet(requirementsData, {
        header: headers
      });
      
      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Requirements');
      
      // Generate Excel file
      XLSX.writeFile(workbook, `${currentProject.title.toLowerCase().replace(/\s+/g, '-')}-requirements.xlsx`);
    } catch (error) {
      console.error('Error exporting to Excel:', error);
    }
    setExporting(false);
  };

  const exportToWord = () => {
    setExporting(true);
    try {
      // Create a formatted HTML string
      let htmlContent = `
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; }
            .requirement { margin-bottom: 20px; }
            .metadata { color: #666; margin-bottom: 5px; }
            .content { margin-bottom: 10px; }
          </style>
        </head>
        <body>
          <h1>${currentProject.title}</h1>
          <p>${currentProject.description || ''}</p>
          <div class="requirements">
      `;
      
      currentProject.requirements.forEach((req, index) => {
        htmlContent += `
          <div class="requirement">
            <h3>Requirement ${index + 1}</h3>
            <div class="metadata">
              Type: ${req.type} | Priority: ${req.priority} | Status: ${req.status}
            </div>
            <div class="content">${req.content}</div>
          </div>
        `;
      });
      
      htmlContent += `
          </div>
        </body>
        </html>
      `;
      
      // Create a Blob and download link
      const blob = new Blob([htmlContent], { type: 'application/msword' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${currentProject.title.toLowerCase().replace(/\s+/g, '-')}-requirements.doc`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error exporting to Word:', error);
    }
    setExporting(false);
  };

  return (
    <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-dark-surface ring-1 ring-black ring-opacity-5 z-10">
      <div className="py-1">
        <button
          onClick={exportToPDF}
          disabled={exporting}
          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-dark-text-secondary hover:bg-gray-100 dark:hover:bg-dark-nav-hover/10 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FileText className="w-4 h-4 mr-2" />
          Export to PDF
        </button>
        <button
          onClick={exportToWord}
          disabled={exporting}
          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-dark-text-secondary hover:bg-gray-100 dark:hover:bg-dark-nav-hover/10 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FileText className="w-4 h-4 mr-2" />
          Export to Word
        </button>
        <button
          onClick={exportToExcel}
          disabled={exporting}
          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-dark-text-secondary hover:bg-gray-100 dark:hover:bg-dark-nav-hover/10 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FileSpreadsheet className="w-4 h-4 mr-2" />
          Export to Excel
        </button>
      </div>
    </div>
  );
};

export default ExportMenu;