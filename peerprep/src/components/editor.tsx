"use client"

import dynamic from "next/dynamic";
import { Editor, Monaco, } from "@monaco-editor/react"
import monaco from "monaco-editor";
import * as Y from 'yjs'
import { useEffect, useRef, useState } from "react";
import { MonacoBinding } from "y-monaco";
import { HocuspocusProvider } from "@hocuspocus/provider";
import { Avatar, Button, Select, Stack, Tooltip, Box, ScrollArea, Title, useMantineTheme, Dialog, Text, Code, Badge } from "@mantine/core";
import { Group } from "@mantine/core";
import { UserWithToken } from "@/actions/user";
import { IconAlertCircle, IconPlayerPlayFilled } from "@tabler/icons-react";
import useSWRMutation from "swr/mutation";
import ReactMarkdown from 'react-markdown';
import { runCode, ExecutionResult } from "../actions/execution";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { addAttempt } from "@/actions/history";
import { Question } from "@/actions/questions";
import { z } from 'zod';
import { ExecutionResultSchema } from "@/lib/schemas";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";

const LANGUAGES = ["javascript", "typescript", "csharp", "java", "rust", "python"] as const;
export type Language = typeof LANGUAGES[number];

const OutputEventSchema = z.object({
  _tag: z.literal("output"),
  data: ExecutionResultSchema
});

const RunEventSchema = z.object({
  _tag: z.literal("run"),
  username: z.string()
});

const RunErrorSchema = z.object({
  _tag: z.literal("runError"),
  error: z.any(),
})

const AcceptLanguageChangeEventSchema = z.object({
  _tag: z.literal("acceptLang"),
  lang: z.enum(LANGUAGES),
});
const RequestLanguageChangeEventSchema = z.object({
  _tag: z.literal("changeLang"),
  lang: z.enum(LANGUAGES),
  username: z.string(),
});

const ProviderEventSchema = z.discriminatedUnion("_tag", [OutputEventSchema, RunEventSchema, AcceptLanguageChangeEventSchema, RunErrorSchema, RequestLanguageChangeEventSchema]).and(z.object({ source: z.string() }));
export type ProviderEvent = z.infer<typeof ProviderEventSchema>;

