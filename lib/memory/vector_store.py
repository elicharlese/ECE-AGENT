"""
Free Vector Store - ChromaDB-based vector storage and retrieval
Provides semantic search capabilities for the AGENT LLM system
"""

import chromadb
from sentence_transformers import SentenceTransformer
from typing import List, Dict, Any, Optional, Tuple
import uuid
import os
from datetime import datetime
import json


class FreeVectorStore:
    """
    Vector database implementation using ChromaDB and Sentence Transformers
    Handles storage, retrieval, and semantic similarity search for agent examples
    """

    def __init__(
        self,
        collection_name: str = "agent_examples",
        embedder_model: str = "all-MiniLM-L6-v2",
        persist_directory: Optional[str] = None
    ):
        """
        Initialize the vector store

        Args:
            collection_name: Name of the ChromaDB collection
            embedder_model: Sentence transformer model to use
            persist_directory: Directory to persist ChromaDB data
        """

        # Initialize ChromaDB client
        if persist_directory:
            self.chroma_client = chromadb.PersistentClient(path=persist_directory)
        else:
            self.chroma_client = chromadb.Client()

        self.collection_name = collection_name
        self.embedder_model = embedder_model

        # Initialize sentence transformer
        self.embedder = SentenceTransformer(embedder_model)
        # Get or create collection
        try:
            self.collection = self.chroma_client.get_collection(name=collection_name)
        except Exception:
            # Collection does not exist, create it
            self.collection = self.chroma_client.create_collection(name=collection_name)

    def add_example(
        self,
        text: str,
        metadata: Optional[Dict[str, Any]] = None,
        custom_id: Optional[str] = None
    ) -> str:
        """
        Add a text example to the vector store

        Args:
            text: The text content to embed and store
            metadata: Additional metadata to store with the example
            custom_id: Custom ID for the example (auto-generated if None)

        Returns:
            The ID of the stored example
        """

        # Generate embedding
        embedding = self.embedder.encode([text])[0]

        # Generate ID if not provided
        if custom_id is None:
            custom_id = str(uuid.uuid4())

        # Prepare metadata
        if metadata is None:
            metadata = {}

        # Add timestamp and other metadata
        metadata.update({
            "timestamp": datetime.now().isoformat(),
            "text_length": len(text),
            "embedder_model": self.embedder_model
        })

        # Add to collection
        self.collection.add(
            embeddings=[embedding.tolist()],
            documents=[text],
            metadatas=[metadata],
            ids=[custom_id]
        )

        return custom_id

    def search_similar(
        self,
        query: str,
        n_results: int = 5,
        where: Optional[Dict[str, Any]] = None,
        where_document: Optional[Dict[str, str]] = None
    ) -> List[Dict[str, Any]]:
        """
        Search for semantically similar examples

        Args:
            query: The search query text
            n_results: Number of results to return
            where: Metadata filters
            where_document: Document content filters

        Returns:
            List of similar examples with scores and metadata
        """

        # Generate query embedding
        query_embedding = self.embedder.encode([query])[0]

        # Perform search
        results = self.collection.query(
            query_embeddings=[query_embedding.tolist()],
            n_results=n_results,
            where=where,
            where_document=where_document,
            include=["documents", "metadatas", "distances"]
        )

        # Format results
        formatted_results = []
        if results["documents"] and len(results["documents"][0]) > 0:
            for i, (doc, metadata, distance) in enumerate(zip(
                results["documents"][0],
                results["metadatas"][0],
                results["distances"][0]
            )):
                formatted_results.append({
                    "id": results["ids"][0][i],
                    "text": doc,
                    "metadata": metadata,
                    "similarity_score": 1.0 - distance,  # Convert distance to similarity
                    "distance": distance
                })

        return formatted_results

    def get_example_by_id(self, example_id: str) -> Optional[Dict[str, Any]]:
        """
        Retrieve a specific example by ID

        Args:
            example_id: The ID of the example to retrieve

        Returns:
            The example data or None if not found
        """

        try:
            result = self.collection.get(ids=[example_id])
            if result["documents"]:
                return {
                    "id": result["ids"][0],
                    "text": result["documents"][0],
                    "metadata": result["metadatas"][0]
                }
        except Exception:
            pass

        return None

    def update_example(
        self,
        example_id: str,
        text: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> bool:
        """
        Update an existing example

        Args:
            example_id: ID of the example to update
            text: New text content (if updating)
            metadata: New metadata (if updating)

        Returns:
            True if update was successful
        """

        try:
            # Prepare update data
            update_data = {}

            if text is not None:
                # Re-embed the text
                embedding = self.embedder.encode([text])[0]
                update_data["embeddings"] = [embedding.tolist()]
                update_data["documents"] = [text]

            if metadata is not None:
                # Update timestamp
                metadata["updated_at"] = datetime.now().isoformat()
                update_data["metadatas"] = [metadata]

            if update_data:
                self.collection.update(
                    ids=[example_id],
                    **update_data
                )

            return True

        except Exception:
            return False

    def delete_example(self, example_id: str) -> bool:
        """
        Delete an example from the vector store

        Args:
            example_id: ID of the example to delete

        Returns:
            True if deletion was successful
        """

        try:
            self.collection.delete(ids=[example_id])
            return True
        except Exception:
            return False

    def get_collection_stats(self) -> Dict[str, Any]:
        """
        Get statistics about the vector store collection

        Returns:
            Dictionary with collection statistics
        """

        try:
            # Get all items to count
            all_items = self.collection.get(include=["metadatas"])

            total_examples = len(all_items["ids"]) if all_items["ids"] else 0

            # Count by agent mode if metadata available
            mode_counts = {}
            quality_scores = []

            if all_items["metadatas"]:
                for metadata in all_items["metadatas"]:
                    if metadata and "mode" in metadata:
                        mode = metadata["mode"]
                        mode_counts[mode] = mode_counts.get(mode, 0) + 1

                    if metadata and "quality_score" in metadata:
                        try:
                            quality_scores.append(float(metadata["quality_score"]))
                        except (ValueError, TypeError):
                            pass

            avg_quality = sum(quality_scores) / len(quality_scores) if quality_scores else 0

            return {
                "collection_name": self.collection_name,
                "total_examples": total_examples,
                "embedder_model": self.embedder_model,
                "embedding_dimension": self.embedder.get_sentence_embedding_dimension(),
                "examples_by_mode": mode_counts,
                "average_quality_score": round(avg_quality, 2),
                "last_updated": datetime.now().isoformat()
            }

        except Exception as e:
            return {
                "error": str(e),
                "collection_name": self.collection_name
            }

    def clear_collection(self):
        """Clear all examples from the collection"""
        try:
            # Delete the collection and recreate it
            self.chroma_client.delete_collection(name=self.collection_name)
            self.collection = self.chroma_client.create_collection(name=self.collection_name)
        except Exception:
            # If deletion fails, try to recreate
            try:
                self.collection = self.chroma_client.create_collection(name=self.collection_name)
            except Exception:
                pass  # Collection might already exist

    def export_examples(self, format: str = "json") -> str:
        """
        Export all examples in the specified format

        Args:
            format: Export format ("json" or "csv")

        Returns:
            Exported data as string
        """

        try:
            all_data = self.collection.get(include=["documents", "metadatas"])

            if format.lower() == "json":
                export_data = []
                for i, doc_id in enumerate(all_data["ids"]):
                    export_data.append({
                        "id": doc_id,
                        "text": all_data["documents"][i],
                        "metadata": all_data["metadatas"][i]
                    })
                return json.dumps(export_data, indent=2, default=str)

            elif format.lower() == "csv":
                lines = ["id,text,metadata"]
                for i, doc_id in enumerate(all_data["ids"]):
                    metadata_str = json.dumps(all_data["metadatas"][i]) if all_data["metadatas"][i] else ""
                    text = all_data["documents"][i].replace('"', '""')  # Escape quotes
                    lines.append(f'"{doc_id}","{text}","{metadata_str}"')
                return "\n".join(lines)

            else:
                raise ValueError(f"Unsupported export format: {format}")

        except Exception as e:
            return f"Export failed: {str(e)}"
