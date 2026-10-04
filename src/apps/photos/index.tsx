import { useDrag, usePinch } from "@use-gesture/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { haptic } from "../../lib/haptics";
import { deletePhoto, listPhotos, seedOnce, type Photo } from "../../lib/storage";
import { clamp } from "../../lib/util";
import { AppFrame } from "../../ui/AppFrame";
import { Glass } from "../../ui/Glass";
import { Icon } from "../../ui/icons";
import s from "./Photos.module.css";
import { addSamplePhotos } from "./samples";

type Shown = Photo & { url: string };
const ZOOM = { min: 1, max: 4, double: 2.5 };

/** Photos from IndexedDB as object URLs, revoked when replaced or unmounted. */
function usePhotos() {
  const [photos, setPhotos] = useState<Shown[] | null>(null);
  const urls = useRef<string[]>([]);
  const reload = useCallback(async () => {
    await seedOnce("sample-photos", addSamplePhotos);
    const list = (await listPhotos()).map(p => ({ ...p, url: URL.createObjectURL(p.blob) }));
    urls.current.forEach(URL.revokeObjectURL);
    urls.current = list.map(p => p.url);
    setPhotos(list);
  }, []);
  useEffect(() => {
    void reload();
    return () => urls.current.forEach(URL.revokeObjectURL);
  }, [reload]);
  return { photos, reload };
}

function Viewer({ photo, onClose, onDelete }: { photo: Shown; onClose: () => void; onDelete: () => void }) {
  const stage = useRef<HTMLDivElement>(null);
  const [view, setView] = useState({ scale: 1, x: 0, y: 0 });
  usePinch(({ offset: [scale] }) => setView(v => ({ ...v, scale })), {
    target: stage,
    scaleBounds: { min: ZOOM.min, max: ZOOM.max },
    from: () => [view.scale, 0],
  });
  useDrag(
    ({ offset: [x, y], pinching }) => {
      if (!pinching && view.scale > 1) setView(v => ({ ...v, x, y }));
    },
    { target: stage, from: () => [view.x, view.y] },
  );
  const toggleZoom = () => setView(v => (v.scale > 1 ? { scale: 1, x: 0, y: 0 } : { ...v, scale: ZOOM.double }));
  const date = new Date(photo.at).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" });

  return (
    <AppFrame dark background="#000" onBack={onClose} backLabel="Tümü" trailing={<span className={s.date}>{date}</span>}>
      <div ref={stage} className={s.stage} onDoubleClick={toggleZoom}>
        <img
          src={photo.url}
          alt={`Fotoğraf, ${date}`}
          draggable={false}
          style={{ transform: `translate(${view.x}px, ${view.y}px) scale(${clamp(view.scale, ZOOM.min, ZOOM.max)})` }}
        />
      </div>
      <Glass shape="pill" className={s.toolbar}>
        <button aria-label="Yakınlaştır" onClick={toggleZoom}><Icon name="search" size={20} /></button>
        <button aria-label="Fotoğrafı sil" onClick={onDelete}><Icon name="trash" size={20} /></button>
      </Glass>
    </AppFrame>
  );
}

export default function Photos() {
  const { photos, reload } = usePhotos();
  const [openId, setOpenId] = useState<string | null>(null);
  const open = photos?.find(p => p.id === openId);

  const remove = async (id: string) => {
    await deletePhoto(id);
    haptic("success");
    setOpenId(null);
    await reload();
  };

  if (open) return <Viewer photo={open} onClose={() => setOpenId(null)} onDelete={() => void remove(open.id)} />;

  return (
    <AppFrame title="Fotoğraflar">
      {photos === null && <p className={s.empty}>Yükleniyor…</p>}
      {photos?.length === 0 && <p className={s.empty}>Fotoğraf yok. Kamera ile bir tane çekin.</p>}
      <div className={s.grid}>
        {photos?.map(p => (
          <button key={p.id} className={s.thumb} onClick={() => setOpenId(p.id)} aria-label={`Fotoğraf, ${new Date(p.at).toLocaleDateString("tr-TR")}`}>
            <img src={p.url} alt="" loading="lazy" draggable={false} />
          </button>
        ))}
      </div>
      {photos && <p className={s.count}>{photos.length} Fotoğraf</p>}
    </AppFrame>
  );
}
