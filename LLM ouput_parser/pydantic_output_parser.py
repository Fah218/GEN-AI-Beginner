
import os
from dotenv import load_dotenv
from pydantic import BaseModel, Field
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import PydanticOutputParser

load_dotenv()

# Step 1: Define the structure using Pydantic
class DSAResponse(BaseModel):
    topic: str = Field(description="Name of the DSA topic")
    definition: str = Field(description="Simple definition of the topic")
    time_complexity: str = Field(description="Time complexity")
    requires_sorted_input: bool = Field(
        description="Whether the algorithm requires sorted input"
    )

# Step 2: Create the parser
parser = PydanticOutputParser(pydantic_object=DSAResponse)

# Step 3: Create the model
model = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",
    google_api_key=os.getenv("GOOGLE_API_KEY"),
    temperature=0
)

# Step 4: Add parser instructions to the prompt
prompt = PromptTemplate(
    template=(
        "You are a helpful DSA tutor.\n"
        "Explain the requested topic clearly.\n"
        "{format_instructions}\n"
        "Topic: {topic}"
    ),
    input_variables=["topic"],
    partial_variables={
        "format_instructions": parser.get_format_instructions()
    }
)

# Step 5: Connect prompt -> model -> parser
chain = prompt | model | parser

# Step 6: Invoke the chain
def main():
    try:
        result = chain.invoke({"topic": "Binary Search"})

        print("\nParsed Pydantic object:")
        print(result)

        print("\nIndividual fields:")
        print("Topic:", result.topic)
        print("Definition:", result.definition)
        print("Time complexity:", result.time_complexity)
        print("Requires sorted input:", result.requires_sorted_input)

    except Exception as error:
        print("Error:", error)

if __name__ == "__main__":
    main()
