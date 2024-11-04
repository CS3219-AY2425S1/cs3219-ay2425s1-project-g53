"use client"

import { MantineThemeContext } from "@mantine/core"
import { use } from "react"
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels"

export function TwoHorizontalPanels({ left, right, persistanceId }: { left: JSX.Element, right: JSX.Element, persistanceId?: string }) {
  const theme = use(MantineThemeContext);

  return (
    <PanelGroup direction="horizontal">
      <Panel>
        {left}
      </Panel>
      <PanelResizeHandle style={{ width: "2px", backgroundColor: theme?.colors.gray[8] }} />
      <Panel>
        {right}
      </Panel>
    </PanelGroup>
  )
}
