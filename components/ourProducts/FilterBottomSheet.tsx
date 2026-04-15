import { Dispatch, SetStateAction, useEffect, useState } from 'react'
import { Drawer } from 'vaul'
import { FiSliders } from 'react-icons/fi'

import {
  CategoryId,
  FilterId,
  categories,
  filters,
} from '../../constants/product'

type Props = {
  activeCategory: CategoryId | undefined
  setActiveCategory: Dispatch<SetStateAction<CategoryId | undefined>>
  isFiltersChecked: Record<FilterId, boolean>
  setisFiltersChecked: Dispatch<SetStateAction<Record<FilterId, boolean>>>
}

export default function FilterBottomSheet({
  activeCategory,
  isFiltersChecked,
  setActiveCategory,
  setisFiltersChecked,
}: Props) {
  const [isOpen, setIsOpen] = useState(false)
  
  // Local state agar filter tidak langsung berubah sebelum klik "APPLY"
  const [localActiveCategory, setLocalActiveCategory] = useState<CategoryId | undefined>(activeCategory)
  const [localCheckedFilters, setLocalCheckedFilters] = useState<Record<FilterId, boolean>>(isFiltersChecked)

  // Sinkronisasi saat prop berubah
  useEffect(() => {
    setLocalActiveCategory(activeCategory)
    setLocalCheckedFilters(isFiltersChecked)
  }, [activeCategory, isFiltersChecked, isOpen])

  const onSubmit = () => {
    setActiveCategory(localActiveCategory)
    setisFiltersChecked(localCheckedFilters)
    setIsOpen(false)
  }

  return (
    <Drawer.Root open={isOpen} onOpenChange={setIsOpen}>
      {/* Trigger Button */}
      <Drawer.Trigger asChild>
        <div className="pl-4 cursor-pointer">
          <FiSliders size={24} />
        </div>
      </Drawer.Trigger>

      <Drawer.Portal>
        {/* Overlay gelap di belakang */}
        <Drawer.Overlay className="fixed inset-0 z-50 bg-black/40" />
        
        <Drawer.Content className="fixed bottom-0 left-0 right-0 z-50 flex flex-col rounded-t-[20px] bg-white outline-none">
          {/* Handle bar untuk scroll down/close */}
          <div className="mx-auto mt-4 h-1.5 w-12 flex-shrink-0 rounded-full bg-zinc-300" />
          
          <div className="px-4 pb-8 pt-6">
            <Drawer.Title className="txt-mobile-h2 pb-6">Filter</Drawer.Title>
            
            <h3 className="txt-mobile-h3 pb-4">Kategori</h3>
            <div className="flex flex-row flex-wrap gap-x-2 gap-y-4 pb-10">
              {Object.entries(categories).map(([key, { name }]) => (
                <h5
                  key={key}
                  onClick={() => {
                    localActiveCategory === key
                      ? setLocalActiveCategory(undefined)
                      : setLocalActiveCategory(key as CategoryId)
                  }}
                  className={`txt-mobile-h4 flex select-none items-center whitespace-nowrap rounded-full border py-2 px-3 font-bold transition-colors ${
                    localActiveCategory === key
                      ? 'border-[#F46666] bg-[#FDE5E5] text-[#F46666]'
                      : 'border-[#1D1E20] bg-[#FFFFFF] text-[#777777]'
                  }`}
                >
                  {name}
                </h5>
              ))}
            </div>

            <h3 className="txt-mobile-h3 pb-4">Filter Spesifik</h3>
            <div className="flex flex-row flex-wrap gap-x-2 gap-y-4 pb-8">
              {Object.entries(filters).map(([key, { name }]) => (
                <h5
                  key={key}
                  onClick={() => {
                    setLocalCheckedFilters(prev => ({
                      ...prev,
                      [key as FilterId]: !prev[key as FilterId]
                    }))
                  }}
                  className={`txt-mobile-h4 flex select-none items-center whitespace-nowrap rounded-full border py-2 px-3 font-bold transition-colors ${
                    localCheckedFilters[key as FilterId]
                      ? 'border-[#F46666] bg-[#FDE5E5] text-[#F46666]'
                      : 'border-[#1D1E20] bg-[#FFFFFF] text-[#777777]'
                  }`}
                >
                  {name}
                </h5>
              ))}
            </div>

            {/* Submit Button */}
            <button
              className="w-full rounded-full bg-[#1D1E20] py-4 transition-opacity active:opacity-80"
              onClick={onSubmit}
            >
              <span className="txt-mobile-body font-bold text-[#FFFFFF]">APPLY FILTER</span>
            </button>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  )
}