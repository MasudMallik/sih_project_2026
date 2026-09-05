from langchain.chat_models import init_chat_model
from langchain_core.prompts import PromptTemplate
from langchain_community.document_loaders import PyPDFLoader
from langchain_community.embeddings import HuggingFaceBgeEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter
from pathlib import Path
from langchain_core.output_parsers import StrOutputParser
from langchain_chroma import Chroma
from dotenv import load_dotenv
load_dotenv()

def load_data(document):
    file_paths=Path(document)
    files=list(file_paths.glob("**/*pdf"))
    all_files=[]
    for i in files:
        print(f"processing {i}")
        try:
            doc=PyPDFLoader(str(i))
            data=doc.load()
            all_files.extend(data)
        except Exception as e:
            print(f"cannot open{i} due to {e}")
    return all_files

def text_split(document,chunk_size=1000,chunk_overlap=200):
    splitter=RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap,
        separators=["\n\n","\n","."],
        length_function=len
    )
    doc=splitter.split_documents(document)
    return doc

def create_db(doc):
    dir="chroma_db"
    embedding=HuggingFaceBgeEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
    vector_space=Chroma.from_documents(
        documents=doc,
        embedding=embedding,
        persist_directory=dir
    )
    return vector_space

def rag_pipeline(vector_space,question):
    prompt=PromptTemplate(
        input_variables=["context","query"],
        template="this is the context:{context} answer from thi context only,if the anwer is not present then return not available in document,the question is {query},Answer:"
    )
    model=init_chat_model(model="groq:openai/gpt-oss-120b")
    retriver=vector_space.as_retriever()
    document=retriver.invoke(question)
    all_document="\n\n".join([d.page_content for d in document]) if document else "Not present in document"
    chain=prompt | model | StrOutputParser()
    return chain.invoke({"context":all_document,"query":question})
