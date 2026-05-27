import { useState, useRef } from 'react';
import { uploadFile } from '../api';

export function UploadSection({ tenantId, onUploadSuccess }: { tenantId: string, onUploadSuccess: () => void }) {
    const [source, setSource] = useState('sap_fuel');
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const fileInput = useRef<HTMLInputElement>(null);

    const handleUpload = async () => {
        if (!file) return;
        setLoading(true);
        setError('');
        try {
            await uploadFile(file, source, tenantId);
            onUploadSuccess();
            setFile(null);
            if (fileInput.current) fileInput.current.value = '';
            alert('File uploaded and processed successfully.');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-900">Upload Data</h2>
            <div className="flex flex-col sm:flex-row gap-4 items-end">
                <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
                    <select 
                        value={source} 
                        onChange={e => setSource(e.target.value)}
                        className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2 border"
                    >
                        <option value="sap_fuel">SAP Fuel & Procurement</option>
                        <option value="utility_electricity">Utility Electricity</option>
                        <option value="corporate_travel">Corporate Travel</option>
                    </select>
                </div>
                <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">CSV File</label>
                    <input 
                        type="file" 
                        accept=".csv"
                        ref={fileInput}
                        onChange={e => setFile(e.target.files?.[0] || null)}
                        className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                </div>
                <button 
                    onClick={handleUpload}
                    disabled={!file || loading}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                    {loading ? 'Uploading...' : 'Upload & Process'}
                </button>
            </div>
            {error && <p className="text-red-600 mt-2 text-sm">{error}</p>}
        </div>
    );
}
