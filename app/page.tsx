import Link from 'next/link'

// ── helpers ──────────────────────────────────────────────
const accent      = '#7c6cf6'
const accentBright= '#a99bff'
const green       = '#34d399'
const bg          = '#0b0b10'
const surface     = '#15151e'
const surface2    = '#14141d'
const cardBg      = '#1b1b26'
const border      = 'rgba(255,255,255,.08)'
const borderFaint = 'rgba(255,255,255,.06)'
const text        = '#f5f5fa'
const muted       = '#9a9aae'
const muted2      = '#cfcfdd'
const dimmed      = '#6e6e84'
const r           = '14px'

export default function LandingPage() {
  return (
    <div style={{ position: 'relative', background: bg, color: text, fontFamily: "'Inter', system-ui, sans-serif", WebkitFontSmoothing: 'antialiased', minHeight: '100vh', overflowX: 'hidden' }}>

      {/* Ambient glow */}
      <div className="animate-glow-shift" style={{ position: 'absolute', top: -260, left: '50%', transform: 'translateX(-50%)', width: 1100, height: 760, background: `radial-gradient(60% 60% at 50% 40%, rgba(124,108,246,.22), rgba(124,108,246,0) 70%)`, filter: 'blur(20px)', pointerEvents: 'none', zIndex: 0 }} />

      {/* ── NAV ────────────────────────────────────────────── */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 50, backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)', background: 'rgba(11,11,16,.7)', borderBottom: `1px solid ${borderFaint}` }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '15px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20 }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
            <div style={{ width: 32, height: 32, borderRadius: 9, background: `linear-gradient(135deg,${accent},${accentBright})`, display: 'grid', placeItems: 'center', fontFamily: 'var(--font-space-grotesk)', fontWeight: 700, fontSize: 17, color: '#fff', boxShadow: '0 4px 16px rgba(124,108,246,.4)' }}>S</div>
            <span style={{ fontFamily: 'var(--font-space-grotesk)', fontWeight: 700, fontSize: 18, letterSpacing: '-.02em' }}>Syncboard</span>
          </div>
          {/* Links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 30, fontSize: 14.5, color: '#b6b6c6' }}>
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#live" className="hover:text-white transition-colors">How it works</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          </div>
          {/* Auth */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Link href="/login" style={{ fontSize: 14.5, color: muted2 }} className="hover:text-white transition-colors">Sign in</Link>
            <Link href="/login" style={{ background: accent, color: '#fff', fontWeight: 600, fontSize: 14.5, padding: '9px 18px', borderRadius: `calc(${r} - 4px)`, boxShadow: '0 6px 20px rgba(124,108,246,.35)' }} className="hover:brightness-110 transition-all">Start free</Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ────────────────────────────────────────────── */}
      <section style={{ position: 'relative', zIndex: 1, maxWidth: 1200, margin: '0 auto', padding: '78px 28px 40px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 48 }}>

        {/* Left — copy */}
        <div className="animate-reveal" style={{ flex: 1, minWidth: 360 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 9, padding: '6px 13px 6px 11px', border: '1px solid rgba(255,255,255,.1)', background: 'rgba(255,255,255,.03)', borderRadius: 100, fontSize: 13, color: muted2, marginBottom: 24 }}>
            <span className="animate-pulse-green" style={{ width: 8, height: 8, borderRadius: '50%', background: green }} />
            Real-time collaborative boards
          </div>

          <h1 style={{ fontFamily: 'var(--font-space-grotesk)', fontWeight: 700, fontSize: 'clamp(42px,5.6vw,74px)', lineHeight: 1.0, letterSpacing: '-.035em', marginBottom: 22 }}>
            Your team,<br />in sync.{' '}
            <span style={{ background: `linear-gradient(96deg,${accent},${accentBright})`, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>Always.</span>
          </h1>

          <p style={{ fontSize: 18.5, lineHeight: 1.6, color: '#a3a3b6', maxWidth: 480, marginBottom: 34 }}>
            A real-time Kanban board where your whole team works live. Drag a card and everyone sees it move — cursors, presence and edits, instantly. No refresh, ever.
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 13, marginBottom: 26 }}>
            <Link href="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: accent, color: '#fff', fontWeight: 600, fontSize: 15.5, padding: '14px 24px', borderRadius: r, boxShadow: '0 10px 30px rgba(124,108,246,.4)' }} className="hover:brightness-110 hover:-translate-y-px transition-all">
              Start free →
            </Link>
            <Link href="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 9, background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.12)', color: '#eaeaf2', fontWeight: 600, fontSize: 15.5, padding: '14px 22px', borderRadius: r }} className="hover:bg-white/10 transition-colors">
              <GitHubIcon />
              Continue with GitHub
            </Link>
          </div>

          {/* Avatar stack */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              {[
                { l: 'A', bg: 'linear-gradient(135deg,#f2734d,#f5b252)', color: '#fff' },
                { l: 'M', bg: 'linear-gradient(135deg,#4d8df6,#7c6cf6)', color: '#fff' },
                { l: 'J', bg: 'linear-gradient(135deg,#22c79a,#5ff0c5)', color: bg },
                { l: '+9', bg: '#1b1b26', color: muted2, small: true },
              ].map(({ l, bg: ab, color, small }, i) => (
                <div key={l} style={{ width: 30, height: 30, borderRadius: '50%', background: ab, border: `2px solid ${bg}`, marginLeft: i === 0 ? 0 : -9, display: 'grid', placeItems: 'center', fontSize: small ? 10 : 11, fontWeight: 700, color }}>
                  {l}
                </div>
              ))}
            </div>
            <span style={{ fontSize: 13.5, color: '#8a8a9e' }}>12 teammates collaborating right now · No credit card</span>
          </div>
        </div>

        {/* Right — animated board */}
        <div className="animate-floaty" style={{ flex: 1, minWidth: 392 }}>
          <div style={{ position: 'relative', border: `1px solid rgba(255,255,255,.09)`, borderRadius: 18, background: `linear-gradient(180deg,${surface},#101019)`, boxShadow: '0 30px 80px rgba(0,0,0,.55)', overflow: 'hidden' }}>

            {/* Window bar */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 16px', borderBottom: `1px solid ${borderFaint}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <span style={{ width: 11, height: 11, borderRadius: '50%', background: '#f2615a' }} />
                <span style={{ width: 11, height: 11, borderRadius: '50%', background: '#f5b836' }} />
                <span style={{ width: 11, height: 11, borderRadius: '50%', background: '#3fc96b' }} />
                <span style={{ fontSize: 13, color: '#9a9aae', marginLeft: 10, fontWeight: 500 }}>Product Roadmap · Q3</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                {[
                  { l: 'A', bg: 'linear-gradient(135deg,#f2734d,#f5b252)' },
                  { l: 'M', bg: 'linear-gradient(135deg,#4d8df6,#7c6cf6)', ml: -7 },
                  { l: '', bg: 'linear-gradient(135deg,#22c79a,#5ff0c5)', ml: -7 },
                ].map(({ l, bg: ab, ml }, i) => (
                  <div key={i} style={{ width: 24, height: 24, borderRadius: '50%', background: ab, border: `2px solid ${surface}`, marginLeft: ml ?? 0, display: 'grid', placeItems: 'center', fontSize: 9, fontWeight: 700, color: '#fff' }}>
                    {l}
                  </div>
                ))}
              </div>
            </div>

            {/* Columns */}
            <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 11, padding: '16px 14px 18px' }}>
              {[
                { title: 'Backlog',      dot: '#7a7a90', cards: ['User auth flow', 'Mobile nav redesign', 'Dark mode toggle'], done: false },
                { title: 'In Progress',  dot: accent,    cards: ['Presence indicators', 'Drag & drop cards'],                  done: false, live: 1 },
                { title: 'Review',       dot: '#f5b836', cards: ['Realtime sync engine'],                                      done: false },
                { title: 'Done',         dot: green,     cards: ['Database schema', 'CI/CD pipeline', 'API rate limiting'],    done: true },
              ].map((col) => (
                <div key={col.title}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11.5, fontWeight: 600, color: muted2 }}>
                      <span style={{ width: 7, height: 7, borderRadius: '50%', background: col.dot }} />
                      {col.title}
                    </div>
                    <span style={{ fontSize: 11, color: dimmed }}>{col.cards.length}</span>
                  </div>
                  {col.cards.map((card, ci) => (
                    <div key={card} style={{ position: 'relative', background: cardBg, border: `1px solid ${borderFaint}`, borderRadius: 9, padding: '9px 10px', fontSize: 11.5, color: col.done ? '#9a9aae' : '#d6d6e2', marginBottom: ci < col.cards.length - 1 ? 8 : 0 }}>
                      {card}
                      {col.live === ci && (
                        <span className="animate-blink" style={{ position: 'absolute', top: 8, right: 9, width: 6, height: 6, borderRadius: '50%', background: green }} />
                      )}
                    </div>
                  ))}
                </div>
              ))}

              {/* Dragged card */}
              <div className="animate-drag-loop" style={{ position: 'absolute', left: 18, top: 54, width: 148, zIndex: 6 }}>
                <div style={{ background: '#212130', border: `1px solid ${accent}`, borderRadius: 9, padding: '9px 10px', fontSize: 11.5, color: '#fff', boxShadow: `0 16px 34px rgba(0,0,0,.6),0 0 0 3px rgba(124,108,246,.18)` }}>
                  Realtime sync engine
                </div>
                {/* Cursor Ana */}
                <div style={{ position: 'absolute', left: 118, top: 20 }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill={accentBright} style={{ filter: 'drop-shadow(0 2px 3px rgba(0,0,0,.5))' }}><path d="M5 2l14 7-6 2-2 6-6-15z"/></svg>
                  <span style={{ position: 'absolute', left: 16, top: 16, background: accent, color: '#fff', fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 6, whiteSpace: 'nowrap' }}>Ana</span>
                </div>
              </div>

              {/* Cursor Marco */}
              <div className="animate-drift2" style={{ position: 'absolute', right: 42, top: 120, zIndex: 5 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill={green} style={{ filter: 'drop-shadow(0 2px 3px rgba(0,0,0,.5))' }}><path d="M5 2l14 7-6 2-2 6-6-15z"/></svg>
                <span style={{ position: 'absolute', left: 16, top: 16, background: '#1f9c6f', color: '#fff', fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 6, whiteSpace: 'nowrap' }}>Marco</span>
              </div>
            </div>

            {/* Live status footer */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '11px 16px', borderTop: `1px solid ${borderFaint}`, fontSize: 12, color: '#8a8a9e' }}>
              <span className="animate-pulse-green" style={{ width: 7, height: 7, borderRadius: '50%', background: green }} />
              Ana moved <strong style={{ color: muted2, fontWeight: 600, margin: '0 3px' }}>Realtime sync engine</strong> · synced in 38ms
            </div>
          </div>
        </div>
      </section>

      {/* ── TRUST STRIP ─────────────────────────────────────── */}
      <section style={{ position: 'relative', zIndex: 1, maxWidth: 1100, margin: '36px auto 10px', padding: '0 28px', textAlign: 'center' }}>
        <p style={{ fontSize: 12.5, letterSpacing: '.14em', textTransform: 'uppercase', color: dimmed, marginBottom: 22 }}>Trusted by fast-moving teams</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: 42, opacity: .72 }}>
          {['Northwind', 'Loophole', 'Cadence', 'Vertex', 'Quanta'].map(name => (
            <span key={name} style={{ fontFamily: 'var(--font-space-grotesk)', fontWeight: 700, fontSize: 21, color: '#c8c8d6' }}>{name}</span>
          ))}
        </div>
      </section>

      {/* ── FEATURES ────────────────────────────────────────── */}
      <section id="features" style={{ position: 'relative', zIndex: 1, maxWidth: 1200, margin: '0 auto', padding: '96px 28px 30px' }}>
        <div style={{ maxWidth: 640, marginBottom: 48 }}>
          <p style={{ fontSize: 13, letterSpacing: '.04em', color: accentBright, fontWeight: 600, marginBottom: 14 }}>WHY SYNCBOARD</p>
          <h2 style={{ fontFamily: 'var(--font-space-grotesk)', fontWeight: 700, fontSize: 'clamp(30px,3.6vw,44px)', lineHeight: 1.08, letterSpacing: '-.025em' }}>
            Built for the way teams actually move.
          </h2>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 18 }}>
          {[
            {
              icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={accentBright} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="3.2"/><path d="M5 20a7 7 0 0 1 14 0"/></svg>,
              bg: `rgba(124,108,246,.14)`, border: `rgba(124,108,246,.25)`,
              title: 'Live presence',
              desc: "See every teammate's cursor, selection and edit the instant it happens. You always know who's doing what.",
            },
            {
              icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={green} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 9h4v11H5zM15 4h4v16h-4z"/><path d="M9 14h6"/></svg>,
              bg: 'rgba(52,211,153,.13)', border: 'rgba(52,211,153,.25)',
              title: 'Instant drag & drop',
              desc: 'Move a card and it lands on everyone\'s board immediately — no refresh, no stale state, no lost work.',
            },
            {
              icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f5b836" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2 4 14h7l-1 8 9-12h-7l1-8z"/></svg>,
              bg: 'rgba(245,184,54,.13)', border: 'rgba(245,184,54,.25)',
              title: 'Sub-50ms sync',
              desc: 'A conflict-free sync engine keeps every board consistent under load, even with the whole team editing at once.',
            },
          ].map(({ icon, bg: ib, border: ibd, title, desc }) => (
            <div key={title} style={{ flex: 1, minWidth: 280, background: `linear-gradient(180deg,${surface2},#101017)`, border: `1px solid ${border}`, borderRadius: r, padding: 28 }}>
              <div style={{ width: 42, height: 42, borderRadius: 11, background: ib, border: `1px solid ${ibd}`, display: 'grid', placeItems: 'center', marginBottom: 18 }}>
                {icon}
              </div>
              <h3 style={{ fontFamily: 'var(--font-space-grotesk)', fontWeight: 600, fontSize: 19, marginBottom: 9 }}>{title}</h3>
              <p style={{ fontSize: 14.5, lineHeight: 1.6, color: muted }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── LIVE SHOWCASE ───────────────────────────────────── */}
      <section id="live" style={{ position: 'relative', zIndex: 1, maxWidth: 1200, margin: '0 auto', padding: '84px 28px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 54 }}>
        <div style={{ flex: 1, minWidth: 340 }}>
          <p style={{ fontSize: 13, letterSpacing: '.04em', color: accentBright, fontWeight: 600, marginBottom: 14 }}>COLLABORATION, LIVE</p>
          <h2 style={{ fontFamily: 'var(--font-space-grotesk)', fontWeight: 700, fontSize: 'clamp(28px,3.4vw,42px)', lineHeight: 1.1, letterSpacing: '-.025em', marginBottom: 20 }}>
            Watch the board breathe with your team.
          </h2>
          <p style={{ fontSize: 16.5, lineHeight: 1.65, color: '#a3a3b6', marginBottom: 26, maxWidth: 460 }}>
            Every cursor, comment and status change streams in real time. The activity feed keeps a running history so nobody misses a beat — even across time zones.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {['Live cursors & selections', 'Threaded comments on any card', 'Full activity history & undo'].map(item => (
              <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 11, fontSize: 15, color: muted2 }}>
                <span style={{ width: 18, height: 18, borderRadius: 5, background: 'rgba(52,211,153,.15)', display: 'grid', placeItems: 'center', color: green, fontSize: 12 }}>✓</span>
                {item}
              </div>
            ))}
          </div>
        </div>

        {/* Activity panel */}
        <div style={{ flex: 1, minWidth: 360 }}>
          <div style={{ position: 'relative', border: `1px solid rgba(255,255,255,.09)`, borderRadius: 18, background: `linear-gradient(180deg,${surface},#101019)`, boxShadow: '0 30px 70px rgba(0,0,0,.5)', padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <span style={{ fontSize: 13.5, fontWeight: 600, color: muted2 }}>Activity</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11.5, color: green }}>
                <span className="animate-pulse-green" style={{ width: 7, height: 7, borderRadius: '50%', background: green }} />
                3 online
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
              {[
                { l: 'A', grad: 'linear-gradient(135deg,#f2734d,#f5b252)', name: 'Ana',   action: 'moved', item: 'Realtime sync engine', itemColor: accentBright, ctx: 'to Review', time: 'just now', cls: 'animate-toast-in' },
                { l: 'M', grad: 'linear-gradient(135deg,#4d8df6,#7c6cf6)', name: 'Marco', action: 'commented on', item: 'Presence indicators', itemColor: accentBright, ctx: '', time: '2 min ago', cls: '' },
                { l: 'J', grad: 'linear-gradient(135deg,#22c79a,#5ff0c5)', name: 'Jana',  action: 'completed', item: 'API rate limiting', itemColor: green, ctx: '', time: '5 min ago', cls: '' },
              ].map(({ l, grad, name, action, item, itemColor, ctx, time, cls }) => (
                <div key={name} className={cls} style={{ display: 'flex', gap: 11, alignItems: 'flex-start' }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: grad, flexShrink: 0, display: 'grid', placeItems: 'center', fontSize: 11, fontWeight: 700, color: l === 'J' ? bg : '#fff' }}>{l}</div>
                  <div style={{ fontSize: 13.5, color: '#c4c4d2', lineHeight: 1.45 }}>
                    <strong style={{ color: '#fff', fontWeight: 600 }}>{name}</strong>{' '}{action}{' '}
                    <span style={{ color: itemColor }}>{item}</span>
                    {ctx && ` ${ctx}`}
                    <div style={{ fontSize: 11, color: dimmed, marginTop: 2 }}>{time}</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 18, display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', background: '#13131b', border: `1px solid ${borderFaint}`, borderRadius: 10 }}>
              <input disabled placeholder="Write a comment…" style={{ flex: 1, background: 'transparent', border: 'none', color: '#8a8a9e', fontSize: 13, fontFamily: 'inherit', outline: 'none' }} />
              <span style={{ fontSize: 11, color: dimmed }}>⏎</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── PRICING ─────────────────────────────────────────── */}
      <section id="pricing" style={{ position: 'relative', zIndex: 1, maxWidth: 1100, margin: '0 auto', padding: '84px 28px 40px' }}>
        <div style={{ textAlign: 'center', marginBottom: 50 }}>
          <p style={{ fontSize: 13, letterSpacing: '.04em', color: accentBright, fontWeight: 600, marginBottom: 14 }}>PRICING</p>
          <h2 style={{ fontFamily: 'var(--font-space-grotesk)', fontWeight: 700, fontSize: 'clamp(30px,3.6vw,44px)', letterSpacing: '-.025em' }}>Start free. Scale when you&apos;re ready.</h2>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 18, alignItems: 'stretch' }}>
          {/* Free */}
          <div style={{ flex: 1, minWidth: 270, background: '#101017', border: `1px solid ${border}`, borderRadius: r, padding: 30 }}>
            <h3 style={{ fontFamily: 'var(--font-space-grotesk)', fontWeight: 600, fontSize: 18, marginBottom: 6 }}>Free</h3>
            <p style={{ fontSize: 13.5, color: '#8a8a9e', marginBottom: 18 }}>For small teams getting started.</p>
            <div style={{ marginBottom: 22 }}>
              <span style={{ fontFamily: 'var(--font-space-grotesk)', fontWeight: 700, fontSize: 40, letterSpacing: '-.03em' }}>$0</span>
              <span style={{ color: '#8a8a9e', fontSize: 14 }}> /forever</span>
            </div>
            <Link href="/login" style={{ display: 'block', textAlign: 'center', padding: 11, borderRadius: `calc(${r} - 3px)`, background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.12)', color: '#eaeaf2', fontWeight: 600, fontSize: 14.5, marginBottom: 22 }} className="hover:bg-white/10 transition-colors">
              Get started
            </Link>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 11, fontSize: 13.5, color: '#b6b6c6' }}>
              {['Up to 5 boards', 'Up to 5 members', 'Real-time sync', '7-day history'].map(f => (
                <div key={f} style={{ display: 'flex', gap: 9 }}><span style={{ color: green }}>✓</span>{f}</div>
              ))}
            </div>
          </div>
          {/* Pro */}
          <div style={{ flex: 1, minWidth: 270, background: 'linear-gradient(180deg,#1a1726,#121018)', border: `1px solid ${accent}`, borderRadius: r, padding: 30, position: 'relative', boxShadow: '0 24px 60px rgba(124,108,246,.22)' }}>
            <span style={{ position: 'absolute', top: -11, left: 30, background: accent, color: '#fff', fontSize: 11, fontWeight: 700, letterSpacing: '.04em', padding: '4px 11px', borderRadius: 7 }}>MOST POPULAR</span>
            <h3 style={{ fontFamily: 'var(--font-space-grotesk)', fontWeight: 600, fontSize: 18, marginBottom: 6 }}>Pro</h3>
            <p style={{ fontSize: 13.5, color: '#a3a3b6', marginBottom: 18 }}>For growing teams that ship fast.</p>
            <div style={{ marginBottom: 22 }}>
              <span style={{ fontFamily: 'var(--font-space-grotesk)', fontWeight: 700, fontSize: 40, letterSpacing: '-.03em' }}>$9</span>
              <span style={{ color: '#a3a3b6', fontSize: 14 }}> /user / month</span>
            </div>
            <Link href="/login" style={{ display: 'block', textAlign: 'center', padding: 11, borderRadius: `calc(${r} - 3px)`, background: accent, color: '#fff', fontWeight: 600, fontSize: 14.5, marginBottom: 22, boxShadow: '0 8px 24px rgba(124,108,246,.4)' }} className="hover:brightness-110 transition-all">
              Start free trial
            </Link>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 11, fontSize: 13.5, color: '#d6d6e2' }}>
              {['Unlimited boards & members', 'Live presence & cursors', 'Unlimited history & undo', 'GitHub & Slack integrations'].map(f => (
                <div key={f} style={{ display: 'flex', gap: 9 }}><span style={{ color: green }}>✓</span>{f}</div>
              ))}
            </div>
          </div>
          {/* Enterprise */}
          <div style={{ flex: 1, minWidth: 270, background: '#101017', border: `1px solid ${border}`, borderRadius: r, padding: 30 }}>
            <h3 style={{ fontFamily: 'var(--font-space-grotesk)', fontWeight: 600, fontSize: 18, marginBottom: 6 }}>Enterprise</h3>
            <p style={{ fontSize: 13.5, color: '#8a8a9e', marginBottom: 18 }}>For organizations at scale.</p>
            <div style={{ marginBottom: 22 }}>
              <span style={{ fontFamily: 'var(--font-space-grotesk)', fontWeight: 700, fontSize: 40, letterSpacing: '-.03em' }}>Custom</span>
            </div>
            <a href="mailto:hello@syncboard.app" style={{ display: 'block', textAlign: 'center', padding: 11, borderRadius: `calc(${r} - 3px)`, background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.12)', color: '#eaeaf2', fontWeight: 600, fontSize: 14.5, marginBottom: 22 }} className="hover:bg-white/10 transition-colors">
              Contact sales
            </a>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 11, fontSize: 13.5, color: '#b6b6c6' }}>
              {['SSO & SCIM', 'Audit logs', '99.99% uptime SLA', 'Dedicated support'].map(f => (
                <div key={f} style={{ display: 'flex', gap: 9 }}><span style={{ color: green }}>✓</span>{f}</div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ───────────────────────────────────────── */}
      <section style={{ position: 'relative', zIndex: 1, maxWidth: 1100, margin: '60px auto 0', padding: '0 28px' }}>
        <div style={{ position: 'relative', overflow: 'hidden', border: '1px solid rgba(124,108,246,.3)', borderRadius: 24, background: 'linear-gradient(135deg,#191428,#100e18)', padding: '64px 40px', textAlign: 'center' }}>
          <div style={{ position: 'absolute', top: -120, left: '50%', transform: 'translateX(-50%)', width: 600, height: 400, background: 'radial-gradient(50% 50% at 50% 50%,rgba(124,108,246,.3),transparent 70%)', pointerEvents: 'none' }} />
          <h2 style={{ position: 'relative', fontFamily: 'var(--font-space-grotesk)', fontWeight: 700, fontSize: 'clamp(30px,4vw,48px)', letterSpacing: '-.03em', marginBottom: 16 }}>
            Get your team in sync today.
          </h2>
          <p style={{ position: 'relative', fontSize: 17, color: '#a3a3b6', marginBottom: 30, maxWidth: 440, marginLeft: 'auto', marginRight: 'auto' }}>
            Free up to 5 boards. No credit card required. Set up your first board in under a minute.
          </p>
          <Link href="/login" style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', gap: 8, background: accent, color: '#fff', fontWeight: 600, fontSize: 16, padding: '15px 30px', borderRadius: r, boxShadow: '0 12px 34px rgba(124,108,246,.45)' }} className="hover:brightness-110 hover:-translate-y-px transition-all">
            Start free →
          </Link>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────── */}
      <footer style={{ position: 'relative', zIndex: 1, maxWidth: 1200, margin: '0 auto', padding: '64px 28px 40px', display: 'flex', flexWrap: 'wrap', gap: 40, justifyContent: 'space-between' }}>
        <div style={{ maxWidth: 280 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: `linear-gradient(135deg,${accent},${accentBright})`, display: 'grid', placeItems: 'center', fontFamily: 'var(--font-space-grotesk)', fontWeight: 700, fontSize: 15, color: '#fff' }}>S</div>
            <span style={{ fontFamily: 'var(--font-space-grotesk)', fontWeight: 700, fontSize: 16 }}>Syncboard</span>
          </div>
          <p style={{ fontSize: 13.5, lineHeight: 1.6, color: '#8a8a9e' }}>Real-time Kanban for teams that move together.</p>
        </div>
        <div style={{ display: 'flex', gap: 64, flexWrap: 'wrap' }}>
          {[
            { label: 'Product',  links: [{ text: 'Features', href: '#features' }, { text: 'Pricing', href: '#pricing' }, { text: 'Changelog', href: '#' }] },
            { label: 'Company',  links: [{ text: 'About', href: '#' }, { text: 'Blog', href: '#' }, { text: 'Careers', href: '#' }] },
            { label: 'Legal',    links: [{ text: 'Privacy', href: '#' }, { text: 'Terms', href: '#' }, { text: 'Security', href: '#' }] },
          ].map(({ label, links }) => (
            <div key={label} style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
              <span style={{ fontSize: 12, letterSpacing: '.06em', textTransform: 'uppercase', color: dimmed, marginBottom: 3 }}>{label}</span>
              {links.map(({ text, href }) => (
                <a key={text} href={href} style={{ fontSize: 14, color: '#b6b6c6' }} className="hover:text-white transition-colors">{text}</a>
              ))}
            </div>
          ))}
        </div>
      </footer>
      <div style={{ position: 'relative', zIndex: 1, borderTop: `1px solid ${borderFaint}`, maxWidth: 1200, margin: '0 auto', padding: '22px 28px', fontSize: 13, color: dimmed }}>
        © 2026 Syncboard. All rights reserved.
      </div>

    </div>
  )
}

function GitHubIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.6 7.6 0 0 1 2-.27c.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z"/>
    </svg>
  )
}
