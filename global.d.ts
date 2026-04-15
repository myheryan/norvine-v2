// import { MutableRefObject } from 'react'
type MutableRefObject<T> = import('react').MutableRefObject<T>
declare module 'react-is-visible' {
  export function useIsVisible(ref: MutableRefObject): boolean
}
