'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import TextStyle from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import TextAlign from '@tiptap/extension-text-align';
import Heading from '@tiptap/extension-heading';
import Bold from '@tiptap/extension-bold';
import Italic from '@tiptap/extension-italic';
import Underline from '@tiptap/extension-underline';
import Strike from '@tiptap/extension-strike';
import Code from '@tiptap/extension-code';
import ListItem from '@tiptap/extension-list-item';
import BulletList from '@tiptap/extension-bullet-list';
import OrderedList from '@tiptap/extension-ordered-list';
import Blockquote from '@tiptap/extension-blockquote';
import CodeBlock from '@tiptap/extension-code-block';
import HorizontalRule from '@tiptap/extension-horizontal-rule';
import Link from '@tiptap/extension-link';
import { EditorState } from '@/types';

interface EditorProps {
  content: string;
  onChange: (content: string, state: EditorState) => void;
  onSelectionChange?: (selection: { from: number; to: number } | null) => void;
  placeholder?: string;
  className?: string;
}

export default function Editor({
  content,
  onChange,
  onSelectionChange,
  placeholder = '여기에 내용을 작성하세요...',
  className = ''
}: EditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder,
      }),
      TextStyle,
      Color,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Heading.configure({
        levels: [1, 2, 3, 4, 5, 6],
      }),
      Bold,
      Italic,
      Underline,
      Strike,
      Code,
      ListItem,
      BulletList,
      OrderedList,
      Blockquote,
      CodeBlock,
      HorizontalRule,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary-600 hover:text-primary-800 underline',
        },
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      const state: EditorState = {
        content: html,
        selection: editor.state.selection.empty 
          ? null 
          : { from: editor.state.selection.from, to: editor.state.selection.to }
      };
      onChange(html, state);
    },
    onSelectionUpdate: ({ editor }) => {
      if (onSelectionChange) {
        const selection = editor.state.selection.empty 
          ? null 
          : { from: editor.state.selection.from, to: editor.state.selection.to };
        onSelectionChange(selection);
      }
    },
    editorProps: {
      attributes: {
        class: 'editor-content min-h-screen p-6 focus:outline-none',
      },
    },
  });

  return (
    <div className={`editor-container ${className}`}>
      <EditorContent editor={editor} />
    </div>
  );
}
