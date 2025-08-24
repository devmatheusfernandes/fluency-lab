# Calendar Component

A comprehensive calendar component similar to shadcn's calendar that supports displaying events, adding new events, and managing schedules. Built with React and TypeScript, following the project's design system.

## Features

- 📅 **Multiple Views**: Month, Week, and Day views with easy switching
- 🎯 **Event Display**: Show events with color coding and truncation for multiple events
- ➕ **Add Events**: Click the plus button on any date/time to add new events
- 🎨 **Color Coding**: 6 different color variants for event categorization
- ⏰ **Time Support**: Support for timed events and all-day events
- 👤 **Person Assignment**: Assign events to specific people
- 📍 **Location Support**: Add event locations
- 🔄 **Repeating Events**: Daily, weekly, monthly, and yearly recurring events
- 🎯 **Priority Levels**: High, medium, and low priority events
- 🌍 **Portuguese Localization**: Uses Portuguese day and month names
- 📱 **Mobile Responsive**: Optimized layouts for mobile and desktop
- 🎭 **Customizable**: Multiple props for customization
- ♿ **Accessible**: Proper ARIA labels and keyboard navigation

## Props

### CalendarProps

| Prop              | Type                             | Default     | Description                                         |
| ----------------- | -------------------------------- | ----------- | --------------------------------------------------- |
| `events`          | `CalendarEvent[]`                | `[]`        | Array of events to display on the calendar          |
| `onEventClick`    | `(event: CalendarEvent) => void` | `undefined` | Callback when an event is clicked                   |
| `onAddEvent`      | `(date: Date) => void`           | `undefined` | Callback when the add event button is clicked       |
| `onDateSelect`    | `(date: Date) => void`           | `undefined` | Callback when a date is selected                    |
| `selectedDate`    | `Date`                           | `undefined` | Currently selected date (highlighted)               |
| `className`       | `string`                         | `undefined` | Additional CSS classes                              |
| `showNavigation`  | `boolean`                        | `true`      | Whether to show month navigation buttons            |
| `showTodayButton` | `boolean`                        | `true`      | Whether to show the "Today" button                  |
| `showViewToggle`  | `boolean`                        | `true`      | Whether to show the view toggle buttons             |
| `defaultView`     | `CalendarView`                   | `"month"`   | Default calendar view (month, week, or day)         |
| `locale`          | `string`                         | `"pt-BR"`   | Locale for date formatting (defaults to Portuguese) |
| `isMobile`        | `boolean`                        | `undefined` | Force mobile layout (auto-detected if not provided) |

### CalendarView

| Value     | Description                    |
| --------- | ------------------------------ |
| `"month"` | Month view with grid layout    |
| `"week"`  | Week view with time slots      |
| `"day"`   | Day view with hourly breakdown |

### CalendarEvent

| Property      | Type                                                                                       | Required | Description                                      |
| ------------- | ------------------------------------------------------------------------------------------ | -------- | ------------------------------------------------ |
| `id`          | `string`                                                                                   | ✅       | Unique identifier for the event                  |
| `title`       | `string`                                                                                   | ✅       | Event title                                      |
| `description` | `string`                                                                                   | ❌       | Event description                                |
| `date`        | `Date`                                                                                     | ✅       | Event date                                       |
| `startTime`   | `string`                                                                                   | ❌       | Start time (HH:MM format)                        |
| `endTime`     | `string`                                                                                   | ❌       | End time (HH:MM format)                          |
| `color`       | `"primary" \| "secondary" \| "success" \| "warning" \| "danger" \| "info"`                 | ❌       | Event color (defaults to primary)                |
| `isAllDay`    | `boolean`                                                                                  | ❌       | Whether the event is all-day (defaults to false) |
| `person`      | `string`                                                                                   | ❌       | Person responsible for the event                 |
| `location`    | `string`                                                                                   | ❌       | Event location                                   |
| `priority`    | `"low" \| "medium" \| "high"`                                                              | ❌       | Event priority level                             |
| `repeating`   | `{ type: "daily" \| "weekly" \| "monthly" \| "yearly", interval: number, endDate?: Date }` | ❌       | Repeating event configuration                    |

## Usage Examples

### Basic Calendar

```tsx
import { Calendar } from "@/components/ui/Calendar";

function MyComponent() {
  return <Calendar />;
}
```

