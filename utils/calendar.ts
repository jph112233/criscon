interface CalendarEvent {
  title: string;
  description: string;
  startTime: Date;
  endTime: Date;
  location: string;
}

export const generateCalendarLinks = (event: CalendarEvent) => {
  const formatDate = (date: Date) => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const startDate = formatDate(new Date(event.startTime));
  const endDate = formatDate(new Date(event.endTime));
  const description = `${event.description}\n\nLocation: ${event.location}`;

  // Google Calendar
  const googleUrl = new URL('https://calendar.google.com/calendar/render');
  googleUrl.searchParams.append('action', 'TEMPLATE');
  googleUrl.searchParams.append('text', event.title);
  googleUrl.searchParams.append('details', description);
  googleUrl.searchParams.append('dates', `${startDate}/${endDate}`);
  googleUrl.searchParams.append('location', event.location);

  // Apple Calendar (ICS format)
  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'BEGIN:VEVENT',
    `DTSTART:${startDate}`,
    `DTEND:${endDate}`,
    `SUMMARY:${event.title}`,
    `DESCRIPTION:${description.replace(/\n/g, '\\n')}`,
    `LOCATION:${event.location}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  const icsBlob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const icsUrl = URL.createObjectURL(icsBlob);

  return {
    google: googleUrl.toString(),
    apple: icsUrl,
  };
}; 