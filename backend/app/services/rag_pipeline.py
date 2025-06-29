import google.generativeai as genai
import os
from app.services.vector_store import retrieve_similar_chunks

# Env config
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))
model = genai.GenerativeModel(os.getenv("GOOGLE_AI_MODEL_NAME"))

# Generate Response
def generate_answer(query: str, user_history: list = []):
    '''
    Takes the user's query and recent conversation history to generate a relevant response.
    '''

    # Reterive chunk from vector database
    retrieved_chunks = retrieve_similar_chunks(query)
    context = "\n\n".join(retrieved_chunks)

    print("context here->",context)
    # Chat Prompt
    chat_prompt = f"""
        You are an advanced, empathetic, and responsible AI Legal Assistant trained in Indian law (IPC, CrPC, Constitution, civil and criminal codes, 
        and protective acts).

            You help users who are victims of crime or injustice by explaining what legal protections apply, what punishments are assigned to 
            the offender, and what realistic steps the user should take. You must write in clear English, and always be polite and supportive.

            ##  OBJECTIVES

            1. Understand the user's situation — even if emotional or unclear.
            2. Identify all relevant Indian laws (IPC, CrPC, POCSO, DV Act, etc.)
            3. For each law:
            - Explain in detail:
                - What the law is
                - Who it protects
                - What actions are criminalized
                - What punishment applies
                - What steps the user should take
            4. Do not copy legal jargon or sections verbatim. Use simplified, plain English.
            5. Be sensitive and polite.

            ##  RESPONSE FORMAT (Mandatory)
            Give answer in points, and use nextline also
            always give me in this formate only.

            {context}
            {query}       

"""

    # Get all the previous chat history
    if user_history:
        past = "\n".join(f"User: {q}\nBot: {a}" for q, a in user_history)
        chat_prompt = f"{past}\n\n{chat_prompt}"

    try:
        response = model.generate_content(chat_prompt)
        return response.text.strip()
    except Exception as e:
        print("Gemini error:", e)
        return "Sorry, I couldn't process your question right now."



# ****************************** to use openAI **********************************************
# import os
# from openai import OpenAI
# from app.services.vector_store import retrieve_similar_chunks

# client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
# MODEL_NAME = os.getenv("OPENAI_MODEL_NAME", "gpt-3.5-turbo")

# Generate Response
# def generate_answer(query: str, user_history: list = []):
#     retrieved_chunks = retrieve_similar_chunks(query)
#     context = "\n\n".join(retrieved_chunks)

#     system_prompt = """
# You are an assistant answering questions based on the provided legal or policy context.

# - When a question is asked, find the most relevant section from the context.
# - Provide a short summary of what action should be taken in that situation.
# - If asked about the number of available sections, list all section titles/names found in the context.
# - If asked to explain a particular section, summarize it clearly and briefly using the available context.
# """

#     # Build messages list
#     messages = [{"role": "system", "content": system_prompt}]

#     for q, a in user_history:
#         messages.append({"role": "user", "content": q})
#         messages.append({"role": "assistant", "content": a})

#     messages.append({
#         "role": "user",
#         "content": f"Context:\n{context}\n\nUser question: {query}"
#     })

#     try:
#         response = client.chat.completions.create(
#             model=MODEL_NAME,
#             messages=messages,
#             temperature=0.0
#         )
#         return response.choices[0].message.content.strip()
#     except Exception as e:
#         print("OpenAI error:", e)
#         return "Sorry, I couldn't process your question right now."
