const STORAGE_KEY = "escape-pi-audio-v1";

const DEFAULT_SETTINGS = { music: true, sounds: true };
let sharedAudio;

function readSettings() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
    const wasMuted = stored.muted === true;
    return {
      music: wasMuted ? false : (typeof stored.music === "boolean" ? stored.music : DEFAULT_SETTINGS.music),
      sounds: wasMuted ? false : (typeof stored.sounds === "boolean"
        ? stored.sounds
        : stored.effects !== false && stored.keyTone !== false),
    };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

function writeSettings(settings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // Audio remains usable when storage is disabled.
  }
}

export class AudioEngine {
  constructor() {
    this.settings = readSettings();
    this.context = null;
    this.musicSource = null;
    this.musicGain = null;
    this.musicBuffer = null;
  }

  getSettings() {
    return { ...this.settings };
  }

  async unlock() {
    const AudioContextClass = window.AudioContext ?? window.webkitAudioContext;
    if (!AudioContextClass) return false;
    this.context ??= new AudioContextClass();
    if (this.context.state === "suspended") await this.context.resume();
    if (this.settings.music) this.startMusic();
    return true;
  }

  setSetting(key, value) {
    if (!(key in DEFAULT_SETTINGS)) return;
    this.settings[key] = Boolean(value);
    writeSettings(this.settings);
    if (key === "music") {
      if (this.settings.music) this.startMusic();
      else this.stopMusic();
    }
  }

  toggle(key) {
    this.setSetting(key, !this.settings[key]);
    return this.settings[key];
  }

  startMusic() {
    if (!this.context || this.musicSource || !this.settings.music) return;
    if (!this.musicBuffer) {
      try {
        this.musicBuffer = this.createMusicBuffer();
      } catch (error) {
        console.error("Hintergrundmusik konnte nicht erzeugt werden:", error);
        return;
      }
    }
    this.musicGain = this.context.createGain();
    this.musicGain.gain.value = 0.2;
    this.musicGain.connect(this.context.destination);
    this.musicSource = this.context.createBufferSource();
    this.musicSource.buffer = this.musicBuffer;
    this.musicSource.loop = true;
    this.musicSource.connect(this.musicGain);
    this.musicSource.start();
  }

  stopMusic() {
    if (!this.musicSource) return;
    try { this.musicSource.stop(); } catch { /* already stopped */ }
    this.musicSource.disconnect();
    this.musicGain?.disconnect();
    this.musicSource = null;
    this.musicGain = null;
  }

  play(name = "step") {
    if (!this.context || !this.settings.sounds) return;
    const sounds = {
      step: [120, 80, 0.055, "sine", 0.012],
      start: [330, 740, 0.19, "triangle"],
      warning: [430, 610, 0.18, "square"],
      caught: [390, 110, 0.48, "sawtooth"],
      win: [440, 880, 0.42, "triangle"],
      timeout: [260, 100, 0.42, "triangle"],
      speech: [680, 520, 0.1, "sine"],
    };
    const [from, to, duration, type, volume = 0.07] = sounds[name] ?? sounds.step;
    const now = this.context.currentTime;
    const oscillator = this.context.createOscillator();
    const gain = this.context.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(from, now);
    oscillator.frequency.exponentialRampToValueAtTime(Math.max(1, to), now + duration);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(volume, now + Math.min(0.012, duration / 4));
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    oscillator.connect(gain);
    gain.connect(this.context.destination);
    oscillator.start(now);
    oscillator.stop(now + duration + 0.01);
    oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
  }

  createMusicBuffer() {
    const sampleRate = this.context.sampleRate;
    const bpm = 74;
    const beat = 60 / bpm;
    const bar = beat * 4;
    const bars = 8;
    const length = Math.ceil(sampleRate * bar * bars);
    const buffer = this.context.createBuffer(1, length, sampleRate);
    const samples = buffer.getChannelData(0);
    const progression = [
      { chord: [50, 54, 57, 61], bass: [38, 45, 50, 45] }, // Dmaj7
      { chord: [55, 59, 62, 66], bass: [43, 50, 55, 50] }, // Gmaj7
      { chord: [52, 55, 59, 62], bass: [40, 47, 52, 47] }, // Em7
      { chord: [45, 49, 52, 55, 59], bass: [33, 40, 45, 40] }, // A13
      { chord: [50, 54, 57, 61], bass: [38, 45, 50, 45] },
      { chord: [55, 59, 62, 66], bass: [43, 50, 55, 50] },
      { chord: [47, 50, 54, 57], bass: [35, 42, 47, 42] }, // Bm7
      { chord: [45, 49, 52, 55], bass: [33, 40, 45, 40] }, // A7
    ];
    const melody = [74, 76, 78, 81, 78, 76, 74, 71, 73, 76, 78, 76, 73, 71, 69, 71];
    const midiFrequency = midi => 440 * (2 ** ((midi - 69) / 12));
    const addNote = (midi, startSeconds, durationSeconds, volume, instrument = "keys") => {
      const start = Math.max(0, Math.floor(startSeconds * sampleRate));
      const end = Math.min(length, Math.floor((startSeconds + durationSeconds) * sampleRate));
      const frequency = midiFrequency(midi);
      for (let i = start; i < end; i += 1) {
        const t = (i - start) / sampleRate;
        const remaining = (end - i) / sampleRate;
        const envelope = Math.min(1, t * 8, remaining * 3);
        const phase = 2 * Math.PI * frequency * t;
        const wave = instrument === "bass"
          ? Math.sin(phase) * 0.9 + Math.sin(phase * 2) * 0.1
          : Math.sin(phase) * 0.76 + Math.sin(phase * 2) * 0.18 + Math.sin(phase * 3) * 0.06;
        samples[i] += wave * envelope * volume;
      }
    };

    for (let barIndex = 0; barIndex < bars; barIndex += 1) {
      const barStart = barIndex * bar;
      const harmony = progression[barIndex];
      harmony.chord.forEach(midi => addNote(midi, barStart, bar, 0.018));
      harmony.bass.forEach((midi, beatIndex) => {
        addNote(midi, barStart + beatIndex * beat, beat * 0.72, 0.045, "bass");
      });
      for (let phraseNote = 0; phraseNote < 2; phraseNote += 1) {
        const midi = melody[(barIndex * 2 + phraseNote) % melody.length];
        const beatOffset = phraseNote === 0 ? 1.25 : 3.25;
        addNote(midi, barStart + beatOffset * beat, beat * 0.42, 0.024);
      }
    }
    return buffer;
  }
}

export function getAudioEngine() {
  sharedAudio ??= new AudioEngine();
  return sharedAudio;
}
