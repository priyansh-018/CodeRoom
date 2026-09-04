import React from 'react';
import { 
  X, 
  User, 
  GraduationCap, 
  BookOpen, 
  Code2, 
  FileText, 
  Download, 
  ExternalLink, 
  Phone, 
  Mail, 
  Linkedin, 
  Github,
  Award,
  Sparkles
} from 'lucide-react';
import type { CandidateProfile } from '../../types';

interface CandidateProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidateName?: string;
  candidateEmail?: string;
  candidateAvatar?: string;
  profile?: CandidateProfile;
}

export const CandidateProfileModal: React.FC<CandidateProfileModalProps> = ({
  isOpen,
  onClose,
  candidateName = 'Candidate',
  candidateEmail,
  candidateAvatar,
  profile
}) => {
  if (!isOpen) return null;

  // Parse skills whether array or stringified JSON
  let skillsList: string[] = [];
  if (profile?.skills) {
    if (Array.isArray(profile.skills)) {
      skillsList = profile.skills;
    } else if (typeof profile.skills === 'string') {
      try {
        const parsed = JSON.parse(profile.skills);
        if (Array.isArray(parsed)) skillsList = parsed;
        else skillsList = [profile.skills];
      } catch {
        skillsList = profile.skills.split(',').map((s) => s.trim());
      }
    }
  }

  // Handle open resume in new window or download
  const handleOpenResume = () => {
    if (!profile?.resumeUrl) return;
    const win = window.open();
    if (win) {
      win.document.write(
        `<iframe src="${profile.resumeUrl}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`
      );
      win.document.title = `${candidateName} - Resume`;
    } else {
      const a = document.createElement('a');
      a.href = profile.resumeUrl;
      a.download = profile.resumeFileName || `${candidateName}_Resume.pdf`;
      a.click();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#0E0E0E] text-white border border-white/10 rounded-[28px] p-6 sm:p-7 shadow-2xl max-h-[90vh] overflow-y-auto font-['Plus_Jakarta_Sans',sans-serif] space-y-5">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-neutral-400 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header & Candidate Card */}
        <div className="flex items-center gap-4 border-b border-white/5 pb-5">
          <div className="w-16 h-16 rounded-2xl bg-[#1E1E1E] border-2 border-[#7CFC00]/50 overflow-hidden flex items-center justify-center font-extrabold text-2xl text-white shadow-xl shrink-0">
            {candidateAvatar ? (
              <img src={candidateAvatar} alt={candidateName} className="w-full h-full object-cover" />
            ) : (
              <span>{candidateName.slice(0, 2).toUpperCase()}</span>
            )}
          </div>

          <div className="overflow-hidden flex-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#7CFC00]/15 border border-[#7CFC00]/30 text-[#7CFC00] text-[10px] font-mono font-bold uppercase mb-1">
              <Sparkles className="w-3 h-3" />
              <span>Candidate Dossier</span>
            </div>
            <h2 className="text-xl font-extrabold text-white tracking-tight truncate">{candidateName}</h2>
            <p className="text-xs text-neutral-400 truncate">{candidateEmail || 'Candidate in session'}</p>
          </div>
        </div>

        {/* Qualification & Degree Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-3.5 rounded-2xl bg-[#141414] border border-white/5 space-y-1">
            <span className="text-[10px] font-extrabold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5 text-[#7CFC00]" />
              <span>Current Status</span>
            </span>
            <p className="text-xs font-bold text-white">
              {profile?.qualificationStatus || 'Student / Candidate'}
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#141414] border border-white/5 space-y-1">
            <span className="text-[10px] font-extrabold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-[#7CFC00]" />
              <span>Degree / Major</span>
            </span>
            <p className="text-xs font-bold text-white truncate">
              {profile?.degree || 'Software Engineering'}
            </p>
          </div>
        </div>

        {/* Technical Skills Section */}
        <div className="p-4 rounded-2xl bg-[#141414] border border-white/5 space-y-2.5">
          <span className="text-[11px] font-extrabold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
            <Code2 className="w-4 h-4 text-[#7CFC00]" />
            <span>Technical Skills</span>
          </span>

          {skillsList.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {skillsList.map((skill, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 rounded-full bg-[#7CFC00]/15 border border-[#7CFC00]/30 text-[#7CFC00] text-xs font-extrabold shadow-sm"
                >
                  {skill}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-neutral-500 italic">No specific skills listed.</p>
          )}
        </div>

        {/* Candidate Resume Section */}
        <div className="p-4 rounded-2xl bg-[#141414] border border-white/5 space-y-2.5">
          <span className="text-[11px] font-extrabold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-[#7CFC00]" />
            <span>Candidate Resume / CV</span>
          </span>

          {profile?.resumeUrl ? (
            <div className="p-3 rounded-xl bg-black/40 border border-white/10 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div className="w-9 h-9 rounded-xl bg-[#7CFC00]/15 text-[#7CFC00] flex items-center justify-center shrink-0 font-bold">
                  <FileText className="w-4 h-4" />
                </div>
                <div className="overflow-hidden">
                  <span className="text-xs font-bold text-white block truncate">
                    {profile.resumeFileName || `${candidateName}_Resume.pdf`}
                  </span>
                  <span className="text-[10px] text-neutral-400 block">Uploaded Document</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleOpenResume}
                className="px-3.5 py-1.5 rounded-full bg-[#7CFC00] hover:bg-[#65D600] text-black text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>View Resume</span>
              </button>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-black/40 border border-dashed border-white/10 text-center text-xs text-neutral-500">
              No resume uploaded by candidate.
            </div>
          )}
        </div>

        {/* Contact & Social Links */}
        <div className="p-4 rounded-2xl bg-[#141414] border border-white/5 space-y-2">
          <span className="text-[11px] font-extrabold text-neutral-300 uppercase tracking-wider block">
            Contact & Profiles
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {profile?.phone && (
              <div className="flex items-center gap-2 text-neutral-300">
                <Phone className="w-3.5 h-3.5 text-[#7CFC00] shrink-0" />
                <span>{profile.phone}</span>
              </div>
            )}
            {candidateEmail && (
              <div className="flex items-center gap-2 text-neutral-300 truncate">
                <Mail className="w-3.5 h-3.5 text-[#7CFC00] shrink-0" />
                <span className="truncate">{candidateEmail}</span>
              </div>
            )}
            {profile?.github && (
              <a
                href={profile.github.startsWith('http') ? profile.github : `https://${profile.github}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 text-neutral-300 hover:text-[#7CFC00] transition-colors truncate"
              >
                <Github className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                <span className="truncate">{profile.github}</span>
              </a>
            )}
            {profile?.linkedin && (
              <a
                href={profile.linkedin.startsWith('http') ? profile.linkedin : `https://${profile.linkedin}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 text-neutral-300 hover:text-[#7CFC00] transition-colors truncate"
              >
                <Linkedin className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                <span className="truncate">{profile.linkedin}</span>
              </a>
            )}
          </div>
        </div>

        {/* Close Action */}
        <div className="pt-2 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 rounded-full bg-white/10 hover:bg-white/15 text-xs font-bold text-white transition-colors cursor-pointer"
          >
            Close Dossier
          </button>
        </div>
      </div>
    </div>
  );
};
