/**
 * Rule-based auto reply for the Messages app.
 * Gets the text the user just sent and returns the contact's answer, or null to stay silent
 * (then no "yazıyor…" bubble is shown). The caller already handles the delay, the typing
 * bubble, saving the message and the notification when the user has left the app.
 */
export function autoReply(text: string): string | null {
  // TODO(human): map `text` to a reply with a few simple rules.
  return null;
}
