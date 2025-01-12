import { useState } from 'react';
import { MentionEditor } from '@/components/MentionEditor';
import { Button } from '@/components/ui/button';
import { User } from '@/components/types';

const Index = () => {
  const [content, setContent] = useState('');
  const [submittedContent, setSubmittedContent] = useState('');
  const [submittedMentions, setSubmittedMentions] = useState<User[]>([]);

  const handleSubmit = () => {
    setSubmittedContent(content);
    
    // Parse mentions from content
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;
    const mentionElements = tempDiv.querySelectorAll('[data-mention="true"]');
    const mentions: User[] = Array.from(mentionElements).map(el => ({
      id: el.getAttribute('data-user-id') || '',
      name: el.textContent || ''
    }));
    
    setSubmittedMentions(mentions);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold mb-8">Editor with Mentions</h1>
        
        <div className="space-y-4">
          <MentionEditor
            value={content}
            onChange={setContent}
          />
          
          <Button 
            onClick={handleSubmit}
            className="w-full"
          >
            送信
          </Button>
        </div>

        {submittedContent && (
          <div className="space-y-4">
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <h3 className="text-sm font-medium text-gray-700 mb-2">送信された内容:</h3>
              <div 
                className="prose max-w-none"
                dangerouslySetInnerHTML={{ __html: submittedContent }}
              />
            </div>

            {submittedMentions.length > 0 && (
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <h3 className="text-sm font-medium text-gray-700 mb-2">送信されたメンション:</h3>
                <ul className="space-y-1">
                  {submittedMentions.map(mention => (
                    <li key={mention.id} className="text-sm text-gray-600">
                      ID: {mention.id} - {mention.name}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;