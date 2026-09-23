import { GoogleGenAI, Type } from "@google/genai";
import readlineSync from "readline-sync";
import "dotenv/config";

// ------------------------------------
// 1. Gemini Client
// ------------------------------------

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
});

const MODEL = "gemini-3.8-flash";

// ------------------------------------
// 2. Tool Functions
// ------------------------------------

// Sum of two numbers
function sum({ num1, num2 }) {
    return num1 + num2;
}


// Check whether a number is prime
function prime({ num }) {

    if (num < 2) {
        return false;
    }

    for (let i = 2; i <= Math.sqrt(num); i++) {

        if (num % i === 0) {
            return false;
        }
    }

    return true;
}


// Get crypto price
async function getCryptoPrice({ coin }) {

    const url =
        `https://api.coingecko.com/api/v3/simple/price?ids=${coin}&vs_currencies=usd`;

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error("Failed to fetch crypto price");
    }

    const data = await response.json();

    return data;
}


// ------------------------------------
// 3. Function Declarations
// ------------------------------------

const sumDeclaration = {

    name: "sum",

    description: "Get the sum of two numbers.",

    parameters: {

        type: Type.OBJECT,

        properties: {

            num1: {
                type: Type.NUMBER,
                description: "The first number."
            },

            num2: {
                type: Type.NUMBER,
                description: "The second number."
            }

        },

        required: ["num1", "num2"]
    }
};


const primeDeclaration = {

    name: "prime",

    description: "Check whether a number is prime or not.",

    parameters: {

        type: Type.OBJECT,

        properties: {

            num: {
                type: Type.NUMBER,
                description: "The number to check."
            }

        },

        required: ["num"]
    }
};


const cryptoDeclaration = {

    name: "get_crypto_price",

    description: "Get the current price of a cryptocurrency in USD using its CoinGecko coin ID, such as bitcoin or ethereum.",

    parameters: {

        type: Type.OBJECT,

        properties: {

            coin: {
                type: Type.STRING,
                description:
                    "CoinGecko cryptocurrency ID, for example bitcoin, ethereum, or dogecoin."
            }

        },

        required: ["coin"]
    }
};


// ------------------------------------
// 4. Available Tools
// ------------------------------------

const availableTools = {

    sum: sum,

    prime: prime,

    get_crypto_price: getCryptoPrice

};


// ------------------------------------
// 5. Tool Configuration
// ------------------------------------

const tools = [
    {
        functionDeclarations: [
            sumDeclaration,
            primeDeclaration,
            cryptoDeclaration
        ]
    }
];


// ------------------------------------
// 6. Conversation History
// ------------------------------------

const history = [];


// ------------------------------------
// 7. System Instruction
// ------------------------------------

const systemInstruction = `
You are an AI Agent.

You have access to three tools:

1. sum
   - Used to calculate the sum of two numbers.

2. prime
   - Used to check whether a number is prime.

3. get_crypto_price
   - Used to get the current cryptocurrency price.

Use these tools whenever they are necessary.

For general questions that do not require these tools,
answer normally.

Do not call a tool when it is not necessary.
`;


// ------------------------------------
// 8. Agent Function
// ------------------------------------

async function runAgent(userProblem) {

    // Add user message to history
    history.push({
        role: "user",
        parts: [
            {
                text: userProblem
            }
        ]
    });


    // Agent loop
    while (true) {

        const response = await ai.models.generateContent({

            model: MODEL,

            contents: history,

            config: {

                systemInstruction: systemInstruction,

                tools: tools

            }
        });


        // ------------------------------------
        // Check whether Gemini wants a tool
        // ------------------------------------

        if (
            response.functionCalls &&
            response.functionCalls.length > 0
        ) {

            const functionCall = response.functionCalls[0];

            const functionName = functionCall.name;

            const functionArgs = functionCall.args;


            console.log(
                `\nTool Called: ${functionName}`
            );

            console.log(
                "Arguments:",
                functionArgs
            );


            // Find the actual JavaScript function
            const selectedFunction =
                availableTools[functionName];


            if (!selectedFunction) {

                throw new Error(
                    `Function ${functionName} not found`
                );
            }


            // Execute the function
            const result =
                await selectedFunction(functionArgs);


            console.log(
                "Tool Result:",
                result
            );


            // ------------------------------------
            // Add model's function call to history
            // ------------------------------------

            history.push(
                response.candidates[0].content
            );


            // ------------------------------------
            // Add function result to history
            // ------------------------------------

            history.push({

                role: "user",

                parts: [

                    {
                        functionResponse: {

                            name: functionName,

                            response: {
                                result: result
                            }

                        }
                    }

                ]

            });


            // Continue loop
            // Gemini will now see the tool result
            // and generate the final answer.

        }

        else {

            // ------------------------------------
            // No tool required
            // Final response
            // ------------------------------------

            const finalAnswer = response.text;

            history.push({

                role: "model",

                parts: [
                    {
                        text: finalAnswer
                    }
                ]

            });

            return finalAnswer;
        }
    }
}


// ------------------------------------
// 9. Main Function
// ------------------------------------

async function main() {

    while (true) {

        const userProblem =
            readlineSync.question("\nAsk me anything --> ");


        // Exit command
        if (
            userProblem.toLowerCase() === "exit" ||
            userProblem.toLowerCase() === "quit"
        ) {

            console.log("Goodbye!");

            break;
        }


        try {

            const answer =
                await runAgent(userProblem);

            console.log("\nAI:", answer);

        }
        catch (error) {

            console.error(
                "\nError:",
                error.message
            );
        }
    }
}


// ------------------------------------
// 10. Start Agent
// ------------------------------------

main();