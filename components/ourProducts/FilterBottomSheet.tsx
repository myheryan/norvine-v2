import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react'
import { BottomSheet, BottomSheetRef } from 'react-spring-bottom-sheet'
import { FiSliders } from 'react-icons/fi'

import 'react-spring-bottom-sheet/dist/style.css'

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
  const focusRef = useRef<HTMLButtonElement>(null)
  const bottomSheetRef = useRef<BottomSheetRef>(null)

  let [isOpen, setIsOpen] = useState(false)
  
  // Explicitly typing the local states is a good practice here
  let [localActiveCategory, setLocalActiveCategory] = useState<CategoryId | undefined>(activeCategory)
  let [localCheckedFilters, setLocalCheckedFilters] = useState<Record<FilterId, boolean>>(isFiltersChecked)

  useEffect(() => {
    setLocalActiveCategory(activeCategory)
    setLocalCheckedFilters(isFiltersChecked)
  }, [activeCategory, isFiltersChecked])

  const onCancel = () => {
    setLocalActiveCategory(activeCategory)
    setLocalCheckedFilters(isFiltersChecked)
    setIsOpen(false)
  }

  const onSubmit = () => {
    setActiveCategory(localActiveCategory)
    setisFiltersChecked(localCheckedFilters)
    setIsOpen(false)
  }

  return (
    <div>
      <div className="pl-4">
        <FiSliders size={24} onClick={() => setIsOpen(!isOpen)} />
      </div>
      <BottomSheet
        ref={bottomSheetRef}
        initialFocusRef={focusRef as React.RefObject<HTMLElement>} 
        open={isOpen}
        onDismiss={onCancel}
      >
        <div className="z-50 rounded-t-2xl bg-white px-4 pb-8 pt-1">
          <h2 className="txt-mobile-h2 pb-6">Filter</h2>
          <h3 className="txt-mobile-h3 pb-4">Kategori</h3>
          <div className="flex flex-row flex-wrap gap-x-2 gap-y-4 pb-10">
            {Object.entries(categories).map(([key, { name }]) => {
              return (
                <h5
                  onClick={() => {
                    localActiveCategory === key
                      ? setLocalActiveCategory(undefined)
                      : setLocalActiveCategory(key as CategoryId)
                  }}
                  key={key}
                  className={`txt-mobile-h4 flex select-none items-center whitespace-nowrap rounded-full border py-2 px-3 font-bold ${
                    localActiveCategory === key
                      ? 'border-[#F46666] bg-[#FDE5E5] text-[#F46666]'
                      : 'border-[#1D1E20] bg-[#FFFFFF] text-[#777777]'
                  }`}
                >
                  {name}
                </h5>
              )
            })}
          </div>
          <h3 className="txt-mobile-h3 pb-4">Filter</h3>
          <div className="flex flex-row flex-wrap gap-x-2 gap-y-4 pb-4">
            {Object.entries(filters).map(([key, { name }]) => {
              return (
                <h5
                  onClick={() => {
                    let newFilter = { ...localCheckedFilters }
                    newFilter[key as FilterId] = !newFilter[key as FilterId]
                    setLocalCheckedFilters(newFilter)
                  }}
                  key={key}
                  className={`txt-mobile-h4 flex select-none items-center whitespace-nowrap rounded-full border py-2 px-3 font-bold ${
                    localCheckedFilters[key as FilterId]
                      ? 'border-[#F46666] bg-[#FDE5E5] text-[#F46666]'
                      : 'border-[#1D1E20] bg-[#FFFFFF] text-[#777777]'
                  }`}
                >
                  {name}
                </h5>
              )
            })}
          </div>
          <button
            className="w-full rounded-full bg-[#1D1E20] py-3"
            onClick={onSubmit}
          >
            <h5 className="txt-mobile-body text-[#FFFFFF]">APPLY FILTER</h5>
          </button>
        </div>
      </BottomSheet>
    </div>
  )
}