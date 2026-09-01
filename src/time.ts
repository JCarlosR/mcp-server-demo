export type CurrentTime = {
  iso: string;
  timezone: string;
  offset: string;
  local: string;
};

export function getCurrentTime(timeZone?: string): CurrentTime {
  const timezone = timeZone?.trim() || Intl.DateTimeFormat().resolvedOptions().timeZone;
  const now = new Date();

  let formatter: Intl.DateTimeFormat;
  try {
    formatter = new Intl.DateTimeFormat("en-CA", {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hourCycle: "h23",
      timeZoneName: "longOffset",
    });
  } catch {
    throw new Error(`Unknown IANA timezone: ${timezone}`);
  }

  const parts = Object.fromEntries(
    formatter.formatToParts(now).map((part) => [part.type, part.value]),
  );

  const local = `${parts.year}-${parts.month}-${parts.day} ${parts.hour}:${parts.minute}:${parts.second}`;
  const offset = parts.timeZoneName ?? "GMT";

  return {
    iso: now.toISOString(),
    timezone,
    offset,
    local,
  };
}

export function formatCurrentTime(time: CurrentTime): string {
  return [
    `Local time: ${time.local}`,
    `Timezone: ${time.timezone} (${time.offset})`,
    `UTC: ${time.iso}`,
  ].join("\n");
}
