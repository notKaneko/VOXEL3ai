// ------------------------------------------------------- index.html -----------------------------------------------------------
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



// ------------------------------------------------------- VOXEL3.html ---------------------------------------------------------------------
const textbox = document.getElementById("userInput");
const baseHeight = textbox.clientHeight; // 50px

textbox.addEventListener("input", () => {
    // Temporarily disable the transition
    textbox.style.transition = 'none';

    // Reset height to base to correctly calculate new scrollHeight
    textbox.style.height = baseHeight + "px";

    // Set the new height
    textbox.style.height = Math.min(textbox.scrollHeight, 140) + "px";

    // Re-enable the transition with a small delay
    setTimeout(() => {
        textbox.style.transition = 'cubic-bezier(0.075, 0.82, 0.165, 1) 1s';
    }, 10);
});


const submitBtn = document.getElementById("generateButton");

textbox.addEventListener("keydown", function (event) {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    submitBtn.click();
  }
});

// disable the button by default
submitBtn.disabled = true;
submitBtn.style.cursor = "not-allowed";

textbox.addEventListener("input", function () {
if (textbox.value.trim() === "") {
  submitBtn.disabled = true; // greyed out
  submitBtn.style.cursor = "not-allowed";
} else {
  submitBtn.disabled = false; // active
  submitBtn.style.cursor = "pointer";
}
});





let conversation = [
  { role: "system", content: `You are a Math National Exam Study Planner assistant. If you want to go down to a new line in your output, you need to use "<br>"`}
];



function animateText(element, text, speed = 120) {
  element.innerHTML = "";
  const words = text.split(/(\s+)/); // keep spaces

  let i = 0;

  function type() {
    if (i < words.length) {
      const word = words[i];

      if (word === "<br>") {
        element.appendChild(document.createElement("br"));
      } else {
        const span = document.createElement("span");
        span.innerHTML = word;
        span.style.opacity = 0;
        span.style.display = "inline";
        element.appendChild(span);

        void span.offsetWidth; // reflow
        span.style.transition = "opacity 0.5s ease";
        span.style.opacity = 1;
      }

      i++;
      setTimeout(type, speed);
    }
  }

  type();
}

animateText(document.getElementById("output"), "Need help with the 2026 BacII Exam? Ask Away.<br>ត្រូវការជំនួយទេ? ចាំសួរខ្ញុំផង។", 50); // initially set the output to display this

document.getElementById("generateButton").addEventListener("click", async () => {
  const userInput = document.getElementById("userInput").value.trim();
  const outputDiv = document.getElementById("output");

  if (!userInput) {
    animateText(outputDiv, "Please enter something first.", 30);
    return;
  }

  conversation.push({ role: "user", content: userInput });

  const maxMessages = 9; // this is basically how much of the past conversation the ai remembers

  if (conversation.length > maxMessages) {
    conversation = [conversation[0], ...conversation.slice(conversation.length - (maxMessages - 1))];
  }


  animateText(outputDiv, "Give me a moment... សូមរងចាំបន្តិច។", 30);

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
    /*
    outputDiv.innerHTML = reply;
    console.log("Raw response:", data);
    console.log("Conversation so far: ", conversation);*/
    outputDiv.textContent = "";
    animateText(outputDiv, reply, 10);

  } catch (err) {
    setTimeout(() => {
      outputDiv.textContent = "";
      animateText(outputDiv, "Error: Gateway Timeout or " + err.message, 30);
    }, 400);
  }
});