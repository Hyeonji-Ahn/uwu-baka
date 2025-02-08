"use server";

import fs from "fs/promises";
import path from "path";

export async function saveJsonToFile(data: any) {
    try {
        const filePath = path.join(process.cwd(), "data.json"); // Save inside public/
        await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
        return { success: true, message: "JSON file created successfully!" };
    } catch (error) {
        return { success: false, message: "Error writing file", error };
    }
}