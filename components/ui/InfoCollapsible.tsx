import { Collapsible } from '@base-ui/react';


export function InfoCollapsible({ title, children }: { title: string, children: React.ReactNode }) {
  return (
    <Collapsible.Root className="border-b border-black/10">
      <Collapsible.Trigger className="flex w-full items-center justify-between py-2 group outline-none">
        <span className="text-lg font-bold">{title}</span>
        <span className="text-xl transition-transform duration-300 group-data-[state=open]:rotate-45">+</span>
      </Collapsible.Trigger>
      <Collapsible.Panel className="overflow-hidden transition-all duration-300 data-[state=closed]:h-0 data-[state=open]:h-auto">
        <div className="pb-8">{children}</div>
      </Collapsible.Panel>
    </Collapsible.Root>
  )
}
