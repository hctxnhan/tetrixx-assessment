import { ConnectionStatus } from "@/components/ConnectionStatus";
import { MetricCard } from "@/components/MetricCard";
import { PlayPauseButton } from "@/components/PlayPauseButton";
import { RealTimeChart } from "@/components/RealTimeChart";
import { SystemLogs } from "@/components/SystemLogs";
import { ThresholdInput } from "@/components/ThresholdInput";
import { useStockMonitor } from "@/hooks/useStockMonitor";
import { useState, useMemo } from "react";
import {
  LayoutDashboard,
  LineChart,
  Settings,
  Users,
  Bell,
  Search,
  Menu,
  Wallet,
  PieChart,
  LogOut,
  ChevronDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

function App() {
  const [threshold, setThreshold] = useState(500);
  const [isPaused, setIsPaused] = useState(false);

  const {
    displayData: throttledData,
    currentValue,
    status,
    error,
    retryCount,
    reconnect,
    disconnect,
  } = useStockMonitor(isPaused);

  const isThresholdBreached = currentValue > threshold;
  const lastPacket = throttledData.length > 0 ? throttledData[throttledData.length - 1] : undefined;

  const handlePauseToggle = () => {
    setIsPaused((prev) => !prev);
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white text-slate-400 border-r border-slate-200 opacity-10 pointer-events-none select-none grayscale">
        <div className="h-16 flex items-center px-6 border-b border-slate-100">
           <div className="flex items-center gap-3 text-slate-900 font-bold text-lg">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <LineChart className="w-5 h-5 text-white" />
            </div>
            <span>FinDash</span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
            Main Menu
          </div>
          <Button variant="ghost" className="w-full justify-start gap-3 bg-slate-100 text-slate-900 hover:bg-slate-200 transition-colors">
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-3 hover:bg-slate-100 transition-colors">
            <Wallet className="w-4 h-4" />
            Portfolio
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-3 hover:bg-slate-100 transition-colors">
            <PieChart className="w-4 h-4" />
            Analytics
          </Button>
           <Button variant="ghost" className="w-full justify-start gap-3 hover:bg-slate-100 transition-colors">
            <Users className="w-4 h-4" />
            Team
          </Button>
          
           <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-400 mt-6 mb-2">
            Preferences
          </div>
           <Button variant="ghost" className="w-full justify-start gap-3 hover:bg-slate-100 transition-colors">
            <Settings className="w-4 h-4" />
            Settings
          </Button>
        </nav>

        <div className="p-4 border-t border-slate-100">
          <Button variant="ghost" className="w-full justify-start gap-3 text-rose-500 hover:bg-rose-50">
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col h-full min-w-0 bg-slate-50/50">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shadow-sm z-10 opacity-10 pointer-events-none select-none grayscale">
          <div className="flex items-center gap-4 w-1/3">
             <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="w-5 h-5" />
            </Button>
            <div className="relative w-full max-w-md hidden sm:block">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search stocks, indices, or markets..."
                className="w-full bg-slate-100 border-transparent focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 pl-10 pr-4 py-2 rounded-lg text-sm transition-all outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="relative text-slate-500 hover:text-slate-700">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
            </Button>
            <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
               <div className="text-right hidden md:block">
                  <p className="text-sm font-semibold text-slate-700">Admin User</p>
                  <p className="text-xs text-slate-500">Administrator</p>
               </div>
               <div className="h-9 w-9 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold text-sm shadow-sm ring-2 ring-white">
                AD
              </div>
               <ChevronDown className="w-4 h-4 text-slate-400 hidden md:block cursor-pointer" />
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 overflow-y-auto p-6 pb-30 scroll-smooth">
          <div className="max-w-400 mx-auto space-y-6">
            
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Market Overview</h1>
                <p className="text-slate-500 text-sm mt-1">Real-time monitoring of key financial indicators</p>
              </div>
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <MetricCard
                title="Current Price"
                value={currentValue}
                unit="$"
                isAlert={isThresholdBreached}
                description="Live USD Market Price"
              />
               
               {/* Placeholders for other metrics to make the dashboard look complete */}
               <div className="opacity-10 grayscale pointer-events-none select-none">
                <MetricCard
                  title="24h Volume"
                  value={1245930}
                  unit="$"
                  trend="up"
                  description="Total Traded Volume"
                />
               </div>
               <div className="opacity-10 grayscale pointer-events-none select-none">
                 <MetricCard
                  title="Market Cap"
                  value={85.4}
                  unit="$"
                  description="in Billions"
                />
               </div>
               <div className="opacity-10 grayscale pointer-events-none select-none">
                 <MetricCard
                  title="PE Ratio"
                  value={24.8}
                  unit=""
                  trend="stable"
                  description="Trailing Twelve Months"
                />
               </div>
            </div>

            {/* Main Chart Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:h-[500px]">
              
              {/* Chart Container */}
              <Card className="lg:col-span-2 flex flex-col shadow-sm border-slate-200 min-w-0 h-[400px] lg:h-auto">
                <CardHeader className="flex flex-row items-center justify-between py-4 px-6 border-b border-slate-100">
                  <div className="flex items-center gap-4">
                    <CardTitle className="text-base font-semibold text-slate-800">Price Movement</CardTitle>
                    {isThresholdBreached && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-100 text-rose-800 animate-pulse">
                        Threshold Exceeded
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                     <PlayPauseButton
                        isPaused={isPaused}
                        isDisabled={status !== "connected"}
                        onToggle={handlePauseToggle}
                      />
                  </div>
                </CardHeader>
                <CardContent className="flex-1 p-0 min-h-0 relative">
                   <div className="absolute inset-0 p-6">
                      <RealTimeChart
                        data={throttledData}
                        threshold={threshold}
                        isPaused={isPaused}
                        isConnected={status === "connected"}
                      />
                   </div>
                </CardContent>
              </Card>

              {/* Side Panel (Controls & Logs) */}
              <div className="flex flex-col gap-6">
                 {/* Controls Card */}
                <Card className="shadow-sm border-slate-200">
                   <CardHeader className="py-4 px-6 border-b border-slate-100">
                       <CardTitle className="text-sm font-semibold text-slate-800">Configuration</CardTitle>
                   </CardHeader>
                   <CardContent className="p-6">
                      <div className="space-y-4">
                         <ThresholdInput
                            value={threshold}
                            onChange={setThreshold}
                            disabled={status !== "connected"}
                          />
                          <p className="text-xs text-slate-500 leading-relaxed">
                            Set the price threshold to trigger visual alerts on the dashboard.
                          </p>
                      </div>
                   </CardContent>
                </Card>

                {/* System Logs */}
                <div className="flex-1 min-h-0">
                    <SystemLogs
                      connectionStatus={status}
                      lastPacketTime={lastPacket?.timestamp}
                      reconnectionAttempts={retryCount}
                      error={error}
                    />
                </div>
              </div>
            </div>

          </div>
        </main>
        
        <ConnectionStatus
            status={status}
            error={error}
            lastPing={lastPacket?.timestamp}
            onReconnect={status === "disconnected" ? reconnect : undefined}
            onDisconnect={status === "connected" ? disconnect : undefined}
        />
      </div>
    </div>
  );
}

export default App;