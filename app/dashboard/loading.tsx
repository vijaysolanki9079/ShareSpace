export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-[#f6fbf9] flex flex-col text-[#0f1720]">
      {/* Top Navbar Skeleton */}
      <div className="h-16 border-b border-[#00000014] bg-white flex items-center px-6 justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gray-200 animate-pulse"></div>
          <div className="w-28 h-6 bg-gray-200 rounded animate-pulse"></div>
        </div>

        <div className="flex items-center gap-6">
          <div className="w-60 h-9 bg-gray-100 rounded-md animate-pulse"></div>
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse"></div>
            <div className="w-24 h-4 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
      </div>

      <div className="flex flex-1">
        {/* Sidebar Skeleton */}
        <div className="w-64 bg-white border-r border-[#00000014] p-6 flex flex-col gap-4 flex-shrink-0">
          {[...Array(4)].map((_, i) => (
            <div key={`nav-${i}`} className="flex items-center gap-3 animate-pulse">
              <div className="w-5 h-5 bg-gray-200 rounded"></div>
              <div className="flex-1 h-4 bg-gray-100 rounded"></div>
            </div>
          ))}
        </div>

        {/* Content Area Skeleton */}
        <div className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-7xl animate-pulse">
            <div className="w-48 h-8 bg-gray-200 rounded mb-2"></div>
            <div className="w-96 h-4 bg-gray-100 rounded mb-8"></div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              {[...Array(4)].map((_, i) => (
                <div key={`stat-${i}`} className="bg-white rounded-2xl border border-[#00000014] p-6">
                  <div className="w-12 h-12 bg-gray-100 rounded-xl mb-4"></div>
                  <div className="w-16 h-8 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-2xl border border-[#00000014] p-6 h-64"></div>
          </div>
        </div>
      </div>
    </div>
  );
}