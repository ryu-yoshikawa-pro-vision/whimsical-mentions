import React, { useCallback, useEffect, useRef, useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { MentionList } from './MentionList';
import { CurrentMentions } from './CurrentMentions';
import { User } from './types';

const DUMMY_USERS: User[] = [
  { id: '1', name: 'John Doe' },
  { id: '2', name: 'Jane Smith' },
  { id: '3', name: 'Bob Johnson' },
];

interface MentionEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export const MentionEditor: React.FC<MentionEditorProps> = ({ value, onChange }) => {
  const [showMentions, setShowMentions] = useState(false);
  const [mentionFilter, setMentionFilter] = useState('');
  const [cursorPosition, setCursorPosition] = useState({ top: 0, left: 0 });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [currentMentions, setCurrentMentions] = useState<User[]>([]);
  const quillRef = useRef<ReactQuill>(null);
  const mentionListRef = useRef<HTMLDivElement>(null);

  const extractMentionsFromContent = useCallback((content: string) => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;
    const mentionElements = tempDiv.querySelectorAll('[data-mention="true"]');
    const mentionIds = Array.from(mentionElements).map(el => el.getAttribute('data-user-id'));
    return DUMMY_USERS.filter(user => mentionIds.includes(user.id));
  }, []);

  const handleChange = useCallback((content: string) => {
    const mentions = extractMentionsFromContent(content);
    setCurrentMentions(mentions);
    onChange(content);
  }, [onChange, extractMentionsFromContent]);

  const insertMention = useCallback((user: User) => {
    const quill = quillRef.current?.getEditor();
    if (!quill) return;

    const selection = quill.getSelection();
    if (!selection) return;

    // Delete the '@' character and any filter text
    quill.deleteText(selection.index - mentionFilter.length - 1, mentionFilter.length + 1);

    // Insert the mention without bold styling
    const mentionText = `${user.name}`;
    quill.insertText(
      selection.index - mentionFilter.length - 1,
      mentionText,
      {
        'mention': true,
        'data-mention': 'true',
        'data-user-id': user.id,
        'bold': false
      }
    );
    
    // Add a space after the mention
    quill.insertText(
      selection.index - mentionFilter.length - 1 + mentionText.length,
      ' ',
      { 'bold': false }
    );

    setShowMentions(false);
    setMentionFilter('');
    setSelectedIndex(0);
  }, [mentionFilter]);

  const filteredUsers = DUMMY_USERS.filter(user =>
    user.name.toLowerCase().includes(mentionFilter.toLowerCase())
  );

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    const quill = quillRef.current?.getEditor();
    if (!quill) return;

    if (event.key === '@') {
      const selection = quill.getSelection();
      if (!selection) return;

      const bounds = quill.getBounds(selection.index);
      setCursorPosition({
        top: bounds.top + bounds.height,
        left: bounds.left,
      });
      setShowMentions(true);
      setMentionFilter('');
      setSelectedIndex(0);
    } else if (showMentions) {
      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          setSelectedIndex(prev => 
            prev < filteredUsers.length - 1 ? prev + 1 : prev
          );
          break;
        case 'ArrowUp':
          event.preventDefault();
          setSelectedIndex(prev => 
            prev > 0 ? prev - 1 : prev
          );
          break;
        case 'Enter':
          event.preventDefault();
          if (filteredUsers[selectedIndex]) {
            insertMention(filteredUsers[selectedIndex]);
          }
          break;
        case 'Escape':
          setShowMentions(false);
          setSelectedIndex(0);
          break;
        case 'Backspace':
          if (mentionFilter === '') {
            setShowMentions(false);
            setSelectedIndex(0);
          } else {
            setMentionFilter(prev => prev.slice(0, -1));
          }
          break;
        default:
          if (event.key.length === 1 && !event.ctrlKey && !event.metaKey) {
            setMentionFilter(prev => prev + event.key);
          }
      }
    }
  }, [showMentions, filteredUsers, selectedIndex, insertMention]);

  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (
      mentionListRef.current && 
      !mentionListRef.current.contains(event.target as Node) &&
      !quillRef.current?.editor?.root.contains(event.target as Node)
    ) {
      setShowMentions(false);
      setSelectedIndex(0);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [handleKeyDown, handleClickOutside]);

  return (
    <div className="space-y-4">
      <div className="relative">
        <ReactQuill
          ref={quillRef}
          value={value}
          onChange={handleChange}
          theme="snow"
          className="bg-white rounded-lg"
        />
        
        {showMentions && (
          <div
            ref={mentionListRef}
            className="absolute z-10 bg-white rounded-lg shadow-lg border border-gray-200"
            style={{
              top: cursorPosition.top + 10,
              left: cursorPosition.left,
            }}
          >
            <MentionList
              users={filteredUsers}
              selectedIndex={selectedIndex}
              onSelect={insertMention}
            />
          </div>
        )}
      </div>

      <CurrentMentions mentions={currentMentions} />
    </div>
  );
};