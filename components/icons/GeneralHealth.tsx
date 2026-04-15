type Props = {
  color?: string
}
export default function GeneralHealth({ color = '#999999' }) {
  return (
    <svg
      className="h-full w-full"
      viewBox="0 0 96 96"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g clipPath="url(#clip0_2042_17893)">
        <g filter="url(#filter0_d_2042_17893)">
          <path
            d="M10.1797 26.8602C10.1797 17.6591 17.6786 10.1602 26.8797 10.1602H69.1197C78.3207 10.1602 85.8197 17.6591 85.8197 26.8602V69.1002C85.8197 78.3012 78.3207 85.8001 69.1197 85.8001H26.8797C17.6786 85.8001 10.1797 78.3012 10.1797 69.1002V26.8602Z"
            stroke={color}
            strokeWidth="5"
            shapeRendering="crispEdges"
          />
        </g>
        <g filter="url(#filter1_d_2042_17893)">
          <path
            d="M51 26.3125C51 34.7083 64 42.8333 64 42.8333C64 42.8333 77 34.7083 77 26.3125C77 21.7083 73.9228 19 69.9583 19C66.7083 19 64 21.1667 64 21.1667C64 21.1667 61.2917 18.9934 58.0417 19C54.0772 19.0081 51 21.7083 51 26.3125Z"
            fill={color}
          />
        </g>
      </g>
      <defs>
        <filter
          id="filter0_d_2042_17893"
          x="-0.320312"
          y="-0.339844"
          width="96.6406"
          height="96.6406"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset />
          <feGaussianBlur stdDeviation="4" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.4 0"
          />
          <feBlend
            mode="normal"
            in2="BackgroundImageFix"
            result="effect1_dropShadow_2042_17893"
          />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect1_dropShadow_2042_17893"
            result="shape"
          />
        </filter>
        <filter
          id="filter1_d_2042_17893"
          x="43"
          y="11"
          width="42"
          height="39.834"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset />
          <feGaussianBlur stdDeviation="4" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.4 0"
          />
          <feBlend
            mode="normal"
            in2="BackgroundImageFix"
            result="effect1_dropShadow_2042_17893"
          />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect1_dropShadow_2042_17893"
            result="shape"
          />
        </filter>
        <clipPath id="clip0_2042_17893">
          <rect width="96" height="96" fill="white" />
        </clipPath>
      </defs>
    </svg>
  )
}
