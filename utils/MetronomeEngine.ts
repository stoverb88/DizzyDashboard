/**
 * MetronomeEngine - Web Audio API-based metronome for vestibular exercises
 *
 * Provides precise audio cues at specified BPM with configurable sound characteristics.
 * Uses Web Audio API for low-latency, accurate timing.
 */

export class MetronomeEngine {
  private audioContext: AudioContext | null = null;
  private isRunning: boolean = false;
  private intervalId: number | null = null;
  private nextBeatTime: number = 0;
  private scheduleAheadTime: number = 0.1; // Schedule beats 100ms in advance
  private lookahead: number = 25; // How frequently to call scheduling function (ms)
  private bpm: number = 60;
  private beatCallback?: (beatNumber: number) => void;
  private currentBeat: number = 0;

  // Sound configuration
  private frequency: number = 800; // Hz - higher pitch for clear audibility
  private duration: number = 0.05; // 50ms click duration
  private volume: number = 0.3; // 30% volume to avoid being jarring

  constructor(bpm: number = 60) {
    this.bpm = bpm;
  }

  /**
   * Initialize audio context (must be called after user interaction)
   */
  private initAudioContext(): void {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  /**
   * Schedule a single beat to play at a specific time
   */
  private scheduleBeat(time: number): void {
    if (!this.audioContext) return;

    // Create oscillator for the beep sound
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    // Configure sound
    oscillator.frequency.value = this.frequency;
    oscillator.type = 'sine'; // Smooth, non-harsh tone

    // Envelope for click sound (quick attack and release)
    gainNode.gain.setValueAtTime(0, time);
    gainNode.gain.linearRampToValueAtTime(this.volume, time + 0.005); // 5ms attack
    gainNode.gain.linearRampToValueAtTime(0, time + this.duration); // Decay to silence

    // Start and stop oscillator
    oscillator.start(time);
    oscillator.stop(time + this.duration);

    // Trigger callback for visual sync
    if (this.beatCallback) {
      const currentContextTime = this.audioContext.currentTime;
      const delayMs = (time - currentContextTime) * 1000;
      setTimeout(() => {
        if (this.beatCallback) {
          this.beatCallback(this.currentBeat);
        }
      }, Math.max(0, delayMs));
    }
  }

  /**
   * Scheduler function - called repeatedly to schedule upcoming beats
   */
  private scheduler(): void {
    if (!this.audioContext) return;

    const currentTime = this.audioContext.currentTime;

    // Schedule all beats that fall within the lookahead window
    while (this.nextBeatTime < currentTime + this.scheduleAheadTime) {
      this.scheduleBeat(this.nextBeatTime);
      this.currentBeat++;

      // Calculate next beat time
      const secondsPerBeat = 60.0 / this.bpm;
      this.nextBeatTime += secondsPerBeat;
    }
  }

  /**
   * Start the metronome
   * @param beatCallback - Optional callback fired on each beat for visual sync
   */
  start(beatCallback?: (beatNumber: number) => void): void {
    if (this.isRunning) {
      console.warn('Metronome already running');
      return;
    }

    this.initAudioContext();

    if (!this.audioContext) {
      console.error('Failed to initialize audio context');
      return;
    }

    this.beatCallback = beatCallback;
    this.currentBeat = 0;
    this.isRunning = true;
    this.nextBeatTime = this.audioContext.currentTime;

    // Start the scheduling loop
    this.intervalId = window.setInterval(() => {
      this.scheduler();
    }, this.lookahead);

    console.log(`Metronome started at ${this.bpm} BPM`);
  }

  /**
   * Stop the metronome
   */
  stop(): void {
    if (!this.isRunning) return;

    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    this.isRunning = false;
    this.beatCallback = undefined;

    console.log('Metronome stopped');
  }

  /**
   * Update BPM while running (takes effect on next beat)
   */
  setBPM(bpm: number): void {
    if (bpm < 20 || bpm > 240) {
      console.warn(`BPM ${bpm} out of range (20-240), clamping`);
      bpm = Math.max(20, Math.min(240, bpm));
    }
    this.bpm = bpm;
    console.log(`Metronome BPM updated to ${bpm}`);
  }

  /**
   * Update volume (0.0 to 1.0)
   */
  setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
  }

  /**
   * Update sound frequency in Hz
   */
  setFrequency(frequency: number): void {
    this.frequency = Math.max(200, Math.min(2000, frequency));
  }

  /**
   * Check if metronome is currently running
   */
  isActive(): boolean {
    return this.isRunning;
  }

  /**
   * Get current BPM
   */
  getBPM(): number {
    return this.bpm;
  }

  /**
   * Play a special cue sound (higher pitch for milestones like halfway point)
   */
  playCue(): void {
    if (!this.audioContext) {
      this.initAudioContext();
    }

    if (!this.audioContext) return;

    const now = this.audioContext.currentTime;

    // Play a double beep with higher pitch
    const frequencies = [1200, 1200]; // Higher pitch than normal 800Hz
    const delays = [0, 0.15]; // Two beeps 150ms apart

    frequencies.forEach((freq, index) => {
      const oscillator = this.audioContext!.createOscillator();
      const gainNode = this.audioContext!.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext!.destination);

      oscillator.frequency.value = freq;
      oscillator.type = 'sine';

      const startTime = now + delays[index];
      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(this.volume * 0.8, startTime + 0.005);
      gainNode.gain.linearRampToValueAtTime(0, startTime + 0.08);

      oscillator.start(startTime);
      oscillator.stop(startTime + 0.08);
    });

    console.log('Milestone cue played');
  }

  /**
   * Clean up resources
   */
  dispose(): void {
    this.stop();
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }
}
