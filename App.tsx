
import React, { useState, useEffect } from 'react';
import { Language, User, UserRole, ProblemReport, IssueStatus } from './types';
import { translations } from './translations';
import { BENGALURU_WARDS } from './constants';
import { validateCivicIssue } from './geminiService';
import { api } from './api';

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>('en');
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<'landing' | 'auth' | 'main'>('landing');
  const [activeTab, setActiveTab] = useState<string>('home');
  const [authRole, setAuthRole] = useState<UserRole>(UserRole.CITIZEN);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [reports, setReports] = useState<ProblemReport[]>([]);
  const [loadingReports, setLoadingReports] = useState(false);
  
  const t = translations[lang];

  useEffect(() => {
    if (user && view === 'main') {
      loadReports();
    }
  }, [user, view, activeTab]);

  useEffect(() => {
    const loggedUser = localStorage.getItem('fix_my_ward_session');
    if (loggedUser) {
      try {
        const parsed = JSON.parse(loggedUser);
        setUser(parsed);
        setView('main');
      } catch (e) {
        localStorage.removeItem('fix_my_ward_session');
      }
    }
  }, []);

  const loadReports = async () => {
    if (!user) return;
    setLoadingReports(true);
    try {
      let fetched: ProblemReport[] = [];
      if (user.role === UserRole.COUNCILLOR) {
        fetched = await api.getReports(user.wardId);
      } else {
        if (activeTab === 'my_issues') {
          fetched = await api.getReports(undefined, user.id);
        } else if (activeTab === 'feed') {
          fetched = await api.getReports(user.wardId);
        } else {
          // Default to ward reports for home etc.
          fetched = await api.getReports(user.wardId);
        }
      }
      setReports(fetched);
    } catch (err) {
      console.error('Failed to load reports');
    } finally {
      setLoadingReports(false);
    }
  };

  const handleAuthComplete = (loggedInUser: User) => {
    setUser(loggedInUser);
    localStorage.setItem('fix_my_ward_session', JSON.stringify(loggedInUser));
    setView('main');
    setActiveTab('home');
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('fix_my_ward_session');
    setView('landing');
  };

  const addReport = async (reportData: any) => {
    try {
      await api.submitReport(reportData);
      setActiveTab('my_issues');
      // No need to manually call loadReports here as the useEffect handles it based on tab change
    } catch (err) {
      alert("Failed to submit report. Please try again.");
    }
  };

  const verifyReport = async (id: string) => {
    try {
      await api.verifyReport(id);
      loadReports();
    } catch (err) {
      alert("Failed to verify on server.");
    }
  };

  const startAuth = (role: UserRole) => {
    setAuthRole(role);
    setAuthMode('login');
    setView('auth');
  };

  const citizenTabs = [
    { id: 'home', label: "Home", icon: "🏠" },
    { id: 'report', label: "Report Issue", icon: "➕" },
    { id: 'my_issues', label: "My Issues", icon: "📋" },
    { id: 'feed', label: "Ward Feed", icon: "🌐" },
    { id: 'councillor', label: "Councillor", icon: "👤" },
    { id: 'settings', label: "Settings", icon: "⚙️" }
  ];

  const councillorTabs = [
    { id: 'home', label: "Dashboard", icon: "📊" },
    { id: 'pending', label: "Pending Tasks", icon: "🔔" },
    { id: 'resolved', label: "Resolved Cases", icon: "✅" },
    { id: 'feed', label: "Ward Overview", icon: "🌐" },
    { id: 'councillor', label: "Ward Profile", icon: "🏛️" },
    { id: 'settings', label: "Settings", icon: "⚙️" }
  ];

  const currentTabs = user?.role === UserRole.COUNCILLOR ? councillorTabs : citizenTabs;

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-900 font-sans">
      <header className="bg-white/90 backdrop-blur-xl border-b border-slate-200 p-4 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => !user && setView('landing')}>
            <div className={`w-10 h-10 ${user?.role === UserRole.COUNCILLOR ? 'bg-slate-900' : 'bg-blue-600'} rounded-xl flex items-center justify-center text-white font-black text-2xl shadow-lg group-hover:scale-105 transition-transform`}>
              F
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-slate-800 leading-none">{t.title}</h1>
              <p className="text-[9px] uppercase font-black text-slate-400 tracking-[0.2em] mt-1">{t.subtitle}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {user && (
              <div className="hidden md:flex flex-col items-end mr-2">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">
                   {user.role === UserRole.COUNCILLOR ? 'Councillor Access' : 'Citizen Account'}
                </span>
                <span className="text-sm font-bold text-slate-800">{user.name}</span>
              </div>
            )}
            {user && (
              <button onClick={handleLogout} className="p-2.5 rounded-full bg-red-50 text-red-500 hover:bg-red-100 border border-red-100 shadow-sm transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="flex-grow flex flex-col">
        {view === 'landing' && <LandingView onSelectRole={startAuth} t={t} />}
        {view === 'auth' && <AuthView role={authRole} mode={authMode} setMode={setAuthMode} onAuthComplete={handleAuthComplete} onCancel={() => setView('landing')} t={t} />}

        {view === 'main' && user && (
          <div className="flex flex-col md:flex-row flex-grow max-w-7xl w-full mx-auto p-4 md:p-8 gap-8">
            <nav className="w-full md:w-64 shrink-0">
              <div className="bg-white rounded-[2rem] p-4 shadow-xl border border-slate-100 sticky top-24">
                <div className="space-y-2">
                  {currentTabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold text-sm transition-all ${
                        activeTab === tab.id 
                        ? (user.role === UserRole.COUNCILLOR ? 'bg-slate-900 text-white shadow-lg shadow-slate-300' : 'bg-blue-600 text-white shadow-lg shadow-blue-200')
                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                      }`}
                    >
                      <span className="text-xl">{tab.icon}</span>
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>
            </nav>

            <div className="flex-grow">
              {loadingReports && (
                <div className="flex flex-col items-center justify-center py-20 space-y-4">
                  <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <div className="animate-pulse text-slate-400 font-black uppercase tracking-widest text-xs">Accessing Ward Database...</div>
                </div>
              )}
              {!loadingReports && (
                <>
                  {activeTab === 'home' && <HomeDashboard user={user} reports={reports} t={t} />}
                  {activeTab === 'report' && user.role === UserRole.CITIZEN && <CitizenReportForm user={user} t={t} onSuccess={addReport} />}
                  {activeTab === 'my_issues' && user.role === UserRole.CITIZEN && (
                    <CitizenReportList reports={reports} t={t} />
                  )}
                  {activeTab === 'pending' && user.role === UserRole.COUNCILLOR && (
                    <CouncillorTasks reports={reports.filter(r => r.status === IssueStatus.PENDING)} t={t} onVerify={verifyReport} type="pending" />
                  )}
                  {activeTab === 'resolved' && user.role === UserRole.COUNCILLOR && (
                    <CouncillorTasks reports={reports.filter(r => r.status === IssueStatus.VERIFIED)} t={t} onVerify={verifyReport} type="resolved" />
                  )}
                  {activeTab === 'feed' && (
                    <WardFeed reports={reports} t={t} isCouncillor={user.role === UserRole.COUNCILLOR} onVerify={verifyReport} />
                  )}
                  {activeTab === 'councillor' && <CouncillorInfo wardId={user.wardId} t={t} />}
                  {activeTab === 'settings' && <SettingsView lang={lang} setLang={setLang} user={user} t={t} />}
                </>
              )}
            </div>
          </div>
        )}
      </main>

      <footer className="bg-white border-t border-slate-200 py-10">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">&copy; 2024 Bengaluru Community Problem Tracker</p>
        </div>
      </footer>
    </div>
  );
};

// --- Sub-Components ---

const LandingView: React.FC<{ onSelectRole: (r: UserRole) => void; t: any }> = ({ onSelectRole, t }) => (
  <div className="relative flex flex-col items-center justify-center py-20 px-4">
    <div className="absolute inset-0 z-0 opacity-[0.05] pointer-events-none">
       <img src="https://images.unsplash.com/photo-1596422846543-75c6fc18a593?q=80&w=2070&auto=format&fit=crop" alt="Bengaluru Background" className="w-full h-full object-cover" />
    </div>
    <div className="max-w-4xl mx-auto text-center space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 relative z-10">
      <div className="space-y-6">
        <h2 className="text-6xl md:text-8xl font-black text-slate-900 tracking-tighter leading-none">
          Fix My Ward. <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Empower India.</span>
        </h2>
        <p className="text-lg md:text-2xl text-slate-500 font-medium max-w-2xl mx-auto leading-relaxed">
          The official digital channel for Bengaluru citizens to connect with their ward councillor.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-3xl mx-auto">
        <button onClick={() => onSelectRole(UserRole.CITIZEN)} className="group relative p-1 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-[2.5rem] transition-all hover:-translate-y-2 shadow-xl shadow-blue-100">
          <div className="bg-white rounded-[2.4rem] p-10 h-full text-left overflow-hidden relative">
             <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-6 group-hover:scale-110 transition-transform text-2xl">🏠</div>
             <h3 className="text-2xl font-black text-slate-800 mb-2">{t.loginAsCitizen}</h3>
             <p className="text-slate-500 font-medium text-sm">Report civic issues and track them in real-time.</p>
          </div>
        </button>

        <button onClick={() => onSelectRole(UserRole.COUNCILLOR)} className="group relative p-1 bg-slate-900 rounded-[2.5rem] transition-all hover:-translate-y-2 shadow-xl shadow-slate-200">
          <div className="bg-slate-900 rounded-[2.4rem] p-10 h-full text-left overflow-hidden relative border border-slate-800">
             <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform text-2xl">🛡️</div>
             <h3 className="text-2xl font-black text-white mb-2">{t.loginAsCouncillor}</h3>
             <p className="text-slate-400 font-medium text-sm">Official dashboard for problem verification and resolution.</p>
          </div>
        </button>
      </div>
    </div>
  </div>
);

const HomeDashboard: React.FC<{ user: User; reports: ProblemReport[]; t: any }> = ({ user, reports, t }) => {
  const ward = BENGALURU_WARDS.find(w => w.id === user.wardId);
  
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="relative h-72 rounded-[3rem] overflow-hidden shadow-2xl border border-white group">
        <img src="https://images.unsplash.com/photo-1561037404-61cd46aa615b?q=80&w=2070&auto=format&fit=crop" className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" alt="Bengaluru" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/30 to-transparent flex flex-col justify-end p-12">
           <h2 className="text-5xl font-black text-white tracking-tight">Namaskara, {user.name}</h2>
           <div className="flex items-center gap-3 mt-2">
              <span className="w-2 h-2 rounded-full bg-blue-400"></span>
              <p className="text-blue-300 font-bold uppercase tracking-widest text-sm">Ward {ward?.id} • {ward?.name}</p>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-8 bg-white rounded-[2.5rem] shadow-xl border border-slate-100">
           <div className="text-3xl mb-4">🔔</div>
           <h3 className="text-3xl font-black text-slate-800">{reports.filter(r => r.status === IssueStatus.PENDING).length}</h3>
           <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Awaiting Resolution</p>
        </div>
        <div className="p-8 bg-white rounded-[2.5rem] shadow-xl border border-slate-100">
           <div className="text-3xl mb-4">✅</div>
           <h3 className="text-3xl font-black text-green-600">{reports.filter(r => r.status === IssueStatus.VERIFIED).length}</h3>
           <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Successfully Resolved</p>
        </div>
        <div className={`p-8 rounded-[2.5rem] shadow-xl border text-white ${user.role === UserRole.COUNCILLOR ? 'bg-slate-900' : 'bg-blue-600'}`}>
           <div className="text-3xl mb-4">📋</div>
           <h3 className="text-3xl font-black">{reports.length}</h3>
           <p className="text-xs font-black text-white/70 uppercase tracking-widest">{user.role === UserRole.COUNCILLOR ? 'Total Ward Reports' : 'Reports Viewable'}</p>
        </div>
      </div>
    </div>
  );
};

const AuthView: React.FC<{ 
  role: UserRole; 
  mode: 'login' | 'signup'; 
  setMode: (m: 'login' | 'signup') => void;
  onAuthComplete: (u: User) => void; 
  onCancel: () => void;
  t: any 
}> = ({ role, mode, setMode, onAuthComplete, onCancel, t }) => {
  const [formData, setFormData] = useState({ name: '', phone: '', password: '', wardId: '151' });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (mode === 'signup') {
        const user = await api.signup({ ...formData, role });
        onAuthComplete(user);
      } else {
        const user = await api.login({ phone: formData.phone, password: formData.password, role });
        onAuthComplete(user);
      }
    } catch (err: any) {
      setError(err.message || "Authentication failed. Please check your inputs.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-grow flex items-center justify-center p-4 py-20">
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 bg-white rounded-[3rem] shadow-2xl border border-slate-100 overflow-hidden">
        <div className={`p-16 text-white flex flex-col justify-between relative overflow-hidden ${role === UserRole.COUNCILLOR ? 'bg-slate-900' : 'bg-blue-600'}`}>
          <img src="https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=1000&auto=format&fit=crop" className="absolute inset-0 w-full h-full object-cover opacity-20" alt="Meetings" />
          <div className="relative z-10">
            <button onClick={onCancel} className="flex items-center gap-2 font-bold text-sm opacity-70 hover:opacity-100 transition-all mb-12">← Back</button>
            <h2 className="text-5xl font-black mb-4 tracking-tighter leading-tight">{mode === 'login' ? 'Welcome Back' : 'Create Account'}</h2>
            <p className="font-black uppercase tracking-widest text-xs opacity-70">{role === UserRole.COUNCILLOR ? "Official Ward Portal" : "Public Community Access"}</p>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="p-16 space-y-6">
          {error && <div className="p-4 bg-red-50 text-red-600 text-xs font-black rounded-2xl border border-red-100">{error}</div>}
          {mode === 'signup' && (
            <input type="text" placeholder="Full Name" required className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold focus:ring-4 focus:ring-blue-100 outline-none" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
          )}
          <input type="tel" placeholder="Phone Number" required className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
          <input type="password" placeholder="Password" required className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
          <select className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none" value={formData.wardId} onChange={e => setFormData({...formData, wardId: e.target.value})}>
            {BENGALURU_WARDS.map(w => <option key={w.id} value={w.id}>{w.id} - {w.name}</option>)}
          </select>
          <button type="submit" disabled={loading} className={`w-full py-5 rounded-[1.8rem] font-black text-sm uppercase tracking-[0.2em] shadow-xl text-white transition-all active:scale-95 disabled:opacity-50 ${role === UserRole.COUNCILLOR ? 'bg-slate-900' : 'bg-blue-600'}`}>
            {loading ? 'Processing...' : (mode === 'login' ? 'Login' : 'Sign Up')}
          </button>
          <div className="text-center">
            <button type="button" onClick={() => setMode(mode === 'login' ? 'signup' : 'login')} className="text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors">{mode === 'login' ? "Need an account? Sign up" : "Have an account? Login"}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const CitizenReportForm: React.FC<{ user: User; t: any; onSuccess: (r: any) => void }> = ({ user, t, onSuccess }) => {
  const [desc, setDesc] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!image || !desc) return;
    setLoading(true);
    setError(null);
    try {
      const val = await validateCivicIssue(image, desc);
      if (!val.isValid) {
        setError(val.reason);
        setLoading(false);
        return;
      }
      await onSuccess({
        userId: user.id, userName: user.name, userPhone: user.phone, wardId: user.wardId,
        description: desc, image, aiVerificationReason: val.reason
      });
      setDesc('');
      setImage(null);
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-right-4">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center text-2xl shadow-sm">➕</div>
        <h2 className="text-3xl font-black text-slate-800">Report an Issue</h2>
      </div>
      <div className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-slate-100">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="aspect-video border-2 border-dashed border-slate-200 rounded-[2rem] flex flex-col items-center justify-center bg-slate-50 relative overflow-hidden cursor-pointer group hover:bg-slate-100 transition-colors">
            {image ? <img src={image} className="w-full h-full object-cover" /> : (
              <div className="text-center p-6">
                <div className="text-4xl mb-4 grayscale group-hover:grayscale-0 transition-all">📸</div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Select Image to Upload</p>
              </div>
            )}
            <input type="file" accept="image/*" onChange={e => {
              const file = e.target.files?.[0];
              if (file) {
                const r = new FileReader();
                r.onloadend = () => setImage(r.result as string);
                r.readAsDataURL(file);
              }
            }} className="absolute inset-0 opacity-0 cursor-pointer" />
          </div>
          <textarea placeholder="Describe the problem accurately (e.g. Garbage piling at main road junction)..." required className="w-full p-8 bg-slate-50 border border-slate-200 rounded-[2rem] font-bold min-h-[160px] outline-none focus:ring-4 focus:ring-blue-100 transition-all" value={desc} onChange={e => setDesc(e.target.value)} />
          {loading ? (
            <div className="p-8 bg-blue-50 rounded-[2rem] border border-blue-100 flex flex-col items-center gap-4 animate-pulse">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs font-black text-blue-700 tracking-widest uppercase">AI is Analyzing Validity...</p>
            </div>
          ) : 
           error ? (
             <div className="p-6 bg-red-50 text-red-600 rounded-[2rem] border border-red-100 flex items-start gap-4">
               <span className="text-xl">⚠️</span>
               <p className="font-bold text-sm">{error}</p>
             </div>
           ) : (
           <button type="submit" disabled={!image || !desc} className="w-full bg-slate-900 text-white py-6 rounded-[2rem] font-black uppercase tracking-[0.2em] shadow-xl hover:bg-black transition-all active:scale-95 disabled:opacity-30">Submit to Ward Server</button>
          )}
        </form>
      </div>
    </div>
  );
};

const CitizenReportList: React.FC<{ reports: ProblemReport[]; t: any }> = ({ reports, t }) => (
  <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 bg-slate-100 text-slate-600 rounded-xl flex items-center justify-center text-2xl shadow-sm">📋</div>
      <h2 className="text-3xl font-black text-slate-800">My Reports</h2>
    </div>
    {reports.length === 0 ? (
      <div className="bg-white rounded-[3rem] border border-slate-200 p-24 text-center space-y-6">
        <p className="text-xl font-black text-slate-300 uppercase tracking-widest">{t.noReports}</p>
      </div>
    ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {reports.map(r => <ReportCard key={r.id} report={r} t={t} isCitizenView={true} />)}
      </div>
    )}
  </div>
);

const CouncillorTasks: React.FC<{ reports: ProblemReport[]; t: any; onVerify: (id: string) => void; type: 'pending' | 'resolved' }> = ({ reports, t, onVerify, type }) => (
  <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
    <div className="flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-sm ${type === 'pending' ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'}`}>
        {type === 'pending' ? '🔔' : '✨'}
      </div>
      <h2 className="text-3xl font-black text-slate-800">{type === 'pending' ? 'Pending Actions' : 'Resolved Archive'}</h2>
    </div>
    {reports.length === 0 ? (
      <div className="bg-white rounded-[3rem] border border-slate-200 p-24 text-center">
        <p className="text-xl font-black text-slate-300 uppercase tracking-widest">No reports in this category</p>
      </div>
    ) : (
      <div className="grid grid-cols-1 gap-8">
        {reports.map(r => <ReportCard key={r.id} report={r} t={t} isCouncillor={true} onVerify={() => onVerify(r.id)} />)}
      </div>
    )}
  </div>
);

const WardFeed: React.FC<{ reports: ProblemReport[]; t: any; isCouncillor: boolean; onVerify: (id: string) => void }> = ({ reports, t, isCouncillor, onVerify }) => (
  <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center text-2xl shadow-lg">🌐</div>
      <h2 className="text-3xl font-black text-slate-800">Community Ward Feed</h2>
    </div>
    <div className="grid grid-cols-1 gap-8">
      {reports.map(r => <ReportCard key={r.id} report={r} t={t} isCouncillor={isCouncillor} onVerify={() => onVerify(r.id)} />)}
    </div>
  </div>
);

const CouncillorInfo: React.FC<{ wardId: string; t: any }> = ({ wardId, t }) => {
  const ward = BENGALURU_WARDS.find(w => w.id === wardId);
  return (
    <div className="max-w-4xl mx-auto p-12 bg-white rounded-[3rem] shadow-xl border border-slate-100 animate-in fade-in slide-in-from-bottom-4">
       <div className="flex items-center gap-8 mb-10">
          <div className="w-24 h-24 bg-slate-900 rounded-[2rem] flex items-center justify-center text-5xl shadow-xl">👤</div>
          <div>
            <h2 className="text-5xl font-black text-slate-800 leading-none">{ward?.councillorName}</h2>
            <p className="font-black text-blue-600 uppercase tracking-widest mt-2">Ward {wardId} Representative • {ward?.party}</p>
          </div>
       </div>
       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100">
             <p className="text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest">Office Name</p>
             <p className="font-bold text-xl text-slate-800">{ward?.name} Ward Office</p>
          </div>
          <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100">
             <p className="text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest">Official Support</p>
             <p className="font-bold text-xl text-slate-800">+91 080 2234 5678</p>
          </div>
       </div>
    </div>
  );
};

const SettingsView: React.FC<{ lang: Language, setLang: (l: Language) => void, user: User, t: any }> = ({ lang, setLang, user, t }) => (
  <div className="max-w-4xl mx-auto bg-white p-12 rounded-[3rem] shadow-xl border border-slate-100 animate-in fade-in slide-in-from-right-4">
     <h2 className="text-3xl font-black text-slate-800 mb-10">System Preferences</h2>
     <div className="space-y-12">
        <section>
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Choose Interface Language</p>
          <div className="flex flex-wrap gap-4">
            {['en', 'hi', 'kn'].map(l => (
              <button key={l} onClick={() => setLang(l as Language)} className={`px-10 py-5 rounded-2xl font-black uppercase text-xs tracking-widest transition-all ${lang === l ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}>
                {l === 'en' ? 'English' : l === 'hi' ? 'Hindi' : 'Kannada'}
              </button>
            ))}
          </div>
        </section>

        <section className="pt-10 border-t border-slate-100">
           <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Account Information</p>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                 <p className="text-[10px] font-black text-slate-400 mb-1">PHONE NUMBER</p>
                 <p className="font-bold text-slate-800">{user.phone}</p>
              </div>
              <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                 <p className="text-[10px] font-black text-slate-400 mb-1">ASSIGNED WARD</p>
                 <p className="font-bold text-slate-800">{user.wardId} - {BENGALURU_WARDS.find(w => w.id === user.wardId)?.name}</p>
              </div>
           </div>
        </section>
     </div>
  </div>
);

const ReportCard: React.FC<{ report: ProblemReport; t: any; isCouncillor?: boolean; isCitizenView?: boolean; onVerify?: () => void }> = ({ report, t, isCouncillor, isCitizenView, onVerify }) => (
  <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden flex flex-col md:flex-row transition-all hover:shadow-2xl group">
    <div className="md:w-2/5 h-80 md:h-auto overflow-hidden bg-slate-100 relative">
      <img src={report.image} className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105" alt="Issue" />
      <div className="absolute top-6 left-6">
        <span className={`px-5 py-2 text-[10px] font-black tracking-widest uppercase rounded-full shadow-2xl border backdrop-blur-md ${report.status === IssueStatus.VERIFIED ? 'bg-green-600/90 text-white border-green-400' : 'bg-orange-600/90 text-white border-orange-400'}`}>
          {report.status === IssueStatus.VERIFIED ? 'Verified Complete' : 'Under Investigation'}
        </span>
      </div>
    </div>
    <div className="md:w-3/5 p-10 flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-start mb-4">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Report ID: {report.id}</p>
          {report.aiVerificationReason && <div className="text-lg" title="AI Validated">🤖</div>}
        </div>
        <p className="text-2xl font-black text-slate-800 leading-tight mb-8">"{report.description}"</p>
        
        {isCouncillor && (
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-6 flex items-center gap-3">
             <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-xs shadow-sm">👤</div>
             <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Reporter</p>
                <p className="text-xs font-bold text-slate-700">{report.userName}</p>
             </div>
          </div>
        )}
      </div>

      <div className="mt-4">
        {isCouncillor && report.status === IssueStatus.PENDING && (
          <button onClick={onVerify} className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-black transition-all active:scale-95">Confirm Resolution</button>
        )}
        {report.status === IssueStatus.VERIFIED && (
          <div className="flex items-center gap-4 bg-green-50 p-6 rounded-[1.8rem] border border-green-100 text-green-700 font-bold">
             <div className="text-2xl">✨</div>
             <div>
                <p className="text-xs uppercase tracking-widest">Problem Resolved</p>
                <p className="text-[10px] text-green-600/70 font-medium">Verified by Councillor Office</p>
             </div>
          </div>
        )}
      </div>
    </div>
  </div>
);

export default App;
