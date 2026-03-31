import { type Signal } from './Simulator'
import { Zap, Clock, ExternalLink, MessageSquare, Eye } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface SignalsFeedProps {
  signals: Signal[];
  onSync?: () => void;
}

export const SignalsFeed = ({ signals, onSync }: SignalsFeedProps) => {
  if (signals.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
          <Zap className="text-slate-200 w-8 h-8" />
        </div>
        <h3 className="text-slate-900 font-bold mb-2">No LinkedIn signals detected yet</h3>
        <p className="text-slate-500 text-sm max-w-xs">
          Signals appear when someone views your profile or interacts with your LinkedIn posts.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4 max-w-4xl mx-auto py-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Interaction Intelligence</h2>
          <p className="text-slate-500 text-sm">Real-time intent signals from your LinkedIn ecosystem</p>
        </div>
        <div className="flex gap-4 items-center">
          <div className="hidden md:flex items-center bg-white border border-slate-200 rounded-xl px-3 py-1.5 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all shadow-sm">
            <ExternalLink size={14} className="text-slate-400 mr-2" />
            <input 
              type="text" 
              placeholder="Paste LinkedIn Post URL..." 
              className="bg-transparent border-none outline-none text-[11px] font-bold w-40"
            />
          </div>
          <button 
            onClick={() => onSync?.()}
            className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20 flex items-center gap-2"
          >
            <Zap size={14} />
            Sync LinkedIn
          </button>
          <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-bold border border-blue-100 flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse" />
            Live Monitoring Active
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {signals.map((signal) => (
          <div key={signal.id} className="glass-card p-5 group hover:border-blue-200 transition-all cursor-pointer">
            <div className="flex gap-6">
              <div className="relative">
                <img 
                  src={signal.person_image} 
                  alt={signal.person_name} 
                  className="w-14 h-14 rounded-2xl object-cover ring-2 ring-white/50 group-hover:ring-blue-100 transition-all"
                />
                <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-lg flex items-center justify-center border-2 border-white shadow-sm ${
                  signal.type === 'profile_view' ? 'bg-blue-600 text-white' : 'bg-amber-500 text-white'
                }`}>
                  {signal.type === 'profile_view' ? <Eye size={12} /> : <MessageSquare size={12} />}
                </div>
              </div>

              <div className="flex-1">
                <div className="flex items-start justify-between mb-1">
                  <div>
                    <h4 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors flex items-center gap-2">
                      {signal.person_name}
                      <a href={signal.linkedin_url} target="_blank" rel="noopener noreferrer" className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <ExternalLink size={14} className="text-slate-400 hover:text-blue-600" />
                      </a>
                    </h4>
                    <p className="text-slate-500 text-xs">{signal.person_title} at <span className="font-medium text-slate-700">{signal.person_company}</span></p>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50 px-2 py-1 rounded-lg">
                    <Clock size={10} />
                    {formatDistanceToNow(new Date(signal.timestamp), { addSuffix: true })}
                  </div>
                </div>

                <div className="mt-3 p-3 bg-slate-50/50 rounded-xl border border-slate-100/50">
                  <p className="text-sm font-medium text-slate-700 flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${signal.type === 'profile_view' ? 'bg-blue-400' : 'bg-amber-400'}`} />
                    {signal.interaction_text}
                  </p>
                </div>

                <div className="mt-4 flex gap-4">
                  <button className="text-[11px] font-bold text-blue-600 hover:text-blue-700 uppercase tracking-wider transition-colors">
                    Send Personalized Invite
                  </button>
                  <button className="text-[11px] font-bold text-slate-400 hover:text-slate-600 uppercase tracking-wider transition-colors">
                    View Post Profile
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
