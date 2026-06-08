const Loader = ({ size = 'md', fullScreen = false }) => {
  const sizes = { sm: 'w-5 h-5', md: 'w-8 h-8', lg: 'w-12 h-12' };

  const spinner = (
    <div className={`${sizes[size]} animate-spin rounded-full border-4 border-gray-200 border-t-primary-600`} />
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 animate-spin rounded-full border-4 border-gray-200 border-t-primary-600" />
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return spinner;
};

export const TableSkeleton = ({ rows = 5, cols = 5 }) => (
  <div className="space-y-3">
    {Array(rows).fill(0).map((_, i) => (
      <div key={i} className="flex gap-4">
        {Array(cols).fill(0).map((_, j) => (
          <div key={j} className="skeleton h-8 flex-1" />
        ))}
      </div>
    ))}
  </div>
);

export default Loader;
