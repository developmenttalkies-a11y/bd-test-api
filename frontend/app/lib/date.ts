export function toBluedartDate(input?: string) {
  if (!input) return "";

  let date: Date | null = null;

  // yyyy-mm-dd (HTML date input)
  if (/^\d{4}-\d{2}-\d{2}$/.test(input)) {
    date = new Date(input);
  }

  // dd/mm/yyyy or dd-mm-yyyy
  else if (/^\d{2}[\/-]\d{2}[\/-]\d{4}$/.test(input)) {
    const [dd, mm, yyyy] = input.split(/[\/-]/);
    date = new Date(`${yyyy}-${mm}-${dd}`);
  }

  // yyyy/mm/dd
  else if (/^\d{4}[\/-]\d{2}[\/-]\d{2}$/.test(input)) {
    date = new Date(input.replace(/\//g, "-"));
  }

  if (!date || isNaN(date.getTime())) {
    throw new Error("Invalid date format");
  }

  return `/Date(${date.getTime()})/`;
}
