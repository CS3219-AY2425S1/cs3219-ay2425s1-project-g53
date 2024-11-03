import { Session } from "@/lib/schemas";
import { Badge, Indicator, Menu } from "@mantine/core";
import Link from "next/link";

export default function SessionBadge({ sessions }: { sessions: Session[] }) {
  const badge = (
    <Indicator label={sessions.length} color="red">
      <Badge component="button" style={{ cursor: "pointer" }}>
        sessions
      </Badge>
    </Indicator>
  )

  return (
    <Menu>
      <Menu.Target>
        {badge}
      </Menu.Target>
      <Menu.Dropdown>
        {sessions.map(s => (
          <Menu.Item key={s.name} component={Link} href={`/user/session/${s.name}`}>
            {`Question ${s.question}`}
          </Menu.Item>
        ))}
      </Menu.Dropdown>
    </Menu>
  )
}
