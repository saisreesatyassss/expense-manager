
"use client";

import { useEditor, EditorContent, Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  Quote,
  Code,
} from "lucide-react";
import { Toggle } from "@/components/ui/toggle";
import { Separator } from "@/components/ui/separator";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
}

const Toolbar = ({ editor }: { editor: Editor | null }) => {
  if (!editor) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-1 border-b border-input p-2">
      <EditorToggle
        editor={editor}
        action={() => editor.chain().focus().toggleBold().run()}
        name="bold"
        icon={Bold}
      />
      <EditorToggle
        editor={editor}
        action={() => editor.chain().focus().toggleItalic().run()}
        name="italic"
        icon={Italic}
      />
      <EditorToggle
        editor={editor}
        action={() => editor.chain().focus().toggleUnderline().run()}
        name="underline"
        icon={UnderlineIcon}
      />
      <EditorToggle
        editor={editor}
        action={() => editor.chain().focus().toggleStrike().run()}
        name="strike"
        icon={Strikethrough}
      />
      <Separator orientation="vertical" className="h-6 mx-1" />
      <EditorToggle
        editor={editor}
        action={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        name="heading"
        params={{ level: 1 }}
        icon={Heading1}
      />
      <EditorToggle
        editor={editor}
        action={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        name="heading"
        params={{ level: 2 }}
        icon={Heading2}
      />
      <EditorToggle
        editor={editor}
        action={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        name="heading"
        params={{ level: 3 }}
        icon={Heading3}
      />
      <Separator orientation="vertical" className="h-6 mx-1" />
      <EditorToggle
        editor={editor}
        action={() => editor.chain().focus().toggleBulletList().run()}
        name="bulletList"
        icon={List}
      />
      <EditorToggle
        editor={editor}
        action={() => editor.chain().focus().toggleOrderedList().run()}
        name="orderedList"
        icon={ListOrdered}
      />
      <EditorToggle
        editor={editor}
        action={() => editor.chain().focus().toggleBlockquote().run()}
        name="blockquote"
        icon={Quote}
      />
      <EditorToggle
        editor={editor}
        action={() => editor.chain().focus().toggleCodeBlock().run()}
        name="codeBlock"
        icon={Code}
      />
    </div>
  );
};


export function RichTextEditor({ value, onChange }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [StarterKit, Underline],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "prose dark:prose-invert prose-sm sm:prose-base lg:prose-lg xl:prose-2xl min-h-[150px] p-4 focus:outline-none",
      },
    },
  });

  return (
    <div className="border border-input rounded-md bg-background">
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}

const EditorToggle = ({ editor, action, name, icon: Icon, params }: {editor: Editor, action: () => void, name: string, icon: React.ElementType, params?: any}) => (
  <Toggle
    size="sm"
    pressed={editor.isActive(name, params)}
    onPressedChange={action}
  >
    <Icon className="h-4 w-4" />
  </Toggle>
);
