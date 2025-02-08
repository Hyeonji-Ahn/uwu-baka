import OpenAI from "openai";

// Create an OpenAI API client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// eslint-disabl-no-explicit-any
export async function POST(req: { json: () => PromiseLike<{ messages: any; }> | { messages: any; }; }) { 
  try {
    // Extract the `messages` from the request body
    const { messages } = await req.json();
    if (!messages) {
      return new Response(JSON.stringify({ error: "Messages are required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Send the messages to OpenAI
    const chatCompletion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: messages, // Use messages from the request
    });

    // Return the response as JSON
    return new Response(JSON.stringify(chatCompletion.choices[0].message), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
