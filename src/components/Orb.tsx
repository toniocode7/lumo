import './Orb.css'

// Placeholder light spirit. The real creature (egg, stages, branches) comes in step 3.
export function Orb({ size = 180 }: { size?: number }) {
  return (
    <div className="orb" style={{ width: size, height: size }} aria-hidden="true">
      <svg viewBox="0 0 200 200" width="100%" height="100%">
        <defs>
          <radialGradient id="orb-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0" stopColor="#4fd1c5" stopOpacity="0.55" />
            <stop offset="1" stopColor="#4fd1c5" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="orb-core" cx="45%" cy="40%" r="60%">
            <stop offset="0" stopColor="#f2fffd" />
            <stop offset="0.5" stopColor="#8be6dc" />
            <stop offset="1" stopColor="#2fa89d" />
          </radialGradient>
        </defs>
        <circle className="orb-halo" cx="100" cy="100" r="96" fill="url(#orb-glow)" />
        <g className="orb-body">
          <path d="M100 52 L134 100 L100 148 L66 100 Z" fill="url(#orb-core)" />
          <path d="M100 52 L134 100 L100 100 Z" fill="#ffffff" opacity="0.25" />
          <circle cx="88" cy="98" r="4.5" fill="#0b1f1d" />
          <circle cx="112" cy="98" r="4.5" fill="#0b1f1d" />
        </g>
        <circle className="orb-mote m1" cx="48" cy="70" r="2.5" fill="#bff3ee" />
        <circle className="orb-mote m2" cx="156" cy="84" r="2" fill="#bff3ee" />
        <circle className="orb-mote m3" cx="140" cy="146" r="1.8" fill="#bff3ee" />
      </svg>
    </div>
  )
}
