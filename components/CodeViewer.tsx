import React, { useState, useEffect } from 'react';
import { GeneratedPlugin, PluginFile } from '../types';
import { Icons } from './Icon';
import JSZip from 'jszip';

interface CodeViewerProps {
  plugin: GeneratedPlugin;
}

const CodeViewer: React.FC<CodeViewerProps> = ({ plugin }) => {
  const [activeFileIndex, setActiveFileIndex] = useState(0);
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied'>('idle');

  // Reset active file when plugin changes
  useEffect(() => {
    setActiveFileIndex(0);
  }, [plugin.id]);

  const activeFile = plugin.files[activeFileIndex];

  const getFileIcon = (type: PluginFile['type']) => {
    switch (type) {
      case 'php': return <Icons.FileCode className="w-4 h-4 text-purple-600" />;
      case 'css': return <Icons.FileType className="w-4 h-4 text-blue-500" />;
      case 'js': return <Icons.FileJson className="w-4 h-4 text-yellow-500" />;
      default: return <Icons.FileText className="w-4 h-4 text-slate-500" />;
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(activeFile.content);
    setCopyStatus('copied');
    setTimeout(() => setCopyStatus('idle'), 2000);
  };

  const handleDownloadZip = async () => {
    const zip = new JSZip();
    const folder = zip.folder(plugin.slug);

    if (folder) {
      plugin.files.forEach(file => {
        folder.file(file.filename, file.content);
      });

      const content = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(content);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${plugin.slug}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-100 rounded-lg text-green-700">
            <Icons.Code className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800">{plugin.name}</h3>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="font-mono bg-slate-200 px-1 rounded">v{plugin.version}</span>
              <span>•</span>
              <span className="font-mono">{plugin.slug}</span>
            </div>
          </div>
        </div>
        <button
          onClick={handleDownloadZip}
          className="flex items-center gap-2 px-4 py-2 bg-wp-600 text-white rounded-lg hover:bg-wp-700 transition-colors shadow-sm text-sm font-medium"
        >
          <Icons.Download className="w-4 h-4" />
          Download .zip
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* File Explorer Sidebar */}
        <div className="w-48 sm:w-64 bg-slate-50 border-r border-slate-200 overflow-y-auto shrink-0">
          <div className="p-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Files
          </div>
          <ul>
            {plugin.files.map((file, index) => (
              <li key={index}>
                <button
                  onClick={() => setActiveFileIndex(index)}
                  className={`w-full flex items-center gap-2 px-4 py-3 text-sm transition-colors text-left
                    ${activeFileIndex === index 
                      ? 'bg-white border-l-4 border-wp-500 text-slate-900 font-medium shadow-sm' 
                      : 'text-slate-600 hover:bg-slate-100 border-l-4 border-transparent'
                    }`}
                >
                  {getFileIcon(file.type)}
                  <span className="truncate">{file.filename}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Code Content */}
        <div className="flex-1 flex flex-col bg-[#1e1e1e] overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2 bg-[#252526] border-b border-[#3e3e42]">
            <span className="text-sm text-slate-300 font-mono">{activeFile.filename}</span>
            <button
              onClick={handleCopy}
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
            >
              {copyStatus === 'copied' ? (
                <>
                  <Icons.Code className="w-3 h-3" /> Copied!
                </>
              ) : (
                <>
                  <Icons.Layers className="w-3 h-3" /> Copy
                </>
              )}
            </button>
          </div>
          <div className="flex-1 overflow-auto code-scroll p-4 relative group">
            <pre className="text-sm font-mono text-slate-300 leading-relaxed whitespace-pre font-ligature">
              <code>{activeFile.content}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodeViewer;
