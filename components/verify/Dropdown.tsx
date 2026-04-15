import { useEffect, useState } from 'react'
import { HiChevronRight } from 'react-icons/hi'

type Props = {
  options: Array<{ id: string; label: string }>
  placeholder?: string
  activeOptionId?: string
  onSelect: (id: string) => void
}

export default function Dropdown({
  options,
  activeOptionId,
  placeholder,
  onSelect,
}: Props) {
  let [isOpen, setIsOpen] = useState(false)

  let activeOption = options.find((option) => option.id === activeOptionId)
  return (
    <div className="mb-8 w-full max-w-[39.125rem] ">
      <div
        onClick={() => {
          setIsOpen(!isOpen)
        }}
        className="mb-4 flex h-16 cursor-pointer select-none items-center justify-between border-2 border-[#1D1E201F] px-4"
      >
        {activeOptionId ? (
          <p className="txt-body text-[#1D1E20]">{activeOption?.label}</p>
        ) : (
          <p className="txt-body text-[#1D1E2052]">{placeholder}</p>
        )}
        <HiChevronRight
          size={24}
          className={`${
            isOpen ? 'rotate-[270deg]' : 'rotate-90'
          } rotate duration-250 transition`}
        />
      </div>
      {
        <div className="relative">
          <div
            className={` absolute z-10 w-full max-w-[39.125rem] overflow-clip border-2 border-[#1D1E201F] bg-white transition-all  duration-500 ${
              isOpen ? `max-h-32 opacity-100` : `max-h-0 opacity-0`
            }`}
          >
            {options.map((option) => (
              <div
                key={option.id}
                onClick={() => {
                  onSelect(option.id)
                  setIsOpen(false)
                }}
                className={`flex h-16 cursor-pointer select-none items-center px-4 hover:bg-[#F2F2F2]`}
              >
                <p className="txt-body">{option.label}</p>
              </div>
            ))}
          </div>
        </div>
      }
    </div>
  )
}
