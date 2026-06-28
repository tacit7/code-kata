// ── VizNav ─────────────────────────────────────────────────────────────────
// Shared step-navigation harness for snapshot-based visualizations.
//
// Usage:
//   const nav = VizNav({
//     btnPrev, btnNext, btnPlay, speedSel,
//     render: function(snap, cursor, total) { ... }
//   });
//   nav.load(steps);   // call from loadPreset after building steps
//
// render() receives (snap, cursor, total) so it can update the step counter.

window.VizNav = function(opts) {
  var steps = [], cursor = 0, playTimer = null;

  function updateButtons() {
    opts.btnPrev.disabled = cursor <= 0;
    opts.btnNext.disabled = cursor >= steps.length - 1;
    opts.btnPlay.disabled = steps.length === 0;
  }

  function goTo(idx) {
    cursor = Math.max(0, Math.min(steps.length - 1, idx));
    opts.render(steps[cursor], cursor, steps.length);
    updateButtons();
  }

  function stopPlay() {
    if (playTimer) {
      clearInterval(playTimer);
      playTimer = null;
      opts.btnPlay.textContent = 'Play';
    }
  }

  function togglePlay() {
    if (playTimer) { stopPlay(); return; }
    opts.btnPlay.textContent = 'Pause';
    playTimer = setInterval(function() {
      if (cursor >= steps.length - 1) { stopPlay(); return; }
      goTo(cursor + 1);
    }, parseInt(opts.speedSel.value));
  }

  opts.btnPrev.addEventListener('click', function() { stopPlay(); goTo(cursor - 1); });
  opts.btnNext.addEventListener('click', function() { stopPlay(); goTo(cursor + 1); });
  opts.btnPlay.addEventListener('click', togglePlay);

  return {
    load:     function(newSteps) { stopPlay(); steps = newSteps; cursor = 0; goTo(0); },
    goTo:     goTo,
    stopPlay: stopPlay,
    cursor:   function() { return cursor; },
    total:    function() { return steps.length; },
  };
};
