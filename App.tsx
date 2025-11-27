import React, { useState } from 'react';
import { GeneratedPlugin, PluginRequest, GeneratorStatus } from './types';
import { generatePlugin } from './services/geminiService';
import PluginForm from './components/PluginForm';
import CodeViewer from './components/CodeViewer';
import { Icons } from './components/Icon';

const App: React.FC = () => {
  const [status, setStatus] = useState<GeneratorStatus>(GeneratorStatus.IDLE);
  const [currentPlugin, setCurrentPlugin] = useState<GeneratedPlugin | null>(null);
  const [history, setHistory] = useState<GeneratedPlugin[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleCreatePlugin = async (request: PluginRequest) => {
    setStatus(GeneratorStatus.GENERATING);
    setError(null);
    setCurrentPlugin(null);

    try {
      const plugin = await generatePlugin(request);
      setCurrentPlugin(plugin);
      setHistory(prev => [plugin, ...prev]);
      setStatus(GeneratorStatus.SUCCESS);
    } catch (err: any) {
      setError(err.message || "Something went wrong generating the plugin.");
      setStatus(GeneratorStatus.ERROR);
    }
  };

  const handleSelectHistory = (plugin: GeneratedPlugin) => {
    setCurrentPlugin(plugin);
    setStatus(GeneratorStatus.SUCCESS);
    setSidebarOpen(false); // Close sidebar on mobile
  };

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden">
      
      {/* Sidebar Overlay for Mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar History */}
      <aside 
        className={`fixed lg:static inset-y-0 left-0 z-30 w-72 bg-white border-r border-slate-200 transform transition-transform duration-200 ease-in-out lg:transform-none flex flex-col
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="p-5 border-b border-slate-100 flex items-center gap-3">
          <div className="w-8 h-8 bg-wp-600 rounded-lg flex items-center justify-center text-white">
            <Icons.Code className="w-5 h-5" />
          </div>
          <h1 className="font-bold text-lg text-slate-800 tracking-tight">WPForge AI</h1>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            History
          </div>
          
          {history.length === 0 ? (
            <div className="text-sm text-slate-400 text-center py-8">
              No plugins generated yet.
            </div>
          ) : (
            history.map(plugin => (
              <button
                key={plugin.id}
                onClick={() => handleSelectHistory(plugin)}
                className={`w-full text-left p-3 rounded-xl transition-all border
                  ${currentPlugin?.id === plugin.id 
                    ? 'bg-wp-50 border-wp-200 shadow-sm' 
                    : 'bg-white border-slate-100 hover:border-wp-200 hover:bg-slate-50'
                  }`}
              >
                <div className="font-medium text-slate-800 truncate mb-1">{plugin.name}</div>
                <div className="text-xs text-slate-500 truncate">{plugin.description}</div>
                <div className="text-[10px] text-slate-400 mt-2 flex items-center gap-1">
                  <Icons.Code className="w-3 h-3" />
                  {plugin.files.length} files
                </div>
              </button>
            ))
          )}
        </div>
        
        <div className="p-4 border-t border-slate-100">
           <button 
             onClick={() => {
               setCurrentPlugin(null);
               setStatus(GeneratorStatus.IDLE);
               setSidebarOpen(false);
             }}
             className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-wp-600 transition-colors text-sm font-medium"
           >
             <Icons.Plus className="w-4 h-4" />
             New Plugin
           </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Mobile Header */}
        <header className="lg:hidden flex items-center justify-between p-4 bg-white border-b border-slate-200">
          <div className="flex items-center gap-2">
             <div className="w-8 h-8 bg-wp-600 rounded-lg flex items-center justify-center text-white">
               <Icons.Code className="w-5 h-5" />
             </div>
             <span className="font-bold text-slate-800">WPForge</span>
          </div>
          <button 
            onClick={() => setSidebarOpen(true)}
            className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
          >
            <Icons.Sidebar className="w-6 h-6" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-6xl mx-auto h-full flex flex-col">
            
            {status === GeneratorStatus.ERROR && error && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-3">
                <Icons.Layers className="w-5 h-5 mt-0.5 shrink-0" />
                <div>
                  <h4 className="font-bold text-sm">Generation Failed</h4>
                  <p className="text-sm mt-1">{error}</p>
                  <button 
                    onClick={() => setStatus(GeneratorStatus.IDLE)} 
                    className="text-xs font-semibold underline mt-2 hover:text-red-800"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            )}

            {status === GeneratorStatus.IDLE && (
               <div className="flex-1 flex flex-col items-center justify-center min-h-[500px]">
                  <div className="text-center mb-8 max-w-lg">
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4">
                      Build WordPress Plugins in <span className="text-wp-600">Seconds</span>
                    </h1>
                    <p className="text-slate-500 text-lg">
                      Describe your plugin idea, and our AI will engineer the PHP, CSS, and JS files for you—ready to zip and install.
                    </p>
                  </div>
                  <PluginForm onSubmit={handleCreatePlugin} status={status} />
               </div>
            )}

            {status === GeneratorStatus.GENERATING && (
              <div className="flex-1 flex flex-col items-center justify-center min-h-[400px]">
                <div className="flex flex-col items-center animate-pulse">
                  <div className="w-16 h-16 bg-wp-100 text-wp-600 rounded-full flex items-center justify-center mb-6">
                    <Icons.Loader2 className="w-8 h-8 animate-spin" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-2">Forging your plugin...</h3>
                  <p className="text-slate-500">Writing secure PHP code and structuring files.</p>
                </div>
              </div>
            )}

            {status === GeneratorStatus.SUCCESS && currentPlugin && (
              <div className="h-full flex flex-col">
                 <div className="mb-4 flex items-center justify-between">
                   <h2 className="text-xl font-bold text-slate-800">Generated Result</h2>
                   <button 
                     onClick={() => {
                        setStatus(GeneratorStatus.IDLE);
                        setCurrentPlugin(null);
                     }}
                     className="text-sm text-wp-600 hover:text-wp-700 font-medium flex items-center gap-1"
                   >
                     <Icons.RefreshCw className="w-4 h-4" /> Start Over
                   </button>
                 </div>
                 <div className="flex-1 min-h-[500px]">
                    <CodeViewer plugin={currentPlugin} />
                 </div>
              </div>
            )}

          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
