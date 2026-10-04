import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { haptic } from "../../lib/haptics";
import { shutter } from "../../lib/sound";
import { listPhotos, savePhoto } from "../../lib/storage";
import { useOS } from "../../os/store";
import { AppFrame } from "../../ui/AppFrame";
import { Glass } from "../../ui/Glass";
import { Icon } from "../../ui/icons";
import s from "./Camera.module.css";

type Facing = "environment" | "user";
type Status = "starting" | "live" | "denied";
const CAPTURE = { w: 1080, h: 1440, quality: 0.9 };

const stop = (stream: MediaStream) => stream.getTracks().forEach(track => track.stop());

/** Live camera stream; stops every track on unmount or when the lens flips. */
function useCamera(facing: Facing) {
  const video = useRef<HTMLVideoElement>(null);
  const [status, setStatus] = useState<Status>("starting");
  useEffect(() => {
    let stream: MediaStream | null = null;
    let cancelled = false;
    if (!navigator.mediaDevices?.getUserMedia) {
      setStatus("denied");
      return;
    }
    setStatus("starting");
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: facing }, audio: false })
      .then(media => {
        stream = media;
        if (cancelled) return stop(media);
        if (video.current) video.current.srcObject = media;
        setStatus("live");
      })
      .catch(() => setStatus("denied"));
    return () => {
      cancelled = true;
      if (stream) stop(stream);
    };
  }, [facing]);
  return { video, status };
}

/** Draws the current frame (or a generated scene without a camera) into a JPEG blob. */
function capture(video: HTMLVideoElement | null, mirror: boolean): Promise<Blob | null> {
  const canvas = document.createElement("canvas");
  canvas.width = CAPTURE.w;
  canvas.height = CAPTURE.h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return Promise.resolve(null);
  if (video && video.videoWidth) {
    const scale = Math.max(CAPTURE.w / video.videoWidth, CAPTURE.h / video.videoHeight);
    const w = video.videoWidth * scale;
    const h = video.videoHeight * scale;
    if (mirror) ctx.setTransform(-1, 0, 0, 1, CAPTURE.w, 0);
    ctx.drawImage(video, (CAPTURE.w - w) / 2, (CAPTURE.h - h) / 2, w, h);
  } else {
    const sky = ctx.createLinearGradient(0, 0, 0, CAPTURE.h);
    sky.addColorStop(0, `hsl(${Date.now() % 360} 70% 60%)`);
    sky.addColorStop(1, "#1c1c2e");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, CAPTURE.w, CAPTURE.h);
  }
  return new Promise(resolve => canvas.toBlob(resolve, "image/jpeg", CAPTURE.quality));
}

export default function Camera() {
  const [facing, setFacing] = useState<Facing>("environment");
  const { video, status } = useCamera(facing);
  const [flash, setFlash] = useState(0);
  const [thumb, setThumb] = useState<string | null>(null);
  const thumbUrl = useRef<string | null>(null);

  const showThumb = (blob: Blob) => {
    if (thumbUrl.current) URL.revokeObjectURL(thumbUrl.current);
    thumbUrl.current = URL.createObjectURL(blob);
    setThumb(thumbUrl.current);
  };

  useEffect(() => {
    void listPhotos().then(([latest]) => {
      if (latest) showThumb(latest.blob);
    });
    return () => {
      if (thumbUrl.current) URL.revokeObjectURL(thumbUrl.current);
    };
  }, []);

  const takePhoto = async () => {
    shutter();
    haptic("heavy");
    setFlash(Date.now());
    const blob = await capture(status === "live" ? video.current : null, facing === "user");
    if (!blob) return haptic("error");
    await savePhoto(blob);
    showThumb(blob);
  };

  return (
    <AppFrame dark background="#000">
      <div className={s.viewfinder}>
        <video ref={video} className={s.video} style={{ transform: facing === "user" ? "scaleX(-1)" : undefined }} autoPlay playsInline muted />
        {status === "denied" && (
          <div className={s.fallback}>
            <Icon name="camera" size={44} />
            <b>Kamera kullanılamıyor</b>
            <span>Tarayıcı izin vermedi ya da kamera yok. Deklanşör yine de örnek bir kare kaydeder.</span>
          </div>
        )}
        <AnimatePresence>
          {flash > 0 && <motion.div key={flash} className={s.flash} initial={{ opacity: 1 }} animate={{ opacity: 0 }} transition={{ duration: 0.35 }} />}
        </AnimatePresence>
      </div>
      <div className={s.mode}>FOTOĞRAF</div>
      <div className={s.controls}>
        <button className={s.thumb} aria-label="Son fotoğrafı aç" onClick={() => useOS.getState().launch("photos")}>
          {thumb && <img src={thumb} alt="" />}
        </button>
        <button className={s.shutter} aria-label="Fotoğraf çek" onClick={() => void takePhoto()} />
        <Glass interactive shape="circle" className={s.flip} aria-label="Kamerayı çevir" onClick={() => setFacing(f => (f === "user" ? "environment" : "user"))}>
          <Icon name="refresh" size={22} />
        </Glass>
      </div>
    </AppFrame>
  );
}
