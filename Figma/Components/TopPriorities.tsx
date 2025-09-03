import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Checkbox } from './ui/checkbox';
import { Trash2, Plus, Flag } from 'lucide-react';

interface Priority {
  id: string;
  text: string;
  completed: boolean;
  createdAt: Date;
}

export function TopPriorities() {
  const [priorities, setPriorities] = useState<Priority[]>([]);
  const [newPriority, setNewPriority] = useState('');

  const addPriority = () => {
    if (newPriority.trim() && priorities.length < 5) {
      const priority: Priority = {
        id: Date.now().toString(),
        text: newPriority.trim(),
        completed: false,
        createdAt: new Date(),
      };
      setPriorities([...priorities, priority]);
      setNewPriority('');
    }
  };

  const togglePriority = (id: string) => {
    setPriorities(priorities.map(priority => 
      priority.id === id ? { ...priority, completed: !priority.completed } : priority
    ));
  };

  const deletePriority = (id: string) => {
    setPriorities(priorities.filter(priority => priority.id !== id));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addPriority();
    }
  };

  const completedCount = priorities.filter(p => p.completed).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Flag className="w-5 h-5 text-primary" />
            <span>Top Priorities</span>
          </div>
          <span className="text-sm text-muted-foreground">
            {completedCount}/{priorities.length}
          </span>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Focus on what matters most (max 5)
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {priorities.length < 5 && (
          <div className="flex space-x-2">
            <Input
              placeholder="Add a top priority..."
              value={newPriority}
              onChange={(e) => setNewPriority(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1"
            />
            <Button onClick={addPriority} size="sm" disabled={!newPriority.trim()}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        )}

        <div className="space-y-3">
          {priorities.length === 0 ? (
            <div className="text-center py-8">
              <Flag className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                No priorities set yet. Add your most important tasks above!
              </p>
            </div>
          ) : (
            priorities.map((priority, index) => (
              <div
                key={priority.id}
                className={`flex items-center space-x-3 p-4 rounded-lg border transition-colors ${
                  priority.completed 
                    ? 'bg-accent/50 border-primary/20' 
                    : 'bg-card hover:bg-accent/30 border-primary/40'
                }`}
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-medium">
                  {index + 1}
                </div>
                <Checkbox
                  checked={priority.completed}
                  onCheckedChange={() => togglePriority(priority.id)}
                />
                <span
                  className={`flex-1 ${
                    priority.completed
                      ? 'line-through text-muted-foreground'
                      : 'font-medium'
                  }`}
                >
                  {priority.text}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deletePriority(priority.id)}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))
          )}
        </div>

        {priorities.length === 5 && (
          <p className="text-xs text-muted-foreground text-center">
            You've reached the maximum of 5 priorities. Complete or remove some to add more.
          </p>
        )}
      </CardContent>
    </Card>
  );
}