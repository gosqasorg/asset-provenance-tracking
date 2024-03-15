
export function myDate(ts : string) : string {
    var d = new Date(Number(ts));

    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;

    const formatter = new Intl.DateTimeFormat('en-US', {
        hour12: false,
        minute: 'numeric',
        hour: "numeric",
        second: "numeric",
        timeZoneName: "short",
        weekday: 'short',
        timeZone: tz,
    });

    return formatter.format(d);
}
