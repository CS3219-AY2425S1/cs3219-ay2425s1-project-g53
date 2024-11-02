import { Center, Loader } from "@mantine/core";

export default function Loading({h, size}: {h?: string | number, size?: number}) {
  return (
    <Center w="100%" h={h}>
      <Loader size={size}/>
    </Center>
  )
}
