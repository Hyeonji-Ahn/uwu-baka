"use client"

import { useState } from "react";
import Link from 'next/link';
import { HomeIcon } from '@heroicons/react/24/solid'
import ICAL from 'ical.js'
import { saveJsonToFile } from "../actions";
import { useRouter } from 'next/navigation'

interface Option {
  id: number;
  text: string;
}

export default function CustomPage() {
  const router = useRouter()
  const [options, setOptions] = useState<Option[]>([]);

  const [input, setInput] = useState<string>("");
  const [aiResponse, setAiResponse] = useState<string>("");

  const [events, setEvents] = useState<any[]>([]);

  //setJsonData is a function to change the contents of jsonData
  const [jsonData, setJsonData] = useState("");
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  async function handleSave() {
    try {
        //creates json data
        const data = JSON.parse(jsonData);
        if (Array.isArray(data)) {
          setTasks(data);
        } else {
          console.error("Invalid data format: expected an array");
        }
        //calls function to save json to file
        const result = await saveJsonToFile(data);
        alert(result.message);
    } catch (error) {
        alert("Invalid JSON format");
    }

    
  }

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

  const removeTask = (id: number) => {
    // Parse the JSON string into an array of objects
    const jsonArray = JSON.parse(jsonData);
    
    // Filter the array to exclude the item with the specified id
    const updatedArray = jsonArray.filter((item: { id: number }) => item.id !== id);
    
    // Convert the updated array back to a JSON string and update the state
    setJsonData(JSON.stringify(updatedArray));
    handleSave();
  };

  const sendToOpenAI = async () => {
    setLoading(true);  // Show the loading spinner
    const texts = options.map((option) => option.text);
    const today = new Date();
    const prompt = `Today is ${today}.I want to work on the goals in the following JSON input this week, along with a detailed plan to achieve each goal:  
${JSON.stringify(texts, null, texts.length)}.  

Generate a structured and actionable weekly schedule covering Monday to Sunday that breaks down each goal into specific tasks, ensuring steady progress. Ensure that no tasks are scheduled during these unavailable times:  
${JSON.stringify(events, null, events.length)}.  

Return the schedule as a valid JSON array where each entry follows this structure:  
[  
  {  
    "id": <integer>,    
    "text": "<specific task description related to the goal>",    
    "start": "<ISO 8601 datetime string>",    
    "end": "<ISO 8601 datetime string>",    
  }  
]  

Ensure the JSON output is correctly formatted, does not include trailing commas, and strictly follows JSON syntax. Each task should be clearly linked to a goal and distributed across the week for optimal progress.  
`;
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
        setJsonData(data.content);
        handleSave();
        setAiResponse(data.content || "No response received.");
        
      } else {
        setAiResponse("Error: " + data?.error?.message || "An error occurred.");
      }
    } catch (error) {
      console.error("Error calling OpenAI:", error);
      setAiResponse("An error occurred while connecting to OpenAI.");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center p-4">
      {/* Home Icon */}
      <Link href="/landing">
                <HomeIcon className="size-14 text-white-500" />
      </Link>

      {/* Import your calendar*/}
      <h2 className="font-sans text-xl font-bold mb-4 mt-5">Import your Google Calendar</h2>
      <input type="file" accept=".ics" onChange={handleFileUpload} className="mb-4" />
      <ul className="mt-4">
        {events.map((event, index) => (
          <li key={index} className="p-2 border rounded mb-2">
            <strong>{event.summary}</strong><br />
          </li>
        ))}
      </ul>
{/* 
      <p>{JSON.stringify(events, null, 3)}</p> */}

      {/* Input Field */}
      <h2 className="font-sans text-xl font-bold mb-4 mt-5">Goals</h2>
      <div className="font-sans w-full max-w-md">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Start Typing..."
          className="w-full p-2 rounded-lg bg-transparent border border-white text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white"
        />
      </div>
      <div>
      <button
          onClick={addOption}
          className="font-sans mt-3 w-20 bg-white text-black py-2 rounded-lg hover:bg-gray-300 object-center"
        >
          Add
      </button>
      </div>

      {/* Options */}
      <div className="font-sans w-full max-w-md mt-6 space-y-2">
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
          className="font-sans border-2 w-full px-4 py-2 bg-white text-black rounded-lg hover:animate-pulse"
        >
          Create Schedule
        </button>
      </div>

      {loading && <div role="status">
        <svg aria-hidden="true" className="w-8 h-8 mt-3 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
            <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
        </svg>
        <span className="sr-only">Loading...</span>
      </div>}
      
      {/* AI Response */}
      {aiResponse && (
        <div className="w-full max-w-md mt-3 p-4 bg-gray-800 rounded-lg">
          <h3 className="text-lg font-bold mb-2">AI Response:</h3>
          <ul className="space-y-2">
          {tasks.map(task => (
            <li key={task.id} className="p-3 rounded-lg shadow flex flex-col items-start">
              <p className="font-semibold flex-star">{task.text}</p>
              <p className="text-sm text-gray-600">
                {new Date(task.start).toLocaleString()} - {new Date(task.end).toLocaleString()}
              </p>
              <button
              onClick={() => removeTask(task.id)}
              className="text-white hover:text-gray-400 self-end"
              >
              X
            </button>
            </li>
          ))}
        </ul>
        <button 
            onClick={() => router.push("/calendar")}
            className="my-3 w-full border-2 border-white px-4 py-2 text-white hover:animate-pulse rounded-lg">
            View Calendar
        </button>
      </div>
        
      )}
    </div>
  );
}
