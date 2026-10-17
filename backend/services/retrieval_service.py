import re
import math
from typing import List, Dict, Any, Optional
from backend.database import get_db
from backend.config import DEFAULT_TOP_K, SIMILARITY_THRESHOLD

STOP_WORDS = {
    "a", "about", "above", "after", "again", "against", "all", "am", "an", "and", "any", "are",
    "as", "at", "be", "because", "been", "before", "being", "below", "between", "both", "but", "by",
    "can", "could", "did", "do", "does", "doing", "down", "during", "each", "few", "for", "from",
    "further", "had", "has", "have", "having", "he", "her", "here", "hers", "herself", "him", "himself",
    "his", "how", "i", "if", "in", "into", "is", "it", "its", "itself", "just", "me", "more", "most",
    "my", "myself", "no", "nor", "not", "of", "off", "on", "once", "only", "or", "other", "ought",
    "our", "ours", "ourselves", "out", "over", "own", "same", "she", "should", "so", "some", "such",
    "than", "that", "the", "their", "theirs", "them", "themselves", "then", "there", "these", "they",
    "this", "those", "through", "to", "too", "under", "until", "up", "very", "was", "we", "were",
    "what", "when", "where", "which", "while", "who", "whom", "why", "with", "would", "you", "your",
    "yours", "yourself", "yourselves"
}

class RetrievalService:
    @staticmethod
    def _tokenize(text: str, filter_stopwords: bool = False) -> List[str]:
        # Lowercase, clean punctuation, split into alphanumeric tokens
        tokens = re.findall(r'\b[a-zA-Z0-9_\-\$]{2,}\b', text.lower())
        if filter_stopwords:
            tokens = [t for t in tokens if t not in STOP_WORDS]
        return tokens

    @classmethod
    def search(cls,
               query: str,
               document_id: Optional[int] = None,
               top_k: int = DEFAULT_TOP_K,
               min_score: float = 0.12) -> List[Dict[str, Any]]:
        """
        Retrieves top relevant chunks using TF-IDF cosine similarity + BM25-style keyword boosting.
        """
        # Filter stopwords from query to prevent false-positive matching on generic words
        query_tokens = cls._tokenize(query, filter_stopwords=True)
        if not query_tokens:
            # Fallback to unfiltered tokens if all words were stopwords (e.g. "what is it")
            query_tokens = cls._tokenize(query, filter_stopwords=False)
            if not query_tokens:
                return []

        with get_db() as conn:
            # Query chunks with document metadata
            sql = """
                SELECT c.id as chunk_id, c.document_id, c.chunk_index, c.page_number, c.content,
                       d.title as document_title
                FROM document_chunks c
                JOIN documents d ON c.document_id = d.id
                WHERE d.status = 'completed'
            """
            params = []
            if document_id is not None:
                sql += " AND c.document_id = ?"
                params.append(document_id)

            rows = conn.execute(sql, params).fetchall()

        if not rows:
            return []

        # Build corpus and inverted index
        corpus = []
        doc_count = len(rows)
        doc_freq: Dict[str, int] = {}

        for row in rows:
            tokens = cls._tokenize(row["content"])
            corpus.append((row, tokens))
            unique_tokens = set(tokens)
            for t in unique_tokens:
                doc_freq[t] = doc_freq.get(t, 0) + 1

        # Calculate IDF for query tokens
        query_idf = {}
        for t in set(query_tokens):
            df = doc_freq.get(t, 0)
            query_idf[t] = math.log((doc_count + 1) / (df + 1)) + 1.0

        # Query vector
        query_tf = {}
        for t in query_tokens:
            query_tf[t] = query_tf.get(t, 0) + 1

        q_len = math.sqrt(sum((count * query_idf[t]) ** 2 for t, count in query_tf.items()))
        if q_len == 0:
            return []

        # Score each chunk
        scored_chunks = []
        lower_query = query.lower()

        for row, tokens in corpus:
            if not tokens:
                continue

            tf: Dict[str, int] = {}
            for t in tokens:
                tf[t] = tf.get(t, 0) + 1

            dot_product = 0.0
            doc_vec_len_sq = 0.0

            for t, count in tf.items():
                idf = math.log((doc_count + 1) / (doc_freq.get(t, 0) + 1)) + 1.0
                weight = count * idf
                doc_vec_len_sq += weight ** 2
                if t in query_tf:
                    dot_product += (query_tf[t] * query_idf[t]) * weight

            doc_len = math.sqrt(doc_vec_len_sq)
            cosine_sim = dot_product / (q_len * doc_len) if doc_len > 0 else 0.0

            # Keyword boosting
            exact_phrase_bonus = 0.0
            content_lower = row["content"].lower()
            if len(query.strip()) > 4 and query.strip().lower() in content_lower:
                exact_phrase_bonus = 0.35

            # Word match density bonus
            matched_query_terms = sum(1 for t in set(query_tokens) if t in tf)
            term_overlap_ratio = matched_query_terms / len(set(query_tokens))

            # Composite relevance score
            final_score = (cosine_sim * 0.65) + (term_overlap_ratio * 0.25) + exact_phrase_bonus

            if final_score >= min_score:
                scored_chunks.append({
                    "chunk_id": row["chunk_id"],
                    "document_id": row["document_id"],
                    "document_title": row["document_title"],
                    "page_number": row["page_number"],
                    "content": row["content"],
                    "score": round(float(final_score), 4)
                })

        scored_chunks.sort(key=lambda x: x["score"], reverse=True)
        return scored_chunks[:top_k]

    @classmethod
    def format_citations(cls, chunks: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Formats citations with page numbers and preview snippets."""
        citations = []
        for ch in chunks:
            # Create a clean snippet
            snippet = ch["content"].strip().replace("\n", " ")
            if len(snippet) > 220:
                snippet = snippet[:220].rsplit(" ", 1)[0] + "..."

            citations.append({
                "document_id": ch["document_id"],
                "document_title": ch["document_title"],
                "page_number": ch["page_number"],
                "chunk_id": ch["chunk_id"],
                "text_snippet": snippet,
                "relevance_score": ch.get("score", 0.0)
            })
        return citations
