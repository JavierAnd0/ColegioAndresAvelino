'use client';
import { useState, useRef, useEffect, useMemo } from 'react';
import Label from '@/components/atoms/Typography/Label';

const DAYS = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa', 'Do'];
const MONTHS = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

function formatDisplay(dateStr, timeStr, includeTime) {
    if (!dateStr) return '';
    const [y, m, d] = dateStr.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    const formatted = date.toLocaleDateString('es-CO', {
        day: 'numeric', month: 'short', year: 'numeric',
    });
    if (includeTime && timeStr) {
        return `${formatted}, ${timeStr}`;
    }
    return formatted;
}

function getDaysInMonth(year, month) {
    return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year, month) {
    const day = new Date(year, month, 1).getDay();
    return day === 0 ? 6 : day - 1; // Monday = 0
}

export default function CalendarPicker({
    label,
    date,
    time = '',
    onDateChange,
    onTimeChange,
    includeTime = true,
    error,
    required = false,
}) {
    const [open, setOpen] = useState(false);
    const [viewYear, setViewYear] = useState(() => {
        if (date) return parseInt(date.split('-')[0]);
        return new Date().getFullYear();
    });
    const [viewMonth, setViewMonth] = useState(() => {
        if (date) return parseInt(date.split('-')[1]) - 1;
        return new Date().getMonth();
    });
    const containerRef = useRef(null);

    // Cerrar al hacer click fuera
    useEffect(() => {
        function handleClickOutside(e) {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setOpen(false);
            }
        }
        if (open) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [open]);

    const today = useMemo(() => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    }, []);

    const calendarDays = useMemo(() => {
        const daysInMonth = getDaysInMonth(viewYear, viewMonth);
        const firstDay = getFirstDayOfWeek(viewYear, viewMonth);
        const daysInPrevMonth = getDaysInMonth(viewYear, viewMonth - 1);

        const days = [];

        // Días del mes anterior
        for (let i = firstDay - 1; i >= 0; i--) {
            const d = daysInPrevMonth - i;
            const m = viewMonth === 0 ? 11 : viewMonth - 1;
            const y = viewMonth === 0 ? viewYear - 1 : viewYear;
            days.push({
                day: d,
                dateStr: `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
                currentMonth: false,
            });
        }

        // Días del mes actual
        for (let d = 1; d <= daysInMonth; d++) {
            days.push({
                day: d,
                dateStr: `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
                currentMonth: true,
            });
        }

        // Días del mes siguiente para completar la grilla
        const remaining = 42 - days.length;
        for (let d = 1; d <= remaining; d++) {
            const m = viewMonth === 11 ? 0 : viewMonth + 1;
            const y = viewMonth === 11 ? viewYear + 1 : viewYear;
            days.push({
                day: d,
                dateStr: `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
                currentMonth: false,
            });
        }

        return days;
    }, [viewYear, viewMonth]);

    const prevMonth = () => {
        if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
        else setViewMonth(m => m - 1);
    };

    const nextMonth = () => {
        if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
        else setViewMonth(m => m + 1);
    };

    const goToday = () => {
        const now = new Date();
        setViewYear(now.getFullYear());
        setViewMonth(now.getMonth());
        onDateChange(today);
    };

    const selectDate = (dateStr) => {
        onDateChange(dateStr);
        if (!includeTime) setOpen(false);
    };

    return (
        <div className="flex flex-col gap-1.5 w-full" ref={containerRef}>
            {label && <Label required={required}>{label}</Label>}

            {/* Display field */}
            <div className="flex gap-2">
                <button
                    type="button"
                    onClick={() => setOpen(!open)}
                    className={`
                        flex-1 flex items-center gap-2 px-3 py-2.5 text-sm text-left
                        bg-white border rounded-lg transition-all duration-200 cursor-pointer
                        ${error
                            ? 'border-red-400'
                            : open
                                ? 'border-neutral-900 ring-2 ring-neutral-900'
                                : 'border-neutral-200 hover:border-neutral-400'
                        }
                    `}
                >
                    <svg className="h-4 w-4 text-neutral-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                            d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                    </svg>
                    <span className={date ? 'text-neutral-900' : 'text-neutral-400'}>
                        {date ? formatDisplay(date, time, includeTime) : 'Seleccionar fecha...'}
                    </span>
                </button>

                {/* Time input */}
                {includeTime && (
                    <div className="relative w-28">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2.5">
                            <svg className="h-4 w-4 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                    d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <input
                            type="time"
                            value={time}
                            onChange={(e) => onTimeChange(e.target.value)}
                            className="w-full pl-8 pr-2 py-2.5 text-sm bg-white border border-neutral-200 rounded-lg text-neutral-900 outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent cursor-pointer"
                        />
                    </div>
                )}
            </div>

            {/* Calendar dropdown */}
            {open && (
                <div className="relative z-50">
                    <div className="absolute top-1 left-0 w-72 bg-white border border-neutral-200 rounded-xl shadow-lg p-3 animate-in fade-in">

                        {/* Header: month/year + nav */}
                        <div className="flex items-center justify-between mb-3">
                            <button type="button" onClick={prevMonth}
                                className="p-1 rounded-md hover:bg-neutral-100 transition-colors cursor-pointer">
                                <svg className="h-4 w-4 text-neutral-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>

                            <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold text-neutral-900">
                                    {MONTHS[viewMonth]} {viewYear}
                                </span>
                                <button type="button" onClick={goToday}
                                    className="px-2 py-0.5 text-[10px] font-medium text-neutral-500 bg-neutral-100 rounded hover:bg-neutral-200 transition-colors cursor-pointer">
                                    Hoy
                                </button>
                            </div>

                            <button type="button" onClick={nextMonth}
                                className="p-1 rounded-md hover:bg-neutral-100 transition-colors cursor-pointer">
                                <svg className="h-4 w-4 text-neutral-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        </div>

                        {/* Day headers */}
                        <div className="grid grid-cols-7 mb-1">
                            {DAYS.map(d => (
                                <div key={d} className="text-center text-[10px] font-semibold text-neutral-400 py-1">
                                    {d}
                                </div>
                            ))}
                        </div>

                        {/* Day grid */}
                        <div className="grid grid-cols-7">
                            {calendarDays.map(({ day, dateStr, currentMonth }, i) => {
                                const isSelected = dateStr === date;
                                const isToday = dateStr === today;

                                return (
                                    <button
                                        key={i}
                                        type="button"
                                        onClick={() => selectDate(dateStr)}
                                        className={`
                                            h-8 w-full text-xs rounded-md transition-all duration-150 cursor-pointer
                                            ${!currentMonth ? 'text-neutral-300' : 'text-neutral-700 hover:bg-neutral-100'}
                                            ${isToday && !isSelected ? 'font-bold text-blue-600 bg-blue-50' : ''}
                                            ${isSelected ? 'bg-neutral-900 text-white font-semibold hover:bg-neutral-800' : ''}
                                        `}
                                    >
                                        {day}
                                    </button>
                                );
                            })}
                        </div>

                        {/* End date hint */}
                        {date && (
                            <div className="mt-2 pt-2 border-t border-neutral-100">
                                <button
                                    type="button"
                                    onClick={() => setOpen(false)}
                                    className="w-full py-1.5 text-xs font-medium text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 rounded-md transition-colors cursor-pointer"
                                >
                                    Confirmar
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {error && <span className="text-xs text-red-500">{error}</span>}
        </div>
    );
}
