import { memo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: number;
  unit: string;
  isAlert?: boolean;
  trend?: 'up' | 'down' | 'stable';
  description?: string;
}

export const MetricCard = memo<MetricCardProps>(({
  title,
  value,
  unit,
  isAlert = false,
  trend,
  description
}) => {
  const formatValue = (val: number) => {
    if (unit === '%') {
      return val.toFixed(1);
    }
    if (unit === '$') {
      return val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
    return val.toString();
  };

  const trendColor = trend === 'up' ? 'text-emerald-500' : trend === 'down' ? 'text-rose-500' : 'text-slate-500';
  const trendBg = trend === 'up' ? 'bg-emerald-50' : trend === 'down' ? 'bg-rose-50' : 'bg-slate-50';
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;

  return (
    <Card
      className={`relative overflow-hidden transition-all duration-300 border-0 shadow-sm hover:shadow-md ${
        isAlert
          ? 'bg-white ring-2 ring-rose-500 ring-opacity-50'
          : 'bg-white'
      }`}
    >
      {isAlert && (
        <div className="absolute top-0 right-0 p-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
          </span>
        </div>
      )}
      
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-sm font-medium text-slate-500">{title}</p>
            {description && <p className="text-xs text-slate-400 mt-1">{description}</p>}
          </div>
          {trend && (
            <div className={`p-2 rounded-full ${trendBg} ${trendColor}`}>
              <TrendIcon size={16} />
            </div>
          )}
        </div>

        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-bold text-slate-900 tracking-tight">
             {unit === '$' ? '$' : ''}{formatValue(value)}
          </span>
          {unit !== '$' && <span className="text-sm font-medium text-slate-500">{unit}</span>}
        </div>
      </CardContent>
    </Card>
  );
});

MetricCard.displayName = 'MetricCard';