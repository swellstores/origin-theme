/**
 * @param {{date: Date, locale: string, options: Intl.DateTimeFormatOptions}} - date (date to format), locale (user locale), options (additional options)
 */

export function dateTimeFormatter({ date, locale, options = {} }) {
  if (!date || !locale) return;

  /**
   * @constant
   * @type {Intl.DateTimeFormatOptions}
   */
  const defaultOptions = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  };

  const newOptions = { ...defaultOptions, ...options };

  return new Intl.DateTimeFormat(locale, newOptions).format(date);
}
