import { useCallback, useEffect, useRef } from 'react';
import {
  MediaPlayer,
  MediaProvider,
  isYouTubeProvider,
  useMediaStore,
  useMediaPlayer,
  type MediaProviderAdapter
} from '@vidstack/react';
import {
  DefaultVideoLayout,
  defaultLayoutIcons
} from '@vidstack/react/player/layouts/default';
import '@vidstack/react/player/styles/default/theme.css';
import '@vidstack/react/player/styles/default/layouts/video.css';

interface VideoPlayerProps {
  src: string;
  title?: string;
  poster?: string;
  onComplete?: () => void;
  /** Fired when the user tries to skip ahead past the watched portion. */
  onSeekAttempt?: () => void;
}

function getPlayedDuration(played: TimeRanges): number {
  let total = 0;
  for (let i = 0; i < played.length; i++) {
    total += played.end(i) - played.start(i);
  }
  return total;
}

function ProgressTracker({ onComplete }: { onComplete?: () => void }) {
  const { played, duration } = useMediaStore();
  const completedRef = useRef(false);

  useEffect(() => {
    if (completedRef.current || !duration || duration <= 0) return;
    if (getPlayedDuration(played) / duration >= 0.98) {
      completedRef.current = true;
      onComplete?.();
    }
  }, [played, duration, onComplete]);

  return null;
}

// Blocks forward seeks past the furthest point the user has actually watched.
// Rewinding within the watched portion stays allowed.
function SeekGuard({ onSeekAttempt }: { onSeekAttempt?: () => void }) {
  const player = useMediaPlayer();
  const { played } = useMediaStore();
  const maxWatchedRef = useRef(0);
  const onSeekAttemptRef = useRef(onSeekAttempt);
  onSeekAttemptRef.current = onSeekAttempt;

  useEffect(() => {
    let max = 0;
    for (let i = 0; i < played.length; i++) max = Math.max(max, played.end(i));
    if (max > maxWatchedRef.current) maxWatchedRef.current = max;
  }, [played]);

  useEffect(() => {
    const el = player?.el;
    if (!el) return;

    const handler = (event: Event) => {
      const targetTime = (event as unknown as { detail?: number }).detail;
      if (typeof targetTime !== 'number') return;
      if (targetTime > maxWatchedRef.current + 1.5) {
        event.preventDefault();
        if (player) player.currentTime = maxWatchedRef.current;
        onSeekAttemptRef.current?.();
      }
    };

    el.addEventListener('media-seek-request', handler, true);
    el.addEventListener('media-seeking-request', handler, true);
    return () => {
      el.removeEventListener('media-seek-request', handler, true);
      el.removeEventListener('media-seeking-request', handler, true);
    };
  }, [player]);

  return null;
}

export function VideoPlayer({
  src,
  title,
  poster,
  onComplete,
  onSeekAttempt
}: VideoPlayerProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);

  const onProviderSetup = useCallback((provider: MediaProviderAdapter) => {
    if (isYouTubeProvider(provider)) {
      try {
        (provider as any).cookies = false;
      } catch {}
    }
  }, []);

  useEffect(() => {
    if (!wrapperRef.current) return;

    const id = setInterval(() => {
      const iframe = wrapperRef.current?.querySelector(
        'iframe[src*="youtube"]'
      );
      if (iframe) {
        const src = iframe.getAttribute('src') || '';
        if (src.includes('modestbranding=1')) {
          clearInterval(id);
          return;
        }
        try {
          const url = new URL(src);
          url.searchParams.set('modestbranding', '1');
          url.searchParams.set('rel', '0');
          iframe.setAttribute('src', url.toString());
        } catch {}
        clearInterval(id);
      }
    }, 200);

    return () => clearInterval(id);
  }, [src]);

  return (
    <div ref={wrapperRef} onContextMenu={(e) => e.preventDefault()}>
      <style>{`
        [data-media-provider] iframe {
          pointer-events: none;
        }
      `}</style>
      <MediaPlayer
        title={title}
        src={src}
        poster={poster}
        aspectRatio="16/9"
        crossorigin
        load="visible"
        autoplay
        onProviderSetup={onProviderSetup}
      >
        <MediaProvider />
        <DefaultVideoLayout
          icons={defaultLayoutIcons}
          download={false}
          noKeyboardAnimations
          slots={{
            settingsMenu: null
          }}
        />
        {onComplete && <ProgressTracker onComplete={onComplete} />}
        {onSeekAttempt && <SeekGuard onSeekAttempt={onSeekAttempt} />}
      </MediaPlayer>
    </div>
  );
}
