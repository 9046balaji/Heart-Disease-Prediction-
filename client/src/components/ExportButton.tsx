import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Download, FileText, FileSpreadsheet, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Utility function to sanitize input
const sanitizeInput = (input: string): string => {
  return input.trim().replace(/</g, "&lt;").replace(/>/g, "&gt;");
};

interface ExportButtonProps {
  userId: string;
}

const ExportButton: React.FC<ExportButtonProps> = ({ userId }) => {
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async (type: string) => {
    // Sanitize input
    const sanitizedType = sanitizeInput(type);
    
    // Validate input
    const validTypes = ['lab-results', 'symptoms', 'all'];
    if (!validTypes.includes(sanitizedType)) {
      toast({
        title: "Error",
        description: "Invalid export type",
        variant: "destructive",
      });
      return;
    }
    
    setIsExporting(true);
    
    try {
      let url = '';
      let filename = '';
      
      switch (sanitizedType) {
        case 'lab-results':
          url = '/api/export/lab-results';
          filename = 'lab-results.csv';
          break;
        case 'symptoms':
          url = '/api/export/symptoms';
          filename = 'symptoms.csv';
          break;
        case 'all':
          url = '/api/export/all';
          filename = 'health-data.csv';
          break;
        default:
          throw new Error('Invalid export type');
      }
      
      const token = localStorage.getItem('token');
      
      // Check if token exists
      if (!token) {
        throw new Error('Authentication required. Please log in again.');
      }
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout for file downloads
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        if (response.status === 401) {
          // Token might be expired, redirect to login
          localStorage.removeItem('token');
          window.location.href = '/login';
          throw new Error('Session expired. Please log in again.');
        }
        
        if (response.status === 403) {
          throw new Error('Access denied. You do not have permission to export this data.');
        }
        
        const errorData = await response.json();
        throw new Error(errorData.error?.message || `Export failed: ${response.status} ${response.statusText}`);
      }
      
      // Create a blob from the response
      const blob = await response.blob();
      
      // Create a download link
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      // Clean up the URL object
      window.URL.revokeObjectURL(downloadUrl);
      
      toast({
        title: "Success",
        description: `Exported ${sanitizedType.replace('-', ' ')} successfully`
      });
    } catch (error: any) {
      if (error.name === 'AbortError') {
        toast({
          title: "Request Timeout",
          description: "The export request took too long to complete. Please try again.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Error",
          description: error.message || "Failed to export data. Please try again.",
          variant: "destructive"
        });
      }
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button disabled={isExporting}>
          <Download className="h-4 w-4 mr-2" />
          {isExporting ? "Exporting..." : "Export Data"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleExport('lab-results')}>
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          Lab Results CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('symptoms')}>
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          Symptoms CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('all')}>
          <FileText className="h-4 w-4 mr-2" />
          All Health Data CSV
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ExportButton;