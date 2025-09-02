"""
Simple RAISE Framework Integration Test
Basic test to validate core RAISE components work together
"""

import asyncio
import os
import sys
from datetime import datetime

# Add current directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

async def test_basic_components():
    """Test basic component initialization"""
    print("🧪 Testing RAISE Framework Components...")
    
    try:
        # Test imports
        from memory.vector_store import ChromaVectorStore
        print("✅ ChromaVectorStore import successful")
        
        from llm.base_wrapper import FreeLLMWrapper
        print("✅ FreeLLMWrapper import successful")
        
        from reasoning.react_processor import FreeReActProcessor
        print("✅ FreeReActProcessor import successful")
        
        from reasoning.raise_controller import FreeRAISEController
        print("✅ FreeRAISEController import successful")
        
        # Test basic initialization
        vector_store = ChromaVectorStore(
            collection_name="test_collection",
            persist_directory="./data/test_chroma"
        )
        print("✅ Vector store initialized")
        
        llm_wrapper = FreeLLMWrapper()
        print("✅ LLM wrapper initialized")
        
        react_processor = FreeReActProcessor(llm_wrapper)
        print("✅ ReAct processor initialized")
        
        raise_controller = FreeRAISEController(
            llm_wrapper=llm_wrapper,
            vector_store=vector_store
        )
        print("✅ RAISE controller initialized")
        
        print("\n🎉 All core components initialized successfully!")
        return True
        
    except Exception as e:
        print(f"❌ Component initialization failed: {e}")
        import traceback
        traceback.print_exc()
        return False

async def test_vector_store():
    """Test vector store functionality"""
    print("\n🗄️ Testing Vector Store...")
    
    try:
        from memory.vector_store import ChromaVectorStore
        
        store = ChromaVectorStore(
            collection_name="test_store",
            persist_directory="./data/test_store"
        )
        
        # Test adding documents
        test_docs = [
            "Python is a programming language",
            "Machine learning uses algorithms",
            "AI systems can learn from data"
        ]
        
        doc_ids = store.add_documents(test_docs)
        print(f"✅ Added {len(doc_ids)} documents")
        
        # Test search
        results = store.search_similar("programming", n_results=2)
        print(f"✅ Search returned {len(results.get('results', []))} results")
        
        return True
        
    except Exception as e:
        print(f"❌ Vector store test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

async def main():
    """Main test function"""
    print("🤖 ECE-AGENT RAISE Framework Simple Integration Test")
    print("=" * 60)
    
    # Run tests
    component_test = await test_basic_components()
    vector_test = await test_vector_store()
    
    print("\n" + "=" * 60)
    print("📊 TEST RESULTS")
    print("=" * 60)
    
    if component_test and vector_test:
        print("✅ ALL TESTS PASSED")
        print("🎉 RAISE Framework core components are working!")
        return True
    else:
        print("❌ SOME TESTS FAILED")
        print("⚠️ Check the error messages above")
        return False

if __name__ == "__main__":
    success = asyncio.run(main())
    sys.exit(0 if success else 1)