### Calendar with Events

```tsx
import { Calendar, CalendarEvent } from "@/components/ui/Calendar";

function MyComponent() {
  const events: CalendarEvent[] = [
    {
      id: "1",
      title: "Team Meeting",
      description: "Weekly sync",
      date: new Date(2024, 11, 15),
      startTime: "09:00",
      endTime: "10:00",
      color: "primary",
    },
  ];

  return (
    <Calendar
      events={events}
      onEventClick={(event) => console.log("Event clicked:", event)}
    />
  );
}
```

### Calendar with Different Views

```tsx
import {
  Calendar,
  CalendarEvent,
  CalendarView,
} from "@/components/ui/Calendar";

function MyComponent() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [currentView, setCurrentView] = useState<CalendarView>("month");

  const handleAddEvent = (date: Date) => {
    // Open modal or form to add event
    console.log("Add event for:", date);
  };

  const handleEventClick = (event: CalendarEvent) => {
    // Open event details modal
    console.log("Event clicked:", event);
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  return (
    <div>
      {/* View Toggle */}
      <div className="flex space-x-2 mb-4">
        <Button
          variant={currentView === "month" ? "primary" : "ghost"}
          onClick={() => setCurrentView("month")}
        >
          Mês
        </Button>
        <Button
          variant={currentView === "week" ? "primary" : "ghost"}
          onClick={() => setCurrentView("week")}
        >
          Semana
        </Button>
        <Button
          variant={currentView === "day" ? "primary" : "ghost"}
          onClick={() => setCurrentView("day")}
        >
          Dia
        </Button>
      </div>

      <Calendar
        events={events}
        onEventClick={handleEventClick}
        onAddEvent={handleAddEvent}
        onDateSelect={handleDateSelect}
        selectedDate={selectedDate}
        defaultView={currentView}
        showViewToggle={false}
        showNavigation={true}
        showTodayButton={true}
        locale="pt-BR"
      />
    </div>
  );
}
```

## Mobile Responsiveness

The calendar automatically detects mobile devices and adapts its layout accordingly:

- **Auto-detection**: Automatically detects screen size and switches to mobile layout
- **Mobile Layouts**: Optimized views for small screens with touch-friendly interactions
- **Responsive Design**: Adapts spacing, font sizes, and layouts for different screen sizes
- **Touch Optimized**: Larger touch targets and simplified navigation for mobile devices
- **Force Mobile**: Use `isMobile={true}` prop to force mobile layout regardless of screen size

### Mobile Features

- **Month View**: Compact day cells with fewer events displayed
- **Week View**: Simplified card-based layout instead of complex time grid
- **Day View**: Full-width event cards with detailed information
- **Navigation**: Stacked layout with full-width buttons

## Localization

- **Days**: Domingo, Segunda, Terça, Quarta, Quinta, Sexta, Sábado
- **Months**: Janeiro, Fevereiro, Março, Abril, Maio, Junho, Julho, Agosto, Setembro, Outubro, Novembro, Dezembro

You can customize the locale by passing a different `locale` prop.

## Event Colors

- `primary` - Uses `--color-primary` and `--color-primary-text`
- `secondary` - Uses `--color-secondary` and `--color-secondary-text`
- `success` - Uses `--color-success` and white text
- `warning` - Uses `--color-warning` and white text
- `danger` - Uses `--color-danger` and white text
- `info` - Uses `--color-info` and white text

## Styling

The calendar component uses your project's CSS variables for consistent theming:

- **Background**: `--color-background`
- **Container**: `--color-container`
- **Surface**: `--color-surface-1`, `--color-surface-2`, `--color-surface-hover`
- **Text**: `--color-title`, `--color-subtitle`, `--color-paragraph`
- **Borders**: `--color-surface-2`

## Accessibility

- Proper ARIA labels for navigation buttons
- Keyboard navigation support
- Screen reader friendly date announcements
- High contrast color support through CSS variables

## Browser Support

- Modern browsers with ES6+ support
- React 18+
- TypeScript 4.5+

## Dependencies

- React
- TypeScript
- Tailwind CSS
- `@solar-icons/react` for icons
- `tailwind-merge` for class merging

## Demo

Check out the demo page at `/calendar-demo` to see the calendar in action with sample events and full CRUD functionality.
