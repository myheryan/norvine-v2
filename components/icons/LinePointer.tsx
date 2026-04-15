type SVGProps = {
  direction: 'left' | 'right'
}

export default function HoverPoint({ direction }: SVGProps) {
  let points =
    direction === 'left' ? '160,70 120,10 -20,10' : '20,70 60,10 250,10'

  return (
    <svg
      width="200"
      height="200"
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <polyline stroke="white" fill="none" points={points} strokeWidth={4} />
    </svg>
  )
}

export function CirclePulse() {
  return (
    <svg
      width="50"
      height="50"
      viewBox="0 0 50 50"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx={25} cy={25} fill="none" r="10" stroke="#FFF" strokeWidth="2">
        <animate
          attributeName="r"
          from="8"
          to="20"
          dur="1.5s"
          begin="0s"
          repeatCount="indefinite"
        />
        <animate
          attributeName="opacity"
          from="1"
          to="0"
          dur="1.5s"
          begin="0s"
          repeatCount="indefinite"
        />
      </circle>
      <circle cx={25} cy={25} fill="#FFF" r="10" />
    </svg>
  )
}

export function MobileHoverPoint({ direction }: SVGProps) {
  let points =
    direction === 'left' ? '160,70 120,10 50,10' : '20,70 60,10 130,10'

  return (
    <svg
      width="100"
      height="100"
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <polyline stroke="white" fill="none" points={points} strokeWidth={4} />
    </svg>
  )
}

export function MobileCirclePulse() {
  return (
    <svg
      width="25"
      height="25"
      viewBox="0 0 50 50"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx={25} cy={25} fill="none" r="10" stroke="#FFF" strokeWidth="2">
        <animate
          attributeName="r"
          from="8"
          to="20"
          dur="1.5s"
          begin="0s"
          repeatCount="indefinite"
        />
        <animate
          attributeName="opacity"
          from="1"
          to="0"
          dur="1.5s"
          begin="0s"
          repeatCount="indefinite"
        />
      </circle>
      <circle cx={25} cy={25} fill="#FFF" r="10" />
    </svg>
  )
}
