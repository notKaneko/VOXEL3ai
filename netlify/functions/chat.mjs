import fetch from "node-fetch";

export async function handler(event, context) {
  try {
    const body = JSON.parse(event.body);
    const userMessage = body.message;

    if (!userMessage) {
      return { statusCode: 400, body: "Missing message in request body" };
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-5-mini",
        messages: [
          { role: "system", content: "You are a helpful Math Study Planner assistant." },
          { role: "user", content: userMessage }
        ],
        max_tokens: 800,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      return { statusCode: response.status, body: errorText };
    }

    const data = await response.json();
    return {
      statusCode: 200,
      body: JSON.stringify(data)
    };

  } catch (err) {
    return {
      statusCode: 500,
      body: `Server Error: ${err.message}`
    };
  }
}