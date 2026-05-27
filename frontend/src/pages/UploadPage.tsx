import React, { useState } from 'react';
import { UploadCloud, CheckCircle, AlertCircle } from 'lucide-react';
import api from '../api';

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [source, setSource] = useState('SAP');
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setStatus('idle');
    
    const formData = new FormData();
    formData.append('file', file);
    
    // In production we would map source to different endpoints
    const endpoint = source === 'SAP' ? '/upload/sap/' : '/upload/sap/'; 
    
    try {
      const res = await api.post(endpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setStatus('success');
      setMessage(`Upload successful. Job ID: ${res.data.upload_id}`);
      setFile(null);
    } catch (err: any) {
      setStatus('error');
      setMessage(err.response?.data?.error || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6 max-w-3xl border border-gray-200">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Ingest Enterprise Data</h3>
      <p className="text-sm text-gray-500 mb-6">Select your data source and upload the CSV export. A processing job will be created to validate and normalize the data.</p>
      
      <div className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Data Source Mapping</label>
          <select 
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            value={source}
            onChange={e => setSource(e.target.value)}
          >
            <option value="SAP">SAP Fuel & Procurement (CSV)</option>
            <option value="UTILITY">Utility Portal (CSV)</option>
            <option value="TRAVEL">Corporate Travel System (CSV)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">File</label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md bg-gray-50">
            <div className="space-y-1 text-center">
              <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
              <div className="flex text-sm text-gray-600 justify-center">
                <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none">
                  <span>Upload a file</span>
                  <input type="file" className="sr-only" onChange={e => setFile(e.target.files?.[0] || null)} accept=".csv" />
                </label>
              </div>
              <p className="text-xs text-gray-500">{file ? file.name : "CSV up to 10MB"}</p>
            </div>
          </div>
        </div>

        <div className="pt-4 flex items-center justify-between">
          <div className="flex-1">
            {status === 'success' && (
              <p className="text-sm text-green-700 flex items-center"><CheckCircle className="w-4 h-4 mr-1"/> {message}</p>
            )}
            {status === 'error' && (
              <p className="text-sm text-red-700 flex items-center"><AlertCircle className="w-4 h-4 mr-1"/> {message}</p>
            )}
          </div>
          <button 
            onClick={handleUpload}
            disabled={!file || uploading}
            className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
          >
            {uploading ? 'Processing...' : 'Upload & Process'}
          </button>
        </div>
      </div>
    </div>
  );
}
