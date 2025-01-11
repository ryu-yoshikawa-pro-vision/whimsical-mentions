import { useState } from 'react';
import { MentionEditor } from '@/components/MentionEditor';

const Index = () => {
  const [content, setContent] = useState('');

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Editor with Mentions</h1>
        <MentionEditor
          value={content}
          onChange={setContent}
        />
      </div>
    </div>
  );
};

export default Index;