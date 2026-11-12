// Fechas y dinero. Se fija la zona horaria para que funcione igual en Windows y Linux.
const zona = () => process.env.ZONA_IANA || 'America/Mexico_City';
const offset = () => process.env.ZONA_OFFSET || '-06:00';

const partes = (f) =>
  Object.fromEntries(
    new Intl.DateTimeFormat('en-US', {
      timeZone: zona(), year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
    }).formatToParts(f).map((x) => [x.type, x.value])
  );

// Date -> "YYYY-MM-DDTHH:mm" (para <input type="datetime-local">)
export const aInput = (d) => {
  if (!d) return '';
  if (typeof d === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(d)) return d;
  const f = new Date(d);
  if (isNaN(f)) return '';
  const p = partes(f);
  return `${p.year}-${p.month}-${p.day}T${p.hour}:${p.minute}`;
};

// "YYYY-MM-DDTHH:mm" (hora local de la lonja) -> Date
export const desdeInput = (s) => new Date(`${s}${offset()}`);

export const aVista = (d) =>
  d ? new Date(d).toLocaleString('es-MX', { timeZone: zona(), dateStyle: 'short', timeStyle: 'short' }) : '';

export const hoy = () => {
  const p = partes(new Date());
  return `${p.year}-${p.month}-${p.day}`;
};

export const inicioFin = (fecha) => ({
  inicio: new Date(`${fecha}T00:00:00.000${offset()}`),
  fin: new Date(`${fecha}T23:59:59.999${offset()}`),
});

export const dinero = (n) => Number(n || 0).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' });
