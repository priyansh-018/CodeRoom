import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthCard } from './AuthCard';
import type { UserRole } from '../../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
  initialRole?: UserRole;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
  initialRole = 'CANDIDATE'
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto"
        >
          {/* Dismiss backdrop click */}
          <div 
            className="fixed inset-0"
            onClick={onClose}
          />

          <div className="relative z-10 w-full max-w-md py-4">
            <AuthCard
              initialMode={initialMode}
              initialRole={initialRole}
              isModal={true}
              onClose={onClose}
              onSuccess={onClose}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
