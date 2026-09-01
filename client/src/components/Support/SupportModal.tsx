import React, { useState } from 'react';
import { 
  LifeBuoy, 
  X, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  Mail, 
  User, 
  MessageSquare, 
  HelpCircle,
  ShieldCheck
} from 'lucide-react';
import { apiFetch } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupportModal: React.FC<SupportModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [category, setCategory] = useState('Technical Support / Bug');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const fullSubject = subject ? `[${category}] ${subject}` : `[${category}] Support Inquiry`;
      const res = await apiFetch('/api/support/contact', {
        method: 'POST',
        body: JSON.stringify({
          name,
          email,
          subject: fullSubject,
          message
        })
      });

      if (res.ok) {
        setSuccess(true);
        setMessage('');
        setSubject('');
        setTimeout(() => {
          setSuccess(false);
          onClose();
        }, 3000);
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error || 'Failed to submit support request. Please try again.');
      }
    } catch {
      setError('Network error. Could not send support request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-in fade-in select-text font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="w-full max-w-lg bg-[#0E0E0E] text-white border border-white/10 rounded-[28px] p-6 sm:p-8 shadow-2xl space-y-5 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-neutral-400 hover:text-white p-1 rounded-full hover:bg-white/10 cursor-pointer transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="space-y-1.5 pr-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#72F000]/15 border border-[#72F000]/30 text-[#72F000] text-xs font-mono font-bold">
            <LifeBuoy className="w-3.5 h-3.5 text-[#72F000]" />
            <span>CODEROOM HELP & SUPPORT</span>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">
            How can we help you?
          </h2>
          <p className="text-xs text-neutral-400 leading-relaxed">
            Have an issue with your interview room, account, or feature request? Send a ticket to our support team and we'll reply directly to your email.
          </p>
        </div>

        {/* Feedback messages */}
        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div className="p-6 rounded-2xl bg-[#141414] border border-[#72F000]/40 text-center space-y-3 animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-full bg-[#72F000] text-black flex items-center justify-center mx-auto shadow-lg shadow-[#72F000]/25">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">Support Ticket Dispatched!</h3>
              <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                We've received your request and our team will get back to you shortly at <strong className="text-white">{email}</strong> from <span className="text-[#72F000] font-mono font-bold">supportcoderoom@gmail.com</span>.
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Name */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-neutral-300 uppercase tracking-wider">Your Name</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Alex Turing"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-[#161616] border border-white/10 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#72F000] transition-colors"
                  />
                  <User className="w-4 h-4 text-neutral-500 absolute left-3 top-3 pointer-events-none" />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-neutral-300 uppercase tracking-wider">Your Email</label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your.email@example.com"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-[#161616] border border-white/10 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#72F000] transition-colors"
                  />
                  <Mail className="w-4 h-4 text-neutral-500 absolute left-3 top-3 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Category */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-neutral-300 uppercase tracking-wider">Issue Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#161616] border border-white/10 text-xs text-white focus:outline-none focus:border-[#72F000] transition-colors cursor-pointer"
              >
                <option value="Technical Support / Bug">Technical Support / Bug</option>
                <option value="Interview Room Issue">Interview Room / Live Sync Issue</option>
                <option value="AI Interviewer Question">AI Interviewer Assessment Issue</option>
                <option value="Account & Profile Access">Account & Profile Access</option>
                <option value="Feature Suggestion">Feature Suggestion</option>
                <option value="General Inquiry">General Inquiry</option>
              </select>
            </div>

            {/* Subject */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-neutral-300 uppercase tracking-wider">Subject</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Brief summary of your question or issue"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-[#161616] border border-white/10 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#72F000] transition-colors"
                />
                <HelpCircle className="w-4 h-4 text-neutral-500 absolute left-3 top-3 pointer-events-none" />
              </div>
            </div>

            {/* Message */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-neutral-300 uppercase tracking-wider">Message Details</label>
              <div className="relative">
                <textarea
                  rows={4}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe what happened or what you need assistance with..."
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-[#161616] border border-white/10 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#72F000] transition-colors resize-none"
                />
                <MessageSquare className="w-4 h-4 text-neutral-500 absolute left-3 top-3 pointer-events-none" />
              </div>
            </div>

            {/* Privacy notice */}
            <div className="flex items-center gap-1.5 text-[10px] text-neutral-400 pt-0.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#72F000]" />
              <span>Responses are sent from <strong>CodeRoom &lt;service@gmail.com&gt;</strong> directly to your inbox.</span>
            </div>

            {/* Submit buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 rounded-full bg-white/5 hover:bg-white/10 text-xs font-bold text-neutral-300 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 rounded-full bg-[#72F000] hover:bg-[#65D600] text-black font-extrabold text-xs shadow-lg shadow-[#72F000]/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 tracking-tight"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{loading ? 'Sending...' : 'Send Support Request'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
