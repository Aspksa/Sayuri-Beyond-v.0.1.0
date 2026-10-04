import type { LayoutMode, PageTransitionType, RadiusValue, SiderMenuType } from '@/store'

export function LangPreview({ code }: { code: string }) {
  const text = code === 'zh' ? '文' : 'Aa'
  return (
    <svg viewBox="0 0 56 36" className="w-full rounded-sm" xmlns="http://www.w3.org/2000/svg">
      <rect width="56" height="36" className="fill-muted" />
      <text
        x="28"
        y="25"
        textAnchor="middle"
        fontSize="17"
        className="fill-foreground/25"
        fontWeight="600"
        fontFamily="sans-serif"
      >
        {text}
      </text>
    </svg>
  )
}

export function RadiusPreview({ value }: { value: RadiusValue }) {
  const rxMap: Record<RadiusValue, number> = { 0: 0, 0.3: 4, 0.5: 7, 0.75: 10, 1: 14 }
  const rx = rxMap[value]
  return (
    <svg viewBox="0 0 56 36" className="w-full rounded-sm" xmlns="http://www.w3.org/2000/svg">
      <rect width="56" height="36" className="fill-muted" />
      <rect x="8" y="7" width="40" height="22" rx={rx} className="fill-foreground/20" />
    </svg>
  )
}

export function ColorPreviewCard({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 56 36" className="w-full rounded-sm" xmlns="http://www.w3.org/2000/svg">
      <rect width="56" height="36" className="fill-muted" />
      <rect width="56" height="10" fill={color} />
      <rect x="4" y="15" width="48" height="2.5" rx="1" className="fill-foreground/12" />
      <rect x="4" y="21" width="34" height="2.5" rx="1" className="fill-foreground/10" />
      <rect x="4" y="27" width="40" height="2.5" rx="1" className="fill-foreground/10" />
    </svg>
  )
}

