import * as React from "react"
import { NavigationMenu as Nav } from "@base-ui/react/navigation-menu"
import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { ChevronDownIcon } from "lucide-react"

const NavigationMenu = ({ align = "start", className, children, ...props }: Nav.Root.Props & Pick<Nav.Positioner.Props, "align">) => (
  <Nav.Root data-slot="navigation-menu" className={cn("group/navigation-menu relative flex max-w-max flex-1 items-center justify-center", className)} {...props}>
    {children}
    <NavigationMenuPositioner align={align} />
  </Nav.Root>
)

const NavigationMenuList = ({ className, ...props }: React.ComponentPropsWithRef<typeof Nav.List>) => (
  <Nav.List data-slot="navigation-menu-list" className={cn("group flex flex-1 list-none items-center justify-center gap-0", className)} {...props} />
)

const NavigationMenuItem = ({ className, ...props }: React.ComponentPropsWithRef<typeof Nav.Item>) => (
  <Nav.Item data-slot="navigation-menu-item" className={cn("relative", className)} {...props} />
)

const navigationMenuTriggerStyle = cva(
  "group/navigation-menu-trigger inline-flex h-9 w-max items-center justify-center rounded-md pl-4 py-2 text-sm font-medium transition-all outline-none hover:bg-muted focus:bg-muted disabled:pointer-events-none disabled:opacity-50 data-[popup-open]:bg-muted/50"
)

const NavigationMenuTrigger = ({ className, children, ...props }: Nav.Trigger.Props) => (
  <Nav.Trigger data-slot="navigation-menu-trigger" className={cn(navigationMenuTriggerStyle(), "group", className)} {...props}>
    {children} <ChevronDownIcon className="relative top-px ml-1 size-3 transition duration-300 group-data-[popup-open]/navigation-menu-trigger:rotate-180 group-data-[open]/navigation-menu-trigger:rotate-180" />
  </Nav.Trigger>
)

const NavigationMenuContent = ({ className, ...props }: Nav.Content.Props) => (
  <Nav.Content data-slot="navigation-menu-content" className={cn("h-full w-auto transition-all duration-350 ease-out data-[ending-style]:opacity-0 data-[starting-style]:opacity-0 group-data-[viewport=false]/navigation-menu:bg-popover group-data-[viewport=false]/navigation-menu:rounded-md", className)} {...props} />
)

const NavigationMenuPositioner = ({ className, side = "bottom", sideOffset = 8, align = "start", ...props }: Nav.Positioner.Props) => (
  <Nav.Portal>
    <Nav.Positioner side={side} sideOffset={sideOffset} align={align} className={cn("isolate z-50 transition-all duration-350 ease-out", className)} {...props}>
      <Nav.Popup className="relative overflow-hidden rounded-lg bg-popover text-popover-foreground shadow-xl ring-1 ring-black/5 transition-all duration-350 data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[starting-style]:scale-95 data-[starting-style]:opacity-0">
        <Nav.Viewport className="relative size-full overflow-hidden" />
      </Nav.Popup>
    </Nav.Positioner>
  </Nav.Portal>
)

const NavigationMenuLink = ({ className, ...props }: Nav.Link.Props) => (
  <Nav.Link data-slot="navigation-menu-link" className={cn("flex items-center gap-1.5 rounded-md p-2 text-sm transition-colors outline-none hover:bg-muted focus:bg-muted data-[active=true]:bg-muted/50", className)} {...props} />
)

const NavigationMenuIndicator = ({ className, ...props }: React.ComponentPropsWithRef<typeof Nav.Icon>) => (
  <Nav.Icon data-slot="navigation-menu-indicator" className={cn("top-full z-1 flex h-1.5 items-end justify-center overflow-hidden data-[state=hidden]:fade-out data-[state=visible]:fade-in", className)} {...props}>
    <div className="relative top-[60%] h-2 w-2 rotate-45 rounded-tl-sm bg-border shadow-md" />
  </Nav.Icon>
)

export {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
  NavigationMenuPositioner,
}