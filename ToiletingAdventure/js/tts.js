window.TTS = (() => {
  let enabled = true;

  function speak(text) {
    if (!enabled) return;
    if (!("speechSynthesis" in window)) return;

    // Cancel any ongoing speech to keep it snappy for kids
    window.speechSynthesis.cancel();

    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = 1.0;
    utter.pitch = 1.05;
    utter.volume = 1.0;

    // Optional: choose a consistent voice if available
    // const voices = speechSynthesis.getVoices();
    // utter.voice = voices.find(v => /en/i.test(v.lang)) || null;

    window.speechSynthesis.speak(utter);
  }

  function setEnabled(v) { enabled = !!v; }
  function isEnabled() { return enabled; }

  return { speak, setEnabled, isEnabled };
})();
