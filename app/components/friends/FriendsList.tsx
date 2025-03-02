import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { Input } from '@/app/components/ui/input';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/app/components/ui/avatar';
import { Search, UserPlus, X } from 'lucide-react';

// This would be replaced with actual data from Supabase
const MOCK_FRIENDS = [
  { id: '1', name: 'Jane Smith', username: 'janesmith', imageUrl: 'https://i.pravatar.cc/150?img=1' },
  { id: '2', name: 'John Doe', username: 'johndoe', imageUrl: 'https://i.pravatar.cc/150?img=2' },
  { id: '3', name: 'Alex Johnson', username: 'alexj', imageUrl: 'https://i.pravatar.cc/150?img=3' },
];

export default function FriendsList() {
  const { user } = useUser();
  const [searchQuery, setSearchQuery] = useState('');
  const [friends, setFriends] = useState(MOCK_FRIENDS);

  // This would be replaced with actual search functionality
  const filteredFriends = friends.filter(
    (friend) =>
      friend.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      friend.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddFriend = (username: string) => {
    // This would be replaced with actual API call to add friend
    console.log(`Adding friend with username: ${username}`);
    alert(`Friend request sent to ${username}`);
  };

  const handleRemoveFriend = (id: string) => {
    // This would be replaced with actual API call to remove friend
    setFriends(friends.filter(friend => friend.id !== id));
  };

  return (
    <div className="friends-list">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Add Friend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by username"
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button onClick={() => handleAddFriend(searchQuery)}>
              <UserPlus className="h-4 w-4 mr-2" />
              Add
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your Friends</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredFriends.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              {searchQuery ? 'No friends match your search' : 'You have no friends yet. Add some!'}
            </p>
          ) : (
            <ul className="space-y-4">
              {filteredFriends.map((friend) => (
                <li key={friend.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={friend.imageUrl} alt={friend.name} />
                      <AvatarFallback>{friend.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{friend.name}</p>
                      <p className="text-sm text-muted-foreground">@{friend.username}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => handleRemoveFriend(friend.id)}>
                    <X className="h-4 w-4" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 