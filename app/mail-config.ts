export function mailConfig() {
  const { SMTP_HOST: host, SMTP_USER: user, SMTP_PASSWORD: password, SMTP_FROM: from, SURVEY_BASE_URL: base } = process.env;
  const port = Number(process.env.SMTP_PORT || 587);
  if (!host || !user || !password || !from || !base || !Number.isInteger(port) || port < 1 || port > 65535) return null;
  try {
    const url = new URL(base);
    if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password) return null;
    return { host, user, password, from, port, origin: url.origin };
  } catch { return null; }
}
