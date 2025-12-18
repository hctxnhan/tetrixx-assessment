import { memo } from 'react';
import { Play, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PlayPauseButtonProps {
  isPaused: boolean;
  isDisabled?: boolean;
  onToggle: () => void;
}

export const PlayPauseButton = memo<PlayPauseButtonProps>(({
  isPaused,
  isDisabled = false,
  onToggle,
}) => {
  return (
    <Button
      variant={isPaused ? "default" : "outline"}
      size="sm"
      onClick={onToggle}
      disabled={isDisabled}
      className={`min-w-[110px] font-medium transition-all ${
        isPaused 
          ? 'bg-indigo-600 hover:bg-indigo-700 text-white border-transparent' 
          : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
      }`}
    >
      {isPaused ? (
        <>
          <Play size={16} className="mr-2 fill-current" />
          Resume
        </>
      ) : (
        <>
          <Pause size={16} className="mr-2 fill-current" />
          Pause
        </>
      )}
    </Button>
  );
});

PlayPauseButton.displayName = 'PlayPauseButton';