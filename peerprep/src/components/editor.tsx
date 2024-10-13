"use client"

import { Editor, Monaco, } from "@monaco-editor/react"
import monaco from "monaco-editor";
import * as Y from 'yjs'
import { useEffect, useMemo, useRef, useState } from "react";
import { MonacoBinding } from "y-monaco";
import { HocuspocusProvider } from "@hocuspocus/provider";
import { Select, Stack } from "@mantine/core";

export default function CodeEditor() {
  const ydoc = useMemo(() => new Y.Doc(), []);
  const [editor, setEditor] = useState<any | null>(null);
  const [provider, setProvider] = useState<HocuspocusProvider | null>(null);
  const [binding, setBinding] = useState<MonacoBinding | null>(null);
  const yMap = useRef<Y.Map<string> | null>(null);
  const [language, setLanguage] = useState<string>("typescript");

  useEffect(() => {
    const provider = new HocuspocusProvider({ url: "ws://192.168.0.118:5005", name: 'monaco-demo-ginloy', document: ydoc });
    setProvider(provider);

    return () => {
      provider?.destroy();
      ydoc.destroy();
    }
  }, [ydoc]);

  useEffect(() => {
    if (!provider || !editor) {
      return;
    }
    const binding = new MonacoBinding(ydoc.getText("monaco"), editor.getModel(), new Set([editor]), provider.awareness);
    setBinding(binding);

    const map = ydoc.getMap<string>("language-selector");
    map.set("language", language);
    map.observe(e => {
      const temp = map.get("language");
      if (temp) setLanguage(temp);
    })

    yMap.current = map;

    return () => binding.destroy();
  }, [ydoc, provider, editor]);

  const languageSelector = (
    <Select label="Select Language" data={["javascript", "typescript", "csharp", "java", "cpp", "rust", "python"]} value={language} onChange={v => {
      if (v && yMap.current) {
        yMap.current.set("language", v);
      }
    }} />
  )

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
      <Stack h="calc(100vh - 60px)">
        {languageSelector}
        <Editor width="100%" language={language} theme="vs-dark" onMount={(editor, monaco) => {
          setEditor(editor);
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
