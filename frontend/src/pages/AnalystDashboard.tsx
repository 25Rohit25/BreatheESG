import React, { useEffect, useState, useMemo } from 'react';
import { 
  createColumnHelper, 
  flexRender, 
  getCoreRowModel, 
  getPaginationRowModel,
  getFilteredRowModel,
  useReactTable 
} from '@tanstack/react-table';
import { CheckCircle, AlertTriangle, Search, Filter, X, ArrowRight, Activity, TrendingUp, AlertOctagon, CheckSquare } from 'lucide-react';
import api from '../api';

const columnHelper = createColumnHelper<any>();

export default function AnalystDashboard() {
  const [data, setData] = useState([]);
  const [stats, setStats] = useState<any>({});
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [globalFilter, setGlobalFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [rowSelection, setRowSelection] = useState({});

  useEffect(() => {
    fetchData();
    fetchStats();
  }, []);

  const fetchData = async () => {
    try {
      const res = await api.get('/activities/');
      setData(res.data);
    } catch (e) { console.error(e); }
  };

  const fetchStats = async () => {
    try {
      const res = await api.get('/stats/');
      setStats(res.data);
    } catch (e) { console.error(e); }
  };

  const approveRecord = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      await api.patch(`/activities/${id}/`, { review_status: 'APPROVED' });
      fetchData();
      fetchStats();
      if (selectedRecord?.id === id) {
        setSelectedRecord({ ...selectedRecord, review_status: 'APPROVED' });
      }
    } catch (e) { console.error(e); }
  };

  const handleBulkAction = async (action: 'approve' | 'reject') => {
    const selectedIds = table.getSelectedRowModel().rows.map(r => r.original.id);
    if (selectedIds.length === 0) return;
    try {
      const endpoint = action === 'approve' ? '/activities/bulk_approve/' : '/activities/bulk_reject/';
      await api.post(endpoint, { ids: selectedIds });
      setRowSelection({});
      fetchData();
      fetchStats();
    } catch (e) { console.error(e); }
  };

  // Filter logic
  const filteredData = useMemo(() => {
    if (statusFilter === 'ALL') return data;
    return data.filter((d: any) => d.review_status === statusFilter);
  }, [data, statusFilter]);

  const columns = [
    columnHelper.display({
      id: 'select',
      header: ({ table }) => (
        <input 
          type="checkbox" 
          checked={table.getIsAllRowsSelected()}
          onChange={table.getToggleAllRowsSelectedHandler()}
          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
      ),
      cell: ({ row }) => (
        <input 
          type="checkbox" 
          checked={row.getIsSelected()}
          onChange={row.getToggleSelectedHandler()}
          onClick={e => e.stopPropagation()}
          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
      ),
    }),
    columnHelper.accessor('source_name', {
      header: 'Source',
      cell: info => <span className="text-gray-900 font-medium">{info.getValue() || 'SAP'}</span>,
    }),
    columnHelper.accessor('activity_type', {
      header: 'Activity',
      cell: info => info.getValue(),
    }),
    columnHelper.accessor('normalized_value', {
      header: 'Quantity',
      cell: info => `${parseFloat(info.getValue()).toLocaleString()} ${info.row.original.unit}`,
    }),
    columnHelper.accessor('calculated_emission', {
      header: 'Emissions (kgCO2e)',
      cell: info => <span className="font-semibold text-gray-700">{parseFloat(info.getValue()).toLocaleString()}</span>,
    }),
    columnHelper.accessor('review_status', {
      header: 'Status',
      cell: info => {
        const val = info.getValue();
        if (val === 'APPROVED' || val === 'LOCKED') return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">{val}</span>;
        if (val === 'FLAGGED') return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">{val}</span>;
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">{val}</span>;
      },
    }),
  ];

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { globalFilter, rowSelection },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } }
  });

  return (
    <div className="flex flex-col gap-6 h-[calc(100vh-8rem)]">
      
      {/* Tiny Metrics Dashboard */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4 flex items-center shadow-sm">
          <div className="p-3 rounded-full bg-blue-50 text-blue-600 mr-4"><TrendingUp className="w-5 h-5" /></div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Emissions</p>
            <p className="text-xl font-bold text-gray-900">{stats.total_emissions_kgco2e ? parseFloat(stats.total_emissions_kgco2e).toLocaleString() : 0} <span className="text-sm font-normal text-gray-500">kgCO2e</span></p>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4 flex items-center shadow-sm">
          <div className="p-3 rounded-full bg-red-50 text-red-600 mr-4"><AlertOctagon className="w-5 h-5" /></div>
          <div>
            <p className="text-sm font-medium text-gray-500">Anomaly Rate</p>
            <p className="text-xl font-bold text-gray-900">{stats.flagged_percent || 0}% <span className="text-sm font-normal text-gray-500">Flagged</span></p>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4 flex items-center shadow-sm">
          <div className="p-3 rounded-full bg-green-50 text-green-600 mr-4"><CheckSquare className="w-5 h-5" /></div>
          <div>
            <p className="text-sm font-medium text-gray-500">Approval Ratio</p>
            <p className="text-xl font-bold text-gray-900">{stats.approval_ratio || 0}% <span className="text-sm font-normal text-gray-500">Approved</span></p>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4 flex items-center shadow-sm">
          <div className="p-3 rounded-full bg-purple-50 text-purple-600 mr-4"><Activity className="w-5 h-5" /></div>
          <div>
            <p className="text-sm font-medium text-gray-500">Pending Review</p>
            <p className="text-xl font-bold text-gray-900">{stats.pending_review || 0} <span className="text-sm font-normal text-gray-500">Records</span></p>
          </div>
        </div>
      </div>

      <div className="flex gap-6 flex-1 overflow-hidden">
        {/* Main Table Area */}
        <div className={`flex-1 bg-white border border-gray-200 rounded-lg shadow-sm flex flex-col ${selectedRecord ? 'hidden lg:flex' : 'flex'}`}>
          {/* Toolbar */}
          <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50 rounded-t-lg">
            <div className="flex gap-3">
              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2" />
                <input 
                  value={globalFilter ?? ''}
                  onChange={e => setGlobalFilter(e.target.value)}
                  type="text" 
                  placeholder="Search activities..." 
                  className="pl-9 pr-4 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500" 
                />
              </div>
              <select 
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="pl-3 pr-8 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500 bg-white"
              >
                <option value="ALL">All Statuses</option>
                <option value="PENDING">Pending</option>
                <option value="FLAGGED">Flagged</option>
                <option value="APPROVED">Approved</option>
              </select>
            </div>
            
            {/* Bulk Actions */}
            <div className="flex gap-2">
              <button 
                onClick={() => handleBulkAction('reject')}
                disabled={Object.keys(rowSelection).length === 0}
                className="px-4 py-1.5 bg-white border border-gray-300 text-gray-700 rounded shadow-sm text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
              >
                Bulk Reject
              </button>
              <button 
                onClick={() => handleBulkAction('approve')}
                disabled={Object.keys(rowSelection).length === 0}
                className="px-4 py-1.5 bg-blue-600 text-white rounded shadow-sm text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
              >
                Bulk Approve ({Object.keys(rowSelection).length})
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="flex-1 overflow-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-white sticky top-0 z-10 shadow-sm">
                {table.getHeaderGroups().map(headerGroup => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map(header => (
                      <th key={header.id} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-white">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {table.getRowModel().rows.map(row => (
                  <tr 
                    key={row.id} 
                    onClick={() => setSelectedRecord(row.original)}
                    className={`cursor-pointer hover:bg-blue-50 transition-colors ${selectedRecord?.id === row.original.id ? 'bg-blue-50 border-l-4 border-blue-500' : 'border-l-4 border-transparent'}`}
                  >
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))}
                {table.getRowModel().rows.length === 0 && (
                  <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500 text-sm">No records found matching your filters.</td></tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          <div className="p-3 border-t border-gray-200 bg-gray-50 flex justify-between items-center rounded-b-lg">
            <span className="text-sm text-gray-600">Showing page {table.getState().pagination.pageIndex + 1} of {table.getPageCount() || 1}</span>
            <div className="space-x-2">
              <button onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()} className="px-3 py-1 bg-white border border-gray-300 rounded text-sm disabled:opacity-50">Previous</button>
              <button onClick={() => table.nextPage()} disabled={!table.getCanNextPage()} className="px-3 py-1 bg-white border border-gray-300 rounded text-sm disabled:opacity-50">Next</button>
            </div>
          </div>
        </div>

        {/* Raw vs Normalized Side Panel */}
        {selectedRecord && (
          <div className="w-full lg:w-[500px] bg-white border border-gray-200 rounded-lg shadow-sm flex flex-col">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50 rounded-t-lg">
              <h3 className="font-semibold text-gray-800">Source Traceability & Audit</h3>
              <button onClick={() => setSelectedRecord(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 flex-1 overflow-auto space-y-6">
              
              {/* Status alerts & WHY flagged */}
              {selectedRecord.review_status === 'FLAGGED' && (
                <div className="bg-red-50 border border-red-200 p-4 rounded-lg shadow-sm">
                  <div className="flex">
                    <AlertTriangle className="h-5 w-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="text-sm font-bold text-red-900">System Anomaly Detected</h3>
                      <p className="text-sm text-red-700 mt-1 font-medium">Why flagged:</p>
                      <ul className="list-disc pl-5 mt-1 text-sm text-red-700">
                        {selectedRecord.suspicious_flag?.split('|').map((flag: string, idx: number) => (
                          <li key={idx}>{flag.trim()}</li>
                        ))}
                      </ul>
                      <p className="text-xs text-red-500 mt-2 italic">Requires manual analyst review before approval.</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Activity Timeline */}
              <div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Record Lifecycle</h4>
                <div className="relative border-l border-gray-200 ml-3 space-y-4">
                  <div className="relative pl-6">
                    <span className="absolute -left-1.5 top-1 w-3 h-3 rounded-full bg-blue-500 ring-4 ring-white"></span>
                    <p className="text-sm font-medium text-gray-900">Ingested from SAP</p>
                    <p className="text-xs text-gray-500">Via bulk CSV upload</p>
                  </div>
                  <div className="relative pl-6">
                    <span className="absolute -left-1.5 top-1 w-3 h-3 rounded-full bg-blue-500 ring-4 ring-white"></span>
                    <p className="text-sm font-medium text-gray-900">Normalized & Calculated</p>
                    <p className="text-xs text-gray-500">Converted units & applied EF</p>
                  </div>
                  {selectedRecord.review_status === 'FLAGGED' && (
                    <div className="relative pl-6">
                      <span className="absolute -left-1.5 top-1 w-3 h-3 rounded-full bg-red-500 ring-4 ring-white"></span>
                      <p className="text-sm font-medium text-red-700">Flagged by Heuristics</p>
                    </div>
                  )}
                  <div className="relative pl-6 opacity-50">
                    <span className={`absolute -left-1.5 top-1 w-3 h-3 rounded-full ring-4 ring-white ${selectedRecord.review_status === 'APPROVED' ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                    <p className="text-sm font-medium text-gray-900">Analyst Approved</p>
                  </div>
                  <div className="relative pl-6 opacity-50">
                    <span className={`absolute -left-1.5 top-1 w-3 h-3 rounded-full ring-4 ring-white ${selectedRecord.review_status === 'LOCKED' ? 'bg-purple-500' : 'bg-gray-300'}`}></span>
                    <p className="text-sm font-medium text-gray-900">Locked to Immutable Ledger</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-center">
                <div className="w-full h-px bg-gray-200"></div>
              </div>

              <div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">1. Original Raw Upload</h4>
                <div className="bg-gray-900 rounded-md p-4 overflow-auto shadow-inner">
                  <pre className="text-xs text-green-400 font-mono">
                    {JSON.stringify({
                      "Quantity": selectedRecord.raw_value,
                      "UoM": "GAL", 
                      "MaterialDescription": selectedRecord.activity_type,
                      "PlantCode": "DE-100"
                    }, null, 2)}
                  </pre>
                </div>
                <p className="text-xs text-gray-400 mt-2">Mapped from Source System (Unmodified)</p>
              </div>

              <div className="flex justify-center">
                <div className="h-6 w-px bg-blue-300"></div>
              </div>

              <div>
                <h4 className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-3">2. Normalized ESG Ledger</h4>
                <div className="bg-blue-50 border border-blue-100 rounded-md p-4 shadow-sm">
                  <dl className="grid grid-cols-2 gap-y-4 text-sm">
                    <div>
                      <dt className="text-gray-500">Activity</dt>
                      <dd className="font-medium text-gray-900">{selectedRecord.activity_type}</dd>
                    </div>
                    <div>
                      <dt className="text-gray-500">Scope</dt>
                      <dd className="font-medium text-gray-900">Scope {selectedRecord.scope}</dd>
                    </div>
                    <div>
                      <dt className="text-gray-500">Standardized Qty</dt>
                      <dd className="font-medium text-gray-900">{parseFloat(selectedRecord.normalized_value).toLocaleString()} {selectedRecord.unit}</dd>
                    </div>
                    <div>
                      <dt className="text-gray-500">Calculated Emissions</dt>
                      <dd className="font-bold text-blue-700 text-base">{parseFloat(selectedRecord.calculated_emission).toLocaleString()} kgCO2e</dd>
                    </div>
                  </dl>
                </div>
              </div>

            </div>
            
            <div className="p-4 border-t border-gray-200 bg-gray-50 rounded-b-lg flex gap-3">
               <button 
                  onClick={(e) => approveRecord(selectedRecord.id, e)}
                  disabled={selectedRecord.review_status === 'APPROVED' || selectedRecord.review_status === 'LOCKED'}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-md font-medium text-sm hover:bg-blue-700 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
               >
                 {selectedRecord.review_status === 'APPROVED' ? <><CheckCircle className="w-4 h-4 mr-2"/> Locked (Approved)</> : 'Approve & Lock Record'}
               </button>
               <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md font-medium text-sm shadow-sm hover:bg-gray-50">
                 Reject
               </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
