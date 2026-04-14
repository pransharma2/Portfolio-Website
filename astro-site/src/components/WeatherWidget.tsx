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

  return (
    <div className="p5-weather-widget" aria-hidden="true">
      {/* Row 1: Month + Day */}
      <div className="wgt-date-row">
        <span className="wgt-month">{date.month}</span>
        <span className="wgt-day">{date.day}</span>
      </div>

      {/* Row 2: Weekday */}
      <div className="wgt-weekday">{date.weekday}</div>

      {/* Row 3: Time + Weather */}
      <div className="wgt-info-row">
        <span className="wgt-time">{time}</span>
        <span className="wgt-weather">
          <span className="wgt-icon">{weather.symbol}</span>
          <span className="wgt-temp">{weather.temp}</span>
        </span>
      </div>
    </div>
  );
}
