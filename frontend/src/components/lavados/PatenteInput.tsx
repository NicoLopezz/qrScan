"use client";

import { useRef, useEffect } from "react";

/*
  Argentine license plate formats:
  - Old (pre-2016):  LLL NNN       → 3 letters + 3 digits  (black bg, white chars)
  - Mercosur (2016+): LL NNN LL    → 2 letters + 3 digits + 2 letters (white bg, blue strip)
*/

type PlateFormat = "old" | "mercosur" | "unknown";

function detectFormat(raw: string): PlateFormat {
  const c = raw.replace(/\s/g, "").toUpperCase();
  if (/^[A-Z]{3}\d{0,3}$/.test(c) && c.length >= 3) return "old";
  if (/^[A-Z]{2}\d/.test(c)) return "mercosur";
  return "unknown";
}

function formatDisplay(raw: string, fmt: PlateFormat): string {
  const c = raw.replace(/\s/g, "").toUpperCase();
  if (fmt === "old") {
    const l = c.slice(0, 3), d = c.slice(3, 6);
    return d ? `${l} ${d}` : l;
  }
  if (fmt === "mercosur") {
    const p1 = c.slice(0, 2), p2 = c.slice(2, 5), p3 = c.slice(5, 7);
    if (p3) return `${p1} ${p2} ${p3}`;
    if (p2) return `${p1} ${p2}`;
    return p1;
  }
  return c;
}

function ghostChars(clean: string, fmt: PlateFormat): string {
  if (fmt === "old") {
    const template = "AAA 000";
    const display = formatDisplay(clean, fmt);
    return template.slice(display.length);
  }
  if (fmt === "mercosur") {
    const template = "AA 000 AA";
    const display = formatDisplay(clean, fmt);
    return template.slice(display.length);
  }
  return "";
}

/* ------------------------------------------------------------------ */
/*  SVG Icons                                                          */
/* ------------------------------------------------------------------ */
function ArgentinaFlag({ size = 12 }: { size?: number }) {
  return (
    <svg viewBox="0 0 800 500" style={{ height: size, width: size * 1.6 }} className="flex-shrink-0 rounded-[1px]">
      <rect width="800" height="500" fill="#74ACDF" />
      <rect y="166.66" width="800" height="166.66" fill="#FFFFFF" />
      <circle cx="400" cy="250" r="40" fill="#F6B40E" />
    </svg>
  );
}

function MercosurLogo({ size = 14 }: { size?: number }) {
  return (
    <svg viewBox="0 0 300 200" style={{ height: size, width: size * 1.5 }} className="flex-shrink-0">
      <rect width="300" height="200" fill="none" />
      <path d="M20 140 Q150 100 280 140" stroke="white" strokeWidth="6" fill="none" opacity="0.6" />
      <circle cx="120" cy="60" r="6" fill="white" />
      <circle cx="150" cy="45" r="6" fill="white" />
      <circle cx="180" cy="60" r="6" fill="white" />
      <circle cx="150" cy="85" r="6" fill="white" />
    </svg>
  );
}

