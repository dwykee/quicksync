import React from 'react';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

interface ProfilePageProps {
  user: any;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ user }) => {
  const navigate = useNavigate();
  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Error signing out', error);
    }
  };

  return (
    <div className="min-h-screen bg-background text-slate-800 font-sans p-6 md:p-12 selection:bg-accent selection:text-white flex flex-col items-center justify-center relative">
      <button 
        onClick={() => navigate(-1)}
        className="absolute top-8 left-8 p-3 rounded-full bg-white border border-slate-200 shadow-sm hover:bg-slate-50 transition-colors flex items-center justify-center"
      >
        <span className="material-symbols-outlined text-slate-600">arrow_back</span>
      </button>

      <div className="w-full max-w-md bg-white border border-slate-100 rounded-3xl p-8 shadow-soft-lg flex flex-col items-center text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-accent/20 to-purple-500/20"></div>
        
        <div className="w-24 h-24 rounded-full bg-slate-100 border-4 border-white shadow-md flex items-center justify-center overflow-hidden relative z-10 mb-4 mt-12">
          {user?.photoURL ? (
            <img src={user.photoURL} alt="Profile" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
          ) : (
            <span className="material-symbols-outlined text-4xl text-slate-400">person</span>
          )}
        </div>
        
        <h2 className="text-2xl font-bold text-slate-900 mb-1">{user?.displayName || 'User'}</h2>
        <p className="text-sm text-slate-500 mb-8">{user?.email}</p>

        <div className="w-full flex flex-col gap-3">
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-accent">workspace_premium</span>
              <span className="font-medium text-sm text-slate-700">Current Plan</span>
            </div>
            <span className="text-sm font-bold text-slate-900">Pro</span>
          </div>
          
          <button 
            onClick={handleSignOut}
            className="w-full py-3.5 mt-4 rounded-full font-semibold bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-sm">logout</span>
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};
