export default function Spinner({ fullScreen = false }) {
  const spinner = (
    <div className="flex items-center justify-center gap-2">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      <span className="text-gray-600 text-sm">Chargement...</span>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        {spinner}
      </div>
    );
  }

  return spinner;
}