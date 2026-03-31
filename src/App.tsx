import { useEffect, useState, useMemo } from 'react'
import { supabase } from './lib/supabase'
import { 
  Users, 
  Activity, 
  TrendingUp, 
  Zap, 
  Search, 
  LayoutDashboard, 
  Globe, 
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Bell,
  ArrowRight
} from 'lucide-react'
import { SignalsFeed } from './components/SignalsFeed'
import { Simulator, type Lead, type Signal } from './components/Simulator'

type TabType = 'Overview' | 'Revealed' | 'Activity' | 'Signals';

function App() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [signals, setSignals] = useState<Signal[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('Overview');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchLeads();
    fetchSignals();

    const leadsChannel = supabase
      .channel('leads-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'visitor_leads' }, () => {
        fetchLeads();
      })
      .subscribe();

    const signalsChannel = supabase
      .channel('signals-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'signals' }, () => {
        fetchSignals();
      })
      .subscribe();

    return () => { 
      supabase.removeChannel(leadsChannel);
      supabase.removeChannel(signalsChannel);
    };
  }, []);

  const fetchLeads = async () => {
    try {
      const { data, error } = await supabase
        .from('visitor_leads')
        .select('*')
        .order('last_seen', { ascending: false });

      if (!error && data) setLeads(data);
    } catch (err) {
      console.error('Failed to fetch leads:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSignals = async () => {
    try {
      const { data, error } = await supabase
        .from('signals')
        .select('*')
        .order('timestamp', { ascending: false });

      if (!error && data) setSignals(data);
    } catch (err) {
      console.error('Failed to fetch signals:', err);
    }
  };

  const syncSignals = () => {
    // Open instructions for the LinkedIn Bookmarklet sync
    window.alert("To sync LinkedIn signals: \n1. Drag the 'LinkedIn Sync' bookmarklet from your settings to your bookmarks bar.\n2. Navigate to your 'Who viewed your profile' page on LinkedIn.\n3. Click the bookmarklet to sync instantly.");
  };

  const filteredLeads = useMemo(() => {
    return leads.filter(l => 
      l.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.company_name?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [leads, searchQuery]);

  return (
    <div className="flex min-h-screen bg-[#f8fafc] text-slate-900 bg-grid">
      {/* Sidebar */}
      <aside className="w-72 border-r border-slate-200/60 bg-white/40 backdrop-blur-3xl p-8 flex flex-col hidden lg:flex fixed h-full z-20">
        <div className="flex items-center gap-3 mb-12">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
            <Zap className="text-white w-6 h-6 fill-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">Executive <span className="text-blue-600">Reveal</span></span>
        </div>

        <nav className="space-y-2 flex-1">
          <NavItem 
            icon={<LayoutDashboard size={20} />} 
            label="Overview" 
            active={activeTab === 'Overview'} 
            onClick={() => setActiveTab('Overview')}
          />
          <NavItem 
            icon={<Users size={20} />} 
            label="Revealed Leads" 
            active={activeTab === 'Revealed'} 
            onClick={() => setActiveTab('Revealed')}
          />
          <NavItem 
            icon={<Activity size={20} />} 
            label="Live Activity" 
            active={activeTab === 'Activity'} 
            onClick={() => setActiveTab('Activity')}
          />
          <NavItem 
            icon={<ShieldCheck size={20} />} 
            label="Signals Feed" 
            active={activeTab === 'Signals'} 
            onClick={() => setActiveTab('Signals')}
          />
        </nav>

        <div className="p-6 bg-blue-50/50 rounded-3xl border border-blue-100">
          <div className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-2">Live Status</div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm font-medium text-blue-900">System Active</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-72 p-8 md:p-12">
        <header className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Sales Command Center</h1>
            <p className="text-slate-500 mt-1 font-medium">Monitoring jwaiconsulting.com in real-time.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className={`flex items-center bg-white border border-slate-200 rounded-2xl px-4 py-2 transition-all ${searchQuery ? 'ring-2 ring-blue-500/20 border-blue-500/50' : ''}`}>
              <Search size={18} className="text-slate-400 mr-2" />
              <input 
                type="text" 
                placeholder="Search leads..." 
                className="bg-transparent border-none outline-none text-sm font-medium w-48"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-blue-600 transition-colors shadow-sm relative group">
              <Bell size={20} />
              <div className="absolute top-3 right-3 w-2 h-2 bg-red-500 rounded-full border-2 border-white group-hover:animate-ping" />
            </button>
          </div>
        </header>

        {activeTab === 'Overview' && (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              <StatCard icon={<Users className="text-blue-600" />} label="Total Leads" value={leads.length.toString()} trend="+12% this week" />
              <StatCard icon={<TrendingUp className="text-green-600" />} label="High Intent" value={leads.filter(l => l.intent_score > 50).length.toString()} trend="+5% since yesterday" />
              <StatCard icon={<Activity className="text-purple-600" />} label="Avg. Dwell" value="4m 24s" trend="-2s" />
              <StatCard icon={<Globe className="text-sky-500" />} label="Active Now" value="3" trend="Live traffic" />
            </div>

            {/* Lead Feed */}
            <div className="grid grid-cols-1 gap-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold tracking-tight text-slate-900">Recently Revealed Visitors</h2>
                <button 
                  onClick={() => setActiveTab('Revealed')}
                  className="text-sm font-bold text-blue-600 hover:underline flex items-center gap-1 group"
                >
                  View all leads <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

              <LeadList leads={filteredLeads.slice(0, 5)} loading={loading} />
            </div>
          </>
        )}

        {activeTab === 'Revealed' && (
          <div className="animate-fade-in">
             <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
                <Users className="text-blue-600" />
                Revealed Leads database
              </h2>
              <div className="text-sm font-medium text-slate-500">Showing {filteredLeads.length} total profiles</div>
            </div>
            <LeadList leads={filteredLeads} loading={loading} />
          </div>
        )}

        {activeTab === 'Activity' && (
          <div className="glass-card p-12 text-center flex flex-col items-center animate-fade-in">
            <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center mb-6">
              <Activity className="text-purple-600 w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">Live Activity Stream</h2>
            <p className="text-slate-500 max-w-sm mb-8">Real-time session analysis and page-level intent tracking will appear here.</p>
            <div className="w-full max-w-2xl space-y-4 text-left">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100 opacity-50">
                  <div className="w-2 h-10 bg-slate-200 rounded-full" />
                  <div className="flex-1">
                    <div className="h-4 bg-slate-200 rounded w-1/3 mb-2" />
                    <div className="h-3 bg-slate-200 rounded w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'Signals' && (
          <SignalsFeed signals={signals} onSync={syncSignals} />
        )}
      </main>

      <Simulator 
        onNewLead={(newLead) => setLeads(prev => [newLead, ...prev])} 
        onNewSignal={(newSignal) => setSignals(prev => [newSignal, ...prev])}
      />
    </div>
  )
}

const NavItem = ({ icon, label, active = false, onClick }: { icon: React.ReactNode, label: string, active?: boolean, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl transition-all duration-300 font-bold text-sm ${active ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20 translate-x-2' : 'text-slate-400 hover:bg-blue-50/50 hover:text-blue-600'}`}
  >
    {icon}
    {label}
  </button>
)

const StatCard = ({ icon, label, value, trend }: { icon: React.ReactNode, label: string, value: string, trend: string }) => (
  <div className="glass-card p-8 flex flex-col justify-between">
    <div className="flex justify-between items-start mb-6">
      <div className="p-3 bg-white border border-slate-200 rounded-2xl shadow-sm text-slate-600">
        {icon}
      </div>
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{trend}</span>
    </div>
    <div>
      <div className="text-3xl font-bold tracking-tight text-slate-900 mb-1">{value}</div>
      <div className="text-sm font-medium text-slate-500">{label}</div>
    </div>
  </div>
)

const LeadList = ({ leads, loading }: { leads: Lead[], loading: boolean }) => (
  <div className="space-y-4">
    {loading ? (
      <div className="glass-card p-12 text-center text-slate-400 flex flex-col items-center gap-3">
        <Loader2 className="animate-spin text-blue-600" />
        Syncing lead intelligence...
      </div>
    ) : leads.length === 0 ? (
      <div className="glass-card p-20 text-center flex flex-col items-center">
        <Search className="w-12 h-12 text-slate-300 mb-4" />
        <h3 className="text-lg font-bold text-slate-600">No leads found</h3>
        <p className="text-slate-400 text-sm max-w-xs mt-1">Try adjusting your search or wait for new visitors.</p>
      </div>
    ) : (
      leads.map((lead) => (
        <LeadRow key={lead.id} lead={lead} />
      ))
    )}
  </div>
)

const LeadRow = ({ lead }: { lead: Lead }) => (
  <div className="glass-card p-6 md:p-8 flex flex-col md:flex-row items-center gap-8 glass-card-hover group animate-slide-up">
    {/* Lead Info */}
    <div className="flex items-center gap-6 flex-1 w-full">
      <div className="relative">
        <div className="w-20 h-20 bg-blue-50 rounded-[2rem] flex items-center justify-center border border-blue-100 overflow-hidden shadow-inner">
          {lead.profile_image_url ? (
            <img src={lead.profile_image_url} alt="" className="w-full h-full object-cover" />
          ) : (
            <Users className="text-blue-200 w-8 h-8" />
          )}
        </div>
        <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-white rounded-full flex items-center justify-center border border-slate-100 shadow-lg text-[#0a66c2]">
          <Activity size={14} fill="currentColor" />
        </div>
      </div>

      <div className="flex-1">
        <div className="flex items-center gap-3 mb-1">
          <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors uppercase tracking-tight">{lead.full_name}</h3>
          {lead.intent_score > 50 && (
            <span className="px-2 py-0.5 bg-green-50 text-green-600 text-[10px] font-bold rounded-lg border border-green-100 uppercase tracking-wider">Hot Lead</span>
          )}
        </div>
        <p className="text-slate-500 font-medium text-sm mb-4">
          {lead.job_title} <span className="mx-2 text-slate-300">|</span> <span className="text-slate-900 font-bold">{lead.company_name}</span>
        </p>
        
        <div className="flex items-center gap-4">
          <LeadBadge icon={<Globe size={12} />} label={lead.company_domain || lead.ip_address} />
          <LeadBadge icon={<Activity size={12} />} label={`${lead.visit_count} sessions`} />
        </div>
      </div>
    </div>

    {/* Intent Graph */}
    <div className="w-full md:w-48 bg-slate-50 rounded-2xl p-4 border border-slate-100 hidden sm:block">
      <div className="flex justify-between items-end h-8 gap-1 mb-2">
        {[40, 70, 45, 90, 65, 80].map((h, i) => (
          <div key={i} className={`flex-1 rounded-sm transition-all duration-1000 ${i === 3 ? 'bg-blue-600' : 'bg-blue-200'}`} style={{ height: `${h}%` }} />
        ))}
      </div>
      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Intent Score: {lead.intent_score}%</div>
    </div>

    {/* Actions */}
    <div className="flex items-center gap-3 w-full md:w-auto">
      {lead.linkedin_url ? (
        <a 
          href={lead.linkedin_url} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="flex-1 md:flex-none px-6 py-3 bg-[#0a66c2] text-white text-xs font-bold rounded-2xl hover:bg-[#004182] transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/10"
        >
          LinkedIn <ExternalLink size={14} />
        </a>
      ) : (
        <button className="flex-1 md:flex-none px-6 py-3 bg-slate-100 text-slate-400 text-xs font-bold rounded-2xl cursor-not-allowed">Profile Pending</button>
      )}
      <button className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-blue-600 transition-colors shadow-sm">
        <ChevronRight size={18} />
      </button>
    </div>
  </div>
)

const LeadBadge = ({ icon, label }: { icon: React.ReactNode, label: string }) => (
  <div className="flex items-center gap-2 px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-500 shadow-sm">
    <span className="text-blue-600 opacity-70">{icon}</span>
    {label}
  </div>
)

const Loader2 = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M12 2v4" />
    <path d="m16.2 7.8 2.9-2.9" />
    <path d="M18 12h4" />
    <path d="m16.2 16.2 2.9 2.9" />
    <path d="M12 18v4" />
    <path d="m4.9 19.1 2.9-2.9" />
    <path d="M2 12h4" />
    <path d="m4.9 4.9 2.9 2.9" />
  </svg>
)

export default App
