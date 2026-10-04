import { haptic } from "../lib/haptics";
import { lockClick } from "../lib/sound";
import { unlock } from "./LockScreen";
import { useOS } from "./store";

const VOLUME_STEP = 1 / 16;

/** Physical button behaviour, shared by the 3D buttons and keyboard shortcuts. */
export const hardware = {
  power() {
    haptic("heavy");
    if (useOS.getState().screenOn) lockClick();
    useOS.getState().power();
  },
  volume(direction: 1 | -1) {
    haptic("heavy");
    const os = useOS.getState();
    os.setVolume(os.volume + direction * VOLUME_STEP);
  },
  /** Camera Control: wakes the phone if needed and opens Camera, through Face ID when locked. */
  camera() {
    haptic("heavy");
    const os = useOS.getState();
    if (!os.screenOn) os.power();
    if (useOS.getState().locked) unlock("camera");
    else os.launch("camera");
  },
  action() {
    haptic("heavy");
    const os = useOS.getState();
    if (os.actionButton === "flashlight") {
      useOS.setState({ flashlight: !os.flashlight });
      os.showToast("flashlight", os.flashlight ? "El Feneri Kapalı" : "El Feneri Açık");
    } else {
      useOS.setState({ silent: !os.silent });
      os.showToast(os.silent ? "bell" : "bellSlash", os.silent ? "Sessiz Mod Kapalı" : "Sessiz Mod Açık");
    }
  },
};
