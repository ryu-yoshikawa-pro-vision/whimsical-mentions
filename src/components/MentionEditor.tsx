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
  const quillRef = useRef<ReactQuill>(null);
  const mentionListRef = useRef<HTMLDivElement>(null);

  const filteredUsers = DUMMY_USERS.filter(user =>
    user.name.toLowerCase().includes(mentionFilter.toLowerCase())
  );

  const handleChange = useCallback((content: string) => {
    onChange(content);
  }, [onChange]);

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
    } else if (showMentions) {
      if (event.key === 'Escape') {
        setShowMentions(false);
      } else if (event.key === 'Backspace' && mentionFilter === '') {
        setShowMentions(false);
      } else {
        setMentionFilter(prev => prev + event.key);
      }
    }
  }, [showMentions]);

  const insertMention = useCallback((user: User) => {
    const quill = quillRef.current?.getEditor();
    if (!quill) return;

    const selection = quill.getSelection();
    if (!selection) return;

    // Delete the '@' character and any filter text
    quill.deleteText(selection.index - mentionFilter.length - 1, mentionFilter.length + 1);

    // Insert the mention
    quill.insertText(selection.index - mentionFilter.length - 1, `@${user.name} `, {
      mention: true,
      color: '#2563eb',
      bold: true,
    });

    setShowMentions(false);
    setMentionFilter('');
  }, [mentionFilter]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

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
              {filteredUsers.map(user => (
                <li
                  key={user.id}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
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