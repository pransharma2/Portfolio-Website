import { useState, useCallback, useRef } from 'react';

export default function SoundToggle() {
  const [muted, setMuted] = useState(true);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const toggleSound = useCallback(() => {
    setMuted((prev) => !prev);

    // Broadcast to all videos on the page
    document.querySelectorAll('video').forEach((v) => {
      v.muted = !muted;
    });

    // Play a short confirm tone when unmuting
    if (muted) {
      try {
        if (!audioCtxRef.current) {
          audioCtxRef.current = new AudioContext();
        }
        const ctx = audioCtxRef.current;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(980, ctx.currentTime);
        gain.gain.setValueAtTime(0.04, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.06);
      } catch {
        // Ignore audio failures
      }
    }

    // Dispatch custom event for other components to react
    window.dispatchEvent(new CustomEvent('p5-sound-toggle', { detail: { muted: !muted } }));
  }, [muted]);

  return (
    <button
      className={`p5-sound-toggle ${muted ? 'muted' : ''}`}
      onClick={toggleSound}
      title={muted ? 'Unmute audio' : 'Mute audio'}
      aria-label={muted ? 'Unmute audio' : 'Mute audio'}
    >
      {muted ? '🔇' : '🔊'}
    </button>
  );
}
