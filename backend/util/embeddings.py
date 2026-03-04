import numpy as np
from sentence_transformers import SentenceTransformer
from typing import List, Union
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class EmbeddingManager:
    _instance = None
    _model = None
    _model_name = 'all-MiniLM-L6-v2'

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(EmbeddingManager, cls).__new__(cls)
        return cls._instance

    @property
    def model(self):
        if self._model is None:
            logger.info(f"Loading sentence-transformers model: {self._model_name}")
            try:
                self._model = SentenceTransformer(self._model_name)
            except Exception as e:
                logger.error(f"Failed to load model: {e}")
                raise e
        return self._model

    def generate_embedding(self, text: Union[str, List[str]]) -> Union[List[float], List[List[float]]]:
        """
        Generates embedding(s) for the given text or list of texts.
        Returns a list of floats for a single string, or a list of lists of floats for a list of strings.
        """
        if not text:
            return []
            
        embeddings = self.model.encode(text)
        
        if isinstance(text, str):
            return embeddings.tolist()
        return embeddings.tolist()

    def cosine_similarity(self, embedding1: List[float], embedding2: List[float]) -> float:
        """
        Calculates the cosine similarity between two embeddings.
        """
        if not embedding1 or not embedding2:
            return 0.0
            
        e1 = np.array(embedding1)
        e2 = np.array(embedding2)
        
        dot_product = np.dot(e1, e2)
        norm1 = np.linalg.norm(e1)
        norm2 = np.linalg.norm(e2)
        
        if norm1 == 0 or norm2 == 0:
            return 0.0
            
        return float(dot_product / (norm1 * norm2))

# Singleton instance
embedding_manager = EmbeddingManager()
