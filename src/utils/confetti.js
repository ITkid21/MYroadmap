/**
 * Safe Confetti Launcher
 * Works seamlessly in both bundled Vite builds and browser standalone environments.
 */
export function fireConfetti() {
  try {
    if (typeof window !== 'undefined' && window.confetti) {
      window.confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  } catch (err) {
    // Graceful fallback if confetti library is not loaded
  }
}
