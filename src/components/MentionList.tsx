import { User } from './types';

interface MentionListProps {
  users: User[];
  selectedIndex: number;
  onSelect: (user: User) => void;
}

export const MentionList = ({ users, selectedIndex, onSelect }: MentionListProps) => {
  if (users.length === 0) {
    return <div className="px-4 py-2 text-gray-500">No users found</div>;
  }

  return (
    <ul className="py-2">
      {users.map((user, index) => (
        <li
          key={user.id}
          className={`px-4 py-2 cursor-pointer ${
            index === selectedIndex ? 'bg-blue-100' : 'hover:bg-gray-100'
          }`}
          onClick={() => onSelect(user)}
        >
          {user.name}
        </li>
      ))}
    </ul>
  );
};