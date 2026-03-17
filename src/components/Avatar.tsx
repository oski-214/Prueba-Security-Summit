import type { Profile } from "../data/profiles";
import { getAvatarUrl } from "../data/avatarImages";

type Props = {
  profile: Profile;
  gender?: "male" | "female";
};

/**
 * Avatar component — shows the profile-specific character image.
 * Picks male or female avatar based on the gender prop.
 */
export const Avatar: React.FC<Props> = ({ profile, gender = "male" }) => {
  const avatarSrc = getAvatarUrl(profile.avatar_style_key, gender);

  return (
    <div className="avatar-card">
      <img
        className="avatar-img"
        src={avatarSrc}
        alt={profile.name}
      />
    </div>
  );
};

