import React, { useRef, useEffect } from 'react'
import * as monaco from 'monaco-editor'

// Configure Monaco Editor environment for Vite
self.MonacoEnvironment = {
  getWorker: function (workerId, label) {
    const getWorkerModule = (moduleUrl: string, label: string) => {
      return new Worker(self.MonacoEnvironment.getWorkerUrl(moduleUrl), {
        name: label,
        type: 'module'
      });
    };

    switch (label) {
      case 'json':
        return getWorkerModule('/monaco-editor/esm/vs/language/json/json.worker?worker', label);
      case 'css':
      case 'scss':
      case 'less':
        return getWorkerModule('/monaco-editor/esm/vs/language/css/css.worker?worker', label);
      case 'html':
      case 'handlebars':
      case 'razor':
        return getWorkerModule('/monaco-editor/esm/vs/language/html/html.worker?worker', label);
      case 'typescript':
      case 'javascript':
        return getWorkerModule('/monaco-editor/esm/vs/language/typescript/ts.worker?worker', label);
      default:
        return getWorkerModule('/monaco-editor/esm/vs/editor/editor.worker?worker', label);
    }
  },
  getWorkerUrl: function (moduleUrl: string) {
    return new URL(moduleUrl, import.meta.url).href;
  }
};

interface CodeEditorProps {
  value: string
  onChange: (value: string) => void
  onRunCode: (code: string) => void
}

const CodeEditor: React.FC<CodeEditorProps> = ({ value, onChange, onRunCode }) => {
  const editorContainerRef = useRef<HTMLDivElement>(null)
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null)

  const runCode = () => {
    if (editorRef.current) {
      const code = editorRef.current.getValue()
      onRunCode(code)
    }
  }

  useEffect(() => {
    if (editorContainerRef.current) {
      // 配置Monaco Editor
      monaco.editor.defineTheme('custom-dark', {
        base: 'vs-dark',
        inherit: true,
        rules: [],
        colors: {
          'editor.background': '#1a1a1a',
        }
      })

      editorRef.current = monaco.editor.create(editorContainerRef.current, {
        value: value,
        language: 'javascript',
        theme: 'custom-dark',
        fontSize: 14,
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        automaticLayout: true,
        tabSize: 2,
        insertSpaces: true,
        wordWrap: 'on',
        lineNumbers: 'on',
        glyphMargin: false,
        folding: false,
        lineDecorationsWidth: 0,
        lineNumbersMinChars: 3,
      })

      editorRef.current.onDidChangeModelContent(() => {
        if (editorRef.current) {
          onChange(editorRef.current.getValue())
        }
      })
    }

    return () => {
      if (editorRef.current) {
        editorRef.current.dispose()
      }
    }
  }, [])

  // Update editor value when prop changes
  useEffect(() => {
    if (editorRef.current && editorRef.current.getValue() !== value) {
      editorRef.current.setValue(value)
    }
  }, [value])

  return (
    <div className="code-editor">
      <div className="editor-header">
        <h3>代码编辑器</h3>
        <button onClick={runCode} className="run-button">
          运行代码
        </button>
      </div>
      <div ref={editorContainerRef} className="editor-container"></div>
    </div>
  )
}

export default CodeEditor