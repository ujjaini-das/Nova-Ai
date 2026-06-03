// ==========================
// ELEMENTS
// ==========================

const chatBox =
document.getElementById("chatBox");

const userInput =
document.getElementById("userInput");

const sendBtn =
document.getElementById("sendBtn");

const voiceBtn =
document.getElementById("voiceBtn");

const themeBtn =
document.getElementById("themeBtn");

const newChatBtn =
document.getElementById("newChatBtn");

const historyList =
document.getElementById("historyList");

// ==========================
// STATE
// ==========================

let messages =
JSON.parse(
    localStorage.getItem(
        "currentChat"
    )
) || [];

let chatCounter =
parseInt(
    localStorage.getItem(
        "chatCounter"
    )
) || 1;

// ==========================
// SAVE CHAT
// ==========================

function saveCurrentChat(){

    localStorage.setItem(
        "currentChat",
        JSON.stringify(messages)
    );

}

// ==========================
// LOAD CHAT
// ==========================

function loadChat(){

    if(messages.length === 0)
        return;

    chatBox.innerHTML = "";

    messages.forEach(msg=>{

        addMessage(
            msg.content,
            msg.role === "user"
            ? "user"
            : "bot"
        );

    });

}

loadChat();

// ==========================
// ADD MESSAGE
// ==========================

function addMessage(
    text,
    sender
){

    const div =
    document.createElement("div");

    div.classList.add(
        "message",
        sender
    );

    if(
        sender === "bot"
    ){

        div.innerHTML = `

        <div class="message-content">

        ${marked.parse(text)}

        </div>

        <button class="copy-btn">
            📋 Copy
        </button>

        `;

        div
        .querySelector(".copy-btn")
        .addEventListener(
            "click",
            ()=>{

                navigator.clipboard
                .writeText(text);

            }
        );

    }
    else{

        div.textContent =
        text;

    }

    chatBox.appendChild(div);

    chatBox.scrollTop =
    chatBox.scrollHeight;
}

// ==========================
// TYPING
// ==========================

function showTyping(){

    const div =
    document.createElement("div");

    div.classList.add(
        "message",
        "bot"
    );

    div.id =
    "typingIndicator";

    div.innerHTML = `

    <div class="typing">

        <span></span>
        <span></span>
        <span></span>

    </div>

    `;

    chatBox.appendChild(div);

    chatBox.scrollTop =
    chatBox.scrollHeight;
}

function removeTyping(){

    const typing =

    document.getElementById(
        "typingIndicator"
    );

    if(typing)
        typing.remove();
}

// ==========================
// SEND MESSAGE
// ==========================

async function sendMessage(){

    const prompt =
    userInput.value.trim();

    if(!prompt)
        return;

    if(
        chatBox.querySelector(
            ".welcome"
        )
    ){

        chatBox.innerHTML = "";
    }

    addMessage(
        prompt,
        "user"
    );

    messages.push({

        role:"user",

        content:prompt

    });

    saveCurrentChat();

    userInput.value = "";

    showTyping();

    try{

        const response =
        await fetch(
            "/chat",
            {
                method:"POST",

                headers:{
                    "Content-Type":
                    "application/json"
                },

                body:JSON.stringify({

                    messages

                })
            }
        );

        const data =
        await response.json();

        removeTyping();

        if(!response.ok){

            addMessage(
                data.error ||
                "Server Error",
                "bot"
            );

            return;
        }

        const reply =
        data.reply;

        messages.push({

            role:"assistant",

            content:reply

        });

        saveCurrentChat();

        addMessage(
            reply,
            "bot"
        );

    }
    catch(error){

        console.error(error);

        removeTyping();

        addMessage(
            "Unable to connect to server.",
            "bot"
        );
    }

}

// ==========================
// BUTTON EVENTS
// ==========================

sendBtn.addEventListener(
    "click",
    sendMessage
);

userInput.addEventListener(
    "keydown",
    e=>{

        if(
            e.key === "Enter"
        ){

            sendMessage();

        }

    }
);

// ==========================
// DARK MODE
// ==========================

const savedTheme =
localStorage.getItem(
    "theme"
);

if(
    savedTheme === "light"
){

    document.body.classList.add(
        "light"
    );

    themeBtn.textContent =
    "☀️";
}

themeBtn.addEventListener(
    "click",
    ()=>{

        document.body
        .classList.toggle(
            "light"
        );

        if(
            document.body
            .classList.contains(
                "light"
            )
        ){

            localStorage.setItem(
                "theme",
                "light"
            );

            themeBtn.textContent =
            "☀️";
        }
        else{

            localStorage.setItem(
                "theme",
                "dark"
            );

            themeBtn.textContent =
            "🌙";
        }

    }
);

// ==========================
// NEW CHAT
// ==========================

newChatBtn.addEventListener(
    "click",
    ()=>{

        const firstMessage =

        messages.find(
            msg =>
            msg.role === "user"
        );

        const title =

        firstMessage
        ? firstMessage.content
            .slice(0,30)
        : `Chat ${chatCounter}`;

        const item =
        document.createElement(
            "div"
        );

        item.classList.add(
            "history-item"
        );

        item.textContent =
        title;

        historyList.prepend(
            item
        );

        chatCounter++;

        localStorage.setItem(
            "chatCounter",
            chatCounter
        );

        messages = [];

        localStorage.removeItem(
            "currentChat"
        );

        chatBox.innerHTML = `

        <div class="welcome">

            <h1>
                How can I help you today?
            </h1>

            <p>
                Ask questions,
                solve coding problems,
                generate ideas,
                write content,
                and learn new things.
            </p>

        </div>

        `;

    }
);

// ==========================
// VOICE INPUT
// ==========================

const SpeechRecognition =

window.SpeechRecognition ||

window.webkitSpeechRecognition;

if(SpeechRecognition){

    const recognition =
    new SpeechRecognition();

    recognition.lang =
    "en-US";

    recognition.continuous =
    false;

    recognition.interimResults =
    false;

    voiceBtn.addEventListener(
        "click",
        ()=>{

            recognition.start();

        }
    );

    recognition.onstart =
    ()=>{

        voiceBtn.textContent =
        "🔴";

    };

    recognition.onresult =
    event=>{

        const transcript =

        event.results[0][0]
        .transcript;

        userInput.value =
        transcript;

        voiceBtn.textContent =
        "🎤";

        sendMessage();
    };

    recognition.onend =
    ()=>{

        voiceBtn.textContent =
        "🎤";

    };

    recognition.onerror =
    event=>{

        console.error(
            event.error
        );

        voiceBtn.textContent =
        "🎤";

    };

}
else{

    voiceBtn.disabled =
    true;

    console.log(
        "Speech Recognition not supported"
    );

}