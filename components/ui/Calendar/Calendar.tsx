"use client";

import * as React from "react";
import { twMerge } from "tailwind-merge";
import { Button } from "../Button";
import { Text } from "../Text";
import {
  AddCircle,
  ArrowLeft,
  ArrowRight,
  Calendar as CalendarIcon,
} from "@solar-icons/react/ssr";
import { daysOfWeek, months } from "@/types/time/times";
import { CalendarEvent, CalendarView } from "@/types/calendar/calendar";

export interface CalendarProps {
  events?: CalendarEvent[];
  onEventClick?: (event: CalendarEvent) => void;
  onAddEvent?: (date: Date) => void;
  onDateSelect?: (date: Date) => void;
  selectedDate?: Date;
  className?: string;
  showNavigation?: boolean;
  showTodayButton?: boolean;
  showViewToggle?: boolean;
  defaultView?: CalendarView;
  locale?: string;
  isMobile?: boolean; // Force mobile layout
}

// Helper functions
const getDaysInMonth = (year: number, month: number) => {
  return new Date(year, month + 1, 0).getDate();
};

const getFirstDayOfMonth = (year: number, month: number) => {
  return new Date(year, month, 1).getDay();
};

const isSameDay = (date1: Date, date2: Date) => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

const isToday = (date: Date) => {
  const today = new Date();
  return isSameDay(date, today);
};

const formatDate = (date: Date, locale: string = "pt-BR") => {
  return date.toLocaleDateString(locale, {
    month: "long",
    year: "numeric",
  });
};

const getEventsForDate = (events: CalendarEvent[], date: Date) => {
  return events.filter((event) => {
    return isSameDay(event.date, date);
  });
};

const getEventColorClasses = (color: CalendarEvent["color"]) => {
  const colorMap = {
    primary: "bg-blue-600 text-white border-blue-700 shadow-sm",
    secondary: "bg-purple-600 text-white border-purple-700 shadow-sm",
    success: "bg-emerald-600 text-white border-emerald-700 shadow-sm",
    warning: "bg-amber-600 text-white border-amber-700 shadow-sm",
    danger: "bg-red-600 text-white border-red-700 shadow-sm",
    info: "bg-cyan-600 text-white border-cyan-700 shadow-sm",
  };
  return colorMap[color || "primary"];
};

const getWeekDates = (date: Date) => {
  const startOfWeek = new Date(date);
  const day = startOfWeek.getDay();
  const diff = startOfWeek.getDate() - day;
  startOfWeek.setDate(diff);

  const weekDates = [];
  for (let i = 0; i < 7; i++) {
    const currentDate = new Date(startOfWeek);
    currentDate.setDate(startOfWeek.getDate() + i);
    weekDates.push(currentDate);
  }
  return weekDates;
};

const getDayHours = () => {
  const hours = [];
  // Start at 8 AM and go until 22 (10 PM)
  for (let i = 8; i <= 22; i++) {
    hours.push(i);
  }
  return hours;
};

// Hook to detect mobile
const useIsMobile = () => {
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return isMobile;
};

