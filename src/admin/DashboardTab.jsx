import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { apiFetch, authHeaders } from '../lib/contentApi';

const RANGES = [7, 30, 90];
const METRICS = [
  ['visitors', 'Visitors', 'People who opened the website (each counted once per day)'],
  ['pageViews', 'Page views', 'Pages opened in total'],
  ['whatsapp', 'WhatsApp chats', 'Times someone tapped a WhatsApp / “Contact for Order” button'],
  ['enquiries', 'Enquiries', 'Contact-form messages received'],
];
const PAGE_NAMES = { home: 'Home', inspiration: 'Inspiration', bouquets: 'Bouquets', 'candles-decor': 'Candles & Decor', about: 'About Us', contact: 'Contact Us' };
const fmt = (n) => n.toLocaleString('en-IN');
const dayLabel = (iso, opts = { day: 'numeric', month: 'short' }) => new Date(`${iso}T00:00:00`).toLocaleDateString('en-IN', opts);

function StatTile({ label, value, hint, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-card border bg-card p-4 text-left transition-colors sm:p-5 ${active ? 'border-chart ring-1 ring-chart' : 'border-line hover:border-rose'}`}
    >
      <span className="block text-xs uppercase tracking-eyebrow text-ink/75">{label}</span>
      <span className="mt-2 block font-serif text-4xl leading-none sm:text-5xl">{fmt(value)}</span>
      <span className="mt-2 block text-[11px] leading-4 text-ink/65">{hint}</span>
    </button>
  );
}

/** Column chart, one bar per day (single series → no legend; the title names it). */
function DailyChart({ days, metric, label }) {
  const [hover, setHover] = useState(null);
  // Draw at the real container width so text stays readable on phones (no shrinking SVG).
  const [W, setW] = useState(720);
  const boxRef = useRef(null);
  useEffect(() => {
    const el = boxRef.current;
    if (!el) return undefined;
    const ro = new ResizeObserver(([entry]) => setW(Math.max(280, Math.round(entry.contentRect.width))));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const H = W < 500 ? 200 : 220;
  const pad = { top: 12, right: 8, bottom: 26, left: 36 };
  const innerW = W - pad.left - pad.right;
  const innerH = H - pad.top - pad.bottom;
  const max = Math.max(1, ...days.map((d) => d[metric]));
  const step = Math.max(1, Math.ceil(max / 4));
  const top = step * 4;
  const slot = innerW / days.length;
  const barW = Math.max(2, slot - 2); // 2px surface gap between bars
  const y = (v) => pad.top + innerH - (v / top) * innerH;
  const labelEvery = Math.ceil(days.length / Math.max(3, Math.floor(innerW / 80))); // ~one date per 80px

  return (
    <div className="relative" ref={boxRef}>
      <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} className="block max-w-full" role="img" aria-label={`${label} per day`} onMouseLeave={() => setHover(null)}>
        {[0, 1, 2, 3, 4].map((i) => (
          <g key={i}>
            <line x1={pad.left} x2={W - pad.right} y1={y(step * i)} y2={y(step * i)} stroke="var(--color-line)" strokeWidth="1" />
            <text x={pad.left - 6} y={y(step * i) + 4} textAnchor="end" fontSize="11" fill="currentColor" opacity="0.7">{fmt(step * i)}</text>
          </g>
        ))}
        {days.map((d, i) => {
          const x = pad.left + i * slot + 1;
          const v = d[metric];
          const h = Math.max(0, y(0) - y(v));
          const r = Math.min(4, barW / 2, h);
          const base = y(0);
          return (
            <g key={d.date}>
              {v > 0 && (
                <path
                  d={`M${x},${base} V${base - h + r} Q${x},${base - h} ${x + r},${base - h} H${x + barW - r} Q${x + barW},${base - h} ${x + barW},${base - h + r} V${base} Z`}
                  fill="var(--color-chart)"
                  opacity={hover === null || hover === i ? 1 : 0.45}
                />
              )}
              {/* Bigger invisible hit area for hover / tap */}
              <rect x={pad.left + i * slot} y={pad.top} width={slot} height={innerH} fill="transparent" onMouseEnter={() => setHover(i)} onClick={() => setHover(i)} />
              {i % labelEvery === 0 && (
                <text x={x + barW / 2} y={H - 8} textAnchor="middle" fontSize="11" fill="currentColor" opacity="0.7">{dayLabel(d.date)}</text>
              )}
            </g>
          );
        })}
        <line x1={pad.left} x2={W - pad.right} y1={y(0)} y2={y(0)} stroke="currentColor" strokeOpacity="0.35" />
      </svg>
      {hover !== null && days[hover] && (
        <div
          className="pointer-events-none absolute top-0 -translate-x-1/2 rounded-media border border-line bg-card px-3 py-2 text-xs shadow-card"
          style={{ left: `${((pad.left + hover * slot + slot / 2) / W) * 100}%` }}
          role="status"
        >
          <span className="block font-medium">{dayLabel(days[hover].date, { weekday: 'short', day: 'numeric', month: 'short' })}</span>
          <span className="block">{label}: {fmt(days[hover][metric])}</span>
        </div>
      )}
    </div>
  );
}

/** Ranked list with horizontal bars (direct labels — few items, so values are shown). */
function BarList({ items, empty }) {
  if (!items.length) return <p className="text-sm text-ink/70">{empty}</p>;
  const max = Math.max(...items.map((i) => i.value));
  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item.label} title={`${item.label}: ${fmt(item.value)}`}>
          <div className="flex items-baseline justify-between gap-3 text-sm">
            <span className="truncate">{item.label}</span>
            <span className="shrink-0 tabular-nums font-medium">{fmt(item.value)}</span>
          </div>
          <div className="mt-1 h-2 rounded-full bg-blush" aria-hidden="true">
            <div className="h-2 rounded-full bg-chart" style={{ width: `${Math.max(3, (item.value / max) * 100)}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}

function EnquiryCard({ enquiry, onDelete }) {
  const digits = enquiry.phone?.replace(/\D/g, '').replace(/^0+/, '') || '';
  const waNumber = digits.length === 10 ? `91${digits}` : digits;
  return (
    <article className="rounded-card border border-line bg-card p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="text-base font-medium">{enquiry.name}</h3>
          <p className="text-xs text-ink/70">
            {new Date(enquiry.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Kolkata' })}
            {enquiry.product && <> · Interested in <strong className="font-medium text-ink">{enquiry.product}</strong></>}
          </p>
        </div>
        {!enquiry.emailed && <span className="rounded-full border border-error/40 px-2 py-0.5 text-[11px] text-error">⚠ Email not sent — reply from here</span>}
      </div>
      <p className="mt-3 whitespace-pre-line text-sm leading-6">{enquiry.message}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <a className="admin-secondary" href={`mailto:${enquiry.email}?subject=${encodeURIComponent('Your Florista enquiry')}`}>✉️ Reply by email</a>
        {waNumber && <a className="admin-secondary" href={`https://wa.me/${waNumber}`} target="_blank" rel="noopener noreferrer">💬 WhatsApp</a>}
        {digits && <a className="admin-secondary" href={`tel:+${waNumber}`}>📞 Call</a>}
        <button type="button" className="min-h-11 px-2 text-sm text-error underline sm:ml-auto" onClick={() => onDelete(enquiry)}>Delete</button>
      </div>
      <p className="mt-2 text-[11px] text-ink/60">{enquiry.email}{enquiry.phone && ` · ${enquiry.phone}`}</p>
    </article>
  );
}

export default function DashboardTab({ token, onTutorial }) {
  const [days, setDays] = useState(30);
  const [metric, setMetric] = useState('visitors');
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setError('');
    try {
      setData(await apiFetch(`/api/admin/stats?days=${days}`, { headers: authHeaders(token) }));
    } catch (err) {
      setError(err.message);
    }
  }, [days, token]);

  useEffect(() => {
    load();
  }, [load]);

  async function remove(enquiry) {
    if (!window.confirm(`Delete the enquiry from ${enquiry.name}? This cannot be undone.`)) return;
    await apiFetch(`/api/admin/enquiries/${enquiry.id}`, { method: 'DELETE', headers: authHeaders(token) });
    load();
  }

  const metricInfo = METRICS.find(([id]) => id === metric);
  const topPages = useMemo(() => (data?.topPages || []).map((p) => ({ label: PAGE_NAMES[p.page] || `/${p.page}`, value: p.views })), [data]);
  const topProducts = useMemo(() => (data?.topProducts || []).map((p) => ({ label: p.name, value: p.clicks })), [data]);

  return (
    <section className="grid gap-6">
      <div className="flex flex-col gap-3 rounded-card border border-rose bg-blush p-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm">New here? The tutorial shows how every part of this panel works.</p>
        <button type="button" className="admin-secondary bg-card" onClick={onTutorial}>▶ Play tutorial</button>
      </div>

      {/* Filters: one row above the charts */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2" role="group" aria-label="Time range">
          {RANGES.map((r) => (
            <button key={r} type="button" aria-pressed={days === r} onClick={() => setDays(r)} className={`admin-tab ${days === r ? 'admin-tab-active' : ''}`}>
              Last {r} days
            </button>
          ))}
        </div>
        <button type="button" className="min-h-11 text-sm underline" onClick={load}>Refresh</button>
      </div>

      {error && <p className="text-sm text-error" role="alert">{error}</p>}
      {!data && !error && <p className="text-sm">Loading…</p>}

      {data && (
        <>
          <div data-tour="dashboard-stats" className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {METRICS.map(([id, label, hint]) => (
              <StatTile key={id} label={label} value={data.totals[id]} hint={hint} active={metric === id} onClick={() => setMetric(id)} />
            ))}
          </div>

          <div data-tour="dashboard-chart" className="rounded-card border border-line bg-card p-4 sm:p-5">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="font-serif text-2xl">{metricInfo[1]} per day</h2>
              <p className="text-xs text-ink/65">Tap a box above to switch · hover or tap a bar for the number</p>
            </div>
            <div className="mt-4">
              <DailyChart days={data.days} metric={metric} label={metricInfo[1]} />
            </div>
            <details className="mt-3 text-sm">
              <summary className="cursor-pointer text-xs underline">Show as table</summary>
              <div className="mt-2 max-h-64 overflow-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-line">
                      <th className="py-1 pr-3 font-medium">Date</th>
                      {METRICS.map(([id, label]) => <th key={id} className="py-1 pr-3 text-right font-medium">{label}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {[...data.days].reverse().map((d) => (
                      <tr key={d.date} className="border-b border-line/60">
                        <td className="py-1 pr-3">{dayLabel(d.date, { weekday: 'short', day: 'numeric', month: 'short' })}</td>
                        {METRICS.map(([id]) => <td key={id} className="py-1 pr-3 text-right tabular-nums">{fmt(d[id])}</td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </details>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-card border border-line bg-card p-4 sm:p-5">
              <h2 className="font-serif text-2xl">Most ordered products</h2>
              <p className="mt-1 text-xs text-ink/65">“Contact for Order” taps that opened WhatsApp</p>
              <div className="mt-4"><BarList items={topProducts} empty="No orders yet in this period." /></div>
            </div>
            <div className="rounded-card border border-line bg-card p-4 sm:p-5">
              <h2 className="font-serif text-2xl">Most visited pages</h2>
              <p className="mt-1 text-xs text-ink/65">Page views per page</p>
              <div className="mt-4"><BarList items={topPages} empty="No visits yet in this period." /></div>
            </div>
          </div>

          <div data-tour="dashboard-enquiries">
            <h2 className="font-serif text-3xl">Recent enquiries</h2>
            <p className="mt-1 text-xs text-ink/65">Messages from the Contact page form (latest 25). Reply by email, WhatsApp or phone.</p>
            <div className="mt-4 grid gap-3">
              {data.enquiries.length ? (
                data.enquiries.map((e) => <EnquiryCard key={e.id} enquiry={e} onDelete={remove} />)
              ) : (
                <p className="text-sm text-ink/70">No enquiries yet.</p>
              )}
            </div>
          </div>

          <p className="text-[11px] text-ink/60">
            Visitor numbers are anonymous (no names or personal data). Your own visits on this device and search-engine bots are not counted.
          </p>
        </>
      )}
    </section>
  );
}
