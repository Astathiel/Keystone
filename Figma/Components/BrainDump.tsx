import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Trash2, Save, Brain } from 'lucide-react';

interface BrainDumpEntry {
  id: string;
  content: string;
  timestamp: Date;
}

export function BrainDump() {
  const [entries, setEntries] = useState<BrainDumpEntry[]>([]);
  const [currentThought, setCurrentThought] = useState('');

  const saveThought = () => {
    if (currentThought.trim()) {
      const entry: BrainDumpEntry = {
        id: Date.now().toString(),
        content: currentThought.trim(),
        timestamp: new Date(),
      };
      setEntries([entry, ...entries]);
      setCurrentThought('');
    }
  };

  const deleteEntry = (id: string) => {
    setEntries(entries.filter(entry => entry.id !== id));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      saveThought();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Brain className="w-5 h-5" />
          <span>Brain Dump</span>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Quick thoughts, ideas, and random notes
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <Textarea
            placeholder="What's on your mind? (Ctrl+Enter to save)"
            value={currentThought}
            onChange={(e) => setCurrentThought(e.target.value)}
            onKeyPress={handleKeyPress}
            rows={4}
            className="resize-none"
          />
          <Button 
            onClick={saveThought} 
            disabled={!currentThought.trim()}
            className="w-full"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Thought
          </Button>
        </div>

        <div className="space-y-3 max-h-96 overflow-y-auto">
          {entries.length === 0 ? (
            <div className="text-center py-8">
              <Brain className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                No thoughts captured yet. Start brain dumping above!
              </p>
            </div>
          ) : (
            entries.map((entry) => (
              <div
                key={entry.id}
                className="p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="whitespace-pre-wrap mb-2">{entry.content}</p>
                    <p className="text-xs text-muted-foreground">
                      {entry.timestamp.toLocaleString()}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteEntry(entry.id)}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10 ml-2"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}