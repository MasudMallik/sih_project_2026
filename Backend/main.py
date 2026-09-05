import joblib
from Ml_models.rag_model import load_data,text_split,create_db,rag_pipeline
with open(r"Ml_models\trained_model.joblib","rb") as f:  
    model=joblib.load(f)
if model:
    print("model loaded ",type(model))

documents=load_data(r"E:\Datasets\land_slide_pdf")
after_split=text_split(documents)
vector_space=create_db(after_split)
print(rag_pipeline(vector_space,"why dsa?"))