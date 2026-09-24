import { GoogleGenAI, Type } from "@google/genai";
import readlineSync from "readline-sync";
import { exec } from "child_process";
import "dotenv/config";
import { promisify } from "util";
import os from 'os';


const platform = os.platform();



const asyncExecute = promisify(exec);





// ------------------------------------
// 1. Gemini Client
// ------------------------------------

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
});

const MODEL = "gemini-3.8-flash";

// ------------------------------------
// 2. Tool Functions :   To execute any terminal or shell command
// ------------------------------------


async function executeCommand({ command }) {
    try {
        const { stdout, stderr } = await asyncExecute(command);

        if (stderr) {
            return `Error: ${stderr}`
        }

        return `Success: ${stdout} || Task executed completely`




    }
    catch (error) {
         return `Error : ${error}`
    }
}















const executeCommandDeclaration = {

    name: "executeCommand",

    description: "Execute a single terminal/shell command . A command can be to create a folder , file , wirte on file , edit the file or delet the file ",

    parameters: {

        type: Type.OBJECT,

        properties: {

            command: {
                type: Type.STRING,
                description:
                    "It will be a single terminal command .  Example \"mkdir calculator\""
            }

        },

        required: ["command"]
    }
};


// ------------------------------------
// 4. Available Tools
// ------------------------------------

const availableTools = {

    executeCommand

};


// ------------------------------------
// 5. Tool Configuration
// ------------------------------------

const tools = [
    {
        functionDeclarations: [
            executeCommandDeclaration
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
You are an Website builder expert . You have to create the frontend of the wbesite . you have accessof tools , which can run or execute any shell or terminal command .


Currnet user operating suystem is : ${platform}

Give command to the user according to its operating system support.



What is your job :

1-Analyze the user query to see what type of websites they wnat to build 
2- Give them command step by stpe 
3- use avialable tool executeCommand


// now u can givw them command in the follownibg below 

1: First create a folder  : Ex: mkdir "calculater"
2: Inside the folder , create index.html  Ex: touch/index.js
3: Then cretae style . css same as above 
4- Then create scrpt .js
5- Then wirte code in html .js

You have to provid the terminal / shell command to user , they will directly execute it 


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

        console.log("i ma a cursor let us cretae a website ")
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