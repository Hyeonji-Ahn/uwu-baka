'use client';
import { useState } from "react";
import { saveJsonToFile } from "../actions";
 
export default function JsonSaver() {
  const [jsonData, setJsonData] = useState("");

  async function handleSave() {
      try {
          const data = JSON.parse(jsonData);
          const result = await saveJsonToFile(data);
          alert(result.message);
      } catch (error) {
          alert("Invalid JSON format");
      }
  }

  return (
      <div>
          <textarea 
              value={jsonData} 
              onChange={(e) => setJsonData(e.target.value)} 
              placeholder="Enter JSON data"
              rows={5}
              cols={50}
          />
          <button onClick={handleSave}>Save JSON</button>
      </div>
  );
}