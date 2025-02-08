import { useState } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function ChatComponent() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return; // Prevent empty messages

    const newMessages: Message[] = [...messages, { role: "user", content: input }];
    setMessages(newMessages);
    setInput(""); // Clear input field
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });

      if (!res.ok) {
        throw new Error(`API request failed with status ${res.status}`);
      }

      const data = await res.json();
      if (!data || !data.content) {
        throw new Error("Invalid API response");
      }

      const aiMessage: Message = { role: "assistant", content: data.content };
      setMessages([...newMessages, aiMessage]);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-lg mx-auto border rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-4">Chat with AI</h2>

      <div className="mb-4 h-60 overflow-y-auto border p-2 rounded-md bg-gray-50">
        {messages.length > 0 ? (
          messages.map((msg, index) => (
            <div key={index} className={`p-2 ${msg.role === "user" ? "text-right" : "text-left"} text-black`}>
              <strong>{msg.role === "user" ? "You" : "AI"}:</strong> {msg.content}
            </div>
          ))
        ) : (
          <p className="text-black">Start the conversation...</p>
        )}
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 p-2 border rounded-lg text-black"
          disabled={loading}
        />
        <button
          onClick={sendMessage}
          disabled={loading}
          className="bg-blue-500 text-black px-4 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? "Sending..." : "Send"}
        </button>
      </div>
    </div>
  );
}
