import { ReactNode } from 'react'

type Props = {
  children: ReactNode
}

// Named Export untuk Desktop
export function Desktop({ children }: Props) {
  return <div className="hidden md:block">{children}</div>
}

// Named Export untuk Mobile
export function Mobile({ children }: Props) {
  return <div className="block md:hidden">{children}</div>
}