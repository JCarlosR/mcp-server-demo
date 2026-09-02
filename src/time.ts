const SERVER_TIMEZONE = "America/Lima";

export type CurrentTime = {
  timezone: string;
  offset: string;
  local: string;
};

export function getCurrentTime(): CurrentTime {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: SERVER_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
    timeZoneName: "longOffset",
  });

  const parts = Object.fromEntries(
    formatter.formatToParts(now).map((part) => [part.type, part.value]),
  );

  return {
    timezone: SERVER_TIMEZONE,
    offset: parts.timeZoneName ?? "GMT-05:00",
    local: `${parts.year}-${parts.month}-${parts.day} ${parts.hour}:${parts.minute}:${parts.second}`,
  };
}

export function formatCurrentTime(time: CurrentTime): string {
  return `Current time: ${time.local} (${time.timezone}, ${time.offset})`;
}
