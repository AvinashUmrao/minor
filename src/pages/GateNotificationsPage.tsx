import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  fetchGateNotifications,
  getStoredNotifications,
  markAllAsRead,
  getLastCheckTime,
  clearNotifications,
} from '@/hooks/lib/gateNotifications';
import { GateNotification } from '@/types/gate';
import {
  Bell,
  RefreshCw,
  ExternalLink,
  Calendar,
  FileText,
  Award,
  CreditCard,
  AlertCircle,
  Trash2,
  Clock,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const GateNotificationsPage = () => {
  const [notifications, setNotifications] = useState<GateNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const { toast } = useToast();

  useEffect(() => {
    loadNotifications();
    
    // Auto-refresh every 30 minutes
    const interval = setInterval(() => {
      refreshNotifications(true);
    }, 30 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const loadNotifications = () => {
    const stored = getStoredNotifications();
    setNotifications(stored);
    setLastUpdated(getLastCheckTime());
  };

  const refreshNotifications = async (silent = false) => {
    if (!silent) setLoading(true);
    
    try {
      const response = await fetchGateNotifications();
      setNotifications(response.notifications);
      setLastUpdated(response.lastUpdated);
      
      const newCount = response.notifications.filter(n => n.isNew).length;
      
      if (!silent && newCount > 0) {
        toast({
          title: '🎓 New GATE Notifications!',
          description: `Found ${newCount} new notification${newCount > 1 ? 's' : ''}`,
          duration: 5000,
        });
      } else if (!silent) {
        toast({
          title: '✅ Up to date',
          description: 'No new notifications',
          duration: 3000,
        });
      }
    } catch (error) {
      if (!silent) {
        toast({
          title: '❌ Error',
          description: 'Failed to fetch notifications. Showing cached data.',
          variant: 'destructive',
          duration: 3000,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAllRead = () => {
    markAllAsRead();
    loadNotifications();
    toast({
      title: '✓ Marked as read',
      description: 'All notifications marked as read',
      duration: 2000,
    });
  };

  const handleClearAll = () => {
    if (confirm('Are you sure you want to clear all notifications?')) {
      clearNotifications();
      setNotifications([]);
      setLastUpdated(null);
      toast({
        title: '🗑️ Cleared',
        description: 'All notifications cleared',
        duration: 2000,
      });
    }
  };

  const getCategoryIcon = (category: GateNotification['category']) => {
    switch (category) {
      case 'exam': return Calendar;
      case 'result': return Award;
      case 'admit-card': return CreditCard;
      case 'notification': return AlertCircle;
      default: return FileText;
    }
  };

  const getCategoryColor = (category: GateNotification['category']) => {
    switch (category) {
      case 'exam': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'result': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'admit-card': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'notification': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'all') return true;
    if (filter === 'new') return n.isNew;
    return n.category === filter;
  });

  const newCount = notifications.filter(n => n.isNew).length;

  return (
    <div className="container mx-auto pt-24 pb-12 px-4">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-4xl font-bold mb-2">GATE Notifications</h1>
            <p className="text-muted-foreground text-lg">
              Real-time updates from official GATE website
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refreshNotifications()}
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            {newCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleMarkAllRead}
              >
                Mark all read
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearAll}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Bell className="w-6 h-6 text-blue-600 dark:text-blue-300" />
              </div>
              <div>
                <p className="text-2xl font-bold">{notifications.length}</p>
                <p className="text-sm text-muted-foreground">Total</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                <AlertCircle className="w-6 h-6 text-green-600 dark:text-green-300" />
              </div>
              <div>
                <p className="text-2xl font-bold">{newCount}</p>
                <p className="text-sm text-muted-foreground">New</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <Calendar className="w-6 h-6 text-purple-600 dark:text-purple-300" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {notifications.filter(n => n.category === 'exam').length}
                </p>
                <p className="text-sm text-muted-foreground">Exam Updates</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-lg">
                <Clock className="w-6 h-6 text-orange-600 dark:text-orange-300" />
              </div>
              <div>
                <p className="text-xs font-medium">Last Updated</p>
                <p className="text-xs text-muted-foreground">
                  {lastUpdated
                    ? new Date(lastUpdated).toLocaleString()
                    : 'Never'}
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Filters */}
      <Tabs value={filter} onValueChange={setFilter} className="mb-6">
        <TabsList>
          <TabsTrigger value="all">All ({notifications.length})</TabsTrigger>
          <TabsTrigger value="new">New ({newCount})</TabsTrigger>
          <TabsTrigger value="exam">Exam</TabsTrigger>
          <TabsTrigger value="result">Results</TabsTrigger>
          <TabsTrigger value="admit-card">Admit Card</TabsTrigger>
          <TabsTrigger value="notification">Important</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Notifications List */}
      {filteredNotifications.length === 0 ? (
        <Card className="p-12 text-center">
          <Bell className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">
            {filter === 'new' ? 'No new notifications' : 'No notifications found'}
          </p>
          <Button onClick={() => refreshNotifications()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Fetch Notifications
          </Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map((notification) => {
            const Icon = getCategoryIcon(notification.category);
            return (
              <Card
                key={notification.id}
                className={`p-4 transition-all hover:shadow-md ${
                  notification.isNew ? 'border-l-4 border-l-green-500' : ''
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg ${getCategoryColor(notification.category)}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{notification.title}</h3>
                          {notification.isNew && (
                            <Badge variant="default" className="text-xs">NEW</Badge>
                          )}
                        </div>
                        {notification.date && (
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {notification.date}
                          </p>
                        )}
                      </div>
                      
                      {notification.link && (
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                        >
                          <a
                            href={notification.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2"
                          >
                            View
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </Button>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs capitalize">
                        {notification.category}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        Fetched: {new Date(notification.fetchedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Footer Info */}
      <Card className="mt-8 p-6 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
          <div>
            <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
              About GATE Notifications
            </h4>
            <p className="text-sm text-blue-800 dark:text-blue-200 mb-2">
              Notifications are fetched from the official GATE 2026 website (IIT Guwahati).
              The system automatically checks for updates every 30 minutes.
            </p>
            <p className="text-xs text-blue-700 dark:text-blue-300">
              Source: <a href="https://gate2026.iitg.ac.in" target="_blank" rel="noopener noreferrer" className="underline">
                https://gate2026.iitg.ac.in
              </a>
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default GateNotificationsPage;
