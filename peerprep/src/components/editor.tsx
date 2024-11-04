"use client"

import dynamic from "next/dynamic";
import { Editor, Monaco, } from "@monaco-editor/react"
import monaco from "monaco-editor";
import * as Y from 'yjs'
import { use, useEffect, useMemo, useRef, useState } from "react";
import { MonacoBinding } from "y-monaco";
import { HocuspocusProvider } from "@hocuspocus/provider";
import { Avatar, Button, Select, Stack, Tooltip, Box, ScrollArea, MantineThemeContext, Title } from "@mantine/core";
import Loading from "./loading";
import { Group } from "@mantine/core";
import { useRouter } from "next/navigation";
import { UserWithToken } from "@/actions/user";
import { IconPlayerPlayFilled } from "@tabler/icons-react";
import useSWRMutation from "swr/mutation";
import ReactMarkdown from 'react-markdown';
import { runCode, ExecutionResult } from "../actions/execution";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { addAttempt } from "@/actions/history";
import { Question } from "@/actions/questions";

const LANGUAGES = ["javascript", "typescript", "csharp", "java", "rust", "python"] as const;
export type Language = typeof LANGUAGES[number];

export default function CodeEditor({ sessionName, user, wsUrl, onRun, question }: { sessionName: string, user: UserWithToken, wsUrl?: string, onRun?: (v: string, language: Language) => any, question: Question }) {
  if (!user) {
    useRouter().refresh();
    return <Loading />
  }
  const theme = use(MantineThemeContext);
  const ydoc = useMemo(() => new Y.Doc(), []);
  const [provider, setProvider] = useState<HocuspocusProvider>();
  const editor = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const binding = useRef<MonacoBinding | null>(null);
  const yMap = useRef<Y.Map<string> | null>(null);
  const [language, setLanguage] = useState<Language>("typescript");
  const [users, setUsers] = useState<string[]>([]);
  const [otherUserTriggered, setOtherUserTriggered] = useState(false);

  const { trigger, isMutating, data, reset, error } = useSWRMutation("runCode", async (k, { arg }: { arg: { code: string, language: Language, emit: boolean } }) => {
    if (!arg.emit && yMap.current) {
      const res = JSON.parse(yMap.current.get("output")!) as ExecutionResult;
      yMap.current.delete("run");
      yMap.current.delete("output");
      return res;
    }
    if (users.length > 2) {
      console.log("Adding attempt");
      await addAttempt(users[0], users[1], question, arg.code);
    }
    if (yMap.current && arg.emit) {
      yMap.current.set("run", "true");
    }
    const res = await runCode(arg.language, arg.code);
    if (yMap.current && arg.emit) {
      yMap.current.set("output", JSON.stringify(res));
    }
    return res;
  })

  const languageSelector = (
    <Select flex={3} size="xs" label="Select Language" data={LANGUAGES} value={language} onChange={v => {
      if (v && yMap.current) {
        yMap.current.set("language", v);
      } else if (v) {
        setLanguage(v as Language);
      }
    }} />
  )

  const header = (
    <Group w="100%" align="end">
      {languageSelector}
      <Group flex={5} justify="flex-end">
        {users.map(u =>
          <Tooltip key={u} label={u}>
            <Avatar name={u} color={u === user?.username ? "green" : "red"} />
          </Tooltip>
        )}
        <Button onClick={() =>
          trigger({ language: language, code: editor.current?.getValue() || "", emit: true })} loading={isMutating || otherUserTriggered}>
          <IconPlayerPlayFilled />
        </Button>
      </Group>
    </Group>
  )

  useEffect(() => {
    console.log("Connection");
    const p = new HocuspocusProvider({
      url: `${wsUrl}/ws/${sessionName}`, name: sessionName, document: ydoc, onClose: () => {
        console.log("close");
        binding.current?.destroy();
        editor.current?.dispose();
      },
      onDisconnect(data) {
        console.log("disconnected");
        p.connect();
      },
      onAwarenessUpdate(states) {
        setUsers(states.states.map(v => v?.username ?? null).filter(u => u));
        console.log(users);
      },
    });
    p.setAwarenessField("username", user!.username)
    setProvider(p);
    return () => {
      console.log(p);
      p.destroy();
    }
  }, [ydoc])

  if (!provider) {
    return <Loading h="100%" />
  }

  return (
    <>
      <style>
        {`
            .yRemoteSelection {
              background-color: red;
              opacity: 0.5;
            }
            .yRemoteSelectionHead {
                position: absolute;
                border-left: red solid 2px;
                border-top: red solid 2px;
                border-bottom: red solid 2px;
                height: 100%;
                box-sizing: border-box;
            }
            .yRemoteSelectionHead::after {
                position: absolute;
                content: ' ';
                border: 3px solid red;
                border-radius: 4px;
                left: -4px;
                top: -5px; 
               }
          `}
      </style>
      <PanelGroup direction="vertical" autoSaveId={`${user.id}-${sessionName}-editor`}>
        <Panel>
          <Stack h="100%" p={10} >
            {header}
            <Box flex="1 1 auto" h={0}>
              <Editor width="100%" language={language} theme="vs-dark" onMount={(e, m) => {
                editor.current = e;
                const model = e.getModel();
                if (!model) {
                  return;
                }
                binding.current = new MonacoBinding(ydoc.getText("monaco"), model, new Set([e]), provider.awareness);

                const map = ydoc.getMap<string>("language-selector");
                map.set("language", language);
                map.observe(e => {
                  const temp = map.get("language");
                  if (temp) setLanguage(temp as Language);
                  if (map.get("run") === "true") {
                    setOtherUserTriggered(true);
                  } else {
                    setOtherUserTriggered(false);
                  }
                  if (map.has("output") && editor.current) {
                    trigger({ code: editor.current.getValue(), language: language, emit: false });
                  }
                })

                yMap.current = map;
              }}
                beforeMount={(monaco) => {
                  monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
                    noSemanticValidation: true,
                  });
                }}
              />
            </Box>
          </Stack>
        </Panel>
        <PanelResizeHandle style={{ height: "2px", backgroundColor: theme?.colors.gray[7] ?? "gray" }} />
        <Panel style={{ display: "flex", flexDirection: "column" }}>
          <ScrollArea h={0} m={10} flex="1 1 auto" bg={theme?.colors.gray[9]} c={error || data?.run.code == null || data.run.code !== 0 || (data?.compile?.code != null && data.compile.code !== 0) ? "red" : "green"}>
            <Stack h="100%" p={5}>
              {(data?.compile?.code != null && data.compile.code !== 0) && <Title order={3}>Compilation Error</Title>}
              {(data?.run.code != null && data.run.code !== 0) && <Title order={3}>Runtime Error</Title>}
              {(data?.run.code != null && data.run.code === 0) && <Title order={3}>Success</Title>}
              <ReactMarkdown>{`\`\`\`\n${error ?? (data?.compile?.code != null && data.compile.code !== 0 ? data.compile.output : data?.run.output ?? "")}\n\`\`\``}</ReactMarkdown>
            </Stack>
          </ScrollArea>
        </Panel>
      </PanelGroup>
    </>)
}

