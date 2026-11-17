/** Note + example under an admin field, plus an error when the value is not accepted. */
export default function Hint({ id, guide, error }) {
  if (!guide && !error) return null;
  return (
    <span id={id} className="mt-1.5 block space-y-0.5 text-[11px] leading-4">
      {guide?.note && <span className="block text-ink/75">{guide.note}</span>}
      {guide?.example && (
        <span className="block text-ink/60">
          Example: <span className="whitespace-pre-line font-medium text-ink/85">{guide.example}</span>
        </span>
      )}
      {error && <span className="block font-medium text-error" role="alert">⚠ {error}</span>}
    </span>
  );
}
