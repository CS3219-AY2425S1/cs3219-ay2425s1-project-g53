"use client"

import { Editor, Monaco, } from "@monaco-editor/react"
import monaco from "monaco-editor";
import * as Y from 'yjs'
import { useEffect, useMemo, useState } from "react";
import { MonacoBinding } from "y-monaco";
import { WebsocketProvider } from "y-websocket";


export default function CodeEditor() {
  const ydoc = useMemo(() => new Y.Doc(), []);
  const [editor, setEditor] = useState<any | null>(null);
  const [provider, setProvider] = useState<WebsocketProvider | null>(null);
  const [binding, setBinding] = useState<MonacoBinding | null>(null);

  useEffect(() => {
    const provider = new WebsocketProvider("wss://demos.yjs.dev/ws", 'monaco-demo-ginloy', ydoc);
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
    const binding = new MonacoBinding(ydoc.getText(), editor.getModel(), new Set([editor]), provider.awareness);
    setBinding(binding);
    return () => binding.destroy();
  }, [ydoc, provider, editor]);

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
      <Editor height="100%" defaultLanguage="typescript" theme="vs-dark" onMount={(editor: monaco.editor.IStandaloneCodeEditor, monaco: Monaco) => {
        setEditor(editor);
      }}
      />
    </>)
}
