import React, { useCallback, useEffect, useRef, useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

interface User {
  id: string;
  name: string;
}

interface MentionEditorProps {
  value: string;
  onChange: (value: string) => void;
}

const DUMMY_USERS: User[] = [
  { id: '1', name: 'John Doe' },
  { id: '2', name: 'Jane Smith' },
  { id: '3', name: 'Bob Johnson' },
];

export const MentionEditor: React.FC<MentionEditorProps> = ({ value, onChange }) => {
  const [showMentions, setShowMentions] = useState(false);
  const [mentionFilter, setMentionFilter] = useState('');
  const [cursorPosition, setCursorPosition] = useState({ top: 0, left: 0 });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const quillRef = useRef<ReactQuill>(null);
  const mentionListRef = useRef<HTMLDivElement>(null);

  const filteredUsers = DUMMY_USERS.filter(user =>
    user.name.toLowerCase().includes(mentionFilter.toLowerCase())
  );

  const handleChange = useCallback((content: string) => {
    onChange(content);
  }, [onChange]);

  const insertMention = useCallback((user: User) => {
    const quill = quillRef.current?.getEditor();
    if (!quill) return;

    const selection = quill.getSelection();
    if (!selection) return;

    // Delete the '@' character and any filter text
    quill.deleteText(selection.index - mentionFilter.length - 1, mentionFilter.length + 1);

    // Insert the mention
    quill.insertText(selection.index - mentionFilter.length - 2, `@${user.name} `, {
      mention: true,
      color: '#2563eb',
      bold: true,
    });

    setShowMentions(false);
    setMentionFilter('');
    setSelectedIndex(0);
  }, [mentionFilter]);

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
          {filteredUsers.length > 0 ? (
            <ul className="py-2">
              {filteredUsers.map((user, index) => (
                <li
                  key={user.id}
                  className={`px-4 py-2 cursor-pointer ${
                    index === selectedIndex ? 'bg-blue-100' : 'hover:bg-gray-100'
                  }`}
                  onClick={() => insertMention(user)}
                >
                  {user.name}
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-4 py-2 text-gray-500">No users found</div>
          )}
        </div>
      )}
    </div>
  );
};