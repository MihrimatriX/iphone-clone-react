/** Calendar app icon that shows today's weekday and date. */
export function CalendarFace({ size }: { size: number }) {
  const now = new Date();
  return (
    <span style={{ display: "flex", flexDirection: "column", alignItems: "center", lineHeight: 1, color: "#1c1c1e" }}>
      <span style={{ fontSize: size * 0.17, fontWeight: 600, color: "#ff3b30" }}>
        {now.toLocaleDateString("tr-TR", { weekday: "short" }).toLocaleUpperCase("tr-TR")}
      </span>
      <span style={{ fontSize: size * 0.52, fontWeight: 300 }}>{now.getDate()}</span>
    </span>
  );
}
