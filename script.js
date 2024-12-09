const typingForm = document.querySelector(".typing-form");
const chatList = document.querySelector(".chat-list");
const suggestions = document.querySelector(".suggestion-list .suggestion");
const toggleThemeButton = document.querySelector("#toggle-theme-button");
const deleteChatButton = document.querySelector("#delete-chat-button");

let userMessage = null;

//API Configuration


const loadLocalStorageData = () => {
    const savedChats = localStorage.getItem("savedChats");
    const isLightMode = localStorage.getItem("themeColor") === "light_mode";
  
    // Apply the stored theme
    document.body.classList.toggle("light_mode", isLightMode);
  
    toggleThemeButton.innerText = isLightMode ? "dark_mode" : "light_mode";

    chatList.innerHTML = savedChats || "";

    document.body.classList.toggle("hide-header",savedChats);

    chatList.scrollTo(0,chatList.scrollHeight);

  };
  
  loadLocalStorageData();



//cfreate  a new message eleement and rtrn it
const createMessageElement = (content, ...Classes) => {
    const div = document.createElement("div");
    div.classList.add("message", ...Classes);
    div.innerHTML = content;
    return div;
}

const showTypingEffect = (text, textElement,incomingMessageDiv) => {
    const words = text.split(' ');
    let currentWordIndex = 0;

    const typingInterval = setInterval(() => {
        // Append each word to the text element with a space
        textElement.innerText += (currentWordIndex === 0 ? '' : ' ') + words[currentWordIndex++];
        incomingMessageDiv.querySelector(".icon").classList.add("hide");

        // If all words are displayed
        if (currentWordIndex === words.length) {
            clearInterval(typingInterval);
            incomingMessageDiv.querySelector(".icon").classList.remove("hide");
            localStorage.setItem("savedChats",chatList.innerHTML);
        }
        chatList.scrollTo(0,chatList.scrollHeight);
    }, 75);
}
 

const generateAPIResponse = async (incomingMessageDiv) =>{
   const textElement = incomingMessageDiv.querySelector(".text");



     try{
        const response =await fetch(API_URL, {
            method: "POST",
            headers:{"Content-Type": "application/json"},
            body: JSON.stringify({
                contents:[{
                    role:"user",
                    parts:[{ text: userMessage}]
                }]
            })
        });

        const data = await response.json();

        const apiResponse = data?.candidates[0].content.parts[0].text.replace(/\*\*(.*?)\*\*/g,'$1');
        showTypingEffect(apiResponse,textElement,incomingMessageDiv);
     } catch (error){
        console.log(error);
     } finally{
        incomingMessageDiv.classList.remove("loading");
     }


}

//loading animation while waiting for response
const showLoadingAnimation = () => {
    const html = `<div class="message-content">
            <img src="images/google-gemini-icon.svg" alt="Gemini image" class="avatar">
              <p class="text"></p>
              <div class="loading-indicator">
                <div class="loading-bar"></div>
                <div class="loading-bar"></div>
                <div class="loading-bar"></div>
              </div>
        </div>
        <span onclick="copyMessage(this)" class="icon material-symbols-rounded">
            content_copy
        </span> `;

const incomingMessageDiv = createMessageElement(html, "incoming","loading");
chatList.appendChild(incomingMessageDiv);
chatList.scrollTo(0,chatList.scrollHeight);


generateAPIResponse(incomingMessageDiv);
}

const copyMessage = (copyIcon) => {
    const messageText = copyIcon.parentElement.querySelector(".text").innerText;
    navigator.clipboard.writeText(messageText);
    copyIcon.innerText = "done"; // Show tick icon
    setTimeout(() => copyIcon.innerText = "content_copy", 1000); // Revert back to original icon
  }


// Handle sending outgoing chat messages
const handleOutgoingChat = () => {
    userMessage = typingForm.querySelector(".typing-input").value.trim() || userMessage ;
    if (!userMessage) return; // Exit if there is no message

    const html = `<div class="message-content">
        <img src="images/avatar-659651_1280.png" alt="user image" class="avatar">
        <p class="text"></p>
    </div>`;

    const outgoingMessageDiv = createMessageElement(html, "outgoing");
    outgoingMessageDiv.querySelector(".text").innerText = userMessage;
    chatList.appendChild(outgoingMessageDiv);

    typingForm.reset();//clr inpyt fld
    chatList.scrollTo(0,chatList.scrollHeight);
    document.body.classList.add("hide-header");
    setTimeout(showLoadingAnimation,500);//load animation after delay
};

suggestions.forEach(suggestion => {
    suggestion.addEventListener("click", () => {
      userMessage = suggestion.querySelector(".text").innerText;
      handleOutgoingChat();
    });
  });
  

toggleThemeButton.addEventListener("click", () => {
    const isLightMode = document.body.classList.toggle("light_mode");
    localStorage.setItem("themeColor",isLightMode ? "light_mode" : "dark_mode")
    toggleThemeButton.innerText = isLightMode ? "dark_mode" : "light_mode";
  });

  deleteChatButton.addEventListener("click", () => {
    if (confirm("Are you sure you want to delete all messages?")) {
      localStorage.removeItem("savedChats");
      loadLocalStorageData();
    }
  });


// Prevent default form submission and handle outgoing chat
typingForm.addEventListener("submit", (e) => {
    e.preventDefault();

    handleOutgoingChat();
});