export function CodeEditor({ sessionName, user, wsUrl, onRun, question }: { sessionName: string, user: UserWithToken, wsUrl?: string, onRun?: (v: string, language: Language) => any, question: Question }) {
  const theme = useMantineTheme();
  const [users, setUsers] = useState<string[]>([]);
  const [connected, setConnected] = useState(false);
  const [language, setLanguage] = useState<Language>("typescript");
  const [otherUserTriggered, setOtherUserTriggered] = useState(false);
  const [editor, setEditor] = useState<monaco.editor.IStandaloneCodeEditor | null>(null);
  const [selectorLabel, setSelectorLabel] = useState<"Select Language" | "Waiting for accept..." | "No reply">("Select Language");
  const [warning, setWarning] = useState<string>("");

  const [languageChangeRequest, setLanguageChangeRequest] = useState<z.infer<typeof RequestLanguageChangeEventSchema> | null>(null);

  const configRef = useRef<Y.Map<string> | null>(null);
  const provider = useRef<HocuspocusProvider | null>(null);

  const { trigger, isMutating, data, reset, error } = useSWRMutation("runCode", async (k, { arg }: { arg: { code: string, language: Language, set?: ExecutionResult | any } }) => {
    if (arg.set) {
      const res = ExecutionResultSchema.safeParse(arg.set);
      if (!res.data) {
        throw arg.set;
      }
      return res.data;
    }
    if (provider.current && provider.current.isConnected) {
      const payload: ProviderEvent = {
        _tag: "run",
        source: user.id,
        username: user.username,
      }
      provider.current.sendStateless(JSON.stringify(payload));
    }
    try {
      const res = await runCode(arg.language, arg.code);
      if (provider.current && provider.current.isConnected) {
        const payload: ProviderEvent = {
          _tag: "output",
          data: res,
          source: user.id
        }
        provider.current.sendStateless(JSON.stringify(payload));
      }
      if (users.length >= 2) {
        console.log("Adding attempt");
        await addAttempt(users[0], users[1], question, arg.code);
      }
      return res;
    } catch (error) {
      const payload: ProviderEvent = {
        _tag: "runError",
        error: error,
        source: user.id,
      };
      provider.current?.sendStateless(JSON.stringify(payload))
      throw error;
    }
  })

  useEffect(() => {
    if (!editor || !editor.getModel()) {
      console.log("Editor not mounted");
      return;
    }
    const ydoc = new Y.Doc();
    const config = ydoc.getMap<string>("config");
    config.observe(() => {
      const lang = config.get("language");
      if (lang) {
        setLanguage(lang as Language);
      }
    });
    const providerLocal = new HocuspocusProvider(
      {
        url: `${wsUrl}/ws/${sessionName}`, name: sessionName, document: ydoc,
        onDisconnect(data) {
          console.log("Disconnected, trying to connect...");
          setConnected(false);
          providerLocal.connect();
        },
        onAwarenessUpdate(states) {
          setUsers(states.states.map(v => v?.username ?? null).filter(u => u));
          const position = editor.getPosition();
          if (!position) return;
          const lineConflict = states.states.filter(s => s.username != user.username).find(s => s.line === position.lineNumber);
          if (lineConflict) {
            setWarning(`Line Conflict`);
          } else {
            setWarning("");
          }
        },
        onConnect() {
          console.log("Connected");
          providerLocal.setAwarenessField("username", user.username);
          providerLocal.setAwarenessField("line", editor.getPosition()?.lineNumber);
          providerLocal.awareness?.getStates();
          if (config.has("language")) {
            setLanguage(config.get("language") as Language);
          }
          setConnected(true);
        },
        onStateless({ payload }) {
          try {
            const event = ProviderEventSchema.parse(JSON.parse(payload));
            console.log(event);
            if (event.source === user.id) {
              return;
            }
            switch (event._tag) {
              case "output":
                setOtherUserTriggered(false);
                const res = event.data;
                trigger({ code: "", language: language, set: res });
                break;
              case "runError":
                setOtherUserTriggered(false);
                const error = event.error;
                trigger({ code: "", language: language, set: error });
                break;
              case "run":
                setOtherUserTriggered(true);
                notifications.show({ message: `${event.username} has run the code.` });
                break;
              case "acceptLang":
                setLanguageChangeRequest(null);
                setSelectorLabel("Select Language");
                config.set("language", event.lang)
                notifications.show({ message: `Language changed to ${event.lang}` })
                break;
              case "changeLang":
                setLanguageChangeRequest(event);
                break;
            }
          } catch (error) {
            console.log(error);
          }
        },
      })

    editor.onDidChangeCursorPosition(c => {
      providerLocal.setAwarenessField("line", c.position.lineNumber);
    })

    const binding = new MonacoBinding(ydoc.getText("monaco"), editor.getModel()!, new Set([editor]), providerLocal.awareness);

    provider.current = providerLocal;
    configRef.current = config;

    return () => {
      providerLocal.destroy();
    }
  }, [editor]);

  const languageSelector = (
    <Select flex="3 0 auto" disabled={selectorLabel !== "Select Language"} size="xs" label={selectorLabel} data={LANGUAGES} value={language} onChange={v => {
      if (provider.current?.isConnected && v && users.length > 1) {
        provider.current.sendStateless(JSON.stringify({
          _tag: "changeLang",
          lang: v as Language,
          source: user.id,
          username: user.username
        } satisfies ProviderEvent));
        notifications.show({ message: "Sent a language change request to all users" });
        setSelectorLabel("Waiting for accept...");
        setTimeout(() => {
          setSelectorLabel(prev => {
            if (prev === "Select Language") {
              return prev;
            }
            setTimeout(() => { setSelectorLabel("Select Language") }, 2000);
            return "No reply";
          })
        }, 10000);
      } else if (v) {
        configRef.current?.set("language", v);
        setLanguage(v as Language);
      }
    }} />
  )

  const languageChangeDialog = (
    <Dialog opened={languageChangeRequest != null} withCloseButton onClose={() => setLanguageChangeRequest(null)}>
      <Stack>
        <Text size="sm">
          {`${languageChangeRequest?.username} wants to change language to `}
          <Code >{languageChangeRequest?.lang}</Code>
        </Text>
        <Button onClick={() => {
          if (!languageChangeRequest) {
            return;
          }
          if (provider.current && provider.current.isConnected) {
            provider.current.sendStateless(JSON.stringify({ _tag: "acceptLang", source: user.id, lang: languageChangeRequest.lang } satisfies ProviderEvent));
          }
          setLanguage(languageChangeRequest.lang);
          setLanguageChangeRequest(null);
          setSelectorLabel("Select Language");
        }} >
          Agree
        </Button>
      </Stack>
    </Dialog>
  )

  const header = (
    <Group w="100%" align="end">
      {languageSelector}
      <Group flex="9 0 auto" justify="flex-end" wrap="nowrap">
        {warning && <Group c="orange" wrap="nowrap" gap={4} flex="0 1 auto"><IconAlertCircle /><Text size="xs" >{warning}</Text></Group>}
        <Badge color={connected ? "green" : "gray"} >
          {connected ? "Online" : "Offline"}
        </Badge>
        {users.map(u =>
          <Tooltip key={u} label={u}>
            <Avatar name={u} color={u === user?.username ? "green" : "red"} />
          </Tooltip>
        )}
        <Button variant="transparent" size="compact-md" onClick={() =>
          trigger({ language: language, code: editor?.getValue() || "" })} loading={isMutating || otherUserTriggered}>
          <IconPlayerPlayFilled />
        </Button>
      </Group>
    </Group >
  )

  const title: ["Compile Error" | "Runtime Error" | "Success" | "", "red" | "green" | undefined] = (() => {
    if (!data) {
      return ["", undefined]
    }
    if (data.compile?.code != null && data.compile.code !== 0) {
      return ["Compile Error", "red"]
    }
    if (data.run.code !== 0) {
      return ["Runtime Error", "red"]
    }
    return ["Success", "green"]
  })();

  const contents = (() => {
    if (error) {
      return error;
    }
    switch (title[0]) {
      case "":
        return "";
      case "Compile Error":
        return data?.compile?.output;
      case "Runtime Error":
      case "Success":
        return data?.run.output;
    }
  })()

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
        <Panel defaultSize={80}>
          <Stack h="100%" p={10} >
            {header}
            <Box flex="1 1 auto" h={0}>
              <Editor width="100%" language={language} theme="vs-dark" onMount={(e, m) => {
                console.log("editor mounted");
                setEditor(e);
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
        <Panel defaultSize={20} style={{ display: "flex", flexDirection: "column" }}>
          <ScrollArea h={0} m={10} flex="1 1 auto" bg={theme?.colors.gray[9]} c={title[1]}>
            <Stack h="100%" p={5}>
              <Title>{title[0]}</Title>
              <ReactMarkdown>{`\`\`\`\n${contents}\n\`\`\``}</ReactMarkdown>
            </Stack>
          </ScrollArea>
        </Panel>
      </PanelGroup>
      {languageChangeDialog}
    </>)
}

