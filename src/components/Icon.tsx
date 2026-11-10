// Small hand-drawn icon set: 24x24, 1.75 stroke, rounded joins.
const paths = {
  home: 'M4 11 12 4l8 7v8a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1z',
  tasks: 'M9 6h11M9 12h11M9 18h11M4 6l1 1 2-2M4 12l1 1 2-2M4 18l1 1 2-2',
  cards: 'M7 4h9a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zM11.5 9l2 3-2 3-2-3z',
  compass: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM15.5 8.5l-2 5-5 2 2-5z',
  nest: 'M4 14c0 3.3 3.6 6 8 6s8-2.7 8-6M3 14h18M12 14V9M12 9c0-2.5 2-4 4.5-4C16.5 7.5 14.5 9 12 9zM12 11c0-2-1.6-3.2-3.6-3.2 0 2 1.6 3.2 3.6 3.2z',
  user: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 20c1.2-3.5 4.2-5 8-5s6.8 1.5 8 5',
  plus: 'M12 5v14M5 12h14',
  coin: 'M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM12 8v8M9.5 10.5c0-1 1.1-1.5 2.5-1.5s2.5.6 2.5 1.5-1.1 1.3-2.5 1.5-2.5.5-2.5 1.5 1.1 1.5 2.5 1.5 2.5-.5 2.5-1.5',
  flame: 'M12 21c-3.5 0-6-2.4-6-5.6 0-3.6 3-5.4 3.5-9.4 2.6 1.5 4 3.6 4 5.6.8-.6 1.4-1.6 1.5-2.6 1.8 1.6 3 3.8 3 6.4 0 3.2-2.5 5.6-6 5.6z',
  sun: 'M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4',
  moon: 'M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z',
  spark: 'M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z',
  chevron: 'M9 6l6 6-6 6',
  check: 'M5 12.5l4.5 4.5L19 7.5',
  trash: 'M5 7h14M10 7V5h4v2M7 7l1 12h8l1-12M10.5 11v5M13.5 11v5',
  close: 'M6 6l12 12M18 6L6 18',
  repeat: 'M17 3l3 3-3 3M20 6H8a4 4 0 0 0-4 4v1M7 21l-3-3 3-3M4 18h12a4 4 0 0 0 4-4v-1',
} as const

export type IconName = keyof typeof paths

export function Icon({ name, size = 22 }: { name: IconName; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={paths[name]} />
    </svg>
  )
}
