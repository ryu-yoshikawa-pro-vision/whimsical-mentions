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

    // Get mentions from data attributes (selected from list)
    const mentionElements = tempDiv.querySelectorAll('[data-mention="true"]');
    const selectedMentions = Array.from(mentionElements).map(el => ({
      id: el.getAttribute('data-user-id') || '',
      name: el.textContent?.trim() || ''
    }));

    // Get manually typed mentions
    const textContent = tempDiv.textContent || '';
    const manualMentionRegex = /@([^\s]+)/g;// /@([^\s]+(?:\s+[^\s]+)*)/g;
    const manualMentions = Array.from(textContent.matchAll(manualMentionRegex))
      .map(match => ({
        id: match[1], // Using the mentioned name as ID for manual mentions
        name: match[1].trim()
      }))
      // Filter out mentions that are already included from data attributes
      .filter(manual => !selectedMentions.some(selected => 
        selected.name.toLowerCase() === manual.name.toLowerCase()
      ));

    // Combine both types of mentions and remove duplicates
    const allMentions = [...selectedMentions, ...manualMentions];
    const uniqueMentions = allMentions.reduce((acc: User[], current) => {
      const isDuplicate = acc.some(item => 
        item.name.toLowerCase() === current.name.toLowerCase()
      );
      if (!isDuplicate) {
        acc.push(current);
      }
      return acc;
    }, []);

    console.log(uniqueMentions);
    setSubmittedMentions(uniqueMentions);
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
                  {submittedMentions.map((mention, index) => (
                    <li key={`${mention.id}-${index}`} className="text-sm text-gray-600">
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