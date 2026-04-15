import { BiChevronLeftCircle, BiChevronRightCircle } from 'react-icons/bi'
import { BsChevronLeft, BsChevronRight } from 'react-icons/bs'
import { Mobile, Desktop } from '@/components/responsive'


type Props = {
  direction: 'left' | 'right'
  size?: number
  onClick?: () => void
  color?: string
}
export default function CustomRightArrow({
  direction,
  size = 56,
  onClick,
  color,
}: Props) {
  return (
    <div
      className={`absolute ${
        direction === 'left' ? 'left-[calc(4%+1px)]' : 'right-[calc(4%+1px)]'
      } cursor-pointer`}
    >
      {direction === 'left' ? (
        <>
          <Desktop>
            <BsChevronLeft size={size} onClick={onClick} color={color} />
          </Desktop>
          <Mobile>
            <BiChevronLeftCircle
              size={size / 2}
              onClick={onClick}
              color={color}
            />
          </Mobile>
        </>
      ) : (
        <>
          <Desktop>
            <BsChevronRight size={size} onClick={onClick} color={color} />
          </Desktop>
          <Mobile>
            <BiChevronRightCircle
              size={size / 2}
              onClick={onClick}
              color={color}
            />
          </Mobile>
        </>
      )}
    </div>
  )
}
