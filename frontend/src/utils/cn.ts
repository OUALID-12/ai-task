/**
 * Utilitaire simple pour combiner les classes CSS
 * Remplace clsx et tailwind-merge pour éviter les dépendances externes
 */
export function cn(...inputs: (string | number | boolean | undefined | null)[]): string {
  return inputs
    .filter(Boolean)
    .map(input => String(input))
    .join(' ')
    .trim();
}
