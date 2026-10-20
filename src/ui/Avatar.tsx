const GRADIENTS = [
  "#ff9a8b, #ff6a88",
  "#7f7fd5, #86a8e7",
  "#43cea2, #185a9d",
  "#f7971e, #ffd200",
  "#a18cd1, #fbc2eb",
  "#56ccf2, #2f80ed",
];

export const initialsOf = (name: string) =>
  name
    .split(/\s+/)
    .map(word => word[0] ?? "")
    .join("")
    .slice(0, 2)
    .toLocaleUpperCase("tr-TR");

/** Initials on a gradient picked from the name, so a person keeps the same colour everywhere. */
export function Avatar({ name, size = 40 }: { name: string; size?: number }) {
  const hash = [...name].reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
  return (
    <span
      aria-hidden="true"
      style={{
        flex: "none",
        width: size,
        height: size,
        borderRadius: "50%",
        display: "grid",
        placeItems: "center",
        background: `linear-gradient(${GRADIENTS[hash % GRADIENTS.length]})`,
        color: "#fff",
        fontWeight: 600,
        fontSize: size * 0.4,
      }}
    >
      {initialsOf(name)}
    </span>
  );
}
