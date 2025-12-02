import React, { useEffect, useRef } from "react"
import { EditorView, basicSetup } from "codemirror"
import { EditorState } from "@codemirror/state"
import { javascript } from "@codemirror/lang-javascript"
import { python } from "@codemirror/lang-python"
import { StreamLanguage } from "@codemirror/language"
import { shell } from "@codemirror/legacy-modes/mode/shell"

// Dracula theme colors
const draculaTheme = EditorView.theme(
  {
    "&": {
      color: "#f8f8f2",
      backgroundColor: "#282a36",
      fontSize: "14px",
      fontFamily: '"Fira Code", "JetBrains Mono", "Monaco", "Cascadia Code", "Roboto Mono", monospace',
    },
    ".cm-content": {
      padding: "16px",
      minHeight: "400px",
      caretColor: "#f8f8f2",
    },
    ".cm-focused": {
      outline: "none",
    },
    ".cm-editor": {
      borderRadius: "8px",
    },
    ".cm-scroller": {
      fontFamily: "inherit",
    },
    ".cm-gutters": {
      backgroundColor: "#282a36",
      color: "#6272a4",
      border: "none",
      borderRight: "1px solid #44475a",
    },
    ".cm-activeLineGutter": {
      backgroundColor: "#44475a",
    },
    ".cm-activeLine": {
      backgroundColor: "#44475a40",
    },
    ".cm-selectionBackground": {
      backgroundColor: "#44475a",
    },
    ".cm-focused .cm-selectionBackground": {
      backgroundColor: "#44475a",
    },
    ".cm-searchMatch": {
      backgroundColor: "#ffb86c40",
      outline: "1px solid #ffb86c",
    },
    ".cm-searchMatch.cm-searchMatch-selected": {
      backgroundColor: "#ff5555",
    },
    ".cm-cursor": {
      borderLeftColor: "#f8f8f2",
    },
    ".cm-tooltip": {
      backgroundColor: "#44475a",
      border: "1px solid #6272a4",
      color: "#f8f8f2",
    },
    ".cm-tooltip-autocomplete": {
      "& > ul > li[aria-selected]": {
        backgroundColor: "#6272a4",
        color: "#f8f8f2",
      },
    },
  },
  { dark: true },
)

// Dracula syntax highlighting
const draculaHighlight = EditorView.theme({
  ".tok-comment": { color: "#6272a4", fontStyle: "italic" },
  ".tok-keyword": { color: "#ff79c6" },
  ".tok-string": { color: "#f1fa8c" },
  ".tok-number": { color: "#bd93f9" },
  ".tok-operator": { color: "#ff79c6" },
  ".tok-punctuation": { color: "#f8f8f2" },
  ".tok-variableName": { color: "#50fa7b" },
  ".tok-function": { color: "#50fa7b" },
  ".tok-className": { color: "#8be9fd" },
  ".tok-propertyName": { color: "#50fa7b" },
  ".tok-literal": { color: "#bd93f9" },
  ".tok-meta": { color: "#ff79c6" },
  ".tok-tag": { color: "#ff79c6" },
  ".tok-attribute": { color: "#50fa7b" },
  ".tok-namespace": { color: "#8be9fd" },
  ".tok-macroName": { color: "#50fa7b" },
  ".tok-typeName": { color: "#8be9fd" },
  ".tok-definition": { color: "#50fa7b" },
  ".tok-regexp": { color: "#f1fa8c" },
  ".tok-escape": { color: "#ff79c6" },
  ".tok-link": { color: "#8be9fd", textDecoration: "underline" },
  ".tok-heading": { color: "#bd93f9", fontWeight: "bold" },
  ".tok-emphasis": { fontStyle: "italic" },
  ".tok-strong": { fontWeight: "bold" },
  ".tok-strikethrough": { textDecoration: "line-through" },
})


export default function CodeEditor({ value, onChange, language }) {
  const editorRef = useRef(null)
  const viewRef = useRef(null)

  useEffect(() => {
    if (!editorRef.current) return

    const getLanguageExtension = () => {
      switch (language) {
        case "javascript":
          return javascript({ typescript: false, jsx: false })
        case "python":
          return python()
        case "bash":
          return StreamLanguage.define(shell)
        default:
          return javascript()
      }
    }

    const state = EditorState.create({
      doc: value,
      extensions: [
        basicSetup,
        getLanguageExtension(),
        draculaTheme,
        draculaHighlight,
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            onChange(update.state.doc.toString())
          }
        }),
        EditorView.lineWrapping,
      ],
    })

    // Destroy existing view
    if (viewRef.current) {
      viewRef.current.destroy()
    }

    // Create new view
    viewRef.current = new EditorView({
      state,
      parent: editorRef.current,
    })

    return () => {
      if (viewRef.current) {
        viewRef.current.destroy()
        viewRef.current = null
      }
    }
  }, [language])

  // Update content when value changes externally
  useEffect(() => {
    if (viewRef.current && viewRef.current.state.doc.toString() !== value) {
      viewRef.current.dispatch({
        changes: {
          from: 0,
          to: viewRef.current.state.doc.length,
          insert: value,
        },
      })
    }
  }, [value])

  return <div ref={editorRef} className="w-full border border-[#6272a4] rounded-lg overflow-hidden" />
}
