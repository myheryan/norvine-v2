import HeadMeta from '@/components/HeadMeta'

interface CartSkeletonProps {
  itemsCount?: number;
}

export const CartSkeleton = ({ itemsCount = 3 }: CartSkeletonProps) => {
  return (
    <div className="min-h-screen bg-white pt-28 pb-32 animate-pulse">
      <HeadMeta title="Loading... | NORVINE" />
      <div className="max-w-[1100px] mx-auto px-4 md:px-6">
        
        {/* Title Skeleton */}
        <div className="h-9 w-40 bg-gray-200 rounded-sm mb-10" />

        <div className="flex flex-col lg:flex-row gap-12 items-start">
          
          {/* LEFT: LIST ITEMS SKELETON */}
          <div className="flex-1 w-full space-y-8">
            {/* Header Select All Skeleton */}
            <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
              <div className="w-5 h-5 bg-gray-100 rounded-sm" />
              <div className="h-4 w-32 bg-gray-100 rounded-sm" />
            </div>
            
            {/* Item Rows */}
            {Array.from({ length: itemsCount }).map((_, i) => (
              <div key={i} className="flex gap-6 border-b border-gray-50 pb-8">
                <div className="w-5 h-5 bg-gray-100 rounded-sm self-center shrink-0" />
                
                {/* Image Placeholder - Matching Norvine Ratio */}
                <div className="w-24 h-32 bg-gray-100 rounded-sm shrink-0" />
                
                {/* Content Info */}
                <div className="flex-1 flex flex-col justify-between py-1">
                  <div className="space-y-3">
                    <div className="h-4 w-full md:w-2/3 bg-gray-100 rounded-sm" />
                    <div className="h-3 w-20 bg-gray-50 rounded-sm italic" />
                  </div>
                  <div className="flex justify-between items-end mt-4">
                    <div className="h-6 w-24 bg-gray-200 rounded-sm" />
                    <div className="h-8 w-24 bg-gray-100 rounded-full" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* RIGHT: ORDER SUMMARY SKELETON */}
          <div className="w-full lg:w-[380px] sticky top-32">
            <div className="bg-gray-50 p-8 rounded-sm space-y-6 border border-gray-100">
              <div className="h-5 w-40 bg-gray-200 rounded-sm mb-4" />
              
              <div className="space-y-4">
                <div className="flex justify-between">
                  <div className="h-4 w-24 bg-gray-200 rounded-sm" />
                  <div className="h-4 w-20 bg-gray-200 rounded-sm" />
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-200/50">
                  <div className="h-6 w-20 bg-gray-300 rounded-sm" />
                  <div className="h-6 w-28 bg-gray-300 rounded-sm" />
                </div>
              </div>

              {/* Checkout Button Skeleton */}
              <div className="h-14 w-full bg-gray-200 rounded-full mt-4" />
              
              <div className="flex justify-center pt-2">
                 <div className="h-3 w-32 bg-gray-100 rounded-sm" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}