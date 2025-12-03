import React from 'react';
import { FileText, Github, Terminal, LayoutDashboard, Search, Bot, Database } from 'lucide-react';

interface HeaderProps {
  activeView: 'search' | 'universe' | 'peerbot';
  onViewChange: (view: 'search' | 'universe' | 'peerbot') => void;
}

export const Header: React.FC<HeaderProps> = ({ activeView, onViewChange }) => {
  return (
    <header className="bg-slate-900 text-white shadow-lg sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Logo Section */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onViewChange('peerbot')}>
          <div className="bg-indigo-600 p-2 rounded-lg">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight hidden sm:block">PeerBot</h1>
            <p className="text-xs text-slate-400 hidden sm:block">AI Peer Analysis Solution</p>
          </div>
        </div>
        
        {/* Navigation Tabs */}
        <div className="flex items-center bg-slate-800 rounded-lg p-1 space-x-1">
            {/* Main App */}
            <button
                onClick={() => onViewChange('peerbot')}
                className={`flex items-center space-x-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                    activeView === 'peerbot' 
                        ? 'bg-indigo-600 text-white shadow-sm' 
                        : 'text-slate-300 hover:text-white hover:bg-slate-700'
                }`}
            >
                <Bot className="w-4 h-4" />
                <span className="hidden md:inline">PeerBot (Main)</span>
            </button>

            {/* Divider */}
            <div className="w-px h-5 bg-slate-600 mx-2"></div>

            {/* Ingest Tools */}
            <div className="flex space-x-1">
                <button
                    onClick={() => onViewChange('search')}
                    className={`flex items-center space-x-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                        activeView === 'search' 
                            ? 'bg-blue-600 text-white shadow-sm' 
                            : 'text-slate-400 hover:text-white hover:bg-slate-700'
                    }`}
                >
                    <Search className="w-4 h-4" />
                    <span className="hidden md:inline">Data Explorer</span>
                </button>
                <button
                    onClick={() => onViewChange('universe')}
                    className={`flex items-center space-x-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                        activeView === 'universe' 
                            ? 'bg-blue-600 text-white shadow-sm' 
                            : 'text-slate-400 hover:text-white hover:bg-slate-700'
                    }`}
                >
                    <Database className="w-4 h-4" />
                    <span className="hidden md:inline">Universe</span>
                </button>
            </div>
        </div>
        
        {/* External Links */}
        <div className="hidden lg:flex items-center space-x-4">
          <a href="#" className="flex items-center space-x-1 text-slate-300 hover:text-white transition-colors text-sm">
            <Terminal className="w-4 h-4" />
            <span>API Docs</span>
          </a>
          <a href="#" className="flex items-center space-x-1 text-slate-300 hover:text-white transition-colors text-sm">
            <Github className="w-4 h-4" />
            <span>GitHub</span>
          </a>
        </div>
      </div>
    </header>
  );
};