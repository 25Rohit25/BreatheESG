import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
} from '@tanstack/react-table';
import { updateActivityStatus } from '../api';

const columnHelper = createColumnHelper<any>();

export function DataTable({ data, onRefresh }: { data: any[], onRefresh: () => void }) {
    
    const handleStatusChange = async (id: string, status: string) => {
        try {
            await updateActivityStatus(id, status);
            onRefresh();
        } catch (e) {
            console.error(e);
            alert('Failed to update status');
        }
    };

    const columns = [
        columnHelper.accessor('activity_date', { header: 'Date' }),
        columnHelper.accessor('activity_type', { header: 'Type' }),
        columnHelper.accessor('quantity', { 
            header: 'Quantity', 
            cell: info => `${Number(info.getValue()).toLocaleString()} ${info.row.original.unit}`
        }),
        columnHelper.accessor('calculated_emissions_kgco2e', { 
            header: 'Emissions (kgCO₂e)',
            cell: info => info.getValue() ? Number(info.getValue()).toLocaleString(undefined, {maximumFractionDigits: 2}) : '-'
        }),
        columnHelper.accessor('status', {
            header: 'Status',
            cell: info => {
                const status = info.getValue();
                const colors: Record<string, string> = {
                    pending: 'bg-yellow-100 text-yellow-800',
                    flagged: 'bg-red-100 text-red-800',
                    approved: 'bg-green-100 text-green-800',
                    rejected: 'bg-gray-100 text-gray-800'
                };
                const colorClass = colors[status] || 'bg-blue-100 text-blue-800';
                return (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${colorClass}`}>
                        {status.toUpperCase()}
                    </span>
                );
            }
        }),
        columnHelper.display({
            id: 'actions',
            header: 'Actions',
            cell: props => {
                const row = props.row.original;
                return (
                    <div className="flex gap-2">
                        {row.status !== 'approved' && (
                            <button onClick={() => handleStatusChange(row.id, 'approved')} className="text-xs bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600">Approve</button>
                        )}
                        {row.status !== 'flagged' && (
                            <button onClick={() => handleStatusChange(row.id, 'flagged')} className="text-xs bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600">Flag</button>
                        )}
                        {row.flagged_reason && (
                            <span className="text-xs text-red-500 mt-1 cursor-help" title={row.flagged_reason}>⚠️ Info</span>
                        )}
                    </div>
                );
            }
        })
    ];

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        initialState: {
            pagination: {
                pageSize: 10,
            }
        }
    });

    if (!data.length) return <div className="p-8 text-center text-gray-500 bg-white rounded-lg border">No activities found.</div>;

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        {table.getHeaderGroups().map(headerGroup => (
                            <tr key={headerGroup.id}>
                                {headerGroup.headers.map(header => (
                                    <th key={header.id} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                    </th>
                                ))}
                            </tr>
                        ))}
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {table.getRowModel().rows.map(row => (
                            <tr key={row.id}>
                                {row.getVisibleCells().map(cell => (
                                    <td key={cell.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            
            <div className="flex items-center justify-between px-6 py-3 bg-white border-t border-gray-200">
                <div className="flex gap-2">
                    <button
                        className="px-3 py-1 border rounded text-sm disabled:opacity-50 hover:bg-gray-50"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        Previous
                    </button>
                    <button
                        className="px-3 py-1 border rounded text-sm disabled:opacity-50 hover:bg-gray-50"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        Next
                    </button>
                </div>
                <span className="text-sm text-gray-700">
                    Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
                </span>
            </div>
        </div>
    );
}
