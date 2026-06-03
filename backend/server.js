import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();

// ==========================
// MIDDLEWARE
// ==========================

app.use(cors());

app.use(express.json());

// ==========================
// PATH SETUP
// ==========================

const __filename =
    fileURLToPath(import.meta.url);

const __dirname =
    path.dirname(__filename);

// Serve frontend files

app.use(
    express.static(
        path.join(
            __dirname,
            "../frontend"
        )
    )
);

// ==========================
// CHAT ROUTE
// ==========================

app.post(
    "/chat",
    async (req, res) => {

        try {

            const { messages } =
                req.body;

            const response =
                await fetch(
                    "https://api.groq.com/openai/v1/chat/completions",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json",

                            "Authorization":
                                `Bearer ${process.env.GROQ_API_KEY}`
                        },

                        body: JSON.stringify({

                            model:
                                "llama-3.3-70b-versatile",

                            messages: [

                                {
                                    role: "system",

                                    content: `
You are Nova AI, a professional AI assistant.

Rules:
- Be helpful and friendly.
- Format answers using headings.
- Use bullet points when needed.
- Use code blocks for programming questions.
- Give clear and concise explanations.
- If asked coding questions, provide optimized solutions.
`
                                },

                                ...messages

                            ],

                            temperature: 0.7,

                            max_tokens: 1024

                        })

                    }
                );

            const data =
                await response.json();

            if (!response.ok) {

                return res
                    .status(500)
                    .json({

                        error:
                            data.error
                                ?.message ||
                            "Groq API Error"

                    });

            }

            const reply =
                data.choices?.[0]
                    ?.message?.content ||
                "No response generated.";

            res.json({
                reply
            });

        }
        catch (error) {

            console.error(
                "Server Error:",
                error
            );

            res.status(500).json({

                error:
                    "Internal Server Error"

            });

        }

    }
);

// ==========================
// HOME ROUTE
// ==========================

app.get(
    "/",
    (req, res) => {

        res.sendFile(
            path.join(
                __dirname,
                "../frontend/index.html"
            )
        );

    }
);

// ==========================
// START SERVER
// ==========================

const PORT =
    process.env.PORT || 3000;

app.listen(
    PORT,
    () => {

        console.log(
            `🚀 Nova AI running on http://localhost:${PORT}`
        );

    }
);