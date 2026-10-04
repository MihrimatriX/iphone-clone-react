/** Procedural wallpapers; `tone` drives adaptive glass contrast on home and lock screens. */
export const wallpapers: { name: string; css: string; tone: "light" | "dark" }[] = [
  {
    name: "Aurora",
    tone: "dark",
    css: `radial-gradient(80% 60% at 20% 15%, #7b5cff 0%, transparent 60%),
      radial-gradient(70% 55% at 85% 35%, #00c2c7 0%, transparent 60%),
      radial-gradient(90% 70% at 50% 100%, #ff4f9a 0%, transparent 65%), #120b2e`,
  },
  {
    name: "Gün Batımı",
    tone: "light",
    css: `radial-gradient(90% 60% at 50% 0%, #ffd29a 0%, transparent 70%),
      radial-gradient(80% 70% at 0% 70%, #ff8a7a 0%, transparent 70%),
      radial-gradient(80% 70% at 100% 100%, #ff5fa2 0%, transparent 70%), #ffb38a`,
  },
  {
    name: "Okyanus",
    tone: "dark",
    css: `radial-gradient(90% 60% at 80% 10%, #2d8cff 0%, transparent 60%),
      radial-gradient(80% 60% at 10% 60%, #0a3d91 0%, transparent 70%),
      linear-gradient(180deg, #06204f, #01081a)`,
  },
  {
    name: "Nane",
    tone: "light",
    css: `radial-gradient(80% 60% at 20% 20%, #c9ffe9 0%, transparent 70%),
      radial-gradient(80% 60% at 90% 80%, #8be3ff 0%, transparent 70%), #a8f0d0`,
  },
  {
    name: "Grafit",
    tone: "dark",
    css: `radial-gradient(70% 50% at 70% 20%, #5b5f6b 0%, transparent 70%),
      radial-gradient(90% 60% at 20% 90%, #2b2e36 0%, transparent 70%), #121317`,
  },
  {
    name: "Lavanta",
    tone: "light",
    css: `radial-gradient(80% 60% at 80% 10%, #ffd6f5 0%, transparent 70%),
      radial-gradient(90% 70% at 10% 90%, #b9b4ff 0%, transparent 70%), #e2d6ff`,
  },
];

export const wallpaperOf = (index: number) => wallpapers[index] ?? wallpapers[0]!;
