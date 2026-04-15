export { default as America } from './America'
export { default as GMO } from './GMO'
export { default as Vegan } from './Vegan'
export { default as NoPork } from './NoPork'
export {
  default as ChevronRight,
  ChevronRightGrey,
  ChevronLeft,
} from './ChevronRight'
export { default as Muscle } from './Muscle'
export { default as Skin } from './Skin'
export { default as Brain } from './Brain'
export { default as Bone } from './Bone'
export { default as Hair } from './Hair'
export { default as Heart } from './Heart'
export { default as GeneralHealth } from './GeneralHealth'
export { default as N } from './N'
export { default as Arrow } from './Arrow'
export { default as NorvineLogo, MNorvineLogo } from './NorvineLogo'
export {
  default as LinePointer,
  CirclePulse,
  MobileHoverPoint,
  MobileCirclePulse,
} from './LinePointer'
export { default as Shield } from './Shield'
export * from './MenuIndex'
export function FiTagIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
      <line x1="7" y1="7" x2="7.01" y2="7"></line>
    </svg>
  );
}