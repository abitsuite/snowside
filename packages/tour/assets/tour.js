// packages/tour/assets/tour.js
//
// Snowside Tour — client runtime. Plain ES5-compatible JS, no framework.
//
// Drives BOTH display modes from the same DOM:
//   deck    desktop + tablet: arrows / space / PageUp+PageDown / Home+End,
//           left+right buttons, swipe, click-to-advance.
//   mobile  phones: horizontal swipe between full-screen slides, dot rail,
//           plus the same keyboard controls for accessibility.
//
// Slide visibility is expressed as a single index. The deck toggles
// .active on one .slide; mobile translates .stage. Mode is decided once at
// boot from the media query, and re-evaluated on resize so rotating a tablet
// or resizing a desktop window keeps working.
//
// Progress + URL hash are kept in sync so a slide can be linked directly.

(function () {
  'use strict'

  var body = document.body
  var slides = Array.prototype.slice.call(document.querySelectorAll('.slide'))
  var total = slides.length
  if (!total) return

  var stage = document.querySelector('.stage')
  var progress = document.querySelector('.progress')
  var dots = Array.prototype.slice.call(document.querySelectorAll('.dots .dot'))
  var prevBtn = document.querySelector('[data-nav="prev"]')
  var nextBtn = document.querySelector('[data-nav="next"]')
  var counter = document.querySelector('.mobile-counter')
  var swipeHint = document.querySelector('.swipe-hint')

  // The tab title is a brand string and is deliberately NOT rewritten as the
  // user moves between slides — the page has one canonical title
  // ("Snowside Tour — Bitcoin Security at Avalanche Speed") and the deck chrome
  // already shows position via .slide-number on desktop and .mobile-counter on
  // phones. Rewriting it here previously clobbered that title on first load.

  // Reflow breakpoint. The tour does NOT switch purely on width: the deck is a
  // fixed 980x552 canvas scaled by s = min(vw/980, vh/552).
  //
  // TABLETS STAY ON THE DECK. That is deliberate: the deck is where the cover
  // shows its enlarged "SNOWSIDE TOUR" kicker and the explicit two-line
  // subtitle, and it is what preserves the Slidev look on tablet. Only a
  // narrow, portrait PHONE reflows.
  //
  // Threshold 0.60 == 588px wide or 331px tall. It sits below every tablet
  // scale measured (narrowest is a 7" 600x1024 at 0.612) and above every
  // phone-portrait scale (largest is 430x932 at 0.439).
  //   reflows  phone portrait 0.367-0.439
  //   deck     phone landscape 0.707-0.779 | tablet 0.612-1.218 | desktop 1.304+
  // Keep in sync with assets/tour.css and the inline boot script in
  // scripts/build-tour.mjs.
  var MOBILE_SCALE = 0.60

  function deckScale() {
    return Math.min(window.innerWidth / 980, window.innerHeight / 552)
  }

  function shouldUseMobile() {
    return deckScale() < MOBILE_SCALE
  }

  var index = 0
  var mode = 'deck'

  /* ---------------------------------------------------------------- *
   * Canvas scaling (deck mode)
   * Reproduces Slidev exactly:
   *   scale = Math.min(viewW / 980, viewH / 552)
   * ---------------------------------------------------------------- */
  function fitCanvas() {
    var w = window.innerWidth
    var h = window.innerHeight
    var scale = Math.min(w / 980, h / 552)
    body.style.setProperty('--scale', String(scale))
  }
  /* ---------------------------------------------------------------- *
   * Rendering
   * ---------------------------------------------------------------- */
  function render() {
    if (index < 0) index = 0
    if (index > total - 1) index = total - 1
    if (mode === 'deck') {
      for (var i = 0; i < total; i++) {
        slides[i].classList.toggle('active', i === index)
      }
    } else {
      stage.style.transform = 'translateX(' + (-index * 100) + '%)'
      // Only the visible slide may scroll; reset the others so a re-visit
      // always starts at the top of the slide.
      for (var j = 0; j < total; j++) {
        var scroller = slides[j].querySelector('.slide-content, .connect-inner, .cover-inner')
        if (scroller && j !== index) scroller.scrollTop = 0
      }
    }

    // Progress bar
    if (progress) {
      progress.style.width = ((index + 1) / total * 100) + '%'
    }

    // Dot rail
    for (var k = 0; k < dots.length; k++) {
      dots[k].classList.toggle('active', k === index)
    }

    // Counter
    if (counter) {
      counter.textContent = (index + 1) + ' / ' + total
    }

    // Buttons
    if (prevBtn) prevBtn.disabled = index === 0
    if (nextBtn) nextBtn.disabled = index === total - 1

    // Deep link
    var hash = '#' + (index + 1)
    if (window.location.hash !== hash) {
      // replaceState keeps the back button clean while still allowing shares.
      if (window.history && window.history.replaceState) {
        window.history.replaceState(null, '', hash)
      } else {
        window.location.hash = hash
      }
    }
  }

  function go(next) {
    if (next === index) return
    index = next
    render()
    // The swipe affordance has served its purpose once the user navigates.
    if (swipeHint) swipeHint.classList.add('hidden')
  }
  function next() { go(index + 1) }
  function prev() { go(index - 1) }

  /* ---------------------------------------------------------------- *
   * Mode switching
   * ---------------------------------------------------------------- */
  function applyMode() {
    var nextMode = shouldUseMobile() ? 'mobile' : 'deck'
    var changed = nextMode !== mode
    mode = nextMode
    body.setAttribute('data-mode', mode)

    if (mode === 'deck') {
      // Clear any horizontal offset left over from mobile mode.
      stage.style.transform = ''
      fitCanvas()
    } else {
      body.style.removeProperty('--scale')
    }
    if (changed || mode === 'mobile') render()
  }

  /* ---------------------------------------------------------------- *
   * Input
   * ---------------------------------------------------------------- */
  var SWIPE_MIN = 45 // px of horizontal travel to count as a swipe
  var startX = 0
  var startY = 0
  var tracking = false

  function onTouchStart(e) {
    if (e.touches.length !== 1) return
    startX = e.touches[0].clientX
    startY = e.touches[0].clientY
    tracking = true
  }

  function onTouchEnd(e) {
    if (!tracking) return
    tracking = false
    if (!e.changedTouches || !e.changedTouches.length) return
    var dx = e.changedTouches[0].clientX - startX
    var dy = e.changedTouches[0].clientY - startY
    // Horizontal intent only, so vertical scrolling inside a slide is never
    // swallowed by the swipe handler.
    if (Math.abs(dx) < SWIPE_MIN || Math.abs(dx) < Math.abs(dy)) return
    if (dx < 0) next()
    else prev()
  }

  function onKey(e) {
    // Never hijack typing.
    var t = e.target
    if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return

    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowDown':
      case 'PageDown':
      case ' ': // space
      case 'Spacebar':
        e.preventDefault(); next(); break
      case 'ArrowLeft':
      case 'ArrowUp':
      case 'PageUp':
        e.preventDefault(); prev(); break
      case 'Home':
        e.preventDefault(); go(0); break
      case 'End':
        e.preventDefault(); go(total - 1); break
      case 'f':
      case 'F':
        toggleFullscreen(); break
      default:
        break
    }
  }

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen()
      }
    } else if (document.exitFullscreen) {
      document.exitFullscreen()
    }
  }

  function onClick(e) {
    // Ignore clicks on interactive elements and on the visible controls.
    var el = e.target
    while (el && el !== document.body) {
      var tag = el.tagName
      if (tag === 'A' || tag === 'BUTTON' || tag === 'INPUT' || tag === 'TEXTAREA') return
      el = el.parentNode
    }
    if (mode === 'mobile') {
      // On a phone the affordance is "tap to advance"; there is no left-third
      // convention and the slide is already full-width. Taps on links and
      // buttons were excluded above, and a swipe is suppressed by the browser
      // (a drag does not produce a click), so this cannot double-step.
      next()
      return
    }
    // Deck: left third goes back, the rest advances — the usual presentation
    // feel.
    if (e.clientX < window.innerWidth * 0.33) prev()
    else next()
  }

  /* ---------------------------------------------------------------- *
   * Boot
   * ---------------------------------------------------------------- */
  function init() {
    // Honour a deep link (#3). Anything unparseable falls back to slide 1.
    var fromHash = parseInt(String(window.location.hash).replace('#', ''), 10)
    if (!isNaN(fromHash) && fromHash >= 1 && fromHash <= total) index = fromHash - 1

    applyMode()
    render()

    window.addEventListener('resize', applyMode, { passive: true })
    window.addEventListener('orientationchange', applyMode, { passive: true })
    window.addEventListener('keydown', onKey)
    document.addEventListener('click', onClick)
    document.addEventListener('touchstart', onTouchStart, { passive: true })
    document.addEventListener('touchend', onTouchEnd, { passive: true })

    if (prevBtn) prevBtn.addEventListener('click', function (e) { e.stopPropagation(); prev() })
    if (nextBtn) nextBtn.addEventListener('click', function (e) { e.stopPropagation(); next() })

    // The dot rail doubles as direct navigation on phones. stopPropagation
    // keeps the document-level "tap to advance" handler from also firing.
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function (e) {
        e.stopPropagation()
        go(i)
      })
    })

    // Keep cross-slide deep links working when the hash changes externally.
    window.addEventListener('hashchange', function () {
      var n = parseInt(String(window.location.hash).replace('#', ''), 10)
      if (!isNaN(n) && n >= 1 && n <= total) go(n - 1)
    })
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init)
  } else {
    init()
  }
})()
