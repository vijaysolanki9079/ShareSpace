export default function ExploreLoading() {
  return (
    <div className="min-h-screen bg-[#f6fbf9]">
      <div className="bg-emerald-900/5 pt-32 pb-16 px-6 relative animate-pulse">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mx-auto w-64 h-12 bg-emerald-900/10 rounded-xl mb-6"></div>
          <div className="mx-auto w-full max-w-2xl h-5 bg-emerald-800/10 rounded mb-10"></div>
          <div className="w-full max-w-2xl mx-auto h-16 bg-white rounded-2xl border border-emerald-100"></div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[...Array(6)].map((_, i) => (
            <div key={`card-${i}`} className="bg-white rounded-2xl border border-[#00000014] overflow-hidden animate-pulse">
              <div className="h-56 bg-gray-200 w-full"></div>
              <div className="p-6 space-y-4">
                <div className="w-3/4 h-6 bg-gray-200 rounded"></div>
                <div className="w-full h-4 bg-gray-100 rounded"></div>
                <div className="w-4/5 h-4 bg-gray-100 rounded"></div>
                <div className="w-full h-12 bg-gray-100 rounded-xl mt-4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}