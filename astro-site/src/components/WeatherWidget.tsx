import { useEffect, useState } from 'react';

// ---------------------------------------------------------------------------
// Sprite sheet layout (verified from actual PNG dimensions):
//
//   numbers_spritesheet_3.png  1000×450  → 10 cols × 3 rows, cell 100×150
//   month-number-sprites.png   1440×360  → 12 cols × 3 rows, cell 120×120
//   weekday_sprites.png         573×222  →  3 cols × 3 rows, cell 191×74
//   weather_spritesheet4.png    300×222  →  4 cols × 3 rows, cell  75×74
//   weather-card-sprite.png     100×99   →  single decorative card frame
//
// Display scale ≈ 0.4 for date/weekday sprites, slightly smaller for weather icon.
// We use row=0 of each spritesheet for the cleanest single rendering.
// ---------------------------------------------------------------------------

type SpriteDef = { dw: number; dh: number; url: string; bgW: number; bgH: number };

const NUM: SpriteDef = {
  dw: 40, dh: 60,
  url: '/img/weather/numbers_spritesheet_3.png',
  bgW: 400, bgH: 180,   // 1000*0.4 × 450*0.4
};
const MON: SpriteDef = {
  dw: 48, dh: 48,
  url: '/img/weather/month-number-sprites.png',
  bgW: 576, bgH: 144,   // 1440*0.4 × 360*0.4
};
const WKDAY: SpriteDef = {
  dw: 76, dh: 29,
  url: '/img/weather/weekday_sprites.png',
  bgW: 228, bgH: 87,    // 573*0.398 × 222*0.392
};
const WTHR: SpriteDef = {
  dw: 30, dh: 30,
  url: '/img/weather/weather_spritesheet4.png',
  bgW: 120, bgH: 89,    // 300*0.4 × 222*0.4 ≈ 89
};

// Map OpenWeatherMap icon codes → sprite column (0=sun 1=cloud 2=rain 3=snow)
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
  return `${h < 10 ? '0' : ''}${h}:${m < 10 ? '0' : ''}${m} ${ampm}`;
}

// ---------------------------------------------------------------------------
// Sprite — renders a single cell from a spritesheet.
// col/row select the cell; dw/dh are display dimensions; bgW/bgH are the
// background-size values derived from the scale factor.
// ---------------------------------------------------------------------------
function Sprite({
  col, row, def,
}: {
  col: number; row: number; def: SpriteDef;
}) {
  return (
    <div
      style={{
        width: def.dw,
        height: def.dh,
        flexShrink: 0,
        backgroundImage: `url('${def.url}')`,
        backgroundSize: `${def.bgW}px ${def.bgH}px`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: `${-col * def.dw}px ${-row * def.dh}px`,
      }}
    />
  );
}

// ---------------------------------------------------------------------------
// WeatherWidget — P5-style date/weather widget for the home page (top-right)
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
        month: now.getMonth(),          // 0–11 → sprite column
        tens: Math.floor(d / 10),       // leading digit
        ones: d % 10,                   // trailing digit
        weekday: (now.getDay() + 6) % 7, // Mon=0 … Sun=6
      });
    }
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  // Cycle weather sprite animation frames (4 frames at 1s each)
  useEffect(() => {
    const id = setInterval(() => {
      setWeather(w => ({ ...w, frame: (w.frame + 1) % 3 }));
    }, 1000);
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
              setWeather(w => ({
                ...w,
                condition: iconToCondition(data.weather[0].icon),
                temp: data.main ? `${Math.round(data.main.temp - 273.15)}°C` : '--°C',
              }));
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

  const wkCol = date.weekday % 3;
  const wkRow = Math.floor(date.weekday / 3);

  return (
    <div className="p5-weather-widget" aria-hidden="true">

      {/* ── Row 1: Month name + day digits ── */}
      <div className="wgt-date-row">
        <Sprite col={date.month} row={0} def={MON} />
        <Sprite col={date.tens}  row={0} def={NUM} />
        <Sprite col={date.ones}  row={0} def={NUM} />
      </div>

      {/* ── Row 2: Weekday + weather card ── */}
      <div className="wgt-mid-row">
        <Sprite col={wkCol} row={wkRow} def={WKDAY} />
        {/* Card uses the weather-card-sprite.png as its decorative frame */}
        <div className="wgt-card-wrap">
          <Sprite col={weather.condition} row={weather.frame} def={WTHR} />
        </div>
      </div>

      {/* ── Row 3: Time + temperature ── */}
      <div className="wgt-info-row">
        <span className="wgt-time">{time}</span>
        <span className="wgt-temp">{weather.temp}</span>
      </div>

    </div>
  );
}
