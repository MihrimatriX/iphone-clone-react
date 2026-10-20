import { useOS } from "../../os/store";

/** Opens Messages on the conversation with `name`, starting an empty one if there is none yet. */
export function openConversation(name: string) {
  const existing = useOS.getState().threads.find(t => t.name === name);
  const thread = existing ?? { id: crypto.randomUUID(), name, msgs: [] };
  if (!existing) useOS.setState(st => ({ threads: [thread, ...st.threads] }));
  useOS.setState({ threadId: thread.id });
  useOS.getState().launch("messages");
}
