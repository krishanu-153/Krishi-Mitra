document.addEventListener('DOMContentLoaded', function() {
    const chatContainer = document.getElementById('chat-container');
    const chatInput = document.getElementById('chat-input');
    const sendBtn = document.getElementById('send-btn');
    const voiceBtn = document.getElementById('voice-btn');
    const langStatus = document.getElementById('lang-status');

    const GROQ_API_KEY = "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";   // ← Replace with your real key

    let currentLang = 'hi';
    let recognition = null;
    let isListening = false;

    const languageConfig = {
        'en': { name: 'English', voice: 'en-IN', status: 'Current Language: English' },
        'hi': { name: 'हिंदी',   voice: 'hi-IN', status: 'Current Language: हिंदी' },
        'bn': { name: 'বাংলা',   voice: 'bn-IN', status: 'Current Language: বাংলা' }
    };

    // Language Switcher
    function switchLanguage(lang) {
        currentLang = lang;

        // Update active button
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.lang === lang);
        });

        langStatus.textContent = languageConfig[lang].status;

        // Reinitialize voice with new language
        if (recognition) {
            initSpeechRecognition();
        }
    }

    // Add message
    function addMessage(text, isUser = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message flex ${isUser ? 'justify-end' : 'justify-start'}`;
        messageDiv.innerHTML = `
            <div class="${isUser ? 'user-message' : 'ai-message'} max-w-[85%] p-4 shadow-sm">
                <p class="text-gray-800 leading-relaxed">${text}</p>
                <p class="text-[10px] text-gray-500 mt-2 text-right">${new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</p>
            </div>
        `;
        chatContainer.appendChild(messageDiv);
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    // AI Response
    async function getAIResponse(query) {
        const typingDiv = document.createElement('div');
        typingDiv.id = 'typing';
        typingDiv.className = 'flex justify-start message';
        typingDiv.innerHTML = `<div class="ai-message max-w-[85%] p-4"><p class="text-gray-500 italic">AI सोच रहा है...</p></div>`;
        chatContainer.appendChild(typingDiv);
        chatContainer.scrollTop = chatContainer.scrollHeight;

        try {
            const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${GROQ_API_KEY}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    model: "llama-3.3-70b-versatile",
                    messages: [
                        {
                            role: "system",
                            content: `You are KISAN-SATHI, a helpful AI farming assistant. Always respond in ${languageConfig[currentLang].name}. Use simple and practical language for farmers.`
                        },
                        { role: "user", content: query }
                    ],
                    temperature: 0.7,
                    max_tokens: 700
                })
            });

            const data = await response.json();
            const aiReply = data.choices[0].message.content;

            typingDiv.remove();
            addMessage(aiReply);
        } catch (error) {
            typingDiv.remove();
            addMessage("Sorry, there is some issue with AI service. Please try again later.");
        }
    }

    function sendMessage() {
        const message = chatInput.value.trim();
        if (!message) return;
        addMessage(message, true);
        chatInput.value = '';
        getAIResponse(message);
    }

    // Voice Recognition
    function initSpeechRecognition() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            voiceBtn.style.display = "none";
            return;
        }

        recognition = new SpeechRecognition();
        recognition.lang = languageConfig[currentLang].voice;
        recognition.interimResults = false;

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript.trim();
            if (transcript) {
                addMessage(transcript, true);
                getAIResponse(transcript);
            }
        };

        recognition.onerror = () => stopListening();
        recognition.onend = () => stopListening();
    }

    function toggleListening() {
        if (!recognition) return alert("Voice input not supported in this browser.");
        isListening ? stopListening() : startListening();
    }

    function startListening() {
        recognition.start();
        isListening = true;
        voiceBtn.classList.add('listening');
    }

    function stopListening() {
        if (recognition) recognition.stop();
        isListening = false;
        voiceBtn.classList.remove('listening');
    }

    // Event Listeners
    sendBtn.addEventListener('click', sendMessage);
    chatInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') sendMessage(); });
    voiceBtn.addEventListener('click', toggleListening);

    // Language Button Listeners
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            switchLanguage(btn.dataset.lang);
        });
    });

    // Initialize
    switchLanguage('hi');   // Default Hindi

    setTimeout(() => {
        addMessage("नमस्ते! 🌾 ऊपर दिए भाषा बटन से English, हिंदी या বাংলा चुनें और पूछें।");
    }, 600);

    initSpeechRecognition();
});