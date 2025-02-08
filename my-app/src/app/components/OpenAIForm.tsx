import { useState } from 'react';

const OpenAIForm = () => {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    try {
      const res = await fetch('/api/openai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      const data = await res.json();

      if (data.error) {
        setResponse('Error: ' + data.error);
      } else {
        setResponse(data.choices[0].text);
      }
    } catch (error) {
      setResponse('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Enter your prompt here"
          rows={5}
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Loading...' : 'Get Response'}
        </button>
      </form>
      {response && <div><h3>Response:</h3><p>{response}</p></div>}
    </div>
  );
};

export default OpenAIForm;
