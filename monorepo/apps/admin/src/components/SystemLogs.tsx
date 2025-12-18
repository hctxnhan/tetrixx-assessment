import { memo } from "react";
import { Terminal, Clock, Activity, AlertCircle, CheckCircle2 } from "lucide-react";
import { ConnectionStatus as ConnStatus } from "@/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { config } from "@/config";

interface SystemLogsProps {
  connectionStatus: ConnStatus;
  lastPacketTime?: string;
  reconnectionAttempts?: number;
  error?: string | null;
}

export const SystemLogs = memo<SystemLogsProps>(
  ({ connectionStatus, lastPacketTime, reconnectionAttempts = 0, error }) => {
    
    const formatTime = (isoString?: string) => {
        if (!isoString) return "--:--:--";
        return new Date(isoString).toLocaleTimeString();
    }

    return (
      <Card className="h-full border-0 shadow-sm flex flex-col bg-slate-900 text-slate-300 overflow-hidden">
        <CardHeader className="py-3 px-4 border-b border-slate-800 bg-slate-950">
          <CardTitle className="text-sm font-medium flex items-center gap-2 text-slate-100">
            <Terminal size={14} />
            <span>System Events</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 flex-1 overflow-y-auto font-mono text-xs">
            <div className="flex flex-col divide-y divide-slate-800/50">
                {/* Event Item: Status Change */}
                <div className="flex items-start gap-3 p-3 hover:bg-slate-800/30 transition-colors">
                    <div className="mt-0.5">
                        {connectionStatus === 'connected' && <CheckCircle2 size={14} className="text-emerald-500" />}
                        {connectionStatus === 'disconnected' && <Activity size={14} className="text-slate-500" />}
                        {['connecting', 'reconnecting'].includes(connectionStatus) && <Activity size={14} className="text-blue-500 animate-pulse" />}
                        {connectionStatus === 'error' && <AlertCircle size={14} className="text-rose-500" />}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center mb-1">
                            <span className="font-semibold text-slate-200">Connection Status</span>
                            <span className="text-slate-600 text-[10px]">{new Date().toLocaleTimeString()}</span>
                        </div>
                        <p className="text-slate-400">
                             State changed to <span className="text-slate-200 font-medium">{(connectionStatus || 'disconnected').toUpperCase()}</span>
                             {connectionStatus === 'reconnecting' && ` (Attempt ${reconnectionAttempts})`}
                        </p>
                    </div>
                </div>

                 {/* Event Item: Last Packet */}
                 <div className="flex items-start gap-3 p-3 hover:bg-slate-800/30 transition-colors">
                    <div className="mt-0.5">
                         <Clock size={14} className="text-indigo-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center mb-1">
                            <span className="font-semibold text-slate-200">Data Stream</span>
                             <span className="text-slate-600 text-[10px]">{formatTime(lastPacketTime)}</span>
                        </div>
                        <p className="text-slate-400 truncate">
                            Last packet received from <span className="text-indigo-300">{config.sseEndpoint}</span>
                        </p>
                    </div>
                </div>

                {/* Event Item: Errors */}
                {error && (
                    <div className="flex items-start gap-3 p-3 bg-rose-950/10 hover:bg-rose-950/20 transition-colors border-l-2 border-rose-500">
                         <div className="mt-0.5">
                            <AlertCircle size={14} className="text-rose-500" />
                        </div>
                         <div className="flex-1 min-w-0">
                             <div className="flex justify-between items-center mb-1">
                                <span className="font-semibold text-rose-400">System Error</span>
                                <span className="text-rose-400/50 text-[10px]">{new Date().toLocaleTimeString()}</span>
                            </div>
                            <p className="text-rose-300 break-words">
                                {error}
                            </p>
                         </div>
                    </div>
                )}
            </div>
        </CardContent>
      </Card>
    );
  }
);

SystemLogs.displayName = "SystemLogs";
