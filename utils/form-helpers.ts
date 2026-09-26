export function readString(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === 'string' ? value : '';
}

export function readStringList(formData: FormData, name: string): string[] {
  return [
    ...new Set(
      formData
        .getAll(name)
        .filter((value): value is string => typeof value === 'string' && value.length > 0),
    ),
  ];
};

export function isHttpOrHttpsUrl(url: string): boolean {
  try {
    const { protocol } = new URL(url.trim());
    return protocol === 'http:' || protocol === 'https:';
  }
  catch {
    return false;
  }
}
