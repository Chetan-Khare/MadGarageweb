import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Image as ImageIcon } from 'lucide-react';

interface Option {
  label: string;
  value: string;
  icon?: string;
}

interface ModernSelectProps {
  label: string;
  value: string;
  options: (string | Option)[];
  onChange: (v: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

const ModernSelect: React.FC<ModernSelectProps> = ({ label, value, options, onChange, disabled, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [failedIcons, setFailedIcons] = useState<Set<string>>(new Set());

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => 
    typeof opt === 'string' ? opt === value : opt.value === value
  );

  const displayLabel = typeof selectedOption === 'string' ? selectedOption : (selectedOption?.label || placeholder || `Select ${label}`);
  const displayIcon = typeof selectedOption === 'object' ? selectedOption?.icon : null;

  const handleIconError = (iconPath: string) => {
    setFailedIcons(prev => new Set(prev).add(iconPath));
  };

  const renderIcon = (iconPath: string | null | undefined, size: string = "h-5 w-5") => {
    if (!iconPath || failedIcons.has(iconPath)) {
      return (
        <div className={`${size} flex items-center justify-center bg-gray-100 rounded text-gray-400`}>
          <ImageIcon size={12} />
        </div>
      );
    }

    // Use relative paths to satisfy CSP and leverage the Vite proxy
    const src = iconPath.startsWith('http') ? iconPath : iconPath;

    return (
      <img 
        src={src} 
        alt="" 
        className={`${size} object-contain bg-white rounded p-0.5 border border-gray-100`}
        onError={() => handleIconError(iconPath)}
      />
    );
  };

  return (
    <div className={`flex flex-col relative ${disabled ? 'opacity-40 pointer-events-none' : ''}`} ref={containerRef}>
      <label className="text-[10px] font-black uppercase text-gray-400 mb-2 ml-2 tracking-widest">{label}</label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl text-xs font-black uppercase tracking-widest text-app-bg-dark outline-none focus:border-primary transition-all flex items-center justify-between shadow-sm hover:bg-gray-100"
      >
        <div className="flex items-center gap-3 overflow-hidden">
          {displayIcon && renderIcon(displayIcon)}
          <span className="truncate">{displayLabel}</span>
        </div>
        <ChevronDown size={16} className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-2xl shadow-2xl z-[100] max-h-60 overflow-y-auto animate-in fade-in zoom-in-95 duration-200 custom-scrollbar">
          <div className="p-2">
            {options.map((opt) => {
              const optLabel = typeof opt === 'string' ? opt : opt.label;
              const optValue = typeof opt === 'string' ? opt : opt.value;
              const optIcon = typeof opt === 'string' ? null : opt.icon;
              const isSelected = value === optValue;

              return (
                <button
                  key={optValue}
                  type="button"
                  onClick={() => {
                    onChange(optValue);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between p-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isSelected ? 'bg-primary/10 text-primary' : 'text-gray-500 hover:bg-gray-50 hover:text-app-bg-dark'}`}
                >
                  <div className="flex items-center gap-3">
                    {optIcon && renderIcon(optIcon)}
                    <span>{optLabel}</span>
                  </div>
                  {isSelected && <Check size={14} />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ModernSelect;
