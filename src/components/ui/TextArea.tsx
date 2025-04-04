import React, { forwardRef, useEffect, useRef } from 'react';

export interface TextAreaProps {
  id: string;
  label?: string;
  placeholder?: string;
  error?: string;
  className?: string;
  rows?: number;
  maxRows?: number;
  autoExpand?: boolean;
  required?: boolean;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLTextAreaElement>) => void;
}

const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ 
    id, 
    label, 
    placeholder, 
    error, 
    className = '', 
    rows = 3, 
    maxRows = 10,
    autoExpand = false,
    required,
    value,
    onChange,
    onBlur,
    ...props 
  }, ref) => {
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);
    
    // Function to adjust height based on content
    const adjustHeight = () => {
      const textarea = textareaRef.current;
      if (!textarea || !autoExpand) return;
      
      // Reset height to allow proper scrollHeight calculation
      textarea.style.height = 'auto';
      
      // Calculate new height
      const computedStyle = window.getComputedStyle(textarea);
      const lineHeight = parseInt(computedStyle.lineHeight);
      
      // Calculate max height based on maxRows
      const maxHeight = lineHeight * maxRows;
      
      // Set new height with constraints
      const newHeight = Math.min(textarea.scrollHeight, maxHeight);
      textarea.style.height = `${newHeight}px`;
    };
    
    // Handle textarea changes
    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (onChange) {
        onChange(e);
      }
      
      if (autoExpand) {
        adjustHeight();
      }
    };
    
    // Set up the ref to both our local ref and the forwarded ref
    const setRef = (element: HTMLTextAreaElement) => {
      textareaRef.current = element;
      
      // Handle the case where ref is a function or an object
      if (ref) {
        if (typeof ref === 'function') {
          ref(element);
        } else {
          (ref as React.MutableRefObject<HTMLTextAreaElement | null>).current = element;
        }
      }
    };
    
    // Adjust height on mount and when value changes
    useEffect(() => {
      adjustHeight();
    }, [value]);
    
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <textarea
          ref={setRef}
          id={id}
          placeholder={placeholder}
          rows={rows}
          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 
            ${error ? 'border-red-300' : 'border-gray-300'} 
            ${className}`}
          onChange={handleChange}
          onBlur={onBlur}
          value={value}
          {...props}
        />
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>
    );
  }
);

TextArea.displayName = 'TextArea';

export default TextArea;
