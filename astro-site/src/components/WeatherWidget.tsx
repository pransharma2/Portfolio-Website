import { useEffect, useState } from 'react';

/**
 * WeatherWidget — P5-style text-based date/weather display.
 *
 * Clean text layout replaces the old sprite-sheet approach
 * to fix alignment issues from mismatched sprite cell sizes.
 *
 * Layout:
 *   Row 1: APR 14       (month abbrev + day, large bold)
 *   Row 2: MONDAY       (weekday, smaller)
 *   Row 3: 02:30 PM  ☀ 18°C  (time + weather icon + temp)
 */

const MONTHS = [
  'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
  'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC',
] as const;

const WEEKDAYS = [
  'SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY',
  'THURSDAY', 'FRIDAY', 'SATURDAY',
] as const;

// Map OpenWeatherMap icon codes → weather symbol
function iconToSymbol(icon: string): string {
  if (icon.startsWith('01')) return '☀';
  if (['02', '03', '04'].some(p => icon.startsWith(p))) return '☁';
  if (['09', '10', '11'].some(p => icon.startsWith(p))) return '🌧';
  if (icon.startsWith('13')) return '❄';
  return '☀';
}

function formatTime(d: Date): string {
  let h = d.getHours();
  const m = d.getMinutes();
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h < 10 ? '0' : ''}${h}:${m < 10 ? '0' : ''}${m} ${ampm}`;
}

export default function WeatherWidget() {
  const [time, setTime] = useState('');
  const [date, setDate] = useState({ month: '', day: 0, weekday: '' });
  const [weather, setWeather] = useState({ symbol: '☀', temp: '--°C' });

  // Clock + date: update every second
  useEffect(() => {
    function tick() {
      const now = new Date();
      setTime(formatTime(now));
      setDate({
        month: MONTHS[now.getMonth()],
        day: now.getDate(),
        weekday: WEEKDAYS[now.getDay()],
      });
    }
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  // Geolocation + OpenWeatherMap (runs once on mount)
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const { latitude: lat, longitude: lon } = coords;
        const key = '32aa9a705e117c99f3cd712e3a521b18';
        fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${key}`)
          .then(r => r.json())
          .then(data => {
            if (data?.weather?.[0]) {
              setWeather({
                symbol: iconToSymbol(data.weather[0].icon),
                temp: data.main ? `${Math.round(data.main.temp - 273.15)}°C` : '--°C',
              });
            }
          })
          .catch(() => { /* silently fall back to default (sunny) */ });
      },
      () => { /* geolocation denied — stays at sunny */ },
      { timeout: 5000 },
    );
  }, []);

  // Don't render until we have a time string (avoids hydration flash)
  if (!time) return null;

  const fontDisplay = '"Shippori Mincho B1","Shippori Mincho",serif';

  return (
    <div
      aria-hidden="true"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        pointerEvents: 'none',
      }}
    >
      {/* Row 1: Month + Day */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, lineHeight: 1 }}>
        <span style={{
          fontFamily: fontDisplay, fontSize: 15, fontWeight: 700,
          letterSpacing: '0.1em', color: 'rgba(255,255,255,0.8)',
          textShadow: '1px 1px 0 #000',
        }}>{date.month}</span>
        <span style={{
          fontFamily: fontDisplay, fontSize: 22, fontWeight: 900,
          letterSpacing: '0.04em', color: '#fff',
          textShadow: '2px 2px 0 #000',
        }}>{date.day}</span>
      </div>

      {/* Row 2: Weekday */}
      <div style={{
        fontFamily: fontDisplay, fontSize: 11, fontWeight: 600,
        letterSpacing: '0.15em', color: '#d41428',
        textShadow: '1px 1px 0 rgba(0,0,0,0.6)', lineHeight: 1,
      }}>{date.weekday}</div>

      {/* Row 3: Time + Weather */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        gap: 8, borderTop: '1px solid rgba(255,255,255,0.1)',
        paddingTop: 4, marginTop: 2,
      }}>
        <span style={{
          fontFamily: fontDisplay, fontSize: 12, color: '#fff',
          textShadow: '1px 1px 0 #000', letterSpacing: '0.05em',
        }}>{time}</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ fontSize: 14, lineHeight: 1 }}>{weather.symbol}</span>
          <span style={{
            fontFamily: fontDisplay, fontSize: 12, color: '#fff',
            textShadow: '1px 1px 0 #000', letterSpacing: '0.05em',
          }}>{weather.temp}</span>
        </span>
      </div>
    </div>
  );
}
