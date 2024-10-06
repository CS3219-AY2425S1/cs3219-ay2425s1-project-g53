import MainIcon from '@/app/icons/MainLogo.svg'
import NextImage from 'next/image'
import { Group, Image, NavLink, Text, useMantineTheme } from '@mantine/core'
import Link from 'next/link'

export default function Logo() {
  const theme = useMantineTheme();
  return (
    <Link href="/" style={{ textDecoration: "none", color: theme.white }}>
      <Group gap="xs">
        <Image component={NextImage} src={MainIcon} h="xl" alt="PeerPrep" />
        <Text size="xl">PeerPrep</Text>
      </Group>
    </Link>
  )
}
