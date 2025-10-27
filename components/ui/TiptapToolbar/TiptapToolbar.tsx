"use client";

import React, { useState } from "react";
import { Editor } from "@tiptap/react";
import {
  TextBold,
  TextItalic,
  TextUnderline,
  AlignLeft,
  AlignRight,
  List,
  ListCheck,
  SortFromTopToBottom,
  ParagraphSpacing,
  Palette,
  Link,
  LinkBroken,
  UndoLeft,
  UndoRight,
  AlignHorizontalCenter,
} from "@solar-icons/react";
import { RoundAltArrowRight } from "@solar-icons/react/ssr";

interface TiptapToolbarProps {
  editor: Editor | null;
}

const TiptapToolbar: React.FC<TiptapToolbarProps> = ({ editor }) => {
  if (!editor) {
    return null;
  }

  const ToolbarButton = ({
    onClick,
    isActive = false,
    children,
    title,
  }: {
    onClick: () => void;
    isActive?: boolean;
    children: React.ReactNode;
    title: string;
  }) => (
    <button
      onClick={onClick}
      title={title}
      className={`
        p-2 rounded-md transition-colors duration-200 
        ${
          isActive
            ? "bg-blue-500 text-white dark:bg-blue-600"
            : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
        }
        disabled:opacity-50 disabled:cursor-not-allowed
      `}
    >
      {children}
    </button>
  );

  const ColorPicker = () => {
    const colors = [
      "#000000",
      "#374151",
      "#6B7280",
      "#9CA3AF",
      "#EF4444",
      "#F97316",
      "#EAB308",
      "#22C55E",
      "#3B82F6",
      "#8B5CF6",
      "#EC4899",
      "#F59E0B",
    ];

    return (
      <div className="relative group">
        <ToolbarButton onClick={() => {}} title="Cor do texto">
          <Palette size={16} />
        </ToolbarButton>
        <div className="absolute top-full left-0 mt-1 p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
          <div className="grid grid-cols-4 gap-1">
            {colors.map((color) => (
              <button
                key={color}
                onClick={() => editor.chain().focus().setColor(color).run()}
                className="w-6 h-6 rounded border border-gray-300 dark:border-gray-600 hover:scale-110 transition-transform"
                style={{ backgroundColor: color }}
                title={`Cor: ${color}`}
              />
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="border-b border-gray-200 dark:border-gray-600 p-2 bg-white dark:bg-gray-950">
      <div className="flex flex-wrap gap-1">
        {/* Formatação básica */}
        <div className="flex gap-1 border-r border-gray-200 dark:border-gray-600 pr-2 mr-2">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            isActive={editor.isActive("bold")}
            title="Negrito (Ctrl+B)"
          >
            <TextBold size={16} />
          </ToolbarButton>

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            isActive={editor.isActive("italic")}
            title="Itálico (Ctrl+I)"
          >
            <TextItalic size={16} />
          </ToolbarButton>

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            isActive={editor.isActive("underline")}
            title="Sublinhado (Ctrl+U)"
          >
            <TextUnderline size={16} />
          </ToolbarButton>
        </div>

        {/* Alinhamento */}
        <div className="flex gap-1 border-r border-gray-200 dark:border-gray-600 pr-2 mr-2">
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign("left").run()}
            isActive={editor.isActive({ textAlign: "left" })}
            title="Alinhar à esquerda"
          >
            <AlignLeft size={16} />
          </ToolbarButton>

          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign("center").run()}
            isActive={editor.isActive({ textAlign: "center" })}
            title="Centralizar"
          >
            <AlignHorizontalCenter size={16} />
          </ToolbarButton>

          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign("right").run()}
            isActive={editor.isActive({ textAlign: "right" })}
            title="Alinhar à direita"
          >
            <AlignRight size={16} />
          </ToolbarButton>

          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign("justify").run()}
            isActive={editor.isActive({ textAlign: "justify" })}
            title="Justificar"
          >
            <RoundAltArrowRight size={16} />
          </ToolbarButton>
        </div>

        {/* Listas */}
        <div className="flex gap-1 border-r border-gray-200 dark:border-gray-600 pr-2 mr-2">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            isActive={editor.isActive("bulletList")}
            title="Lista com marcadores"
          >
            <List size={16} />
          </ToolbarButton>

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            isActive={editor.isActive("orderedList")}
            title="Lista numerada"
          >
            <SortFromTopToBottom size={16} />
          </ToolbarButton>

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            isActive={editor.isActive("bulletList")}
            title="Lista com marcadores"
          >
            <List size={16} />
          </ToolbarButton>

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            isActive={editor.isActive("blockquote")}
            title="Citação"
          >
            <ParagraphSpacing size={16} />
          </ToolbarButton>
        </div>

        {/* Cor do texto */}
        <div className="flex gap-1 border-r border-gray-200 dark:border-gray-600 pr-2 mr-2">
          <ColorPicker />
        </div>

        {/* Links */}
        <div className="flex gap-1 border-r border-gray-200 dark:border-gray-600 pr-2 mr-2">
          <ToolbarButton
            onClick={() => {
              const url = window.prompt("URL do link:");
              if (url) {
                editor.chain().focus().setLink({ href: url }).run();
              }
            }}
            isActive={editor.isActive("link")}
            title="Adicionar link"
          >
            <Link size={16} />
          </ToolbarButton>

          <ToolbarButton
            onClick={() => editor.chain().focus().unsetLink().run()}
            title="Remover link"
          >
            <LinkBroken size={16} />
          </ToolbarButton>
        </div>

        {/* Desfazer/Refazer */}
        <div className="flex gap-1">
          <ToolbarButton
            onClick={() => editor.chain().focus().undo().run()}
            title="Desfazer (Ctrl+Z)"
          >
            <UndoLeft size={16} />
          </ToolbarButton>

          <ToolbarButton
            onClick={() => editor.chain().focus().redo().run()}
            title="Refazer (Ctrl+Y)"
          >
            <UndoRight size={16} />
          </ToolbarButton>
        </div>
      </div>
    </div>
  );
};

export default TiptapToolbar;
