import { useEffect, useState, useCallback } from 'react';
import { Badge } from '@/types/gamification';
import { getBadgeById } from '@/data/badges';
import { motion, AnimatePresence } from 'framer-motion';

interface BadgeNotificationProps {
  badgeId: string | null;
  onClose: () => void;
}

export const BadgeNotification = ({ badgeId, onClose }: BadgeNotificationProps) => {
  const [badge, setBadge] = useState<Badge | null>(null);

  useEffect(() => {
    if (badgeId) {
      const badgeData = getBadgeById(badgeId);
      if (badgeData) {
        setBadge(badgeData);
        // Auto-close after 3 seconds
        const timer = setTimeout(() => {
          console.log('Auto-closing badge notification');
          onClose();
        }, 3000);
        return () => {
          console.log('Cleaning up timer');
          clearTimeout(timer);
        };
      }
    } else {
      setBadge(null);
    }
  }, [badgeId, onClose]);

  if (!badge) return null;

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'from-gray-500 to-gray-600';
      case 'rare': return 'from-blue-500 to-blue-600';
      case 'epic': return 'from-purple-500 to-purple-600';
      case 'legendary': return 'from-yellow-500 to-yellow-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getRarityGlow = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'shadow-gray-500/50';
      case 'rare': return 'shadow-blue-500/50';
      case 'epic': return 'shadow-purple-500/50';
      case 'legendary': return 'shadow-yellow-500/50';
      default: return 'shadow-gray-500/50';
    }
  };

  return (
    <AnimatePresence>
      {/* Opaque overlay background */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9998]"
      />
      
      {/* Centered badge popup - using flex for perfect centering */}
      <div className="fixed inset-0 flex items-center justify-center z-[9999] pointer-events-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.3 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5 }}
          transition={{ 
            type: "spring", 
            stiffness: 260, 
            damping: 20 
          }}
          className="pointer-events-auto"
        >
        <motion.div
          animate={{ 
            boxShadow: [
              '0 0 20px rgba(255, 215, 0, 0.3)',
              '0 0 40px rgba(255, 215, 0, 0.6)',
              '0 0 20px rgba(255, 215, 0, 0.3)',
            ]
          }}
          transition={{ 
            duration: 2, 
            repeat: Infinity,
            ease: "easeInOut" 
          }}
          className={`bg-gradient-to-br ${getRarityColor(badge.rarity)} rounded-xl shadow-2xl ${getRarityGlow(badge.rarity)} p-6 min-w-[400px] relative overflow-hidden`}
        >
          {/* Sparkle effect background */}
          <motion.div
            animate={{
              background: [
                'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.2) 0%, transparent 50%)',
                'radial-gradient(circle at 80% 50%, rgba(255,255,255,0.2) 0%, transparent 50%)',
                'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.2) 0%, transparent 50%)',
              ]
            }}
            transition={{ duration: 3, repeat: Infinity }}
            className="absolute inset-0 pointer-events-none"
          />

          <div className="relative z-10">
            {/* Badge Unlocked Header */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="text-center mb-4"
            >
              <p className="text-yellow-200 text-sm font-semibold uppercase tracking-wider">
                🎉 Badge Unlocked! 🎉
              </p>
            </motion.div>

            {/* Badge Icon with continuous vertical (Y-axis) rotation */}
            <motion.div
              initial={{ scale: 0, rotateY: -180 }}
              animate={{ 
                scale: 1, 
                rotateY: 360
              }}
              transition={{ 
                scale: { delay: 0.3, type: "spring", stiffness: 200 },
                rotateY: { 
                  delay: 0.5,
                  duration: 3, 
                  repeat: Infinity, 
                  ease: "linear" 
                }
              }}
              style={{ perspective: 1000 }}
              className="text-center mb-4"
            >
              <div className="text-7xl inline-block" style={{ transformStyle: 'preserve-3d' }}>
                {badge.icon}
              </div>
            </motion.div>

            {/* Badge Name */}
            <motion.h3
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-3xl font-bold text-white text-center mb-2"
            >
              {badge.name}
            </motion.h3>

            {/* Badge Description */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-white/90 text-center mb-3"
            >
              {badge.description}
            </motion.p>

            {/* Rarity Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 }}
              className="flex justify-center"
            >
              <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${
                badge.rarity === 'legendary' ? 'bg-yellow-400 text-yellow-900' :
                badge.rarity === 'epic' ? 'bg-purple-400 text-purple-900' :
                badge.rarity === 'rare' ? 'bg-blue-400 text-blue-900' :
                'bg-gray-400 text-gray-900'
              }`}>
                {badge.rarity}
              </span>
            </motion.div>

            {/* Confetti particles */}
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ 
                  opacity: 1, 
                  x: 0, 
                  y: 0, 
                  scale: 1 
                }}
                animate={{
                  opacity: 0,
                  x: Math.cos((i * Math.PI * 2) / 8) * 100,
                  y: Math.sin((i * Math.PI * 2) / 8) * 100,
                  scale: 0,
                }}
                transition={{ 
                  duration: 1, 
                  delay: 0.5,
                  ease: "easeOut" 
                }}
                className="absolute top-1/2 left-1/2 w-2 h-2 bg-yellow-300 rounded-full"
                style={{
                  transform: 'translate(-50%, -50%)',
                }}
              />
            ))}
          </div>
        </motion.div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
