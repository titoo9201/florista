import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';

const PAD = 8; // space around the highlighted element
const GAP = 14; // space between highlight and card

function findTarget(target) {
  if (!target) return null;
  for (const name of [].concat(target)) {
    const el = [...document.querySelectorAll(`[data-tour="${name}"]`)].find((node) => node.getClientRects().length > 0);
    if (el) return el;
  }
  return null;
}

function measure(el) {
  const r = el.getBoundingClientRect();
  return { top: r.top - PAD, left: r.left - PAD, width: r.width + PAD * 2, height: r.height + PAD * 2 };
}

/**
 * Spotlight tour: dims the page, highlights one element per step and explains it in a card.
 * `onStep(step)` lets the parent open the right admin page / phone menu before highlighting.
 */
export default function Tour({ steps, open, onStep, onClose }) {
  const [index, setIndex] = useState(0);
  const [rect, setRect] = useState(null);
  const [cardStyle, setCardStyle] = useState({});
  const cardRef = useRef(null);
  const targetRef = useRef(null);
  const step = steps[index];
  const isFirst = index === 0;
  const isLast = index === steps.length - 1;

  useEffect(() => {
    if (open) setIndex(0);
  }, [open]);

  // Open the right page for this step, then find and highlight its element.
  useEffect(() => {
    if (!open) return undefined;
    onStep?.(step);
    targetRef.current = null;
    setRect(null);
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let tries = 0;
    let timer;
    const locate = () => {
      const el = findTarget(step.target);
      if (el) {
        targetRef.current = el;
        el.scrollIntoView({ block: 'center', behavior: reduce ? 'auto' : 'smooth' });
        timer = setTimeout(() => setRect(measure(el)), reduce ? 30 : 380);
      } else if (step.target && tries++ < 25) {
        timer = setTimeout(locate, 100); // the page may still be opening
      }
    };
    timer = setTimeout(locate, 60);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, index]);

  // Keep the highlight on the element while scrolling / resizing.
  useEffect(() => {
    if (!open) return undefined;
    const update = () => targetRef.current && setRect(measure(targetRef.current));
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
    };
  }, [open, index]);

  // Place the card next to the highlight (below if it fits, otherwise above); on phones it sits at the bottom.
  useLayoutEffect(() => {
    if (!open || !cardRef.current) return;
    const card = cardRef.current.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    if (!rect || vw < 640) {
      setCardStyle(rect ? { left: 12, right: 12, bottom: 12 } : { left: '50%', top: '50%', transform: 'translate(-50%, -50%)' });
      return;
    }
    const below = rect.top + rect.height + GAP;
    const above = rect.top - GAP - card.height;
    const left = Math.min(Math.max(12, rect.left), vw - card.width - 12);
    if (below + card.height <= vh - 12) setCardStyle({ top: below, left });
    else if (above >= 12) setCardStyle({ top: above, left });
    else setCardStyle({ right: 16, bottom: 16 }); // tall highlight: park the card in the corner
  }, [rect, open, index]);

  const finish = useCallback(() => onClose?.(), [onClose]);
  const next = useCallback(() => (isLast ? finish() : setIndex((i) => i + 1)), [isLast, finish]);
  const back = useCallback(() => setIndex((i) => Math.max(0, i - 1)), []);

  // Keyboard: → / Enter next, ← back, Esc skip. Focus the card for screen readers.
  useEffect(() => {
    if (!open) return undefined;
    cardRef.current?.focus();
    const onKey = (e) => {
      if (e.key === 'Escape') finish();
      else if (e.key === 'ArrowRight') next();
      else if (e.key === 'ArrowLeft') back();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, index, next, back, finish]);

  if (!open || !step) return null;

  return (
    <div className="fixed inset-0 z-[70]" aria-live="polite">
      {/* Blocks clicks on the page while the tour is running */}
      <div className={`absolute inset-0 ${rect ? '' : 'bg-ink/60'}`} onClick={(e) => e.stopPropagation()} />
      {rect && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute rounded-[12px] ring-2 ring-rose transition-all duration-300 ease-out"
          style={{ ...rect, boxShadow: '0 0 0 9999px rgb(81 68 60 / 0.6)' }}
        />
      )}

      <div
        ref={cardRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="tour-title"
        aria-describedby="tour-body"
        tabIndex={-1}
        className="absolute w-auto max-w-[min(420px,calc(100vw-24px))] rounded-card bg-card p-5 shadow-card-hover outline-none sm:w-[400px]"
        style={cardStyle}
      >
        <div className="mb-3 h-1 overflow-hidden rounded-full bg-blush" aria-hidden="true">
          <div className="h-full bg-rose transition-all duration-300" style={{ width: `${((index + 1) / steps.length) * 100}%` }} />
        </div>
        <p className="text-[11px] uppercase tracking-eyebrow text-ink/70">
          Step {index + 1} of {steps.length}
        </p>
        <h2 id="tour-title" className="mt-1 font-serif text-2xl leading-tight">{step.title}</h2>
        <p id="tour-body" className="mt-2 text-sm leading-6">{step.body}</p>

        {isFirst ? (
          <div className="mt-5 flex flex-col gap-2 sm:flex-row">
            <button type="button" className="admin-primary w-full sm:w-auto" onClick={next}>▶ Play tutorial</button>
            <button type="button" className="admin-secondary w-full sm:w-auto" onClick={finish}>Skip tutorial</button>
          </div>
        ) : (
          <div className="mt-5 flex items-center justify-between gap-2">
            <button type="button" className="min-h-11 text-sm underline" onClick={finish}>Skip tutorial</button>
            <div className="flex gap-2">
              <button type="button" className="admin-secondary" onClick={back}>Back</button>
              <button type="button" className="admin-primary" onClick={next}>{isLast ? 'Finish' : 'Next'}</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
