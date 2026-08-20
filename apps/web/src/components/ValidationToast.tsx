export function ValidationToast({ message }: { message: string | null }) {
  if (!message) return null;

  return (
    <div role="alert" className="cc-alert-error cc-toast">
      <p className="text-sm font-medium">{message}</p>
    </div>
  );
}
