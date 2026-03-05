import type { Profile } from "../data/profiles";

type Props = {
  profile: Profile;
};

const paletteByKey: Record<
  Profile["avatar_style_key"],
  { primary: string; secondary: string; accent: string }
> = {
  entra: {
    primary: "#155E9A",
    secondary: "#E5F1FB",
    accent: "#7CC5FF"
  },
  sentinel: {
    primary: "#0F6CBD",
    secondary: "#E6F2FB",
    accent: "#8FD1FF"
  },
  defender: {
    primary: "#0078D4",
    secondary: "#E5F4FF",
    accent: "#5EC4FF"
  },
  purview: {
    primary: "#4B4AD7",
    secondary: "#EBEBFF",
    accent: "#A0A0FF"
  },
  copilot: {
    primary: "#6B4AD7",
    secondary: "#F3ECFF",
    accent: "#C5A5FF"
  }
};

export const Avatar: React.FC<Props> = ({ profile }) => {
  const palette = paletteByKey[profile.avatar_style_key];

  return (
    <div className="avatar-card">
      <svg
        className="avatar-svg"
        viewBox="0 0 120 120"
        role="img"
        aria-label={profile.name}
      >
        <defs>
          <linearGradient id="bgGrad" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor={palette.secondary} />
            <stop offset="100%" stopColor="#ffffff" />
          </linearGradient>
          <pattern
            id="dots"
            x="0"
            y="0"
            width="8"
            height="8"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="1" cy="1" r="1" fill={palette.accent} opacity="0.4" />
          </pattern>
        </defs>

        <rect
          x="6"
          y="6"
          width="108"
          height="108"
          rx="20"
          fill="url(#bgGrad)"
        />
        <rect
          x="6"
          y="6"
          width="108"
          height="108"
          rx="20"
          fill="url(#dots)"
          opacity="0.18"
        />

        <g transform="translate(18 22)">
          <circle
            cx="62"
            cy="24"
            r="18"
            fill={palette.primary}
            opacity="0.14"
          />
          <circle
            cx="40"
            cy="40"
            r="24"
            fill={palette.primary}
            opacity="0.18"
          />
          <circle
            cx="40"
            cy="34"
            r="14"
            fill="#ffffff"
            stroke={palette.primary}
            strokeWidth="3"
          />
          <rect
            x="24"
            y="46"
            width="32"
            height="18"
            rx="9"
            fill={palette.primary}
          />
          <path
            d="M32 54 L38 59 L48 49"
            fill="none"
            stroke="#ffffff"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      </svg>
    </div>
  );
};

