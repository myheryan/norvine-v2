import { ReactElement, useState } from 'react'

import {
  LinePointer,
  CirclePulse,
  MobileHoverPoint as MLinePointer,
  MobileCirclePulse as MCirclePulse,
} from '../icons'
import { Mobile, Desktop } from '@/components/responsive'


export default function IngredientPointer({
  direction,
  text,
  anchorClassName,
}: {
  direction: 'left' | 'right'
  text: ReactElement
  anchorClassName: string
}) {
  let [isHoverVisible, setIsHoverVisible] = useState(false)

  return (
    <>
      <Desktop>
        <div
          className={`flex ${isHoverVisible ? 'opacity-100' : 'opacity-0'}
            transition duration-700
            `}
        >
          {direction === 'left' && text}
          <LinePointer direction={direction} />
          {direction === 'right' && text}
        </div>
        <div
          className={anchorClassName}
          onMouseOver={() => {
            setIsHoverVisible(true)
          }}
          onMouseLeave={() => {
            setIsHoverVisible(false)
          }}
        >
          <CirclePulse />
        </div>
      </Desktop>
      <Mobile>
        <div className="flex opacity-100 transition duration-700">
          {direction === 'left' && text}
          <MLinePointer direction={direction} />
          {direction === 'right' && text}
        </div>
        <div
          className={anchorClassName}
          onMouseOver={() => {
            setIsHoverVisible(true)
          }}
          onMouseLeave={() => {
            setIsHoverVisible(false)
          }}
        >
          <MCirclePulse />
        </div>
      </Mobile>
    </>
  )
}
