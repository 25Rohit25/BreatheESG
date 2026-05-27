export function DashboardStats({ stats }: { stats: any }) {
    if (!stats) return null;
    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <p className="text-sm text-gray-500 font-medium">Total Emissions</p>
                <p className="text-2xl font-bold text-gray-900">{Number(stats.total_emissions_kg).toLocaleString(undefined, {maximumFractionDigits: 0})} kgCO₂e</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <p className="text-sm text-gray-500 font-medium">Pending Review</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending_reviews}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <p className="text-sm text-gray-500 font-medium">Flagged Issues</p>
                <p className="text-2xl font-bold text-red-600">{stats.flagged_issues}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <p className="text-sm text-gray-500 font-medium">Total Records</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total_records}</p>
            </div>
        </div>
    );
}
