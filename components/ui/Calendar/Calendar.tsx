"use client";

import * as React from "react";
import { twMerge } from "tailwind-merge";
import { Button } from "../Button";
import { Text } from "../Text";
import { Heading } from "../Heading";
import {
  AddCircle,
  ArrowLeft,
  ArrowRight,
  Calendar as CalendarIcon,
} from "@solar-icons/react/ssr";
import { daysOfWeek, months } from "@/types/time/times";

// Types for calendar functionality
export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  date: Date;
  startTime?: string;
  endTime?: string;
  color?: "primary" | "secondary" | "success" | "warning" | "danger" | "info";
  isAllDay?: boolean;
  person?: string; // Person responsible for the event
  repeating?: {
    type: "daily" | "weekly" | "monthly" | "yearly";
    interval: number; // Every X days/weeks/months/years
    endDate?: Date; // When the repetition ends
  };
  location?: string; // Event location
  priority?: "low" | "medium" | "high";
}

export type CalendarView = "month" | "week" | "day";

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
    // Check if it's a repeating event
    if (event.repeating) {
      const eventStart = new Date(event.date);
      const currentDate = new Date(date);

      switch (event.repeating.type) {
        case "daily":
          return true; // Daily events appear every day
        case "weekly":
          const daysDiff = Math.floor(
            (currentDate.getTime() - eventStart.getTime()) /
              (1000 * 60 * 60 * 24)
          );
          return (
            daysDiff >= 0 && daysDiff % (7 * event.repeating.interval) === 0
          );
        case "monthly":
          return currentDate.getDate() === eventStart.getDate();
        case "yearly":
          return (
            currentDate.getMonth() === eventStart.getMonth() &&
            currentDate.getDate() === eventStart.getDate()
          );
        default:
          return isSameDay(event.date, date);
      }
    }

    return isSameDay(event.date, date);
  });
};

