const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            setTimeout(() => {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }, 250);
        }
    });
}, { threshold: 0.1 });

document.querySelectorAll('.fadeUpAnim').forEach(el => observer.observe(el));



// VOXEL3.html
const textarea = document.getElementById("userInput");
const baseHeight = textarea.clientHeight; // 50px

textarea.addEventListener("input", () => {
    textarea.style.height = baseHeight + "px"; // reset to base height
    if (textarea.scrollHeight > baseHeight) {
    textarea.style.height = textarea.scrollHeight + "px"; 
    }
});





let conversation = [
  { role: "system", content: `You are a Math National Exam Study Planner assistant. Use "<br>" for new lines.`}
];

document.getElementById("generateButton").addEventListener("click", async () => {
  const userInput = document.getElementById("userInput").value.trim();
  const outputDiv = document.getElementById("output");

  if (!userInput) {
    return;
  }

  const response = await fetch("/.netlify/functions/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages: conversation })
  });

  const reader = response.body.getReader();
  const decoder = new TextDecoder("utf-8");

  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop(); // keep incomplete line

    for (const line of lines) {
      if (line.startsWith("data: ")) {
        const data = line.replace("data: ", "");
        if (data === "[DONE]") {
          return;
        }
        try {
          const parsed = JSON.parse(data);
          const token = parsed.choices[0]?.delta?.content || "";
          outputDiv.innerHTML += token; // 👈 stream into DOM live
        } catch (e) {
          console.error("Stream parse error:", e, line);
        }
      }
    }
  }
});