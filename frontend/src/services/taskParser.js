/**
 * Natural Language Parser for Quick-Add Tasks
 * Extracts: title, dueDate, priority, tags, and description.
 * 
 * Easy to extend or plug in an LLM call (e.g. OpenAI / Claude) in place of the regex engine.
 */

export function parseTaskFromText(input) {
  if (!input || !input.trim()) {
    return {
      title: '',
      dueDate: null,
      priority: 'medium',
      tags: [],
      description: ''
    };
  }

  let text = input.trim();
  let priority = 'medium';
  let tags = [];
  let dueDate = null;
  let description = '';

  // 1. Extract Hashtags (#work, #personal, #urgent)
  const tagRegex = /#([a-zA-Z0-9_\-]+)/g;
  let tagMatch;
  while ((tagMatch = tagRegex.exec(text)) !== null) {
    tags.push(tagMatch[1]);
  }
  text = text.replace(tagRegex, '');

  // 2. Extract Priorities (!high, !medium, !low, p1, p2, p3, #high, #medium, #low)
  const priorityRegexes = [
    { level: 'high', regex: /\b(!high|p1|priority\s*1)\b/i },
    { level: 'medium', regex: /\b(!medium|p2|priority\s*2)\b/i },
    { level: 'low', regex: /\b(!low|p3|priority\s*3)\b/i }
  ];

  for (const { level, regex } of priorityRegexes) {
    if (regex.test(text)) {
      priority = level;
      text = text.replace(regex, '');
      break;
    }
  }

  // 3. Date & Time Parsing Engine
  const now = new Date();
  let targetDate = new Date(now);
  targetDate.setHours(12, 0, 0, 0); // Default default: 12:00 PM (noon)
  let dateParsed = false;
  let timeParsed = false;

  const getWeekdayIndex = (dayName) => {
    const days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
    const fullDays = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    let idx = days.indexOf(dayName.slice(0, 3));
    if (idx === -1) idx = fullDays.indexOf(dayName);
    return idx;
  };

  // Resolve Relative dates: "this evening" / "tonight"
  if (/\bthis evening\b/i.test(text)) {
    targetDate.setHours(18, 0, 0, 0); // 6:00 PM
    text = text.replace(/\bthis evening\b/i, '');
    dateParsed = true;
    timeParsed = true;
  } else if (/\btonight\b/i.test(text)) {
    targetDate.setHours(21, 0, 0, 0); // 9:00 PM
    text = text.replace(/\btonight\b/i, '');
    dateParsed = true;
    timeParsed = true;
  }
  // Resolve "tomorrow"
  else if (/\btomorrow\b/i.test(text)) {
    targetDate.setDate(now.getDate() + 1);
    text = text.replace(/\btomorrow\b/i, '');
    dateParsed = true;
  }
  // Resolve "today"
  else if (/\btoday\b/i.test(text)) {
    text = text.replace(/\btoday\b/i, '');
    dateParsed = true;
  }
  
  // Resolve days of the week: (e.g. "next Friday", "on Monday", "Friday")
  const weekdayRegex = /\b(next\s+)?(monday|tuesday|wednesday|thursday|friday|saturday|sunday|mon|tue|wed|thu|fri|sat|sun)\b/i;
  const dayMatch = text.match(weekdayRegex);
  if (dayMatch && !dateParsed) {
    const isNext = !!dayMatch[1];
    const dayName = dayMatch[2].toLowerCase();
    const targetDayIndex = getWeekdayIndex(dayName);
    
    if (targetDayIndex !== -1) {
      const currentDayIndex = now.getDay();
      let diff = targetDayIndex - currentDayIndex;
      if (diff <= 0) diff += 7; // Forward to next matching weekday
      if (isNext) diff += 7; // Forward additional 7 days if "next Monday"
      
      targetDate.setDate(now.getDate() + diff);
      text = text.replace(weekdayRegex, '');
      dateParsed = true;
    }
  }

  // Resolve Specific calendar month + date: (e.g. "on July 15", "Jul 15")
  const monthRegex = /\b(on\s+)?(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\s+(\d{1,2})\b/i;
  const monthMatch = text.match(monthRegex);
  if (monthMatch && !dateParsed) {
    const monthNames = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
    const monthName = monthMatch[2].toLowerCase().slice(0, 3);
    const dayNum = parseInt(monthMatch[3], 10);
    const monthIdx = monthNames.indexOf(monthName);
    
    if (monthIdx !== -1 && dayNum >= 1 && dayNum <= 31) {
      targetDate.setMonth(monthIdx);
      targetDate.setDate(dayNum);
      // If the resulting date would be in the past relative to now, project it to next year
      if (targetDate < now) {
        targetDate.setFullYear(now.getFullYear() + 1);
      }
      text = text.replace(monthRegex, '');
      dateParsed = true;
    }
  }

  // Time expressions: e.g. "at 3pm", "at 11:30 PM", "10:30 AM", "15:00", "3pm"
  const timeRegex = /\b(?:at\s+)?(\d{1,2})(?::(\d{2}))?\s*(am|pm)\b/i;
  const timeMatch = text.match(timeRegex);

  // O'clock notation: e.g. "9'o clock", "3 o clock", "9 o'clock", "9 oclock"
  const oClockRegex = /\b(?:at\s+)?(\d{1,2})\s*[']?\s*(?:o[']?\s*clock|o\s*clock|oclock|clock)\b/i;
  const oClockMatch = text.match(oClockRegex);

  // 24 hour notation fallback: e.g. "at 15:30", "18:00"
  const time24Regex = /\b(?:at\s+)?(\d{2}):(\d{2})\b/i;
  const time24Match = text.match(time24Regex);

  // General period keywords: e.g. "morning", "afternoon", "evening", "night"
  const isMorning = /\bmorning\b/i.test(text);
  const isAfternoon = /\bafternoon\b/i.test(text);
  const isEvening = /\bevening\b/i.test(text);
  const isNight = /\bnight\b/i.test(text);

  if (timeMatch) {
    let hour = parseInt(timeMatch[1], 10);
    const minute = timeMatch[2] ? parseInt(timeMatch[2], 10) : 0;
    const ampm = timeMatch[3].toLowerCase();

    if (ampm === 'pm' && hour < 12) hour += 12;
    if (ampm === 'am' && hour === 12) hour = 0;

    targetDate.setHours(hour, minute, 0, 0);
    text = text.replace(timeRegex, '');
    timeParsed = true;
  } else if (oClockMatch) {
    let hour = parseInt(oClockMatch[1], 10);
    let isPM = false;

    if (isMorning) {
      isPM = false;
    } else if (isAfternoon || isEvening || isNight) {
      isPM = true;
    } else {
      // Heuristic: 1-7 is PM, 8-11 is AM
      if (hour >= 1 && hour <= 7) {
        isPM = true;
      }
    }

    if (isPM && hour < 12) hour += 12;
    if (!isPM && hour === 12) hour = 0;

    targetDate.setHours(hour, 0, 0, 0);
    text = text.replace(oClockRegex, '');
    timeParsed = true;
  } else if (time24Match) {
    const hour = parseInt(time24Match[1], 10);
    const minute = parseInt(time24Match[2], 10);
    targetDate.setHours(hour, minute, 0, 0);
    text = text.replace(time24Regex, '');
    timeParsed = true;
  } else if (isMorning || isAfternoon || isEvening || isNight) {
    // Default period hours
    let hour = 12;
    if (isMorning) hour = 9;
    else if (isAfternoon) hour = 13; // 1 PM
    else if (isEvening) hour = 18; // 6 PM
    else if (isNight) hour = 21; // 9 PM

    targetDate.setHours(hour, 0, 0, 0);
    timeParsed = true;
  }

  // Clean up general period keywords if a time was parsed
  if (timeParsed) {
    text = text.replace(/\b(morning|afternoon|evening|night)\b/ig, '');
  }

  // If time was parsed but no explicit date was set, default to today/tomorrow
  if (timeParsed && !dateParsed) {
    // If the target time has already passed today, set to tomorrow
    if (targetDate < now) {
      targetDate.setDate(now.getDate() + 1);
    }
    dateParsed = true;
  }

  // Convert to ISO-8601 string format
  if (dateParsed) {
    dueDate = targetDate.toISOString();
  }

  // Clean trailing/dangling prepositions (at, on, for, by, in)
  let cleanedTitle = text
    .replace(/\s+/g, ' ')
    .replace(/\s+(at|on|by|in|for)$/i, '')
    .trim();

  // If the parsed title is entirely empty (only dates/tags were typed), fallback to the input
  if (!cleanedTitle) {
    cleanedTitle = input.trim();
  }

  return {
    title: cleanedTitle,
    dueDate,
    priority,
    tags,
    description
  };
}

/**
 * Example LLM integration function ready for future plug-in.
 * Switch to this by passing a standard API Key.
 *
 * export async function parseTaskFromTextWithLLM(input, apiKey) {
 *   try {
 *     const response = await fetch('https://api.openai.com/v1/chat/completions', {
 *       method: 'POST',
 *       headers: {
 *         'Content-Type': 'application/json',
 *         'Authorization': `Bearer ${apiKey}`
 *       },
 *       body: JSON.stringify({
 *         model: 'gpt-4o-mini',
 *         messages: [
 *           {
 *             role: 'system',
 *             content: 'Parse raw task text into JSON. Extract: title, dueDate (ISO-8601 string, assume current year is 2026), priority ("low", "medium", "high"), tags (array), and description. JSON only.'
 *           },
 *           { role: 'user', content: input }
 *         ],
 *         response_format: { type: 'json_object' }
 *       })
 *     });
 *     const data = await response.json();
 *     return JSON.parse(data.choices[0].message.content);
 *   } catch (err) {
 *     console.error('LLM parsing failed:', err);
 *     throw new Error('Couldn\'t parse task with LLM. Falling back to manual mode.');
 *   }
 * }
 */
