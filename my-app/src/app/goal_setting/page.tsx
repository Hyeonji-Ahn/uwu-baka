"use client"

import { useState } from "react";
import Link from 'next/link';
import { HomeIcon } from '@heroicons/react/24/solid'
import ICAL from 'ical.js'

interface Option {
  id: number;
  text: string;
}

export default function CustomPage() {
  const [options, setOptions] = useState<Option[]>([]);

  const [input, setInput] = useState<string>("");
  const [aiResponse, setAiResponse] = useState<string>("");

  const [events, setEvents] = useState<any[]>([]);
  const [dates, setDates] = useState<Date>();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const jcalData = ICAL.parse(text);
        const comp = new ICAL.Component(jcalData);
        const vevents = comp.getAllSubcomponents('vevent');

        const now = new Date();
        setDates(now)
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay()); // Start of the week (Sunday)
        startOfWeek.setHours(0, 0, 0, 0);
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6); // End of the week (Saturday)
        endOfWeek.setHours(23, 59, 59, 999);

        const eventList = vevents.map((vevent) => {
          const event = new ICAL.Event(vevent);
          const eventStart = event.startDate ? event.startDate.toJSDate() : null;
          const eventEnd = event.endDate ? event.endDate.toJSDate() : null;

          if (eventStart && eventStart >= startOfWeek && eventStart <= endOfWeek) {
            return {
              summary: event.summary,
              start: eventStart.toISOString(),
              end: eventEnd ? eventEnd.toISOString() : 'Unknown',
            };
          }
          return null;
        }).filter(Boolean);

        setEvents(eventList);
      } catch (error) {
        console.error('Error parsing ICS file:', error);
      }
    };
    reader.readAsText(file);
  };


  const addOption = () => {
    if (input.trim() !== "") {
      setOptions([...options, { id: Date.now(), text: input }]);
      setInput(""); // Clear the input
    }
  };

  const removeOption = (id: number) => {
    setOptions(options.filter((option) => option.id !== id));
  };

  const sendToOpenAI = async () => {
    const texts = options.map((option) => option.text);
    const prompt = `I want to work on the goals in the following JSON input this week. 
    JSON input: ${JSON.stringify(texts, null, texts.length)}.
     Give me a schedule covering a week from Monday to Sunday. However, you cannot plan things on these times: ${JSON.stringify(events, null, events.length)}
     give me detailed schedule.
      For each schedule, give me a title with specific suggested plan. 
      Return the week plan in JSON format with the following keys: starttime, endtime, title. 
      starttime and endtime should be given in ISO time`;
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [{ role: "user", content: prompt }],
        }),
      });

      const data = await response.json();
      if (!data || !data.content) {
        throw new Error("Invalid API response");
      }
      if (response.ok) {
        setAiResponse(data.content || "No response received.");
      } else {
        setAiResponse("Error: " + data?.error?.message || "An error occurred.");
      }
    } catch (error) {
      console.error("Error calling OpenAI:", error);
      setAiResponse("An error occurred while connecting to OpenAI.");
    }
  };


  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center p-4">
      {/* Home Icon */}
      <Link href="/landing">
                <HomeIcon className="size-6 text-white-500" />
      </Link>

      {/* Import your calendar*/}
      <div className="w-full max-w-md mt-6 space-y-2">
        <button
          onClick={addOption}
          className="mt-2 w-full bg-white text-black py-2 rounded-lg hover:bg-gray-200"
        >
          Import your Google Calendar
        </button>
      </div>

      <h2 className="text-xl font-bold mb-4">Import iCal File</h2>
      <input type="file" accept=".ics" onChange={handleFileUpload} className="mb-4" />
      <ul className="mt-4">
        {events.map((event, index) => (
          <li key={index} className="p-2 border rounded mb-2">
            <strong>{event.summary}</strong><br />
            {event.start}
          </li>
        ))}
      </ul>

      <p>{JSON.stringify(events, null, 3)}</p>

      {/* Input Field */}
      <div className="w-full max-w-md mt-8">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Start Typing..."
          className="w-full p-2 rounded-lg bg-transparent border border-white text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white"
        />
        <button
          onClick={addOption}
          className="mt-2 w-full bg-white text-black py-2 rounded-lg hover:bg-gray-200"
        >
          Add Option
        </button>
      </div>

      {/* Options */}
      <div className="w-full max-w-md mt-6 space-y-2">
        {options.map((option) => (
          <div
            key={option.id}
            className="flex justify-between items-center p-4 rounded-full border border-white"
          >
            <span>{option.text}</span>
            <button
              onClick={() => removeOption(option.id)}
              className="text-white hover:text-gray-400"
            >
              X
            </button>
          </div>
        ))}
      </div>
      {/* Export and Send Buttons */}
      <div className="w-full max-w-md mt-6 space-y-4">
        <button
          onClick={sendToOpenAI}
          className="w-full bg-blue-500 text-black py-3 rounded-lg hover:bg-blue-600"
        >
          Send to OpenAI
        </button>
      </div>

      {/* AI Response */}
      {aiResponse && (
        <div className="w-full max-w-md mt-6 p-4 bg-gray-800 rounded-lg">
          <h3 className="text-lg font-bold mb-2">AI Response:</h3>
          <p>{aiResponse}</p>
        </div>
      )}
    </div>

    
  );
}