export const Calendar: React.FC<CalendarProps> = ({
  events = [],
  onEventClick,
  onAddEvent,
  onDateSelect,
  selectedDate,
  className,
  showNavigation = true,
  showTodayButton = true,
  showViewToggle = true,
  defaultView = "month",
  locale = "pt-BR",
  isMobile: forceMobile,
}) => {
  const detectedMobile = useIsMobile();
  const isMobile = forceMobile ?? detectedMobile;

  const [currentDate, setCurrentDate] = React.useState(() => {
    return selectedDate || new Date();
  });
  const [currentView, setCurrentView] = React.useState<CalendarView>(
    isMobile ? "month" : defaultView
  );

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  const goToPreviousPeriod = () => {
    if (currentView === "month") {
      setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
    } else if (currentView === "week") {
      const newDate = new Date(currentDate);
      newDate.setDate(currentDate.getDate() - 7);
      setCurrentDate(newDate);
    } else if (currentView === "day") {
      const newDate = new Date(currentDate);
      newDate.setDate(currentDate.getDate() - 1);
      setCurrentDate(newDate);
    }
  };

  const goToNextPeriod = () => {
    if (currentView === "month") {
      setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
    } else if (currentView === "week") {
      const newDate = new Date(currentDate);
      newDate.setDate(currentDate.getDate() + 7);
      setCurrentDate(newDate);
    } else if (currentView === "day") {
      const newDate = new Date(currentDate);
      newDate.setDate(currentDate.getDate() + 1);
      setCurrentDate(newDate);
    }
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
  };

  const handleDateClick = (date: Date) => {
    onDateSelect?.(date);
  };

  const handleAddEvent = (date: Date) => {
    onAddEvent?.(date);
  };

  const getViewTitle = () => {
    if (currentView === "month") {
      return formatDate(currentDate, locale);
    } else if (currentView === "week") {
      const weekDates = getWeekDates(currentDate);
      const startDate = weekDates[0];
      const endDate = weekDates[6];
      return `${startDate.getDate()} ${
        months[startDate.getMonth()]
      } - ${endDate.getDate()} ${months[endDate.getMonth()]} ${currentYear}`;
    } else if (currentView === "day") {
      return `${currentDate.getDate()} ${
        months[currentDate.getMonth()]
      } ${currentYear}`;
    }
    return "";
  };

  // Calculate event height and position based on duration
  const calculateEventPosition = (event: CalendarEvent) => {
    if (!event.startTime || !event.endTime) return { top: 0, height: 60 };

    const [startHour, startMin] = event.startTime.split(":").map(Number);
    const [endHour, endMin] = event.endTime.split(":").map(Number);

    const startMinutes = (startHour - 8) * 60 + startMin; // Offset by 8 hours
    const endMinutes = (endHour - 8) * 60 + endMin;
    const duration = endMinutes - startMinutes;

    const pixelsPerMinute = 60 / 60; // 60px per hour = 1px per minute

    return {
      top: startMinutes * pixelsPerMinute,
      height: Math.max(duration * pixelsPerMinute, 40), // Minimum height of 40px
    };
  };

  const renderEventBadge = (
    event: CalendarEvent,
    isCompact: boolean = false,
    isTimeline: boolean = false
  ) => {
    const eventStyle = isTimeline ? calculateEventPosition(event) : {};

    const baseClasses = twMerge(
      "group relative px-2.5 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all duration-200",
      "hover:scale-102 hover:shadow-md active:scale-95",
      getEventColorClasses(event.color)
    );
    if (isCompact || isTimeline) {
      return (
        <div
          key={event.id}
          className={baseClasses}
          style={isTimeline ? eventStyle : {}}
          onClick={(e) => {
            e.stopPropagation();
            onEventClick?.(event);
          }}
          title={`${event.title} ${event.startTime ? `(${event.startTime} - ${event.endTime})` : ""}`}
        >
          <div className="flex items-center justify-between">
            <span className="truncate font-semibold text-xs leading-tight">
              {event.title}
            </span>
            <div className="flex items-center gap-1 ml-1 flex-shrink-0">
              {event.classType === "occasional" && (
                <span className="text-xs">👤</span>
              )}
              {event.classType === "regular" && (
                <span className="text-xs">📚</span>
              )}
            </div>
          </div>

          {isTimeline && event.startTime && (
            <div className="text-xs opacity-90 mt-0.5">{event.startTime}</div>
          )}

          {(event.studentInfo?.studentName || event.person) && isTimeline && (
            <div className="text-xs opacity-80 truncate mt-0.5">
              {event.studentInfo?.studentName || event.person}
            </div>
          )}
        </div>
      );
    }

    return (
      <div
        key={event.id}
        className={twMerge(baseClasses, "w-full")}
        onClick={(e) => {
          e.stopPropagation();
          onEventClick?.(event);
        }}
        title={event.title}
      >
        <div className="flex items-start justify-between">
          <span className="truncate text-sm font-semibold">{event.title}</span>
          <div className="flex items-center gap-1 ml-2 flex-shrink-0">
            {event.repeating && <span className="text-xs opacity-90">🔄</span>}
            {event.classType === "occasional" && (
              <span className="text-xs">👤</span>
            )}
            {event.classType === "regular" && (
              <span className="text-xs">📅</span>
            )}
          </div>
        </div>

        {/* Additional event info */}
        <div className="mt-1 space-y-1">
          {event.studentInfo?.studentName && (
            <div className="text-xs opacity-90 flex items-center gap-1">
              <span>👤</span>
              <span className="truncate">{event.studentInfo.studentName}</span>
            </div>
          )}
          {!event.studentInfo?.studentName && event.person && (
            <div className="text-xs opacity-90 flex items-center gap-1">
              <span>👤</span>
              <span className="truncate">{event.person}</span>
            </div>
          )}
          {event.location && (
            <div className="text-xs opacity-90 flex items-center gap-1">
              <span>📍</span>
              <span className="truncate">{event.location}</span>
            </div>
          )}
          {event.priority && (
            <div className="text-xs opacity-90 flex items-center gap-1">
              <span>
                {event.priority === "high"
                  ? "🔴"
                  : event.priority === "medium"
                    ? "🟡"
                    : "🟢"}
              </span>
              <span className="capitalize">{event.priority}</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderMonthView = () => {
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const firstDayOfMonth = getFirstDayOfMonth(currentYear, currentMonth);

    const calendarDays = [];
    const totalDays = firstDayOfMonth + daysInMonth;
    const weeks = Math.ceil(totalDays / 7);

    for (let week = 0; week < weeks; week++) {
      const weekDays = [];
      for (let day = 0; day < 7; day++) {
        const dayIndex = week * 7 + day;
        const dateNumber = dayIndex - firstDayOfMonth + 1;
        const isValidDate = dateNumber > 0 && dateNumber <= daysInMonth;
        const date = isValidDate
          ? new Date(currentYear, currentMonth, dateNumber)
          : null;
        const dayEvents = date ? getEventsForDate(events, date) : [];
        const isSelected =
          date && selectedDate && isSameDay(date, selectedDate);
        const isCurrentDay = date && isToday(date);

        weekDays.push(
          <div
            key={dayIndex}
            className={twMerge(
              // Base styles
              "group relative border border-slate-200 dark:border-slate-700 transition-all duration-200",
              // Responsive height
              isMobile ? "min-h-[100px] p-2" : "min-h-[140px] p-3",
              // Interactive states
              isValidDate
                ? "cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600"
                : "bg-slate-50 dark:bg-slate-900 opacity-60",
              // Selection states
              isSelected &&
                "bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-600 ring-2 ring-blue-200 dark:ring-blue-800",
              isCurrentDay &&
                "bg-indigo-50 dark:bg-indigo-900/20 border-indigo-300 dark:border-indigo-600"
            )}
            onClick={() => date && handleDateClick(date)}
          >
            {isValidDate && (
              <>
                <div className="flex items-center justify-between mb-2">
                  <Text
                    size={isMobile ? "sm" : "base"}
                    className={twMerge(
                      "font-bold transition-colors",
                      isCurrentDay && "text-emerald-700 dark:text-emerald-400",
                      isSelected && "text-blue-700 dark:text-blue-400",
                      !isCurrentDay &&
                        !isSelected &&
                        "text-slate-900 dark:text-slate-100"
                    )}
                  >
                    {dateNumber}
                  </Text>
                  {onAddEvent && (
                    <Button
                      size="icon"
                      variant="ghost"
                      className={twMerge(
                        "opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110",
                        isMobile ? "h-6 w-6 p-1" : "h-7 w-7 p-1.5",
                        "text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-900/30"
                      )}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddEvent(date as Date);
                      }}
                    >
                      <AddCircle
                        className={twMerge(isMobile ? "h-4 w-4" : "h-4 w-4")}
                      />
                    </Button>
                  )}
                </div>

                {/* Events for this date */}
                <div className="space-y-1">
                  {dayEvents
                    .slice(0, isMobile ? 2 : 4)
                    .map((event) => renderEventBadge(event, isMobile))}
                  {dayEvents.length > (isMobile ? 2 : 4) && (
                    <div className="px-2 py-1 text-xs text-slate-600 dark:text-slate-400 font-medium bg-slate-100 dark:bg-slate-800 rounded-md">
                      +{dayEvents.length - (isMobile ? 2 : 4)} mais
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        );
      }
      calendarDays.push(
        <div key={week} className="grid grid-cols-7">
          {weekDays}
        </div>
      );
    }

    return (
      <div className="bg-white/60 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm">
        {/* Day headers */}
        <div className="grid grid-cols-7 bg-slate-200 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
          {daysOfWeek.map((day) => (
            <div
              key={day}
              className={twMerge(
                "text-center border-r border-slate-200 dark:border-slate-700 last:border-r-0",
                isMobile ? "py-3 px-1" : "py-4 px-3"
              )}
            >
              <Text
                size={isMobile ? "sm" : "base"}
                className="font-bold text-slate-700 dark:text-slate-300"
              >
                {isMobile ? day.slice(0, 3) : day}
              </Text>
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div>{calendarDays}</div>
      </div>
    );
  };

  const renderWeekView = () => {
    if (isMobile) {
      // Mobile week view - card layout
      const weekDates = getWeekDates(currentDate);

      return (
        <div className="space-y-3">
          {weekDates.map((date) => {
            const dayEvents = getEventsForDate(events, date);
            const isSelected = selectedDate && isSameDay(date, selectedDate);
            const isCurrentDay = isToday(date);

            return (
              <div
                key={date.toISOString()}
                className={twMerge(
                  "p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm cursor-pointer transition-all duration-200 hover:shadow-md",
                  isSelected &&
                    "bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-600 ring-2 ring-blue-200 dark:ring-blue-800",
                  isCurrentDay &&
                    "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-300 dark:border-emerald-600"
                )}
                onClick={() => handleDateClick(date)}
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <Text
                      size="lg"
                      className="font-bold text-slate-900 dark:text-slate-100"
                    >
                      {daysOfWeek[date.getDay()]}
                    </Text>
                    <Text
                      size="sm"
                      className="text-slate-600 dark:text-slate-400 font-medium"
                    >
                      {date.getDate()} {months[date.getMonth()]}
                    </Text>
                  </div>
                  {onAddEvent && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-900/30"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddEvent(date);
                      }}
                    >
                      <AddCircle className="h-4 w-4 mr-2" />
                      Adicionar
                    </Button>
                  )}
                </div>

                <div className="space-y-2">
                  {dayEvents.length === 0 ? (
                    <Text
                      size="sm"
                      className="text-slate-500 dark:text-slate-400 italic"
                    >
                      Nenhum evento
                    </Text>
                  ) : (
                    dayEvents.map((event) => renderEventBadge(event, false))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      );
    }

    // Desktop week view - timeline
    const weekDates = getWeekDates(currentDate);

    return (
      <div className="bg-white/60 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm">
        {/* Time column and day headers */}
        <div className="grid grid-cols-8 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
          <div className="p-4 border-r border-slate-200 dark:border-slate-700">
            <Text
              size="sm"
              className="font-bold text-slate-700 dark:text-slate-300"
            >
              Hora
            </Text>
          </div>
          {weekDates.map((date) => (
            <div
              key={date.toISOString()}
              className="p-4 text-center border-r border-slate-200 dark:border-slate-700 last:border-r-0"
            >
              <Text
                size="sm"
                className="font-bold text-slate-900 dark:text-slate-100"
              >
                {daysOfWeek[date.getDay()]}
              </Text>
              <Text
                size="xs"
                className="text-slate-600 dark:text-slate-400 font-medium"
              >
                {date.getDate()}
              </Text>
            </div>
          ))}
        </div>

        {/* Time slots */}
        <div className="max-h-[600px] overflow-y-auto scrollbar-hide no-scrollbar">
          {getDayHours().map((hour) => (
            <div
              key={hour}
              className="grid grid-cols-8 border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <div className="p-3 border-r border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                <Text
                  size="xs"
                  className="text-slate-600 dark:text-slate-400 font-medium"
                >
                  {hour.toString().padStart(2, "0")}:00
                </Text>
              </div>
              {weekDates.map((date) => {
                const dayEvents = getEventsForDate(events, date).filter(
                  (event) =>
                    event.startTime &&
                    parseInt(event.startTime.split(":")[0]) === hour
                );

                return (
                  <div
                    key={date.toISOString()}
                    className="p-2 border-r border-slate-200 dark:border-slate-700 last:border-r-0 min-h-[60px] relative group"
                    onClick={() => handleDateClick(date)}
                  >
                    {dayEvents.map((event) => renderEventBadge(event, true))}
                    {onAddEvent && (
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-5 w-5 p-1 opacity-0 group-hover:opacity-100 transition-all duration-200 absolute bottom-1 right-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-900/30"
                        onClick={(e) => {
                          e.stopPropagation();
                          const newDate = new Date(date);
                          newDate.setHours(hour);
                          handleAddEvent(newDate);
                        }}
                      >
                        <AddCircle className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderDayView = () => {
    if (isMobile) {
      // Mobile day view - card layout
      const dayEvents = getEventsForDate(events, currentDate);

      return (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <Text
              size="xl"
              className="font-bold text-slate-900 dark:text-slate-100"
            >
              {daysOfWeek[currentDate.getDay()]}, {currentDate.getDate()}{" "}
              {months[currentDate.getMonth()]} {currentYear}
            </Text>
          </div>

          <div className="space-y-3">
            {dayEvents.length === 0 ? (
              <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                <div className="text-6xl mb-4">📅</div>
                <Text
                  size="lg"
                  className="text-slate-500 dark:text-slate-400 mb-4 font-medium"
                >
                  Nenhum evento para hoje
                </Text>
                {onAddEvent && (
                  <Button
                    variant="primary"
                    onClick={() => handleAddEvent(currentDate)}
                    className="bg-blue-600 hover:bg-blue-700 text-white border-blue-700 shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    <AddCircle className="h-5 w-5 mr-2" />
                    Adicionar Evento
                  </Button>
                )}
              </div>
            ) : (
              dayEvents.map((event) => (
                <div
                  key={event.id}
                  className={twMerge(
                    "p-5 rounded-xl border cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-[1.02] active:scale-[0.98]",
                    getEventColorClasses(event.color)
                  )}
                  onClick={() => onEventClick?.(event)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        <Text size="lg" className="font-bold">
                          {event.title}
                        </Text>
                        {event.classType === "occasional" && (
                          <span className="text-lg">👤</span>
                        )}
                        {event.classType === "regular" && (
                          <span className="text-lg">📚</span>
                        )}
                      </div>

                      {event.description && (
                        <Text
                          size="sm"
                          className="opacity-90 mb-3 leading-relaxed"
                        >
                          {event.description}
                        </Text>
                      )}

                      <div className="space-y-2">
                        {event.startTime && event.endTime && (
                          <div className="flex items-center gap-2 text-sm opacity-90">
                            <span className="text-base">⏰</span>
                            <span className="font-medium">
                              {event.startTime} - {event.endTime}
                            </span>
                          </div>
                        )}

                        {event.studentInfo?.studentName && (
                          <div className="flex items-center gap-2 text-sm opacity-90">
                            <span className="text-base">👤</span>
                            <span className="font-medium">
                              {event.studentInfo.studentName}
                            </span>
                          </div>
                        )}

                        {!event.studentInfo?.studentName && event.person && (
                          <div className="flex items-center gap-2 text-sm opacity-90">
                            <span className="text-base">👤</span>
                            <span className="font-medium">{event.person}</span>
                          </div>
                        )}

                        {event.location && (
                          <div className="flex items-center gap-2 text-sm opacity-90">
                            <span className="text-base">📍</span>
                            <span className="font-medium">
                              {event.location}
                            </span>
                          </div>
                        )}

                        {event.priority && (
                          <div className="flex items-center gap-2 text-sm opacity-90">
                            <span className="text-base">
                              {event.priority === "high"
                                ? "🔴"
                                : event.priority === "medium"
                                  ? "🟡"
                                  : "🟢"}
                            </span>
                            <span className="font-medium capitalize">
                              {event.priority}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    {event.repeating && (
                      <span className="text-2xl opacity-80 ml-3">🔄</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      );
    }

    // Desktop day view - timeline
    const dayEvents = getEventsForDate(events, currentDate);
    const hours = getDayHours();

    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm">
        {/* Day header */}
        <div className="bg-slate-100 dark:bg-slate-800 p-6 border-b border-slate-200 dark:border-slate-700">
          <Text
            size="xl"
            className="font-bold text-slate-900 dark:text-slate-100"
          >
            {daysOfWeek[currentDate.getDay()]}, {currentDate.getDate()}{" "}
            {months[currentDate.getMonth()]} {currentYear}
          </Text>
        </div>

        {/* Time slots */}
        <div className="max-h-[600px] overflow-y-auto">
          {hours.map((hour) => {
            const hourEvents = dayEvents.filter(
              (event) =>
                event.startTime &&
                parseInt(event.startTime.split(":")[0]) === hour
            );

            return (
              <div
                key={hour}
                className="flex border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <div className="w-24 p-4 bg-slate-50 dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700">
                  <Text
                    size="sm"
                    className="font-bold text-slate-700 dark:text-slate-300"
                  >
                    {hour.toString().padStart(2, "0")}:00
                  </Text>
                </div>
                <div className="flex-1 p-4 relative min-h-[80px] group">
                  {hourEvents.map((event) => (
                    <div
                      key={event.id}
                      className={twMerge(
                        "px-4 py-3 rounded-lg mb-2 cursor-pointer transition-all duration-200 border hover:shadow-md hover:scale-[1.02] active:scale-[0.98]",
                        getEventColorClasses(event.color)
                      )}
                      onClick={() => onEventClick?.(event)}
                      title={event.title}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Text size="sm" className="font-bold">
                          {event.title}
                        </Text>
                        {event.classType === "occasional" && (
                          <span className="text-sm">👤</span>
                        )}
                        {event.classType === "regular" && (
                          <span className="text-sm">📚</span>
                        )}
                      </div>

                      <div className="space-y-1">
                        {event.startTime && event.endTime && (
                          <Text size="xs" className="opacity-90 font-medium">
                            {event.startTime} - {event.endTime}
                          </Text>
                        )}

                        {event.studentInfo?.studentName && (
                          <div className="flex items-center gap-1 text-xs opacity-90">
                            <span>👤</span>
                            <span className="font-medium">
                              {event.studentInfo.studentName}
                            </span>
                          </div>
                        )}

                        {!event.studentInfo?.studentName && event.person && (
                          <div className="flex items-center gap-1 text-xs opacity-90">
                            <span>👤</span>
                            <span className="font-medium">{event.person}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {onAddEvent && (
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6 p-1 opacity-0 group-hover:opacity-100 transition-all duration-200 absolute bottom-2 right-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-900/30"
                      onClick={() => {
                        const newDate = new Date(currentDate);
                        newDate.setHours(hour);
                        handleAddEvent(newDate);
                      }}
                    >
                      <AddCircle className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case "month":
        return renderMonthView();
      case "week":
        return renderWeekView();
      case "day":
        return renderDayView();
      default:
        return renderMonthView();
    }
  };

  return (
    <div className={twMerge("w-full mx-auto", className)}>
      {/* Modern Calendar Header */}
      <div
        className={twMerge(
          "flex items-center justify-between mb-8",
          isMobile && "flex-col space-y-6 items-stretch"
        )}
      >
        {/* Navigation and Title */}
        <div
          className={twMerge(
            "flex items-center gap-6",
            isMobile && "justify-center"
          )}
        >
          {showNavigation && (
            <div className="flex items-center gap-2">
              <Button
                variant="glass"
                size="icon"
                onClick={goToPreviousPeriod}
                className={twMerge(
                  "border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all duration-200",
                  isMobile ? "h-10 w-10" : "h-11 w-11"
                )}
              >
                <ArrowLeft
                  className={twMerge(
                    "text-slate-700 dark:text-slate-300",
                    isMobile ? "h-5 w-5" : "h-5 w-5"
                  )}
                />
              </Button>
              <Button
                variant="glass"
                size="icon"
                onClick={goToNextPeriod}
                className={twMerge(
                  "border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all duration-200",
                  isMobile ? "h-10 w-10" : "h-11 w-11"
                )}
              >
                <ArrowRight
                  className={twMerge(
                    "text-slate-700 dark:text-slate-300",
                    isMobile ? "h-5 w-5" : "h-5 w-5"
                  )}
                />
              </Button>
            </div>
          )}

          <Text
            size={isMobile ? "xl" : "2xl"}
            className={twMerge(
              "capitalize font-bold text-slate-900 dark:text-slate-100",
              isMobile && "text-center"
            )}
          >
            {getViewTitle()}
          </Text>
        </div>

        {/* Controls */}
        <div
          className={twMerge(
            "flex items-center gap-4",
            isMobile && "flex-col space-y-4 space-x-0 w-full"
          )}
        >
          {showViewToggle && !isMobile && (
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl p-1 border border-slate-200 dark:border-slate-700 shadow-sm gap-2">
              <Button
                variant={currentView === "month" ? "primary" : "ghost"}
                size="sm"
                onClick={() => setCurrentView("month")}
              >
                <CalendarIcon className="h-4 w-4 mr-2" />
                Mês
              </Button>
              <Button
                variant={currentView === "week" ? "primary" : "ghost"}
                size="sm"
                onClick={() => setCurrentView("week")}
              >
                Semana
              </Button>
              <Button
                variant={currentView === "day" ? "primary" : "ghost"}
                size="sm"
                onClick={() => setCurrentView("day")}
              >
                Dia
              </Button>
              <Button variant="warning" size="sm" onClick={goToToday}>
                Hoje
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Calendar Content */}
      <div className="relative">{renderCurrentView()}</div>
    </div>
  );
};
