import { haptic } from "../../lib/haptics";
import { useOS } from "../../os/store";

export function startCall(name: string) {
  haptic("medium");
  useOS.setState({ call: { name, at: Date.now() } });
}

export function endCall() {
  const { call } = useOS.getState();
  if (!call) return;
  haptic("medium");
  useOS.setState(s => ({ call: null, calls: [{ name: call.name, at: call.at, out: true }, ...s.calls].slice(0, 30) }));
}

/** Starts a call and brings the Phone app up on the in-call screen. */
export function callAndShow(name: string) {
  startCall(name);
  useOS.getState().launch("phone");
}
