type Props = { message: string | null; onDismiss: () => void };

export default function NotificationToast({ message, onDismiss }: Props) {
  if (!message) return null;
  return <button onClick={onDismiss} className="fixed top-20 right-4 z-[60] pixel-panel text-ink px-4 py-3 text-left text-sm font-bold">{message}</button>;
}
