// Polling station entries in ecz-locations.json are "<Station name>-<stream> | <POLLING DISTRICT> - <n>",
// taken from the ECZ Registered Voters per Polling Station report (2026).
const tc = (s) => s.toLowerCase().replace(/(^|[\s(/-])(\w)/g, (m, a, b) => a + b.toUpperCase());

export const formatStation = (entry) => {
    const [station, district] = entry.split(' | ');
    const m = station.match(/^(.*?)\s*-\s*0*(\d+)$/);
    const name = m ? `${m[1]} (stream ${m[2]})` : station;
    const pd = district ? tc(district.replace(/\s*-\s*\d+$/, '')) : '';
    return pd ? `${name} — ${pd} polling district` : name;
};
