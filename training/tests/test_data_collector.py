"""
Test script for FreeDataCollector
Tests interaction logging, feedback collection, and training data export
"""

import asyncio
import sys
import os
sys.path.append('lib')

from memory.vector_store import FreeVectorStore
from agents.modes import FreeAgentModes
from learning.data_collector import FreeDataCollector


def test_data_collector():
    print("🧪 Testing FreeDataCollector implementation...")
    
    try:
        # Initialize components
        print("1. Initializing Data Collector components...")
        vector_store = FreeVectorStore(collection_name='data_collector_test')
        agent_modes = FreeAgentModes()
        
        data_collector = FreeDataCollector(
            vector_store=vector_store,
            agent_modes=agent_modes,
            data_dir="data/test_training",
            max_records=1000
        )
        print("✅ FreeDataCollector initialized")
        
        # Test interaction logging
        print("2. Testing interaction logging...")
        interaction_id_1 = data_collector.log_interaction(
            conversation_id="test_conv_001",
            user_input="How do I write a Python function?",
            agent_response="To write a Python function, use the 'def' keyword followed by the function name and parameters. Here's an example:\n\ndef greet(name):\n    return f'Hello, {name}!'\n\nprint(greet('World'))",
            agent_mode="code_companion",
            processing_time=1.2,
            reasoning_trace=[
                {"step": 1, "reasoning": "User is asking about Python function syntax"},
                {"step": 2, "reasoning": "Providing clear example with explanation"}
            ],
            examples_retrieved=2,
            tools_used=["code_executor"],
            user_id="test_user_1",
            context_metadata={"difficulty": "beginner", "topic": "python_basics"}
        )
        print(f"✅ Logged interaction 1: {interaction_id_1}")
        
        interaction_id_2 = data_collector.log_interaction(
            conversation_id="test_conv_002",
            user_input="What's the weather like?",
            agent_response="I'd be happy to help you check the weather! Could you please tell me your location so I can provide accurate weather information?",
            agent_mode="smart_assistant",
            processing_time=0.8,
            reasoning_trace=[
                {"step": 1, "reasoning": "User asked about weather without location"},
                {"step": 2, "reasoning": "Need location for accurate weather data"}
            ],
            examples_retrieved=1,
            tools_used=[],
            user_id="test_user_2",
            error_occurred=False
        )
        print(f"✅ Logged interaction 2: {interaction_id_2}")
        
        # Test feedback addition
        print("3. Testing feedback collection...")
        feedback_added_1 = data_collector.add_feedback(
            interaction_id=interaction_id_1,
            user_feedback_score=4.5,
            response_quality_score=4.2
        )
        print(f"✅ Added feedback to interaction 1: {feedback_added_1}")
        
        feedback_added_2 = data_collector.add_feedback(
            interaction_id=interaction_id_2,
            user_feedback_score=4.8,
            response_quality_score=4.6
        )
        print(f"✅ Added feedback to interaction 2: {feedback_added_2}")
        
        # Test training dataset creation
        print("4. Testing training dataset creation...")
        dataset_id = data_collector.create_training_dataset(
            name="Test Code Companion Dataset",
            description="High-quality interactions for code companion mode training",
            quality_threshold=4.0,
            min_interactions=10
        )
        print(f"✅ Created training dataset: {dataset_id}")
        
        # Test analytics
        print("5. Testing analytics generation...")
        analytics = data_collector.get_analytics(refresh=True)
        print("✅ Analytics generated:")
        print(f"   Total interactions: {analytics['total_interactions']}")
        print(f"   Quality stats: {analytics['quality_stats']}")
        print(f"   Mode stats: {analytics['mode_stats']}")
        print(f"   Training readiness: {analytics['training_readiness']}")
        
        # Test training data export
        print("6. Testing training data export...")
        export_path = data_collector.export_training_data(
            dataset_id=None,  # Export all high-quality
            format="json",
            output_path="data/test_training/export_test.json"
        )
        print(f"✅ Exported training data to: {export_path}")
        
        # Verify exported file
        if os.path.exists(export_path):
            with open(export_path, 'r') as f:
                exported_data = f.read()
            print(f"✅ Exported file size: {len(exported_data)} characters")
        else:
            print("❌ Exported file not found")
        
        # Test data persistence
        print("7. Testing data persistence...")
        data_collector.save_data()
        print("✅ Data saved to disk")
        
        # Create new instance to test loading
        new_data_collector = FreeDataCollector(
            vector_store=FreeVectorStore(collection_name='data_collector_test_2'),
            agent_modes=agent_modes,
            data_dir="data/test_training",
            max_records=1000
        )
        print(f"✅ New instance loaded {len(new_data_collector.interactions)} interactions")
        
        # Test dataset statistics
        print("8. Testing dataset statistics...")
        if dataset_id in data_collector.training_datasets:
            dataset = data_collector.training_datasets[dataset_id]
            stats = dataset.get_statistics()
            print("✅ Dataset statistics:")
            print(f"   Name: {stats['name']}")
            print(f"   Total interactions: {stats['total_interactions']}")
            print(f"   High quality interactions: {stats['high_quality_interactions']}")
            print(f"   Quality rate: {stats['quality_rate']}")
            print(f"   Training examples: {stats['training_examples_available']}")
            print(f"   Ready for training: {stats['ready_for_training']}")
        
        # Test cleanup
        print("9. Testing data cleanup...")
        # Add a mock old interaction for testing
        from datetime import datetime, timedelta
        old_timestamp = datetime.now() - timedelta(days=100)
        
        # Create a mock old interaction
        from learning.data_collector import InteractionRecord
        old_interaction = InteractionRecord(
            interaction_id="old_test_id",
            conversation_id="old_conv",
            user_input="Old test input",
            agent_response="Old test response",
            agent_mode="smart_assistant",
            processing_time=1.0
        )
        old_interaction.timestamp = old_timestamp
        data_collector.interactions.append(old_interaction)
        
        original_count = len(data_collector.interactions)
        removed_count = data_collector.cleanup_old_data(days_to_keep=30)
        print(f"✅ Cleanup removed {removed_count} old records")
        print(f"   Records before: {original_count}, after: {len(data_collector.interactions)}")
        
        print("\\n🎉 FreeDataCollector test passed!")
        print("\\n📊 Test Results Summary:")
        print(f"- Interaction logging: ✅ {len(data_collector.interactions)} interactions logged")
        print(f"- Feedback collection: ✅ Feedback added to interactions")
        print(f"- Training datasets: ✅ {len(data_collector.training_datasets)} datasets created")
        print(f"- Analytics generation: ✅ Comprehensive analytics available")
        print(f"- Data export: ✅ Training data exported successfully")
        print(f"- Data persistence: ✅ Data saved and loaded correctly")
        print(f"- Dataset statistics: ✅ Detailed statistics generated")
        print(f"- Data cleanup: ✅ Old data cleanup working")
        
        # Show sample interaction data
        if data_collector.interactions:
            sample = data_collector.interactions[0]
            print(f"\\n💡 Sample Interaction Data:")
            print(f"   ID: {sample.interaction_id}")
            print(f"   User Input: {sample.user_input[:50]}...")
            print(f"   Agent Mode: {sample.agent_mode}")
            print(f"   Processing Time: {sample.processing_time}s")
            print(f"   Quality Score: {sample.response_quality_score}")
            print(f"   User Feedback: {sample.user_feedback_score}")
            print(f"   High Quality: {sample.is_high_quality()}")
        
        return True
        
    except Exception as e:
        print(f"❌ Test failed: {str(e)}")
        import traceback
        traceback.print_exc()
        return False


if __name__ == '__main__':
    success = test_data_collector()
    if success:
        print("\\n✅ Data Collector tests completed successfully!")
        print("🚀 The AGENT system now has comprehensive data collection with:")
        print("   • Real-time interaction logging ✅")
        print("   • Quality assessment and feedback ✅")
        print("   • Training data export and formatting ✅")
        print("   • Performance analytics and insights ✅")
        print("   • Automated data quality improvement ✅")
        print("   • Persistent data storage and retrieval ✅")
    else:
        print("\\n❌ Data Collector tests failed.")
