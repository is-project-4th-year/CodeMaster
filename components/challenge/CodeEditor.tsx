"use client";
import React from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { python } from '@codemirror/lang-python';
import { javascript } from '@codemirror/lang-javascript';
import { Badge } from '@/components/ui/badge';
import { Code } from 'lucide-react';

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language?: 'python' | 'javascript';
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  value,
  onChange,
  language = 'python'
}) => {
  const getLanguageExtension = () => {
    switch (language) {
      case 'javascript':
        return javascript();
      case 'python':
      default:
        return python();
    }
  };

  return (
    <>
      {/* Editor Header */}
      <div className="border-b border-border px-4 py-3 bg-card">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Code className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">
              solution.{language === 'python' ? 'py' : 'js'}
            </span>
          </div>
          <Badge variant="outline" className="text-xs capitalize">
            {language}
          </Badge>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-hidden">
        <CodeMirror
          value={value}
          height="100%"
          extensions={[getLanguageExtension()]}
          onChange={onChange}
          theme="dark"
          className="h-full text-sm"
          basicSetup={{
            lineNumbers: true,
            highlightActiveLineGutter: true,
            highlightActiveLine: true,
            foldGutter: true,
            highlightSelectionMatches: true,
            autocompletion: true,
          }}
        />
      </div>
    </>
  );
};