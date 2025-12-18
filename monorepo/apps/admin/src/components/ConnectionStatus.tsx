import { useEffect, useState, memo } from 'react';
import { Wifi, WifiOff, RefreshCw, Server, Clock, Power, PowerOff } from 'lucide-react';
import { ConnectionStatus as ConnStatus } from '@/types';
import { Button } from '@/components/ui/button';
import { apiBaseUrl } from '@/config';

interface ConnectionStatusProps {
  status: ConnStatus;
  connectionCount?: number;
  reconnectionAttempts?: number;
  error?: string | null;
  lastPing?: string;
  onReconnect?: () => void;
  onDisconnect?: () => void;
}

export const ConnectionStatus = memo<ConnectionStatusProps>(({
  status,
  connectionCount,
  reconnectionAttempts = 0,
  error,
  lastPing,
  onReconnect,
  onDisconnect,
}) => {
  const [localConnectionCount, setLocalConnectionCount] = useState<number>(0);

  useEffect(() => {
    const fetchConnectionCount = async () => {
      try {
        const response = await fetch(`${apiBaseUrl}/status`);
        if (response.ok) {
          const data = await response.json();
          setLocalConnectionCount(data.connections || 0);
        }
      } catch (err) {
        console.error('Failed to fetch connection count:', err);
      }
    };

    if (status === 'connected') {
      fetchConnectionCount();
      const interval = setInterval(fetchConnectionCount, 5000);
      return () => clearInterval(interval);
    }
  }, [status]);

  const getStatusConfig = () => {
    switch (status) {
      case 'connected':
        return {
          color: 'text-emerald-600',
          dotColor: 'bg-emerald-500',
          bgColor: 'bg-white/90',
          borderColor: 'border-emerald-100',
          icon: Wifi,
          label: 'System Online'
        };
      case 'connecting':
      case 'reconnecting':
        return {
          color: 'text-blue-600',
          dotColor: 'bg-blue-500',
          bgColor: 'bg-white/90',
          borderColor: 'border-blue-100',
          icon: RefreshCw,
          spin: true,
          label: status === 'reconnecting' ? 'Reconnecting...' : 'Connecting...'
        };
      case 'disconnected':
        return {
          color: 'text-slate-500',
          dotColor: 'bg-slate-400',
          bgColor: 'bg-slate-50/90',
          borderColor: 'border-slate-200',
          icon: WifiOff,
          label: 'Disconnected'
        };
      case 'error':
        return {
          color: 'text-rose-600',
          dotColor: 'bg-rose-500',
          bgColor: 'bg-white/90',
          borderColor: 'border-rose-100',
          icon: WifiOff,
          label: 'Error'
        };
      default:
        return {
          color: 'text-slate-500',
          dotColor: 'bg-slate-400',
          bgColor: 'bg-slate-50/90',
          borderColor: 'border-slate-200',
          icon: WifiOff,
          label: 'Unknown'
        };
    }
  };

  const config = getStatusConfig();
  return (
    <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 px-5 py-3 rounded-full border shadow-2xl backdrop-blur-md transition-all duration-300 ${config.bgColor} ${config.borderColor}`}>
      
      {/* Status Section */}
      <div className="flex items-center gap-3">
        <div className="relative flex items-center justify-center">
            {status === 'connected' && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            )}
            <span className={`relative inline-flex rounded-full h-3 w-3 ${config.dotColor}`}></span>
        </div>
        <div className="flex flex-col">
            <span className={`text-sm font-bold ${config.color} leading-none`}>
                {config.label}
            </span>
             {status === 'reconnecting' && (
                 <span className="text-[10px] text-slate-500 font-medium mt-1">
                    Attempt {reconnectionAttempts}/5
                 </span>
             )}
        </div>
      </div>

      {/* Divider */}
      <div className="h-8 w-px bg-slate-200 mx-1"></div>

      {/* Last Update Section */}
      <div className="flex items-center gap-2 text-slate-600 min-w-[140px]">
          <Clock size={16} className="text-slate-400" />
          <div className="flex flex-col">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Last Update</span>
              <span className="text-xs font-mono font-medium">
                  {lastPing ? new Date(lastPing).toLocaleTimeString() : '--:--:--'}
              </span>
          </div>
      </div>

       {/* Divider */}
       <div className="h-8 w-px bg-slate-200 mx-1"></div>

      {/* Actions Section */}
      <div>
         {status === 'disconnected' && onReconnect && (
            <Button 
                size="sm" 
                onClick={onReconnect} 
                className="rounded-full h-9 px-4 bg-slate-900 hover:bg-slate-800 text-white shadow-md hover:shadow-lg transition-all"
            >
              <Power size={14} className="mr-2" />
              Reconnect
            </Button>
          )}
           {status === 'connected' && onDisconnect && (
            <Button 
                size="sm" 
                variant="ghost" 
                onClick={onDisconnect} 
                className="rounded-full h-9 px-4 text-rose-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
            >
              <PowerOff size={14} className="mr-2" />
              Disconnect
            </Button>
          )}
          {['connecting', 'reconnecting'].includes(status) && (
               <Button size="sm" disabled variant="ghost" className="rounded-full h-9 px-4 bg-slate-100 text-slate-400">
                  <RefreshCw size={14} className="mr-2 animate-spin" />
                  Please wait
               </Button>
          )}
      </div>

      {error && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-sm">
             <div className="bg-rose-600 text-white text-xs px-3 py-1.5 rounded-lg shadow-lg">
                {error}
             </div>
             <div className="w-2 h-2 bg-rose-600 rotate-45 absolute left-1/2 -translate-x-1/2 -bottom-1"></div>
        </div>
      )}
    </div>
  );
});

ConnectionStatus.displayName = 'ConnectionStatus';