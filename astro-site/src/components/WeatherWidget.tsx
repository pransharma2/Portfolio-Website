import { useEffect, useState } from 'react';

// ---------------------------------------------------------------------------
// Sprite dimensions (scaled from the original spritesheets)
// numbers_spritesheet_3: 1000x450 → scaled to 460x207, cell 46x69
// month-number-sprites:  1440x360 → scaled to 600x150, cell 50x50
// weekday_sprites:        573x222 → scaled to 228x88, cell 76x29
// weather_spritesheet4:   300x222 → scaled to 152x112, cell 38x37
// ---------------------------------------------------------------------------
const NUM = { w: 46, h: 69, url: '/img/weather/numbers_spritesheet_3.png', bg: '460px 207px' };
const MON = { w: 50, h: 50, url: '/img/weather/month-number-sprites.png', bg: '600px 150px' };
const WKDAY = { w: 76, h: 29, url: '/img/weather/weekday_sprites.png', bg: '228px 88px' };
const WTHR = { w: 38, h: 37, url: '/img/weather/weather_spritesheet4.png', bg: '152px 112px' };

// Map OpenWeatherMap icon codes to sprite column index (0=sun 1=cloud 2=rain 3=snow)
function iconToCondition(icon: string): number {
  if (icon.startsWith('01')) return 0;
  if (['02', '03', '04'].some(p => icon.startsWith(p))) return 1;
  if (['09', '10', '11'].some(p => icon.startsWith(p))) return 2;
  if (icon.startsWith('13')) return 3;
  return 0;
}

function formatTime(d: Date): string {
  let h = d.getHours();
  const m = d.getMinutes();
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h < 10 ? '0' : ''}${h}:${m < 10 ? '0' : ''}${m}${ampm}`;
}

// ---------------------------------------------------------------------------
// StackedSprite — renders a single sprite character as 3 overlapping layers
// The slight rotation offsets between layers create the authentic P5 depth look.
// ---------------------------------------------------------------------------
function StackedSprite({
  col, w, h, url, bg,
}: {
  col: number; w: number; h: number; url: string; bg: string;
}) {
  const base: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
    backgroundImage: `url('${url}')`,
    backgroundSize: bg,
    backgroundRepeat: 'no-repeat',
  };
  return (
    <div style={{ position: 'relative', width: w, height: h, flexShrink: 0 }}>
      {/* Shadow/base layer */}
      <div style={{ ...base, backgroundPosition: `${-col * w}px ${-2 * h}px`, transform: 'rotate(-1deg) translate(-1px, 2px)', opacity: 0.7, zIndex: 1 }} />
      {/* Mid layer */}
      <div style={{ ...base, backgroundPosition: `${-col * w}px ${-h}px`, transform: 'rotate(1deg) translate(1px, 1px)', zIndex: 2 }} />
      {/* Top layer */}
      <div style={{ ...base, backgroundPosition: `${-col * w}px 0px`, transform: 'rotate(-2deg)', zIndex: 3 }} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// WeatherWidget — P5-style date/weather widget for the home page hero
// ---------------------------------------------------------------------------
export default function WeatherWidget() {
  const [time, setTime] = useState('');
  const [date, setDate] = useState({ month: 0, tens: 0, ones: 0, weekday: 0 });
  const [weather, setWeather] = useState({ condition: 0, temp: '--°C', frame: 0 });

  // Clock + date: update every second
  useEffect(() => {
    function tick() {
      const now = new Date();
      const d = now.getDate();
      setTime(formatTime(now));
      setDate({
        month: now.getMonth(),
        tens: Math.floor(d / 10),
        ones: d % 10,
        weekday: (now.getDay() + 6) % 7, // Mon=0 … Sun=6
      });
    }
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  // Weather sprite animation: cycle 3 frames at 1s
  useEffect(() => {
    const id = setInterval(() => {
      setWeather(w => ({ ...w, frame: (w.frame + 1) % 3 }));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  // Geolocation + OpenWeatherMap fetch (runs once on mount)
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
              setWeather(w => ({
                ...w,
                condition: iconToCondition(data.weather[0].icon),
                temp: data.main ? `${Math.round(data.main.temp - 273.15)}°C` : '--°C',
              }));
            }
          })
          .catch(() => { /* silently fall back to sunny */ });
      },
      () => { /* geolocation denied — stays at default sunny */ },
      { timeout: 5000 },
    );
  }, []);

  // Don't render until we have a time string (avoids hydration flash)
  if (!time) return null;

  return (
    <div className="p5-weather-widget" aria-hidden="true">
      {/* Date row: Month + tens + ones (each as 3-layer stacked sprite) */}
      <div className="wgt-date-row">
        <StackedSprite col={date.month} w={MON.w} h={MON.h} url={MON.url} bg={MON.bg} />
        <StackedSprite col={date.tens}  w={NUM.w} h={NUM.h} url={NUM.url} bg={NUM.bg} />
        <StackedSprite col={date.ones}  w={NUM.w} h={NUM.h} url={NUM.url} bg={NUM.bg} />
      </div>

      {/* Bottom row: weekday sprite + weather card + weather icon */}
      <div className="wgt-bottom-row">
        <div
          className="wgt-weekday"
          style={{
            backgroundPosition: `${-(date.weekday % 3) * WKDAY.w}px ${-Math.floor(date.weekday / 3) * WKDAY.h}px`,
          }}
        />
        <div className="wgt-weather-card" />
        <div
          className="wgt-weather-sprite"
          style={{
            backgroundPosition: `${-weather.condition * WTHR.w}px ${-weather.frame * WTHR.h}px`,
          }}
        />
      </div>

      {/* Time + temperature text */}
      <div className="wgt-info-row">
        <span className="wgt-time">{time}</span>
        <span className="wgt-temp">{weather.temp}</span>
      </div>
    </div>
  );
}
