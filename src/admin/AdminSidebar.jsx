import { Link } from 'react-router-dom';
import { IMAGE_SLOTS, SECTIONS } from '../content/sections';

const unique = (list) => [...new Set(list)];

/** Every feature of the admin panel, as shown in the side menu. */
export const MENU = [
  { tab: 'dashboard', icon: '📊', label: 'Dashboard', hint: 'Visitors, orders & enquiries' },
  {
    tab: 'products',
    icon: '🛍️',
    label: 'Products & prices',
    hint: 'Add, edit, hide or delete items',
    subs: [
      ['home', 'Home collection'],
      ['bouquets', 'Bouquets'],
      ['candles', 'Candles & decor'],
    ],
  },
  {
    tab: 'photos',
    icon: '🖼️',
    label: 'Photos',
    hint: 'Change any photo on the website',
    subs: unique(IMAGE_SLOTS.map((s) => s.page)).map((p) => [p, p]),
  },
  {
    tab: 'text',
    icon: '✏️',
    label: 'Website text',
    hint: 'Headings, paragraphs, buttons',
    subs: unique(SECTIONS.map((s) => s.page))
      .filter((p) => p !== 'Contact & WhatsApp')
      .map((p) => [p, p]),
  },
  { tab: 'contact', icon: '💬', label: 'Contact & WhatsApp', hint: 'WhatsApp number, location, Instagram' },
  { tab: 'security', icon: '🔒', label: 'Security', hint: 'Change the admin passkey' },
];

export function menuTitle(view) {
  const item = MENU.find((m) => m.tab === view.tab);
  const sub = item?.subs?.find(([id]) => id === view.sub)?.[1];
  return { title: item?.label ?? '', sub, hint: item?.hint ?? '' };
}

/** Side menu content — used in the desktop sidebar and in the phone drawer. */
export default function AdminSidebar({ view, onSelect, onTutorial, onLogout }) {
  return (
    <div data-tour="sidebar" className="flex min-h-full flex-col">
      <div className="px-5 pt-6 pb-4">
        <p className="font-serif text-2xl leading-none">Florista</p>
        <p className="mt-1 text-[11px] uppercase tracking-eyebrow">Admin panel</p>
      </div>

      <nav aria-label="Admin menu" className="flex-1 px-3">
        <ul className="space-y-1">
          {MENU.map((item) => {
            const active = view.tab === item.tab;
            return (
              <li key={item.tab}>
                <button
                  type="button"
                  aria-current={active && !view.sub ? 'page' : undefined}
                  onClick={() => onSelect(item.tab, null)}
                  className={`flex w-full items-start gap-3 rounded-media px-3 py-2.5 text-left transition-colors ${active ? 'bg-blush' : 'hover:bg-cream'}`}
                >
                  <span aria-hidden="true" className="text-base leading-5">{item.icon}</span>
                  <span>
                    <span className={`block text-sm leading-5 ${active ? 'font-medium' : ''}`}>{item.label}</span>
                    <span className="block text-[11px] leading-4 text-ink/65">{item.hint}</span>
                  </span>
                </button>
                {item.subs && (
                  <ul className="mt-0.5 mb-1 ml-9 border-l border-line">
                    {item.subs.map(([id, label]) => {
                      const subActive = active && view.sub === id;
                      return (
                        <li key={id}>
                          <button
                            type="button"
                            aria-current={subActive ? 'page' : undefined}
                            onClick={() => onSelect(item.tab, id)}
                            className={`-ml-px block min-h-9 w-full border-l-2 px-3 py-1.5 text-left text-[13px] ${subActive ? 'border-ink font-medium' : 'border-transparent text-ink/80 hover:border-rose'}`}
                          >
                            {label}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      <div data-tour="sidebar-footer" className="mt-4 space-y-1 border-t border-line px-3 py-4">
        <button type="button" onClick={onTutorial} className="flex min-h-11 w-full items-center gap-3 rounded-media px-3 text-left text-sm hover:bg-cream">
          <span aria-hidden="true">▶️</span> Play tutorial
        </button>
        <Link to="/" className="flex min-h-11 w-full items-center gap-3 rounded-media px-3 text-sm hover:bg-cream">
          <span aria-hidden="true">🌸</span> View website
        </Link>
        <button type="button" onClick={onLogout} className="flex min-h-11 w-full items-center gap-3 rounded-media px-3 text-left text-sm hover:bg-cream">
          <span aria-hidden="true">🚪</span> Log out
        </button>
      </div>
    </div>
  );
}
