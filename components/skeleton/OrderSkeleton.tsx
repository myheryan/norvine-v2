export const OrderSkeleton = () => (
  <div className="max-w-[1000px] mx-auto px-4 py-10 animate-pulse">
    <div className="h-8 w-48 bg-gray-100 rounded mb-8" />
    <div className="space-y-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="border border-gray-100 p-6 rounded-sm">
          <div className="flex justify-between mb-4">
            <div className="h-4 w-32 bg-gray-50 rounded" />
            <div className="h-6 w-24 bg-gray-100 rounded-full" />
          </div>
          <div className="flex gap-4">
            <div className="w-16 h-20 bg-gray-50 rounded" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-1/2 bg-gray-100 rounded" />
              <div className="h-3 w-1/4 bg-gray-50 rounded" />
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
)