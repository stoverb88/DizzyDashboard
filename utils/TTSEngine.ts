/**
 * TTSEngine - Web Speech API wrapper for vestibular exercises
 *
 * Provides text-to-speech functionality with timing callbacks
 * for synchronized visual cues.
 */

export class TTSEngine {
  private synth: SpeechSynthesis | null = null;
  private selectedVoice: SpeechSynthesisVoice | null = null;
  private isInitialized: boolean = false;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this.loadVoices();
    }
  }

  private loadVoices(): void {
    if (!this.synth) return;

    const setVoice = () => {
      const voices = this.synth!.getVoices();
      // Prefer native English voices for clarity
      this.selectedVoice = voices.find(v =>
        v.lang === 'en-US' && v.localService
      ) || voices.find(v => v.lang.startsWith('en')) || null;
      this.isInitialized = true;
    };

    // Voices may not be loaded immediately in some browsers
    if (this.synth.getVoices().length > 0) {
      setVoice();
    } else {
      this.synth.onvoiceschanged = setVoice;
    }
  }

  /**
   * Speak text with callbacks for start and completion
   * @param text - Text to speak
   * @param onComplete - Called when speech finishes
   * @param onStart - Called when speech starts
   */
  speak(text: string, onComplete?: () => void, onStart?: () => void): void {
    if (!this.synth) {
      console.warn('Speech synthesis not available');
      // Fallback: call callbacks after estimated duration
      if (onStart) onStart();
      setTimeout(() => onComplete?.(), text.length * 80); // ~80ms per character
      return;
    }

    // Cancel any ongoing speech
    this.synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;   // Slightly slower for clarity
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    if (this.selectedVoice) {
      utterance.voice = this.selectedVoice;
    }

    utterance.onstart = () => {
      if (onStart) onStart();
    };

    utterance.onend = () => {
      if (onComplete) onComplete();
    };

    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event.error);
      if (onComplete) onComplete(); // Continue sequence even on error
    };

    this.synth.speak(utterance);
  }

  /**
   * Cancel any ongoing speech
   */
  cancel(): void {
    if (this.synth) {
      this.synth.cancel();
    }
  }

  /**
   * Pause current speech
   */
  pause(): void {
    if (this.synth) {
      this.synth.pause();
    }
  }

  /**
   * Resume paused speech
   */
  resume(): void {
    if (this.synth) {
      this.synth.resume();
    }
  }

  /**
   * Check if Web Speech API is supported
   */
  static isSupported(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  }

  /**
   * Get whether the engine is ready to use
   */
  isReady(): boolean {
    return this.isInitialized;
  }

  /**
   * Clean up resources
   */
  dispose(): void {
    this.cancel();
    this.synth = null;
  }
}

/**
 * Custom audio cue player for pre-recorded audio files
 */
export class CustomAudioEngine {
  private audioElements: Map<string, HTMLAudioElement> = new Map();

  /**
   * Preload audio files for the cues
   */
  async preload(cues: { [key: string]: string }): Promise<void> {
    const loadPromises = Object.entries(cues).map(async ([key, url]) => {
      if (!url) return;

      const audio = new Audio(url);
      audio.preload = 'auto';

      return new Promise<void>((resolve, reject) => {
        audio.oncanplaythrough = () => {
          this.audioElements.set(key, audio);
          resolve();
        };
        audio.onerror = () => reject(new Error(`Failed to load audio: ${url}`));
        audio.load();
      });
    });

    await Promise.all(loadPromises);
  }

  /**
   * Play a specific cue
   */
  play(cueKey: string, onComplete?: () => void): void {
    const audio = this.audioElements.get(cueKey);

    if (!audio) {
      console.warn(`Audio cue not found: ${cueKey}`);
      // Fallback timing
      setTimeout(() => onComplete?.(), 800);
      return;
    }

    audio.currentTime = 0;

    if (onComplete) {
      audio.onended = () => onComplete();
    }

    audio.play().catch(err => {
      console.error('Audio playback error:', err);
      if (onComplete) onComplete();
    });
  }

  /**
   * Stop all audio
   */
  stop(): void {
    this.audioElements.forEach(audio => {
      audio.pause();
      audio.currentTime = 0;
    });
  }

  /**
   * Clean up resources
   */
  dispose(): void {
    this.stop();
    this.audioElements.clear();
  }
}
