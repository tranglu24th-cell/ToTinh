/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Play a playful "boing/dodge" pitched chirp when the No button escapes.
 */
export function playBoing(isMuted: boolean) {
  if (isMuted) return;
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(140, ctx.currentTime);
    // Exponential ramp up to create an organic bouncing sensation
    osc.frequency.exponentialRampToValueAtTime(550, ctx.currentTime + 0.12);

    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.16);
  } catch (error) {
    console.warn("Web Audio API failed (needs user gesture first):", error);
  }
}

/**
 * Play a sparkling arpeggiated romantic major chord cascade when Yes is selected.
 */
export function playSuccessMelody(isMuted: boolean) {
  if (isMuted) return;
  try {
    const ctx = getAudioContext();
    const startTime = ctx.currentTime;
    
    // Notes of a sweeping C major 9 or high-octave pentatonic love sequence
    const notes = [
      261.63, // C4
      329.63, // E4
      392.00, // G4
      493.88, // B4
      523.25, // C5
      659.25, // E5
      783.99, // G5
      987.77, // B5
      1046.50, // C6
      1318.51  // E6
    ];

    notes.forEach((freq, index) => {
      const noteDelay = index * 0.08;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      // Soft triangle/sine blend for a warm crystal music box timbre
      osc.type = index % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, startTime + noteDelay);

      // Simple amplitude envelope
      gain.gain.setValueAtTime(0, startTime + noteDelay);
      gain.gain.linearRampToValueAtTime(0.08, startTime + noteDelay + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + noteDelay + 0.45);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime + noteDelay);
      osc.stop(startTime + noteDelay + 0.5);
    });
  } catch (error) {
    console.warn("Web Audio API failed for success tune:", error);
  }
}

/**
 * Play a simulated retro camera shutter snap for the screenshot flash.
 */
export function playCameraShutter(isMuted: boolean) {
  if (isMuted) return;
  try {
    const ctx = getAudioContext();
    const bufferSize = ctx.sampleRate * 0.1;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    // Create custom shutter-like click white noise
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noiseNode = ctx.createBufferSource();
    noiseNode.buffer = buffer;

    const bandpass = ctx.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.value = 1200;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

    noiseNode.connect(bandpass);
    bandpass.connect(gain);
    gain.connect(ctx.destination);

    noiseNode.start();
    noiseNode.stop(ctx.currentTime + 0.1);
  } catch (error) {
    console.warn("Camera shutter sound failed:", error);
  }
}

/**
 * Play a gentle low-frequency heartbeat sound during contemplation stage.
 */
export function playHeartbeat(isMuted: boolean) {
  if (isMuted) return;
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    // Standard heartbeat has double thumps: lub-dub
    const thumps = [0, 0.25];

    thumps.forEach((delay) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      // Low bassy pressure frequency
      osc.frequency.setValueAtTime(65, now + delay);
      osc.frequency.exponentialRampToValueAtTime(40, now + delay + 0.15);

      gain.gain.setValueAtTime(0, now + delay);
      gain.gain.linearRampToValueAtTime(0.3, now + delay + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + delay);
      osc.stop(now + delay + 0.22);
    });
  } catch (error) {
    // Silent fail since heartbeats loop in the background
  }
}
