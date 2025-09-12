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
  { role: "system", content: `You are a Math National Exam Study Planner assistant. If you want to go down to a new line in your output, you need to use "<br>"`}
];



function animateText(outputElement, text) {
  outputElement.innerHTML = "";
  [...text].forEach((char, i) => {
    const span = document.createElement("span");
    span.textContent = char; 
    outputElement.appendChild(span);

    setTimeout(() => {
      span.classList.add("visible");
    }, i * 30);
  });
}


document.getElementById("output").textContent = "Need a study plan for BacII? Ask away.";

document.getElementById("generateButton").addEventListener("click", async () => {
  const userInput = document.getElementById("userInput").value.trim();
  const outputDiv = document.getElementById("output");

  if (!userInput) {
    outputDiv.textContent = "Please enter a request first.";
    return;
  }

  conversation.push({ role: "user", content: userInput });

  const maxMessages = 9;

  if (conversation.length > maxMessages) {
    conversation = [conversation[0], ...conversation.slice(conversation.length - (maxMessages - 1))];
  }

  outputDiv.textContent = "Give me a moment...";

  try {
    const response = await fetch("/.netlify/functions/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: conversation })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText);
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content?.trim()
           || data.choices?.[0]?.delta?.content?.trim()
           || "Token limit reached. Try a simpler prompt.";




    conversation.push({ role: "assistant", content: reply });

    if (conversation.length > maxMessages) {
      conversation = [conversation[0], ...conversation.slice(conversation.length - (maxMessages - 1))];
    }

    //outputDiv.innerHTML = reply;
    console.log("Raw response:", data);
    console.log("Conversation so far: ", conversation);
    outputDiv.innerHTML = "";
    animateText(outputDiv, reply, 25);

  } catch (err) {
    outputDiv.textContent = "Error: Gateway Timeout or " + err.message;
  }
});