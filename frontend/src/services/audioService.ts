/**
 * Zero-dependency Web Audio API synthesizer for reminder chimes.
 * Fallback when native notifications aren't available or sound is off.
 */

let audioContext: AudioContext | null = null;

export function initAudio(): void {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
}

export function playReminderChime(): void {
  try {
    initAudio();
    if (!audioContext) return;

    if (audioContext.state === "suspended") {
      audioContext.resume();
    }

    const t = audioContext.currentTime;

    // A pleasant two-tone chime (e.g. C5 then E5)
    playTone(523.25, t, 0.2); // C5
    playTone(659.25, t + 0.2, 0.4); // E5

  } catch (error) {
    console.error("Audio playback failed", error);
  }
}

function playTone(freq: number, startTime: number, duration: number) {
  if (!audioContext) return;
  const osc = audioContext.createOscillator();
  const gain = audioContext.createGain();

  osc.type = "sine";
  osc.frequency.setValueAtTime(freq, startTime);

  gain.gain.setValueAtTime(0, startTime);
  gain.gain.linearRampToValueAtTime(0.5, startTime + 0.05);
  gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

  osc.connect(gain);
  gain.connect(audioContext.destination);

  osc.start(startTime);
  osc.stop(startTime + duration);
}
