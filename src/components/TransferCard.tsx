import React from 'react';
import { FileImage, FileVideo, FileCode, FileText, Download, Copy, Trash2 } from 'lucide-react';

export type ItemType = 'text' | 'file';

export interface TransferItem {
  id: string;
  type: ItemType;
  content: string; // Text content or file name
  fileExtension?: string;
  url?: string; // Optional URL for downloading files
  timestamp: number;
  sender: 'me' | 'peer';
  storagePath?: string; // For cloud vault deletion
  blob?: Blob; // For local storage to cloud vault upload
}

interface TransferCardProps {
  item: TransferItem;
  onCopy?: (text: string) => void;
  onDownload?: (item: TransferItem) => void;
  onDelete?: (item: TransferItem) => void;
}

export const TransferCard: React.FC<TransferCardProps> = ({ item, onCopy, onDownload, onDelete }) => {
  const getFileIcon = (ext?: string) => {
    if (!ext) return <FileText size={24} className="text-slate-400" />;

    const e = ext.toLowerCase();
    // Images
    if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'bmp', 'ico', 'tiff'].includes(e)) {
      return <FileImage size={24} className="text-blue-500" />;
    }
    // Videos
    if (['mp4', 'webm', 'ogg', 'mov', 'avi', 'mkv', 'flv', 'wmv', 'm4v'].includes(e)) {
      return <FileVideo size={24} className="text-purple-500" />;
    }
    // Code files
    if (['js', 'ts', 'jsx', 'tsx', 'html', 'css', 'json', 'md', 'py', 'java', 'cpp', 'c', 'h', 'rb', 'go', 'rs', 'php', 'vue', 'svelte', 'xml', 'yaml', 'yml', 'toml', 'sh', 'bat', 'sql'].includes(e)) {
      return <FileCode size={24} className="text-amber-500" />;
    }
    // Archives
    if (['zip', 'rar', '7z', 'tar', 'gz', 'bz2', 'xz', 'iso'].includes(e)) {
      return <span className="material-symbols-outlined text-orange-500 text-2xl">folder_zip</span>;
    }
    // Executables / Installers
    if (['exe', 'msi', 'dmg', 'app', 'deb', 'rpm', 'apk'].includes(e)) {
      return <span className="material-symbols-outlined text-red-500 text-2xl">terminal</span>;
    }
    // Documents (PDF, Word, etc.)
    if (['pdf'].includes(e)) {
      return <span className="material-symbols-outlined text-red-600 text-2xl">picture_as_pdf</span>;
    }
    if (['doc', 'docx', 'rtf', 'odt'].includes(e)) {
      return <span className="material-symbols-outlined text-blue-600 text-2xl">description</span>;
    }
    // Spreadsheets
    if (['xls', 'xlsx', 'csv', 'ods'].includes(e)) {
      return <span className="material-symbols-outlined text-green-600 text-2xl">table_chart</span>;
    }
    // Presentations
    if (['ppt', 'pptx', 'odp'].includes(e)) {
      return <span className="material-symbols-outlined text-orange-600 text-2xl">slideshow</span>;
    }
    // Text files
    if (['txt', 'log', 'ini', 'cfg', 'conf', 'env'].includes(e)) {
      return <FileText size={24} className="text-slate-500" />;
    }
    // Audio
    if (['mp3', 'wav', 'flac', 'aac', 'ogg', 'm4a', 'wma'].includes(e)) {
      return <span className="material-symbols-outlined text-pink-500 text-2xl">music_note</span>;
    }
    // Fonts
    if (['ttf', 'otf', 'woff', 'woff2', 'eot'].includes(e)) {
      return <span className="material-symbols-outlined text-indigo-500 text-2xl">font_download</span>;
    }
    return <FileText size={24} className="text-slate-400" />;
  };

  const isText = item.type === 'text';

  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-4 mb-4 flex items-center gap-4 shadow-sm hover:shadow-soft transition-all duration-200 group">
      <div className="flex-shrink-0 bg-slate-50 rounded-xl p-3 border border-slate-100 text-slate-500">
        {isText ? <FileText size={24} /> : getFileIcon(item.fileExtension)}
      </div>

      <div className="flex-grow min-w-0">
        <p className={`truncate font-medium ${isText ? 'text-slate-700' : 'text-slate-900'}`}>
          {item.content}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-slate-400">
            {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${item.sender === 'me'
            ? 'bg-accent/10 text-accent'
            : 'bg-emerald-50 text-emerald-600'
            }`}>
            {item.sender === 'me' ? 'Sent' : 'Received'}
          </span>
        </div>
      </div>

      <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2">
        {isText ? (
          <button
            onClick={() => onCopy && onCopy(item.content)}
            className="p-2.5 bg-slate-50 text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
            title="Copy Text"
          >
            <Copy size={18} />
          </button>
        ) : (
          <button
            onClick={() => onDownload && onDownload(item)}
            className="p-2.5 bg-accent/10 text-accent rounded-full hover:bg-accent/20 transition-colors"
            title="Download File"
          >
            <Download size={18} />
          </button>
        )}

        {onDelete && (
          <button
            onClick={() => onDelete(item)}
            className="p-2.5 bg-red-50 text-red-500 rounded-full hover:bg-red-100 transition-colors"
            title="Delete from History"
          >
            <Trash2 size={18} />
          </button>
        )}
      </div>
    </div>
  );
};
