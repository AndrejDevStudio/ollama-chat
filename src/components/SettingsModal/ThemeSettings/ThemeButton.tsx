import clsx from 'clsx';

interface ThemeButtonProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  isLast?: boolean;
}

export default function ThemeButton({
  active,
  onClick,
  children,
  isLast,
}: ThemeButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        'cursor-pointer px-3 py-1 transition-colors duration-200 first:rounded-l first:border-l-0 last:rounded-r focus:outline-none focus-visible:inset-ring',
        !isLast && 'border-r border-neutral-300 dark:border-neutral-500',
        active
          ? 'bg-neutral-800 text-neutral-100 dark:bg-neutral-100 dark:text-neutral-800'
          : 'bg-neutral-50 dark:bg-neutral-700',
        active
          ? 'hover:bg-neutral-300 hover:text-neutral-800 dark:hover:bg-neutral-600 dark:hover:text-neutral-100'
          : 'hover:bg-neutral-300 hover:text-neutral-800 dark:hover:bg-neutral-600 dark:hover:text-neutral-100',
      )}
    >
      {children}
    </button>
  );
}
