"use client"

import dynamic from "next/dynamic";
import { Editor, Monaco, } from "@monaco-editor/react"
import monaco from "monaco-editor";
import * as Y from 'yjs'
import { useEffect, useMemo, useRef, useState } from "react";
import { MonacoBinding } from "y-monaco";
import { HocuspocusProvider } from "@hocuspocus/provider";
import { Avatar, Button, Select, Stack, Tooltip } from "@mantine/core";
import Loading from "./loading";
import { Group } from "@mantine/core";
import { useRouter } from "next/navigation";
import { UserWithToken } from "@/actions/user";
import { IconPlayerPlayFilled } from "@tabler/icons-react";

const LANGUAGES = ["javascript", "typescript", "csharp", "java", "rust", "python"] as const;
export type Language = typeof LANGUAGES[number];

export default function CodeEditor({ sessionName, user, wsUrl, onRun }: { sessionName: string, user: UserWithToken, wsUrl?: string, onRun?: (v: string, language: Language) => any }) {
  if (!user) {
    useRouter().refresh();
    return <Loading />
  }
  const ydoc = useMemo(() => new Y.Doc(), []);
  const [provider, setProvider] = useState<HocuspocusProvider>();
  const editor = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const binding = useRef<MonacoBinding | null>(null);
  const yMap = useRef<Y.Map<string> | null>(null);
  const [language, setLanguage] = useState<Language>("typescript");
  const [users, setUsers] = useState<string[]>([]);

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
        <Button onClick={() => {
          if (editor.current && onRun) {
            onRun(editor.current.getValue(), language);
          }
        }}>
          {<IconPlayerPlayFilled />}
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
      <Stack h="100%" w="100%">
        {header}
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
          })

          yMap.current = map;
        }}
          beforeMount={(monaco) => {
            monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
              noSemanticValidation: true,
            });
          }}
        />
      </Stack>
    </>)
}
