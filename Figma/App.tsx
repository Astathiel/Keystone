import { useState } from 'react';
import { 
  Calendar, 
  CheckSquare, 
  Star, 
  Brain, 
  Flag, 
  Smile,
  Menu
} from 'lucide-react';
import { Button } from './components/ui/button';
import { CalendarView } from './components/CalendarView';
import { TodoList } from './components/TodoList';
import { RememberList } from './components/RememberList';
import { BrainDump } from './components/BrainDump';
import { TopPriorities } from './components/TopPriorities';
import { DailyMood } from './components/DailyMood';
import exampleImage from 'figma:asset/3df2fa06eb619e411513bb21b5df357787a3d39a.png';

type View = 'calendar' | 'todos' | 'remember' | 'braindump' | 'priorities' | 'mood';

export default function App() {
  const [currentView, setCurrentView] = useState<View>('calendar');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const navigationItems = [
    { id: 'calendar' as View, label: 'Calendar', icon: Calendar },
    { id: 'todos' as View, label: 'To-Do List', icon: CheckSquare },
    { id: 'priorities' as View, label: 'Top Priorities', icon: Flag },
    { id: 'remember' as View, label: 'Remember List', icon: Star },
    { id: 'braindump' as View, label: 'Brain Dump', icon: Brain },
    { id: 'mood' as View, label: 'Daily Mood', icon: Smile },
  ];

  const renderCurrentView = () => {
    switch (currentView) {
      case 'calendar':
        return <CalendarView />;
      case 'todos':
        return <TodoList />;
      case 'remember':
        return <RememberList />;
      case 'braindump':
        return <BrainDump />;
      case 'priorities':
        return <TopPriorities />;
      case 'mood':
        return <DailyMood />;
      default:
        return <CalendarView />;
    }
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-sidebar border-r border-sidebar-border transition-all duration-300 flex flex-col`}>
        {/* Header */}
        <div className="p-4 border-b border-sidebar-border">
          <div className="flex items-center justify-between">
            {sidebarOpen && (
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg overflow-hidden">
                  <img 
                    src={exampleImage} 
                    alt="Nature theme" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <h1 className="font-semibold text-sidebar-foreground">Nature Planner</h1>
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-sidebar-foreground hover:bg-sidebar-accent"
            >
              <Menu className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-2">
          <ul className="space-y-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.id}>
                  <Button
                    variant={currentView === item.id ? "default" : "ghost"}
                    className={`w-full justify-start ${
                      currentView === item.id 
                        ? 'bg-sidebar-primary text-sidebar-primary-foreground' 
                        : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                    }`}
                    onClick={() => setCurrentView(item.id)}
                  >
                    <Icon className="w-4 h-4" />
                    {sidebarOpen && <span className="ml-2">{item.label}</span>}
                  </Button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        {sidebarOpen && (
          <div className="p-4 border-t border-sidebar-border">
            <p className="text-xs text-sidebar-foreground/70 text-center">
              Stay organized with nature's calm
            </p>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-card border-b border-border p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-foreground">
              {navigationItems.find(item => item.id === currentView)?.label}
            </h2>
            <div className="text-sm text-muted-foreground">
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-4xl mx-auto">
            {renderCurrentView()}
          </div>
        </main>
      </div>
    </div>
  );
}