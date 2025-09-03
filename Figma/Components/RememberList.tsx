import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Trash2, Plus, Star, StarOff } from 'lucide-react';

interface RememberItem {
  id: string;
  title: string;
  content: string;
  important: boolean;
  createdAt: Date;
}

export function RememberList() {
  const [items, setItems] = useState<RememberItem[]>([]);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [showForm, setShowForm] = useState(false);

  const addItem = () => {
    if (newTitle.trim()) {
      const item: RememberItem = {
        id: Date.now().toString(),
        title: newTitle.trim(),
        content: newContent.trim(),
        important: false,
        createdAt: new Date(),
      };
      setItems([item, ...items]);
      setNewTitle('');
      setNewContent('');
      setShowForm(false);
    }
  };

  const deleteItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const toggleImportant = (id: string) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, important: !item.important } : item
    ));
  };

  const sortedItems = items.sort((a, b) => {
    if (a.important && !b.important) return -1;
    if (!a.important && b.important) return 1;
    return b.createdAt.getTime() - a.createdAt.getTime();
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Remember List
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowForm(!showForm)}
          >
            <Plus className="w-4 h-4 mr-1" />
            Add
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {showForm && (
          <div className="space-y-3 p-4 border rounded-lg bg-accent/20">
            <Input
              placeholder="Remember title..."
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
            />
            <Textarea
              placeholder="Details (optional)..."
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              rows={3}
            />
            <div className="flex space-x-2">
              <Button onClick={addItem} size="sm">
                Add Item
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowForm(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        <div className="space-y-3 max-h-96 overflow-y-auto">
          {sortedItems.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No items to remember yet. Add one above!
            </p>
          ) : (
            sortedItems.map((item) => (
              <div
                key={item.id}
                className={`p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors ${
                  item.important ? 'ring-2 ring-primary/20 bg-primary/5' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="font-medium">{item.title}</h4>
                      {item.important && (
                        <Star className="w-4 h-4 text-primary fill-current" />
                      )}
                    </div>
                    {item.content && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {item.content}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-2">
                      {item.createdAt.toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleImportant(item.id)}
                      className="text-primary hover:text-primary"
                    >
                      {item.important ? (
                        <StarOff className="w-4 h-4" />
                      ) : (
                        <Star className="w-4 h-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteItem(item.id)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}