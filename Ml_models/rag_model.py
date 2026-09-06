import os
from pathlib import Path
from dotenv import load_dotenv

# Load env from current dir or parent dirs
env_path = Path(__file__).resolve().parent / ".env"
load_dotenv(dotenv_path=env_path)
load_dotenv()

groq_key = os.getenv("GROQ_API_KEY") or os.getenv("groq_api")
if groq_key:
    os.environ["GROQ_API_KEY"] = groq_key

from langchain.chat_models import init_chat_model
from langchain_core.prompts import PromptTemplate
from langchain_community.document_loaders import PyPDFLoader
from langchain_community.embeddings import HuggingFaceBgeEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.output_parsers import StrOutputParser
from langchain_chroma import Chroma

def load_data(document):
    file_paths = Path(document)
    if not file_paths.exists():
        return []
    files = list(file_paths.glob("**/*.pdf"))
    all_files = []
    for i in files:
        try:
            doc = PyPDFLoader(str(i))
            data = doc.load()
            all_files.extend(data)
        except Exception as e:
            print(f"Cannot open {i} due to {e}")
    return all_files

def text_split(document, chunk_size=1000, chunk_overlap=200):
    if not document:
        return []
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap,
        separators=["\n\n", "\n", "."],
        length_function=len
    )
    doc = splitter.split_documents(document)
    return doc

def create_db(doc):
    if not doc:
        return None
    dir_path = Path(__file__).resolve().parent / "chroma_db"
    embedding = HuggingFaceBgeEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
    vector_space = Chroma.from_documents(
        documents=doc,
        embedding=embedding,
        persist_directory=str(dir_path)
    )
    return vector_space

def rag_pipeline(vector_space, question):
    prompt = PromptTemplate(
        input_variables=["context", "query"],
        template="This is the context:\n{context}\n\nAnswer from this context only. If the answer is not present, return 'Not available in document'.\n\nQuestion: {query}\nAnswer:"
    )
    
    # Use valid Groq model name
    try:
        model = init_chat_model(model="groq:openai/gpt-oss-20b")
    except Exception:
        model = init_chat_model(model="groq:openai/gpt-oss-20b")
        
    retriever = vector_space.as_retriever()
    document = retriever.invoke(question)
    all_document = "\n\n".join([d.page_content for d in document]) if document else "Not present in document"
    chain = prompt | model | StrOutputParser()
    return chain.invoke({"context": all_document, "query": question})
