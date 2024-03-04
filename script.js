const chatInput = document.querySelector("#chat-input");
const sendButton = document.querySelector("#send-btn");
const chatContainer = document.querySelector(".chat-container");
const deleteButton = document.querySelector("#delete-btn");

let userText = null;

const loadDataFromLocalstorage = () => {
  // Load saved chats from local storage and apply/add on the page

  const defaultText = `<div class="default-text">
                            <h1>Image Prototype</h1>
                            <p>Start a conversation and explore the power of AI.</p>
                        </div>`;

  chatContainer.innerHTML = localStorage.getItem("all-chats") || defaultText;
  chatContainer.scrollTo(0, chatContainer.scrollHeight); // Scroll to bottom of the chat container
};

const createChatElement = (content, className) => {
  const chatDiv = document.createElement("div");
  chatDiv.classList.add("chat", className);
  chatDiv.innerHTML = content;
  return chatDiv;
};

const getChatResponse = async (incomingChatDiv) => {
  const API_URL = "https://api.openai.com/v1/chat/completions";
  const pElement = document.createElement("p");

  // Send POST request to API, get response and set the reponse as paragraph element text
  try {
    const response = await (await fetch(API_URL, requestOptions)).json();
    pElement.textContent = response.choices[0].message.content.trim();
  } catch (error) {
    // Add error class to the paragraph element and set error text
    pElement.classList.add("error");
    pElement.textContent =
      "Oops! Something went wrong while retrieving the response. Please try again.";
  }

  // Remove the typing animation, append the paragraph element and save the chats to local storage
  incomingChatDiv.querySelector(".typing-animation").remove();
  incomingChatDiv.querySelector(".chat-details").appendChild(pElement);
  localStorage.setItem("all-chats", chatContainer.innerHTML);
  chatContainer.scrollTo(0, chatContainer.scrollHeight);
};

const copyResponse = (copyBtn) => {
  // Copy the text content of the response to the clipboard
  const reponseTextElement = copyBtn.parentElement.querySelector("p");
  navigator.clipboard.writeText(reponseTextElement.textContent);
  copyBtn.textContent = "done";
  setTimeout(() => (copyBtn.textContent = "content_copy"), 1000);
};

const showAnimalImage = (animalName) => {
  const imageFileName = `${animalName}.jpg`;
  const html = `
      <div class="chat-content">
        <div class="chat-details">
          <img src="images/chatbot.jpg" alt="chatbot-img" class="profile-img">
          <div class="message-image-wrapper">
            <img src="images/${imageFileName}" alt="${animalName}" class="message-image">
          </div>
        </div>
      </div>`;

  const imageChatDiv = createChatElement(html, "incoming");
  chatContainer.appendChild(imageChatDiv);
  chatContainer.scrollTo(0, chatContainer.scrollHeight);
};

const showTypingAnimation = () => {
  // Display the typing animation and call the getChatResponse function
  const html = `<div class="chat-content">
                    <div class="chat-details">
                        <img src="images/chatbot.jpg" alt="chatbot-img" class="profile-img">
                        <div class="typing-animation">
                            <div class="typing-dot" style="--delay: 0.2s"></div>
                            <div class="typing-dot" style="--delay: 0.3s"></div>
                            <div class="typing-dot" style="--delay: 0.4s"></div>
                        </div>
                    </div>
                    <span onclick="copyResponse(this)" class="material-symbols-rounded">content_copy</span>
                </div>`;
  // Create an incoming chat div with typing animation and append it to chat container
  const incomingChatDiv = createChatElement(html, "incoming");
  chatContainer.appendChild(incomingChatDiv);
  chatContainer.scrollTo(0, chatContainer.scrollHeight);
  getChatResponse(incomingChatDiv);
};

const handleOutgoingChat = () => {
  userText = chatInput.value.trim();
  const lowercaseCheck = userText.toLowerCase();
  if (!userText) return;

  chatInput.value = "";
  chatInput.style.height = `${initialInputHeight}px`;

  const animals = ["cat", "dog", "elephant", "rabbit"];
  const animalFound = animals.find((animal) => lowercaseCheck.includes(animal));

  const html = `<div class="chat-content">
                    <div class="chat-details">
                        <img src="images/user.jpg" alt="user-img" class="profile-img">
                        <p>${userText}</p>
                    </div>
                </div>`;

  const outgoingChatDiv = createChatElement(html, "outgoing");
  chatContainer.querySelector(".default-text")?.remove();
  chatContainer.appendChild(outgoingChatDiv);
  chatContainer.scrollTo(0, chatContainer.scrollHeight);

  if (animalFound) {
    showAnimalImage(animalFound);
    setTimeout(() => {
      showTypingAnimation();
      getChatResponse(outgoingChatDiv); // We still call getChatResponse to handle the response after showing the image
    }, 500);
  } else {
    setTimeout(showTypingAnimation, 500);
  }
};

deleteButton.addEventListener("click", () => {
  // Remove the chats from local storage and call loadDataFromLocalstorage function
  if (confirm("Are you sure you want to delete all the chats?")) {
    localStorage.removeItem("all-chats");
    loadDataFromLocalstorage();
  }
});

const initialInputHeight = chatInput.scrollHeight;

chatInput.addEventListener("input", () => {
  // Adjust the height of the input field dynamically based on its content
  chatInput.style.height = `${initialInputHeight}px`;
  chatInput.style.height = `${chatInput.scrollHeight}px`;
});

chatInput.addEventListener("keydown", (e) => {
  // If the Enter key is pressed without Shift and the window width is larger
  // than 800 pixels, handle the outgoing chat
  if (e.key === "Enter" && !e.shiftKey && window.innerWidth > 800) {
    e.preventDefault();
    handleOutgoingChat();
  }
});

loadDataFromLocalstorage();
sendButton.addEventListener("click", handleOutgoingChat);
