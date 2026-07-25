/** Contexto unico de AudioContext para sintesis de sonido en el navegador. */
let audioCtx: AudioContext | null = null;

/** Obtiene o reanuda el AudioContext compartido. */
function getCtx(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  return audioCtx;
}

/** Reproduce una nota simple con oscilador, ganancia y opcional decaimiento. */
function playNote(
  freq: number,
  startTime: number,
  duration: number,
  type: OscillatorType = "sine",
  gainVal = 0.3,
  decay = true
) {
  const ctx = getCtx();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, startTime);
  gain.gain.setValueAtTime(gainVal, startTime);
  if (decay) {
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
  }
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(startTime);
  osc.stop(startTime + duration);
}

/** Sonido breve al seleccionar una gema. */
export function playSelect() {
  const t = getCtx().currentTime;
  playNote(880, t, 0.12, "sine", 0.25);
  playNote(1100, t + 0.04, 0.1, "sine", 0.15);
}

/** Secuencia ascendente al detectar una coincidencia de gemas. */
export function playMatch(matchCount = 3) {
  const t = getCtx().currentTime;
  const baseFreq = 523;
  for (let i = 0; i < Math.min(matchCount, 5); i++) {
    playNote(baseFreq * Math.pow(2, i / 12) * (i + 1), t + i * 0.07, 0.18, "triangle", 0.28);
  }
}

/** Efecto de cascada cuando nuevas gemas caen y generan combos. */
export function playCascade(round = 1) {
  const t = getCtx().currentTime;
  const base = 660 + round * 40;
  playNote(base, t, 0.1, "sine", 0.2);
  playNote(base * 1.25, t + 0.05, 0.12, "sine", 0.18);
  playNote(base * 1.5, t + 0.1, 0.15, "triangle", 0.15);
  playNote(base * 2, t + 0.15, 0.2, "sine", 0.12);
}

/** Fanfarria de victoria al completar un nivel. */
export function playVictory() {
  const t = getCtx().currentTime;
  const notes = [523, 659, 784, 1047];
  notes.forEach((freq, i) => {
    playNote(freq, t + i * 0.15, 0.35, "triangle", 0.3);
  });
  setTimeout(() => {
    const t2 = getCtx().currentTime;
    [1047, 1319, 1568].forEach((freq, i) => {
      playNote(freq, t2 + i * 0.12, 0.4, "sine", 0.25);
    });
  }, 700);
}

/** Tono descendente de derrota al quedarse sin movimientos. */
export function playDefeat() {
  const t = getCtx().currentTime;
  [400, 350, 300, 250].forEach((freq, i) => {
    playNote(freq, t + i * 0.2, 0.3, "sawtooth", 0.15);
  });
}

/** Sonido de error al intentar un intercambio invalido. */
export function playInvalid() {
  const t = getCtx().currentTime;
  playNote(200, t, 0.15, "square", 0.12);
  playNote(180, t + 0.1, 0.15, "square", 0.12);
}

// ─── Background Music ───────────────────────────────────────────

let bgmActive = false;
let bgmTimeoutId: ReturnType<typeof setTimeout> | null = null;
const BGM_GAIN = 0.10;

/** Nodo de ganancia independiente para la musica de fondo (no interfiere con SFX). */
let bgmGain: GainNode | null = null;

function getBGMGain(): GainNode {
  if (!bgmGain) {
    bgmGain = getCtx().createGain();
    bgmGain.gain.value = BGM_GAIN;
    bgmGain.connect(getCtx().destination);
  }
  return bgmGain;
}

/** Programa un ciclo completo de la melodia de fondo. */
function playBGMLoop() {
  if (!bgmActive) return;
  const ctx = getCtx();
  const t = ctx.currentTime;

  // Melodia "candy" — dulce, pegajosa, en C mayor con arpegio ascendente/descendente
  const melody: number[] = [
    // ── Hook principal ──
    523, 659, 784, 659,   // C5 E5 G5 E5
    784, 1047, 784, 659,  // G5 C6 G5 E5
    523, 659, 784, 1047,  // C5 E5 G5 C6
    988, 784, 659, 523,   // B5 G5 E5 C5

    // ── Variacion dulce ──
    587, 698, 880, 698,   // D5 F5 A5 F5
    880, 1047, 880, 698,  // A5 C6 A5 F5
    659, 784, 988, 1319,  // E5 G5 B5 E6
    1175, 988, 784, 659,  // D6 B5 G5 E5

    // ── Repite hook ──
    523, 659, 784, 659,   // C5 E5 G5 E5
    784, 1047, 784, 659,  // G5 C6 G5 E5
    523, 659, 784, 1047,  // C5 E5 G5 C6
    784, 659, 523, 392,   // G5 E5 C5 G4
  ];

  const noteDuration = 0.2;
  let offset = 0;

  for (let i = 0; i < melody.length; i++) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = i % 2 === 0 ? "triangle" : "sine";
    osc.frequency.setValueAtTime(melody[i], t + offset);
    gain.gain.setValueAtTime(BGM_GAIN, t + offset);
    gain.gain.exponentialRampToValueAtTime(0.001, t + offset + noteDuration);
    osc.connect(gain);
    gain.connect(getBGMGain());
    osc.start(t + offset);
    osc.stop(t + offset + noteDuration);
    offset += noteDuration;
  }

  bgmTimeoutId = setTimeout(() => playBGMLoop(), offset * 1000 - 50);
}

/** Inicia la musica de fondo. */
export function startBGM(): void {
  if (bgmActive) return;
  bgmActive = true;
  playBGMLoop();
}

/** Detiene por completo la musica de fondo. */
export function stopBGM(): void {
  bgmActive = false;
  if (bgmTimeoutId !== null) {
    clearTimeout(bgmTimeoutId);
    bgmTimeoutId = null;
  }
}

/** Pausa la musica de fondo (silencio, el ciclo sigue pero no se escucha). */
export function pauseBGM(): void {
  if (bgmGain) {
    bgmGain.gain.setValueAtTime(0, getCtx().currentTime);
  }
}

/** Reanuda la musica de fondo desde donde se pauso. */
export function resumeBGM(): void {
  if (bgmGain) {
    bgmGain.gain.setValueAtTime(BGM_GAIN, getCtx().currentTime);
  }
}
