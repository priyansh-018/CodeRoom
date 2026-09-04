import React, { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  User, 
  Camera, 
  X, 
  Check, 
  AlertCircle, 
  Globe, 
  Link2, 
  Briefcase, 
  FileText, 
  Key, 
  Upload, 
  Sparkles
} from 'lucide-react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PRESET_AVATARS = [
  { name: 'Cyber Bot', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Felix' },
  { name: 'Pixel Coder', url: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Coder' },
  { name: 'Techie', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Priyansh' },
  { name: 'Hacker', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Shadow' },
  { name: 'Wizard', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Merlin' },
  { name: 'Dev Girl', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Jessica' },
  { name: 'Dev Boy', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Alex' },
  { name: 'Astronaut', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Apollo' },
];

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const { user, updateProfile } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
  const [title, setTitle] = useState(user?.title || 'Software Engineer');
  const [bio, setBio] = useState(user?.bio || '');
  const [github, setGithub] = useState(user?.github || '');
  const [linkedin, setLinkedin] = useState(user?.linkedin || '');

  // Password fields
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Handle local image file upload with client-side optimization/compression
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      setError('Image size should be less than 8MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const maxDim = 400;

          if (width > height) {
            if (width > maxDim) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            }
          } else {
            if (height > maxDim) {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const compressed = canvas.toDataURL('image/jpeg', 0.85);
            setAvatarUrl(compressed);
            setError(null);
          } else {
            setAvatarUrl(event.target?.result as string);
          }
        } catch {
          setAvatarUrl(event.target?.result as string);
        }
      };
      img.onerror = () => {
        setError('Failed to read selected image');
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    try {
      const res = await updateProfile({
        name,
        avatarUrl,
        title,
        bio,
        github,
        linkedin,
        ...(showPasswordSection && newPassword ? { currentPassword, newPassword } : {})
      });

      if (res.success) {
        setSuccess(true);
        setCurrentPassword('');
        setNewPassword('');
        setTimeout(() => {
          setSuccess(false);
          onClose();
        }, 1200);
      } else {
        setError(res.error || 'Failed to save changes');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-[#0E0E0E] text-white border border-white/10 rounded-[28px] p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto space-y-6 font-['Plus_Jakarta_Sans',sans-serif]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-neutral-400 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#72F000] text-black flex items-center justify-center font-extrabold shadow-md">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-white tracking-tight">Your Profile Details</h2>
            <p className="text-xs text-neutral-400">View and update your personal info, photo, and developer credentials.</p>
          </div>
        </div>

        {/* Feedback Messages */}
        {error && (
          <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-3 rounded-2xl bg-[#72F000]/15 border border-[#72F000]/30 text-[#72F000] text-xs font-bold flex items-center gap-2">
            <Check className="w-4 h-4 text-[#72F000] shrink-0" />
            <span>Profile details saved successfully!</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-5">
          {/* Avatar / Photo Section */}
          <div className="p-4 rounded-2xl bg-[#141414] border border-white/5 space-y-4">
            <div className="flex items-center gap-4">
              <div className="relative group">
                <div className="w-20 h-20 rounded-2xl bg-[#1E1E1E] border-2 border-[#72F000]/40 overflow-hidden flex items-center justify-center text-white font-extrabold text-2xl shadow-xl">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span>{(name || 'User').slice(0, 2).toUpperCase()}</span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 bg-black/70 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[10px] font-bold gap-1 cursor-pointer"
                  title="Upload Photo"
                >
                  <Camera className="w-4 h-4 text-[#72F000]" />
                  <span>Change</span>
                </button>
              </div>

              <div className="space-y-1.5 flex-1">
                <span className="text-xs font-extrabold text-white block">Profile Photo / Avatar</span>
                <p className="text-[11px] text-neutral-400">Upload a custom image or pick a developer avatar.</p>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3.5 py-1.5 rounded-full bg-[#72F000] hover:bg-[#65D600] text-black text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Image</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAvatarUrl(`https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name || 'Dev')}_${Date.now()}`)}
                    className="px-3.5 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-300 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#72F000]" />
                    <span>Random Bot</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Avatar Gallery */}
            <div className="space-y-2 pt-2 border-t border-white/5">
              <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">Preset Avatars</span>
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                {PRESET_AVATARS.map((av, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setAvatarUrl(av.url)}
                    className={`p-1 rounded-xl border transition-all cursor-pointer bg-[#1A1A1A] hover:scale-105 ${
                      avatarUrl === av.url ? 'border-[#72F000] ring-1 ring-[#72F000]' : 'border-white/5 hover:border-white/20'
                    }`}
                    title={av.name}
                  >
                    <img src={av.url} alt={av.name} className="w-full h-auto rounded-lg aspect-square" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-neutral-300 uppercase tracking-wider">Full Name</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-[#161616] border border-white/10 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#72F000] transition-colors"
                />
                <User className="w-4 h-4 text-neutral-500 absolute left-3 top-3 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-neutral-300 uppercase tracking-wider">Role Title / Designation</label>
              <div className="relative">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Senior Backend Engineer"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-[#161616] border border-white/10 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#72F000] transition-colors"
                />
                <Briefcase className="w-4 h-4 text-neutral-500 absolute left-3 top-3 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Bio */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-neutral-300 uppercase tracking-wider">Bio / Background</label>
            <div className="relative">
              <textarea
                rows={2}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell others about your technical interests, algorithms, and projects..."
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-[#161616] border border-white/10 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#72F000] transition-colors resize-none"
              />
              <FileText className="w-4 h-4 text-neutral-500 absolute left-3 top-3 pointer-events-none" />
            </div>
          </div>

          {/* Social Links */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-neutral-300 uppercase tracking-wider">GitHub Username / URL</label>
              <div className="relative">
                <input
                  type="text"
                  value={github}
                  onChange={(e) => setGithub(e.target.value)}
                  placeholder="e.g. github.com/username"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-[#161616] border border-white/10 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#72F000] transition-colors"
                />
                <Globe className="w-4 h-4 text-neutral-500 absolute left-3 top-3 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-neutral-300 uppercase tracking-wider">LinkedIn Profile</label>
              <div className="relative">
                <input
                  type="text"
                  value={linkedin}
                  onChange={(e) => setLinkedin(e.target.value)}
                  placeholder="e.g. linkedin.com/in/username"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-[#161616] border border-white/10 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#72F000] transition-colors"
                />
                <Link2 className="w-4 h-4 text-neutral-500 absolute left-3 top-3 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Password Security Accordion */}
          <div className="pt-2 border-t border-white/5 space-y-3">
            <button
              type="button"
              onClick={() => setShowPasswordSection(!showPasswordSection)}
              className="text-xs font-bold text-[#72F000] hover:underline flex items-center gap-1.5 cursor-pointer"
            >
              <Key className="w-3.5 h-3.5" />
              <span>{showPasswordSection ? 'Hide Password Settings' : 'Change Password'}</span>
            </button>

            {showPasswordSection && (
              <div className="p-4 rounded-2xl bg-[#141414] border border-white/5 space-y-3 animate-in fade-in duration-150">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-neutral-300 uppercase tracking-wider">Current Password</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    className="w-full px-3.5 py-2 rounded-xl bg-[#161616] border border-white/10 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#72F000]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-neutral-300 uppercase tracking-wider">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full px-3.5 py-2 rounded-xl bg-[#161616] border border-white/10 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#72F000]"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-full bg-white/5 hover:bg-white/10 text-xs font-bold text-neutral-300 transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-full bg-[#72F000] hover:bg-[#65D600] text-black font-extrabold text-xs shadow-md shadow-[#72F000]/20 transition-all disabled:opacity-50 cursor-pointer tracking-tight"
            >
              {loading ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};