const getEventColorClasses = (color: CalendarEvent["color"]) => {
  const colorMap = {
    primary: "bg-primary text-primary-text",
    secondary: "bg-secondary text-secondary-text",
    success: "bg-success text-white",
    warning: "bg-warning text-white",
    danger: "bg-danger text-white",
    info: "bg-info text-white",
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
  for (let i = 0; i < 24; i++) {
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
    onDateSelect?.(today);
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

  const renderEventBadge = (
    event: CalendarEvent,
    isCompact: boolean = false
  ) => {
    const baseClasses = twMerge(
      "px-2 py-1 rounded text-xs truncate cursor-pointer hover:opacity-80 transition-opacity",
      getEventColorClasses(event.color)
    );

    if (isCompact) {
      return (
        <div
          key={event.id}
          className={baseClasses}
          onClick={(e) => {
            e.stopPropagation();
            onEventClick?.(event);
          }}
          title={event.title}
        >
          {event.title}
        </div>
      );
    }

    return (
      <div
        key={event.id}
        className={twMerge(baseClasses, "mb-1")}
        onClick={(e) => {
          e.stopPropagation();
          onEventClick?.(event);
        }}
        title={event.title}
      >
        <div className="flex items-center justify-between">
          <span className="truncate">{event.title}</span>
          {event.repeating && (
            <span className="ml-1 text-xs opacity-80">🔄</span>
          )}
        </div>
        {event.person && (
          <div className="text-xs opacity-80 mt-1">👤 {event.person}</div>
        )}
        {event.location && (
          <div className="text-xs opacity-80">📍 {event.location}</div>
        )}
        {event.priority && (
          <div className="text-xs opacity-80">
            {event.priority === "high"
              ? "🔴"
              : event.priority === "medium"
              ? "🟡"
              : "🟢"}{" "}
            {event.priority}
          </div>
        )}
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
              isMobile
                ? "min-h-[80px] p-1 border border-surface-2 relative transition-colors duration-200"
                : "min-h-[120px] p-2 border border-surface-2 relative transition-colors duration-200",
              isValidDate
                ? "cursor-pointer hover:bg-surface-hover"
                : "bg-surface-1 opacity-50",
              isSelected && "bg-primary/20 border-primary",
              isCurrentDay && "bg-secondary/20"
            )}
            onClick={() => date && handleDateClick(date)}
          >
            {isValidDate && (
              <>
                <div className="flex items-center justify-between mb-1">
                  <Text
                    size={isMobile ? "xs" : "sm"}
                    className={twMerge(
                      "font-semibold",
                      isCurrentDay && "text-secondary",
                      isSelected && "text-primary"
                    )}
                  >
                    {dateNumber}
                  </Text>
                  {onAddEvent && (
                    <Button
                      size="icon"
                      variant="ghost"
                      className={twMerge(
                        "opacity-0 hover:opacity-100 transition-opacity",
                        isMobile ? "h-5 w-5 p-0.5" : "h-6 w-6 p-1"
                      )}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddEvent(date as Date);
                      }}
                    >
                      <AddCircle
                        className={twMerge(
                          isMobile ? "h-2.5 w-2.5" : "h-3 w-3",
                          "text-primary"
                        )}
                      />
                    </Button>
                  )}
                </div>

                {/* Events for this date */}
                <div className="space-y-0.5">
                  {dayEvents
                    .slice(0, isMobile ? 2 : 3)
                    .map((event) => renderEventBadge(event, isMobile))}
                  {dayEvents.length > (isMobile ? 2 : 3) && (
                    <Text size="xs" className="text-paragraph opacity-70">
                      +{dayEvents.length - (isMobile ? 2 : 3)} mais
                    </Text>
                  )}
                </div>
              </>
            )}
          </div>
        );
      }
      calendarDays.push(
        <div key={week} className="grid grid-cols-7 gap-0">
          {weekDays}
        </div>
      );
    }

    return (
      <div className="border border-surface-2 rounded-lg overflow-hidden">
        {/* Day headers */}
        <div className="grid grid-cols-7 bg-surface-1">
          {daysOfWeek.map((day) => (
            <div
              key={day}
              className={twMerge(
                "p-3 text-center border-r border-surface-2 last:border-r-0",
                isMobile && "p-2"
              )}
            >
              <Text
                size={isMobile ? "xs" : "sm"}
                className="font-semibold text-subtitle"
              >
                {isMobile ? day.slice(0, 3) : day}
              </Text>
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="group">{calendarDays}</div>
      </div>
    );
  };

  const renderWeekView = () => {
    if (isMobile) {
      // Mobile week view - simplified
      const weekDates = getWeekDates(currentDate);

      return (
        <div className="space-y-4">
          {weekDates.map((date) => {
            const dayEvents = getEventsForDate(events, date);
            const isSelected = selectedDate && isSameDay(date, selectedDate);
            const isCurrentDay = isToday(date);

            return (
              <div
                key={date.toISOString()}
                className={twMerge(
                  "p-4 border border-surface-2 rounded-lg",
                  isSelected && "bg-primary/20 border-primary",
                  isCurrentDay && "bg-secondary/20"
                )}
                onClick={() => handleDateClick(date)}
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <Text size="lg" className="font-semibold text-subtitle">
                      {daysOfWeek[date.getDay()]}
                    </Text>
                    <Text size="sm" className="text-paragraph">
                      {date.getDate()} {months[date.getMonth()]}
                    </Text>
                  </div>
                  {onAddEvent && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddEvent(date);
                      }}
                    >
                      <AddCircle className="h-4 w-4 mr-1" />
                      Adicionar
                    </Button>
                  )}
                </div>

                <div className="space-y-2">
                  {dayEvents.length === 0 ? (
                    <Text size="sm" className="text-paragraph opacity-70">
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

    // Desktop week view
    const weekDates = getWeekDates(currentDate);

    return (
      <div className="border border-surface-2 rounded-lg overflow-hidden">
        {/* Time column and day headers */}
        <div className="grid grid-cols-8 bg-surface-1">
          <div className="p-3 border-r border-surface-2">
            <Text size="sm" className="font-semibold text-subtitle">
              Hora
            </Text>
          </div>
          {weekDates.map((date) => (
            <div
              key={date.toISOString()}
              className="p-3 text-center border-r border-surface-2 last:border-r-0"
            >
              <Text size="sm" className="font-semibold text-subtitle">
                {daysOfWeek[date.getDay()]}
              </Text>
              <Text size="xs" className="text-paragraph">
                {date.getDate()}
              </Text>
            </div>
          ))}
        </div>

        {/* Time slots */}
        <div className="max-h-[600px] overflow-y-auto">
          {getDayHours().map((hour) => (
            <div
              key={hour}
              className="grid grid-cols-8 border-b border-surface-2"
            >
              <div className="p-2 border-r border-surface-2 bg-surface-1">
                <Text size="xs" className="text-paragraph">
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
                    className="p-1 border-r border-surface-2 last:border-r-0 min-h-[60px] relative"
                    onClick={() => handleDateClick(date)}
                  >
                    {dayEvents.map((event) => renderEventBadge(event, true))}
                    {onAddEvent && (
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-5 w-5 p-1 opacity-0 hover:opacity-100 transition-opacity absolute bottom-1 right-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          const newDate = new Date(date);
                          newDate.setHours(hour);
                          handleAddEvent(newDate);
                        }}
                      >
                        <AddCircle className="h-3 w-3 text-primary" />
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
      // Mobile day view - simplified
      const dayEvents = getEventsForDate(events, currentDate);

      return (
        <div className="space-y-4">
          <div className="bg-surface-1 p-4 rounded-lg border border-surface-2">
            <Text size="lg" className="font-semibold text-subtitle">
              {daysOfWeek[currentDate.getDay()]}, {currentDate.getDate()}{" "}
              {months[currentDate.getMonth()]} {currentYear}
            </Text>
          </div>

          <div className="space-y-3">
            {dayEvents.length === 0 ? (
              <div className="text-center py-8">
                <Text size="lg" className="text-paragraph opacity-70">
                  Nenhum evento para hoje
                </Text>
                {onAddEvent && (
                  <Button
                    variant="primary"
                    onClick={() => handleAddEvent(currentDate)}
                    className="mt-4"
                  >
                    <AddCircle className="h-4 w-4 mr-2" />
                    Adicionar Evento
                  </Button>
                )}
              </div>
            ) : (
              dayEvents.map((event) => (
                <div
                  key={event.id}
                  className={twMerge(
                    "p-4 rounded-lg border border-surface-2 cursor-pointer hover:opacity-80 transition-opacity",
                    getEventColorClasses(event.color)
                  )}
                  onClick={() => onEventClick?.(event)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <Text size="lg" className="font-semibold mb-2">
                        {event.title}
                      </Text>
                      {event.description && (
                        <Text size="sm" className="opacity-80 mb-2">
                          {event.description}
                        </Text>
                      )}
                      {event.startTime && event.endTime && (
                        <Text size="sm" className="opacity-80 mb-2">
                          ⏰ {event.startTime} - {event.endTime}
                        </Text>
                      )}
                      {event.person && (
                        <Text size="sm" className="opacity-80 mb-1">
                          👤 {event.person}
                        </Text>
                      )}
                      {event.location && (
                        <Text size="sm" className="opacity-80 mb-1">
                          📍 {event.location}
                        </Text>
                      )}
                      {event.priority && (
                        <Text size="sm" className="opacity-80">
                          {event.priority === "high"
                            ? "🔴"
                            : event.priority === "medium"
                            ? "🟡"
                            : "🟢"}{" "}
                          {event.priority}
                        </Text>
                      )}
                    </div>
                    {event.repeating && (
                      <span className="text-2xl opacity-80">🔄</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      );
    }

    // Desktop day view
    const dayEvents = getEventsForDate(events, currentDate);
    const hours = getDayHours();

    return (
      <div className="border border-surface-2 rounded-lg overflow-hidden">
        {/* Day header */}
        <div className="bg-surface-1 p-4 border-b border-surface-2">
          <Text size="lg" className="font-semibold text-subtitle">
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
              <div key={hour} className="flex border-b border-surface-2">
                <div className="w-20 p-3 bg-surface-1 border-r border-surface-2">
                  <Text size="sm" className="font-semibold text-subtitle">
                    {hour.toString().padStart(2, "0")}:00
                  </Text>
                </div>
                <div className="flex-1 p-3 relative min-h-[80px]">
                  {hourEvents.map((event) => (
                    <div
                      key={event.id}
                      className={twMerge(
                        "px-3 py-2 rounded mb-2 cursor-pointer hover:opacity-80 transition-opacity",
                        getEventColorClasses(event.color)
                      )}
                      onClick={() => onEventClick?.(event)}
                      title={event.title}
                    >
                      <Text size="sm" className="font-semibold">
                        {event.title}
                      </Text>
                      {event.startTime && event.endTime && (
                        <Text size="xs" className="opacity-80">
                          {event.startTime} - {event.endTime}
                        </Text>
                      )}
                      {event.person && (
                        <Text size="xs" className="opacity-80">
                          👤 {event.person}
                        </Text>
                      )}
                    </div>
                  ))}
                  {onAddEvent && (
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6 p-1 opacity-0 hover:opacity-100 transition-opacity absolute bottom-2 right-2"
                      onClick={() => {
                        const newDate = new Date(currentDate);
                        newDate.setHours(hour);
                        handleAddEvent(newDate);
                      }}
                    >
                      <AddCircle className="h-4 w-4 text-primary" />
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
    <div className={twMerge("w-full", className)}>
      {/* Calendar Header */}
      <div
        className={twMerge(
          "flex items-center justify-between mb-6",
          isMobile && "flex-col space-y-4 items-stretch"
        )}
      >
        <div
          className={twMerge(
            "flex items-center space-x-4",
            isMobile && "justify-center"
          )}
        >
          {showNavigation && (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={goToPreviousPeriod}
                className={twMerge("h-10 w-10", isMobile && "h-8 w-8")}
              >
                <ArrowLeft
                  className={twMerge("h-5 w-5", isMobile && "h-4 w-4")}
                />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={goToNextPeriod}
                className={twMerge("h-10 w-10", isMobile && "h-8 w-8")}
              >
                <ArrowRight
                  className={twMerge("h-5 w-5", isMobile && "h-4 w-4")}
                />
              </Button>
            </>
          )}
          <Heading
            size={isMobile ? "base" : "lg"}
            variant="title"
            className={twMerge(isMobile && "text-center")}
          >
            {getViewTitle()}
          </Heading>
        </div>

        <div
          className={twMerge(
            "flex items-center space-x-3",
            isMobile && "flex-col space-y-3 space-x-0"
          )}
        >
          {showViewToggle && !isMobile && (
            <div className="flex items-center space-x-1 bg-surface-1 rounded-lg p-1">
              <Button
                variant={currentView === "month" ? "primary" : "ghost"}
                size="sm"
                onClick={() => setCurrentView("month")}
                className="h-8 px-3"
              >
                <CalendarIcon className="h-4 w-4 mr-1" />
                Mês
              </Button>
              <Button
                variant={currentView === "week" ? "primary" : "ghost"}
                size="sm"
                onClick={() => setCurrentView("week")}
                className="h-8 px-3"
              >
                Semana
              </Button>
              <Button
                variant={currentView === "day" ? "primary" : "ghost"}
                size="sm"
                onClick={() => setCurrentView("day")}
                className="h-8 px-3"
              >
                Dia
              </Button>
            </div>
          )}

          {showTodayButton && (
            <Button
              variant="secondary"
              size={isMobile ? "base" : "sm"}
              onClick={goToToday}
              className={twMerge(isMobile && "w-full")}
            >
              Hoje
            </Button>
          )}
        </div>
      </div>

      {/* Calendar Content */}
      {renderCurrentView()}
    </div>
  );
};
