import { useOS } from "../../os/store";
import { fmtDuration, useNow } from "../../lib/util";
import { AppFrame } from "../../ui/AppFrame";
import { Glass } from "../../ui/Glass";
import { Icon } from "../../ui/icons";
import { Slider } from "../../ui/Slider";
import { musicPosition, skip, togglePlay } from "./engine";
import s from "./Music.module.css";
import { trackDuration, tracks } from "./tracks";

export default function Music() {
  const music = useOS(st => st.music);
  const volume = useOS(st => st.volume);
  useNow(250); // progress bar refresh
  const track = tracks[music.track] ?? tracks[0]!;
  const duration = trackDuration(track);
  const position = Math.min(musicPosition(), duration);
  const playTrack = (index: number) => useOS.setState({ music: { track: index, playing: true } });

  return (
    <AppFrame title="Müzik">
      <div className={s.player}>
        <div className={s.cover} style={{ background: track.cover }} data-playing={music.playing}>
          <Icon name="music" size={64} />
        </div>
        <div className={s.meta}>
          <b>{track.title}</b>
          <span>{track.artist}</span>
        </div>
        <div className={s.progress} role="progressbar" aria-valuemin={0} aria-valuemax={Math.round(duration)} aria-valuenow={Math.round(position)} aria-label="Çalma ilerlemesi">
          <i style={{ width: `${(position / duration) * 100}%` }} />
        </div>
        <div className={s.times}>
          <span>{fmtDuration(position * 1000)}</span>
          <span>-{fmtDuration((duration - position) * 1000)}</span>
        </div>
        <div className={s.controls}>
          <button aria-label="Önceki parça" onClick={() => skip(-1)}><Icon name="prev" size={34} /></button>
          <Glass interactive shape="circle" className={s.play} aria-label={music.playing ? "Duraklat" : "Oynat"} onClick={togglePlay}>
            <Icon name={music.playing ? "pause" : "play"} size={38} />
          </Glass>
          <button aria-label="Sonraki parça" onClick={() => skip(1)}><Icon name="next" size={34} /></button>
        </div>
        <div className={s.volume}>
          <Icon name="speakerSlash" size={14} />
          <Slider label="Ses" value={volume} onChange={v => useOS.setState({ volume: v })} />
          <Icon name="speaker" size={16} />
        </div>
      </div>
      <ol className={s.list}>
        {tracks.map((t, i) => (
          <li key={t.title}>
            <button className={s.row} aria-current={i === music.track} onClick={() => playTrack(i)}>
              <span className={s.mini} style={{ background: t.cover }} />
              <span className={s.rowText}>
                <b>{t.title}</b>
                <small>{t.artist} · {fmtDuration(trackDuration(t) * 1000)}</small>
              </span>
              {i === music.track && music.playing && <Icon name="speaker" size={16} />}
            </button>
          </li>
        ))}
      </ol>
      <p className={s.note}>Parçalar Web Audio ile gerçek zamanlı üretilir; ses dosyası yoktur.</p>
    </AppFrame>
  );
}
