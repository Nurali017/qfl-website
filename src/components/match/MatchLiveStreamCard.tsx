'use client';

interface MatchLiveStreamCardProps {
  liveUrl: string;
}

function getYoutubeId(url: string): string | null {
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

export function MatchLiveStreamCard({ liveUrl }: MatchLiveStreamCardProps) {
  const youtubeId = getYoutubeId(liveUrl);

  return (
    <div className="bg-white dark:bg-dark-surface rounded-2xl border border-gray-100 dark:border-dark-border overflow-hidden shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-dark-border">
        <h3 className="text-sm font-bold text-gray-900 dark:text-white">Прямая трансляция</h3>
        <div className="flex items-center gap-2 bg-red-600 text-white px-3 py-1 rounded-full">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
          </span>
          <span className="text-xs font-bold uppercase tracking-wide">LIVE</span>
        </div>
      </div>

      {/* Live Stream Embed */}
      <div className="relative aspect-video bg-gray-900">
        {youtubeId ? (
          <iframe
            className="absolute inset-0 w-full h-full"
            src={`https://www.youtube.com/embed/${youtubeId}?autoplay=0&rel=0`}
            title="Прямая трансляция"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <a
              href={liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white underline text-sm"
            >
              Смотреть трансляцию
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
