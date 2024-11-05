"use client"

import { Category, Complexity, Question, QuestionAdd } from "@/actions/questions";
import { Group, TextInput, Stack, Select, MultiSelect, Button, Space, ScrollArea, MantineThemeContext, Modal, Code } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { Editor } from "@monaco-editor/react";
import { use, useState } from "react";
import Markdown from "react-markdown";
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels'
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

export default function MarkdownQuestionForm({ question, categories, onSubmit }: { question?: Question, categories: Category[], onSubmit?: (q: QuestionAdd) => void }) {
  const theme = use(MantineThemeContext);
  const [availableCategories, setAvailableCategories] = useState(categories.map(c => c.name));
  const [newCategory, setNewCategory] = useState("");
  const [description, setDescription] = useState(question?.description ?? "");
  const [title, setTitle] = useState(question?.title ?? "");
  const [selectedCategories, setSelectedCategories] = useState<string[]>(question?.categories.map(c => c.name) ?? []);
  const [complexity, setComplexity] = useState<Complexity>("Medium");
  const [opened, { open, close }] = useDisclosure(false);

  const editor = (
    <Editor theme="vs-dark" height="100%" value={description} onChange={v => { setDescription(v ?? "") }} language="markdown" onMount={e => e.updateOptions({ wordWrap: "on" })} />
  )

  const display = (
    <ScrollArea h="100%" scrollbars="y">
      <Markdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]} components={{
        code(props) {
          return <Code {...props} />
        }
      }}>{`# ${title}\n${description}`}</Markdown>
    </ScrollArea>
  )

  const form = (
    <form style={{ height: "100%" }} onSubmit={(e) => {
      e.preventDefault();
      if (onSubmit) {
        try {
          onSubmit({ description: description, title: title, complexity: complexity, categories: selectedCategories.map(c => { return { name: c } }) });
          notifications.show({ message: "Question add/update successful", color: "green", title: "Success" });
        } catch (error) {
          console.log(error);
          notifications.show({ message: "Question add/update unsuccessful", color: "red", title: "Fail" });
        }
      }
    }}>
      <Stack h="100%">
        <Group align="end">
          <TextInput flex="1 1" required value={title} label="Title" onChange={e => setTitle(e.currentTarget.value)} />
          <Select flex="1 1" required data={["Easy", "Medium", "Hard"]} label="Complexity" value={complexity} onChange={e => { if (e && ["Easy", "Medium", "Hard"].includes(e)) setComplexity(e as Complexity) }} />
          <MultiSelect flex="1 1" required label="Categories" value={selectedCategories} data={availableCategories} onChange={setSelectedCategories} ></MultiSelect>
          <Modal opened={opened} onClose={close}>
            <Stack align="center">
              <TextInput flex="1" required label="Category Name" value={newCategory} onChange={e => { setNewCategory(e.currentTarget.value) }} />
              <Button onClick={() => {
                setAvailableCategories(prev => [...prev, newCategory]);
                setNewCategory("");
                close();
              }}>
                Add
              </Button>
            </Stack>
          </Modal>
          <Button onClick={open}>+</Button>
          <Button type="submit" color="red">Submit</Button>
        </Group>
        {editor}
      </Stack>
    </form>
  )

  return (
    <PanelGroup autoSaveId="question-form" direction="horizontal">
      <Panel>
        {form}
      </Panel>
      <Space w="sm" />
      <PanelResizeHandle style={{ width: "2px", backgroundColor: theme?.colors.gray[8] ?? "gray" }} />
      <Space w="sm" />
      <Panel>
        {display}
      </Panel>
    </PanelGroup>
  )
}