function CoatOfArms({ size = 12 }: { size?: number }) {
  return (
    <svg viewBox="0 0 18 18" style={{ height: size, width: size }} className="flex-shrink-0">
      <ellipse cx="9" cy="9" rx="7" ry="7" fill="none" stroke="#2B59C3" strokeWidth="1.2" />
      <ellipse cx="9" cy="9" rx="3.5" ry="3.5" fill="#74ACDF" opacity="0.4" />
      <circle cx="9" cy="7" r="1.8" fill="#F4B400" />
      <path d="M7 11 L9 9 L11 11" stroke="#2B59C3" strokeWidth="0.8" fill="none" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */
interface PatenteInputProps {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}

export function PatenteInput({ value, onChange, required }: PatenteInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const clean = value.replace(/\s/g, "").toUpperCase();
  const format = detectFormat(clean);
  const isOld = format === "old";
  const isMercosur = format === "mercosur";
  const isComplete = (isOld && clean.length === 6) || (isMercosur && clean.length === 7);
  const display = format !== "unknown" ? formatDisplay(clean, format) : clean;
  const ghost = format !== "unknown" ? ghostChars(clean, format) : "";

  // Keep focus on the real input after each render
  const wasFocused = useRef(false);
  useEffect(() => {
    if (wasFocused.current && inputRef.current) {
      inputRef.current.focus();
    }
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
    // Validate char by char against valid plate patterns:
    // Old:      L L L D D D
    // Mercosur: L L D D D L L
    // Positions 0-1: always letter
    // Position 2: letter → old format, digit → mercosur
    let valid = "";
    for (let i = 0; i < raw.length && valid.length < 7; i++) {
      const ch = raw[i];
      const pos = valid.length;
      const isLetter = /[A-Z]/.test(ch);
      const isDigit = /[0-9]/.test(ch);

      if (pos <= 1) {
        // First 2 chars: must be letters
        if (isLetter) valid += ch;
      } else if (pos === 2) {
        // 3rd char decides format: letter=old, digit=mercosur
        if (isLetter || isDigit) valid += ch;
      } else {
        // Detect which format we're in
        const thirdIsLetter = /[A-Z]/.test(valid[2]);
        if (thirdIsLetter) {
          // Old format: positions 3-5 must be digits
          if (pos <= 5 && isDigit) valid += ch;
        } else {
          // Mercosur: positions 3-4 must be digits, 5-6 must be letters
          if (pos <= 4 && isDigit) valid += ch;
          else if (pos >= 5 && isLetter) valid += ch;
        }
      }
    }
    onChange(valid);
  };

  const handleFocus = () => { wasFocused.current = true; };
  const handleBlur = () => { wasFocused.current = false; };
  const focusInput = () => inputRef.current?.focus();

  // Shared input (always present, always the real source of truth)
  const realInput = (
    <input
      ref={inputRef}
      type="text"
      value={clean}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      maxLength={7}
      required={required}
      autoComplete="off"
      className="absolute inset-0 w-full h-full opacity-0 cursor-text z-10"
      style={{ caretColor: "transparent" }}
    />
  );

  // Empty state
  if (!clean) {
    return (
      <div onClick={focusInput} className="cursor-text">
        <div className="relative flex items-center h-[60px] rounded-lg border border-border bg-muted/10 hover:border-border/80 transition-colors">
          <input
            ref={inputRef}
            type="text"
            value=""
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder="Ej: AB 123 CD"
            maxLength={7}
            required={required}
            autoComplete="off"
            className="w-full h-full bg-transparent text-center text-sm font-medium placeholder:text-muted-foreground/40 outline-none uppercase tracking-widest px-4"
          />
        </div>
      </div>
    );
  }

  // Mercosur plate (2016+)
  if (isMercosur || format === "unknown") {
    return (
      <div onClick={focusInput} className="cursor-text flex justify-center">
        <div
          className={`relative overflow-hidden rounded-[6px] transition-all duration-300 w-full max-w-[280px] ${
            isComplete ? "shadow-[0_2px_12px_rgba(43,89,195,0.25)]" : ""
          }`}
          style={{
            border: isComplete ? "1.5px solid #2B59C3" : "1.5px solid #d1d5db",
          }}
        >
          {/* Blue top strip */}
          <div
            className="flex items-center justify-between px-2.5"
            style={{
              background: "linear-gradient(180deg, #2B59C3 0%, #1E4BAF 100%)",
              height: "18px",
            }}
          >
            <MercosurLogo size={12} />
            <span
              style={{
                fontSize: "6.5px",
                fontWeight: 700,
                color: "white",
                letterSpacing: "0.12em",
                fontFamily: "'Arial Narrow', Arial, sans-serif",
              }}
            >
              REPUBLICA ARGENTINA
            </span>
            <ArgentinaFlag size={8} />
          </div>

          {/* Plate body */}
          <div
            className="relative flex items-center justify-center"
            style={{
              background: "linear-gradient(180deg, #FFFFFF 0%, #F5F5F0 100%)",
              minHeight: "44px",
              padding: "0 16px",
            }}
          >
            <span
              className="pointer-events-none select-none"
              style={{
                fontFamily: "'Arial Black', 'Helvetica Neue', sans-serif",
                fontSize: "26px",
                fontWeight: 900,
                letterSpacing: "0.22em",
                color: "#111111",
                lineHeight: 1,
              }}
            >
              {display}
              {ghost && <span style={{ color: "#ccc", fontWeight: 400, fontSize: "16px", letterSpacing: "0.15em" }}>{clean.length === 0 ? "Ej: AA 000 AA" : ghost}</span>}
            </span>
            {realInput}
          </div>
        </div>
      </div>
    );
  }

  // Old plate (pre-2016)
  return (
    <div onClick={focusInput} className="cursor-text flex justify-center">
      <div
        className={`relative overflow-hidden rounded-[6px] transition-all duration-300 w-full max-w-[260px] ${
          isComplete ? "shadow-[0_2px_12px_rgba(0,0,0,0.3)]" : ""
        }`}
        style={{ border: "2px solid #333" }}
      >
        {/* Top strip — gray with ARGENTINA */}
        <div
          className="flex items-center justify-center gap-1.5 px-3"
          style={{
            background: "linear-gradient(180deg, #e8e8e8 0%, #d4d4d4 100%)",
            height: "18px",
          }}
        >
          <CoatOfArms size={11} />
          <span
            style={{
              fontSize: "7px",
              fontWeight: 700,
              color: "#2B59C3",
              letterSpacing: "0.2em",
              fontFamily: "'Arial Narrow', Arial, sans-serif",
            }}
          >
            ARGENTINA
          </span>
        </div>

        {/* Plate body — black */}
        <div
          className="relative flex items-center justify-center"
          style={{
            background: "linear-gradient(180deg, #1a1a1a 0%, #111 100%)",
            minHeight: "44px",
            padding: "0 16px",
            borderTop: "1.5px solid #333",
          }}
        >
          <span
            className="pointer-events-none select-none"
            style={{
              fontFamily: "'Arial Black', 'Helvetica Neue', sans-serif",
              fontSize: "28px",
              fontWeight: 900,
              letterSpacing: "0.3em",
              color: "#FFFFFF",
              lineHeight: 1,
              textShadow: "0 0 2px rgba(255,255,255,0.1)",
            }}
          >
            {display}
            {ghost && <span style={{ color: "#555", fontWeight: 400, fontSize: "18px", letterSpacing: "0.2em" }}>{ghost}</span>}
          </span>
          {realInput}
        </div>

        {/* Screw dots */}
        <div className="absolute top-[3px] left-[6px] w-[3px] h-[3px] rounded-full bg-gray-400/50" />
        <div className="absolute top-[3px] right-[6px] w-[3px] h-[3px] rounded-full bg-gray-400/50" />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Compact badge for cards/tables/lists                               */
/* ------------------------------------------------------------------ */
export function PatenteBadge({ value }: { value: string }) {
  const clean = value.replace(/\s/g, "").toUpperCase();
  const format = detectFormat(clean);
  const display = format !== "unknown" ? formatDisplay(clean, format) : clean;

  if (format === "mercosur") {
    return (
      <span className="inline-flex items-center rounded-[3px] overflow-hidden border border-blue-200 text-[11px] font-bold tracking-wider text-gray-900 leading-none">
        <span className="bg-[#2B59C3] text-white px-1 py-[3px] text-[6px] self-stretch flex items-center font-bold">AR</span>
        <span className="bg-white px-1.5 py-[3px]">{display}</span>
      </span>
    );
  }

  if (format === "old") {
    return (
      <span className="inline-flex items-center rounded-[3px] bg-[#1a1a1a] px-2 py-[3px] text-[11px] font-bold tracking-[0.15em] text-white leading-none">
        {display}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center rounded-[3px] bg-muted px-2 py-[3px] text-[11px] font-bold tracking-wider text-foreground leading-none font-mono">
      {display}
    </span>
  );
}
