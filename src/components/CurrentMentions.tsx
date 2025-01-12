import { User } from './types';

interface CurrentMentionsProps {
  mentions: User[];
}

export const CurrentMentions = ({ mentions }: CurrentMentionsProps) => {
  if (mentions.length === 0) return null;

  return (
    <div className="bg-white rounded-lg p-4 border border-gray-200">
      <h3 className="text-sm font-medium text-gray-700 mb-2">現在のメンション:</h3>
      <ul className="space-y-1">
        {mentions.map(user => (
          <li key={user.id} className="text-sm text-gray-600">
            ID: {user.id} - {user.name}
          </li>
        ))}
      </ul>
    </div>
  );
};