export function ThemeModePreview({ mode }: { mode: 'light' | 'dark' | 'system' }) {
  if (mode === 'light') {
    return (
      <svg viewBox="0 0 56 36" className="w-full rounded-sm" xmlns="http://www.w3.org/2000/svg">
        <rect width="56" height="36" className="fill-slate-100" />
        <rect width="56" height="9" className="fill-slate-200" />
        <rect x="5" y="15" width="46" height="2.5" rx="1" className="fill-slate-200" />
        <rect x="5" y="21" width="32" height="2.5" rx="1" className="fill-slate-200" />
        <rect x="5" y="27" width="38" height="2.5" rx="1" className="fill-slate-200" />
      </svg>
    )
  }
  if (mode === 'dark') {
    return (
      <svg viewBox="0 0 56 36" className="w-full rounded-sm" xmlns="http://www.w3.org/2000/svg">
        <rect width="56" height="36" className="fill-slate-800" />
        <rect width="56" height="9" className="fill-slate-700" />
        <rect x="5" y="15" width="46" height="2.5" rx="1" className="fill-slate-700" />
        <rect x="5" y="21" width="32" height="2.5" rx="1" className="fill-slate-700" />
        <rect x="5" y="27" width="38" height="2.5" rx="1" className="fill-slate-700" />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 56 36" className="w-full rounded-sm" xmlns="http://www.w3.org/2000/svg">
      <rect width="28" height="36" className="fill-slate-100" />
      <rect width="28" height="9" className="fill-slate-200" />
      <rect x="5" y="15" width="20" height="2.5" rx="1" className="fill-slate-200" />
      <rect x="5" y="21" width="16" height="2.5" rx="1" className="fill-slate-200" />
      <rect x="28" width="28" height="36" className="fill-slate-800" />
      <rect x="28" width="28" height="9" className="fill-slate-700" />
      <rect x="31" y="15" width="20" height="2.5" rx="1" className="fill-slate-700" />
      <rect x="31" y="21" width="16" height="2.5" rx="1" className="fill-slate-700" />
      <line x1="28" y1="0" x2="28" y2="36" className="stroke-slate-400" strokeWidth="0.5" />
    </svg>
  )
}

export function LayoutModePreview({ mode }: { mode: LayoutMode }) {
  return (
    <svg viewBox="0 0 56 36" className="w-full rounded-sm" xmlns="http://www.w3.org/2000/svg">
      <rect width="56" height="36" className="fill-muted" />
      {mode === 'side' && (
        <>
          <rect width="13" height="36" className="fill-foreground/20" />
          <rect x="17" y="9" width="31" height="2.5" rx="1" className="fill-foreground/10" />
          <rect x="17" y="15" width="23" height="2.5" rx="1" className="fill-foreground/10" />
          <rect x="17" y="21" width="27" height="2.5" rx="1" className="fill-foreground/10" />
        </>
      )}
      {mode === 'top' && (
        <>
          <rect width="56" height="10" className="fill-foreground/20" />
          <rect x="5" y="17" width="46" height="2.5" rx="1" className="fill-foreground/10" />
          <rect x="5" y="23" width="32" height="2.5" rx="1" className="fill-foreground/10" />
        </>
      )}
      {mode === 'mix' && (
        <>
          <rect width="56" height="10" className="fill-foreground/20" />
          <rect y="10" width="13" height="26" className="fill-foreground/20" />
          <rect x="17" y="17" width="31" height="2.5" rx="1" className="fill-foreground/10" />
          <rect x="17" y="23" width="23" height="2.5" rx="1" className="fill-foreground/10" />
        </>
      )}
      {mode === 'column' && (
        <>
          <rect width="8" height="36" className="fill-foreground/20" />
          <rect x="8" y="0" width="13" height="36" className="fill-foreground/12" />
          <rect x="25" y="9" width="25" height="2.5" rx="1" className="fill-foreground/10" />
          <rect x="25" y="15" width="19" height="2.5" rx="1" className="fill-foreground/10" />
          <rect x="25" y="21" width="22" height="2.5" rx="1" className="fill-foreground/10" />
        </>
      )}
    </svg>
  )
}

export function TransitionPreview({ type }: { type: PageTransitionType }) {
  const dur = '2s'
  const lines = (
    <>
      <rect x="6" y="14" width="44" height="2.5" rx="1" className="fill-foreground/20" />
      <rect x="6" y="20" width="32" height="2.5" rx="1" className="fill-foreground/15" />
      <rect x="6" y="26" width="38" height="2.5" rx="1" className="fill-foreground/12" />
    </>
  )
  return (
    <svg
      viewBox="0 0 56 36"
      className="w-full rounded-sm overflow-visible"
      xmlns="http://www.w3.org/2000/svg"
    >
      <style>
        {`
        @keyframes sv-fade{0%,90%,100%{opacity:0}30%,70%{opacity:1}}
        @keyframes sv-slide-up{0%,90%,100%{opacity:0;transform:translateY(8px)}30%,70%{opacity:1;transform:translateY(0)}}
        @keyframes sv-slide-right{0%,90%,100%{opacity:0;transform:translateX(-14px)}30%,70%{opacity:1;transform:translateX(0)}}
        @keyframes sv-zoom{0%,90%,100%{opacity:0;transform:scale(0.82)}30%,70%{opacity:1;transform:scale(1)}}
        .sv-f{animation:sv-fade ${dur} ease infinite}
        .sv-su{animation:sv-slide-up ${dur} ease infinite;transform-origin:28px 25px}
        .sv-sr{animation:sv-slide-right ${dur} ease infinite}
        .sv-z{animation:sv-zoom ${dur} ease infinite;transform-origin:28px 25px}
      `}
      </style>
      <rect width="56" height="36" className="fill-muted" />
      <rect width="56" height="9" className="fill-foreground/10" />
      <g
        className={
          type === 'fade'
            ? 'sv-f'
            : type === 'slide-up'
              ? 'sv-su'
              : type === 'slide-right'
                ? 'sv-sr'
                : 'sv-z'
        }
      >
        {lines}
      </g>
    </svg>
  )
}

export function SiderMenuPreview({ mode }: { mode: SiderMenuType }) {
  return (
    <svg viewBox="0 0 56 36" className="w-full rounded-sm" xmlns="http://www.w3.org/2000/svg">
      <rect width="56" height="36" className="fill-muted" />
      {mode === 'sub' && (
        <>
          {/* parent item */}
          <rect x="4" y="5" width="28" height="3" rx="1" className="fill-foreground/20" />
          {/* expand arrow hint */}
          <rect x="36" y="6" width="6" height="1.5" rx="0.75" className="fill-foreground/15" />
          {/* sub items indented */}
          <rect x="10" y="12" width="22" height="2.5" rx="1" className="fill-foreground/12" />
          <rect x="10" y="18" width="18" height="2.5" rx="1" className="fill-foreground/20" />
          <rect x="10" y="24" width="20" height="2.5" rx="1" className="fill-foreground/12" />
        </>
      )}
      {mode === 'group' && (
        <>
          {/* group label */}
          <rect x="4" y="5" width="16" height="2" rx="1" className="fill-foreground/15" />
          {/* group items */}
          <rect x="4" y="11" width="28" height="2.5" rx="1" className="fill-foreground/20" />
          <rect x="4" y="17" width="22" height="2.5" rx="1" className="fill-foreground/12" />
          {/* second group label */}
          <rect x="4" y="24" width="14" height="2" rx="1" className="fill-foreground/15" />
          <rect x="4" y="30" width="24" height="2.5" rx="1" className="fill-foreground/12" />
        </>
      )}
    </svg>
  )
}
