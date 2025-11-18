import { useState, useEffect, useCallback } from 'react';
import { useQuiz } from '@/contexts/QuizContext';
import { BadgeNotification } from './BadgeNotification';

/**
 * Component that listens for newly earned badges and displays notifications
 * Place this at the app level to show badge notifications globally
 */
export const BadgeNotificationHandler = () => {
  const { earnedBadges, clearEarnedBadges } = useQuiz();
  const [currentBadge, setCurrentBadge] = useState<string | null>(null);
  const [badgeQueue, setBadgeQueue] = useState<string[]>([]);

  // Queue up new badges
  useEffect(() => {
    if (earnedBadges.length > 0) {
      console.log('New badges earned:', earnedBadges);
      setBadgeQueue(prev => [...prev, ...earnedBadges]);
      clearEarnedBadges();
    }
  }, [earnedBadges, clearEarnedBadges]);

  // Show badges one at a time from the queue
  useEffect(() => {
    if (badgeQueue.length > 0 && !currentBadge) {
      const [nextBadge, ...remaining] = badgeQueue;
      console.log('Showing badge:', nextBadge);
      setCurrentBadge(nextBadge);
      setBadgeQueue(remaining);
    }
  }, [badgeQueue, currentBadge]);

  const handleClose = useCallback(() => {
    console.log('Closing badge notification');
    setCurrentBadge(null);
  }, []);

  return <BadgeNotification badgeId={currentBadge} onClose={handleClose} />;
};
