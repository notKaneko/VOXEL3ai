import fetch from "node-fetch";

export async function handler(event, context) {
  try {
    const body = JSON.parse(event.body);
    const userMessage = body.message;

    if (!userMessage) {
      return { statusCode: 400, body: "Missing message in request body" };
    }

    // Extract a 4-digit year from userMessage (e.g., 2019)
    const yearMatch = userMessage.match(/\b(20\d{2})\b/); // matches 2000–2099
    const requestedYear = yearMatch ? Number(yearMatch[1]) : null;

    // Sample past exams
    const examsData = [
      {
        year: 2019,
        questions: [
          { topic: "Limits", question: "Compute lim(x->0) (sin x)/x" },
          { topic: "Derivatives", question: "Find d/dx of x^3 + 2x" }
        ]
      },
      {
        year: 2020,
        questions: [
          { topic: "Vectors", question: "Find the dot product of A and B" },
          { topic: "Integrals", question: "Compute ∫x^2 dx" }
        ]
      }
    ];

    // Find only the requested year
    const yearData = requestedYear
      ? examsData.find(e => e.year === requestedYear)
      : null;

    const baseKnowledge = yearData
      ? `Past exam ${requestedYear} questions:\n` +
        yearData.questions.map(q => `- ${q.topic}: ${q.question}`).join("\n")
      : "No past exam data available for the requested year, let the user know the exam data only exists for 2015-2025";

    // GPT call
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-5-mini",
        messages: [
          { role: "system", content: `You are a Math National Exam Study Planner assistant. Refer to ${baseKnowledge} and
          if they specify a year, on the start of your message you should mention what topics came out in that year of exams.
          Then, you  may continue to create practice questions relating to the questions that came out in that year as well.` },
          { role: "user", content: userMessage }
        ],
        temperature: 1,
        max_completion_tokens: 800
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      return { statusCode: response.status, body: errorText };
    }

    const data = await response.json();
    return { statusCode: 200, body: JSON.stringify(data) };

  } catch (err) {
    return { statusCode: 500, body: `Server Error: ${err.message}` };
  }
}