import * as React from "react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

interface TabDef {
  id: string
  label: string
}

interface TabPanelProps {
  tabs: TabDef[]
  children: React.ReactNode[]
  defaultTab?: string
  className?: string
}

export function TabPanel({ tabs, children, defaultTab, className }: TabPanelProps) {
  const [activeTab, setActiveTab] = React.useState(defaultTab ?? tabs[0]?.id ?? "")

  return (
    <Tabs
      value={activeTab}
      onValueChange={(val) => setActiveTab(val as string)}
      className={cn("flex flex-col h-full", className)}
    >
      <TabsList>
        {tabs.map((tab) => (
          <TabsTrigger key={tab.id} value={tab.id}>
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {tabs.map((tab, index) => (
        <TabsContent key={tab.id} value={tab.id} keepMounted className="flex-1 overflow-hidden">
          {children[index]}
        </TabsContent>
      ))}
    </Tabs>
  )
}
