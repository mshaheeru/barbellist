import { avatarToneFromName, getInitials } from "@/lib/members/format";

type MemberAvatarProps = {
  name: string;
  photoUrl?: string | null;
  size?: "list" | "profile";
};

const sizeMap = {
  list: 38,
  profile: 120,
};

const toneStyles = {
  green: { background: "#E7F0EA", color: "var(--color-primary)" },
  amber: { background: "#F7ECD6", color: "var(--color-accent)" },
  grey: { background: "#EFEDE6", color: "#8A8A80" },
};

export function MemberAvatar({
  name,
  photoUrl,
  size = "list",
}: MemberAvatarProps) {
  const px = sizeMap[size];
  const tone = avatarToneFromName(name);
  const colors = toneStyles[tone];
  const initials = getInitials(name);

  if (photoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={photoUrl}
        alt={name}
        width={px}
        height={px}
        style={{
          width: px,
          height: px,
          borderRadius: "50%",
          objectFit: "cover",
          flexShrink: 0,
          border: size === "profile" ? "3px solid #F7ECD6" : undefined,
          boxShadow:
            size === "profile"
              ? "0 4px 14px rgba(31,31,31,.1)"
              : undefined,
        }}
      />
    );
  }

  return (
    <div
      style={{
        width: px,
        height: px,
        borderRadius: "50%",
        background: colors.background,
        color: colors.color,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 700,
        fontSize: size === "profile" ? 28 : 13,
        flexShrink: 0,
        border: size === "profile" ? "3px solid #F7ECD6" : undefined,
        boxShadow:
          size === "profile" ? "0 4px 14px rgba(31,31,31,.1)" : undefined,
      }}
    >
      {initials}
    </div>
  );
}
