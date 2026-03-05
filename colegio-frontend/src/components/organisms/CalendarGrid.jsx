'use client';
import { useState, useMemo } from 'react';
import CalendarDayCell from '@/components/molecules/CalendarDayCell';
import EventDetailPanel from '@/components/molecules/EventDetailPanel';

const WEEKDAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

function getCalendarDays(year, month) {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();

    // Monday = 0, Sunday = 6
    let startWeekday = firstDay.getDay() - 1;
    if (startWeekday < 0) startWeekday = 6;

    const days = [];

    // Previous month filler days
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startWeekday - 1; i >= 0; i--) {
        days.push({ day: prevMonthLastDay - i, isCurrentMonth: false });
    }

    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
        days.push({ day: d, isCurrentMonth: true });
    }

    // Next month filler days to complete the grid (always 6 rows = 42 cells)
    const remaining = 42 - days.length;
    for (let d = 1; d <= remaining; d++) {
        days.push({ day: d, isCurrentMonth: false });
    }

    return days;
}

export default function CalendarGrid({ events = [], currentMonth, currentYear }) {
    const [selectedDay, setSelectedDay] = useState(null);
    const today = new Date();

    const calendarDays = useMemo(
        () => getCalendarDays(currentYear, currentMonth),
        [currentYear, currentMonth]
    );

    // Map events to days
    const eventsByDay = useMemo(() => {
        const map = {};
        events.forEach((event) => {
            const d = new Date(event.startDate);
            if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
                const day = d.getDate();
                if (!map[day]) map[day] = [];
                map[day].push(event);
            }
        });
        return map;
    }, [events, currentMonth, currentYear]);

    const handleDayClick = (day) => {
        setSelectedDay(selectedDay === day ? null : day);
    };

    const selectedDate = selectedDay
        ? new Date(currentYear, currentMonth, selectedDay)
        : null;

    const selectedEvents = selectedDay ? (eventsByDay[selectedDay] || []) : [];

    return (
        <div className="flex flex-col gap-4">
            {/* Weekday headers */}
            <div className="grid grid-cols-7">
                {WEEKDAYS.map((day) => (
                    <div
                        key={day}
                        className="py-2 text-center font-mono text-[0.65rem] font-semibold text-neutral-400 uppercase tracking-wider"
                    >
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 border-t border-l border-neutral-100 rounded-xl overflow-hidden">
                {calendarDays.map((cell, i) => (
                    <CalendarDayCell
                        key={i}
                        day={cell.day}
                        isCurrentMonth={cell.isCurrentMonth}
                        isToday={
                            cell.isCurrentMonth &&
                            cell.day === today.getDate() &&
                            currentMonth === today.getMonth() &&
                            currentYear === today.getFullYear()
                        }
                        isSelected={cell.isCurrentMonth && cell.day === selectedDay}
                        events={cell.isCurrentMonth ? (eventsByDay[cell.day] || []) : []}
                        onClick={cell.isCurrentMonth ? handleDayClick : undefined}
                    />
                ))}
            </div>

            {/* Detail panel */}
            {selectedDay && (
                <EventDetailPanel
                    date={selectedDate}
                    events={selectedEvents}
                    onClose={() => setSelectedDay(null)}
                />
            )}
        </div>
    );
}
