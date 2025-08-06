"""
Spline 3D Training Session - Interactive Data Visualizations
Training AGENT to create immersive 3D experiences based on course screenshots
"""

import asyncio
import json
from datetime import datetime
import sys
import os

# Add the parent directory to the path to import AGENT modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from agent.enhanced_agent import EnhancedAgent
from agent.spline_training_interface import SplineTrainingInterface, integrate_spline_training


async def start_spline_training_session():
    """Start a comprehensive Spline 3D training session"""
    print("🎯 Starting AGENT Spline 3D Training Session...")
    
    # Initialize enhanced agent
    agent = EnhancedAgent()
    
    # Integrate Spline training capabilities
    training_interface = await integrate_spline_training(agent)
    
    # Start training session
    session_result = await training_interface.start_training_session(
        session_name="Real-Time APIs and 3D Data Visualization",
        course_module="Interactive 3D Scenes with Live Data"
    )
    
    print(f"✅ Training session started: {session_result['session_id']}")
    
    # Course notes from the screenshots
    course_notes = """
    # Spline 3D Course: Real-Time APIs and Webhooks for 3D Scenes
    
    ## Key Learning Points:
    
    ### 1. Interactive 3D Bar Charts
    - Create dynamic bar charts with real-time data updates
    - Use distinct colors for data categorization (orange, green, blue, pink)
    - Implement percentage and value labels on each bar
    - Add grid lines for visual reference
    - Dark background for better contrast and modern appearance
    - Bar heights should dynamically adjust based on data values
    
    ### 2. Real-Time API Integration
    - Connect 3D scenes to external APIs for live data feeds
    - Implement weather data integration with temperature display
    - Create responsive weather widgets with location information
    - Use appropriate icons and visual elements (sun with rays)
    - Implement gradient backgrounds for weather conditions
    
    ### 3. Data Visualization Best Practices
    - Balance aesthetics with functionality
    - Use 3D depth strategically without overwhelming content
    - Implement smooth animations and transitions
    - Ensure clear labeling and data presentation
    - Create hover interactions for enhanced user experience
    
    ### 4. Technical Implementation
    - Set up webhooks for real-time scene updates
    - Optimize performance for live data streaming
    - Implement responsive design for different screen sizes
    - Create modular components for reusable visualizations
    - Handle API errors and data loading states gracefully
    
    ### 5. Design Principles
    - Use consistent color schemes across visualizations
    - Implement clean, minimal design approaches
    - Focus on data clarity and readability
    - Create engaging interactive elements
    - Maintain visual hierarchy in complex scenes
    """
    
    # Process the course notes
    print("📚 Processing course notes...")
    notes_result = await training_interface.process_course_notes(
        notes=course_notes,
        lesson_title="Real-Time APIs and Webhooks for 3D Scenes",
        context="Interactive data visualization and API integration in Spline"
    )
    
    if notes_result["success"]:
        print(f"✅ Processed course notes - Learned {notes_result['concepts_learned']} concepts")
        print(f"🔧 New techniques: {', '.join(notes_result['new_techniques'][:3])}")
    
    # Generate a 3D bar chart scene based on the screenshot
    print("📊 Generating 3D bar chart scene...")
    bar_chart_result = await training_interface.generate_scene_from_learning(
        scene_description="""
        Create an interactive 3D bar chart with 4 data categories:
        - Orange bar representing 10% (value: 23)
        - Green bar representing 31% (value: 72) 
        - Blue bar representing 11% (value: 26)
        - Pink bar representing 47% (value: 109)
        
        The scene should have:
        - Dark background for modern appearance
        - Grid lines for reference
        - Clear percentage and value labels
        - Smooth hover interactions
        - Dynamic height scaling based on data values
        - Professional data visualization styling
        """,
        apply_concepts=["real-time data", "interactive visualization", "color coding"],
        style="modern"
    )
    
    if bar_chart_result["success"]:
        print("✅ Generated 3D bar chart scene successfully!")
        print(f"🎨 Scene elements: {len(bar_chart_result['scene'].elements)}")
        
        # Save the generated React code
        with open("/Users/elicharlese/CascadeProjects/AGENT/training_data/spline/generated_bar_chart.jsx", "w") as f:
            f.write(bar_chart_result["web_code"]["code"])
        print("💾 Saved React component code")
    
    # Generate a weather widget scene
    print("🌤️ Generating weather widget scene...")
    weather_result = await training_interface.generate_scene_from_learning(
        scene_description="""
        Create an interactive weather widget with real-time API integration:
        - Display location and temperature (15°C)
        - Show weather condition (Sunny) with appropriate icon
        - Include high/low temperature range (H:20° L:5°)
        - Use blue sky gradient background
        - Add animated sun with radiating rays
        - Implement smooth transitions for data updates
        - Create responsive card-like layout
        - Connect to external weather API for live data
        """,
        apply_concepts=["API integration", "real-time updates", "weather visualization"],
        style="modern"
    )
    
    if weather_result["success"]:
        print("✅ Generated weather widget scene successfully!")
        
        # Save the generated React code
        with open("/Users/elicharlese/CascadeProjects/AGENT/training_data/spline/generated_weather_widget.jsx", "w") as f:
            f.write(weather_result["web_code"]["code"])
        print("💾 Saved weather widget React component")
    
    # Get training progress
    print("📈 Checking training progress...")
    progress = await training_interface.get_training_progress()
    
    print("\n🎯 Training Session Summary:")
    print(f"📝 Notes processed: {progress['training_stats']['total_notes_processed']}")
    print(f"🎨 Scenes generated: {progress['training_stats']['total_scenes_generated']}")
    print(f"🧠 Concepts learned: {progress['training_stats']['concepts_learned']}")
    print(f"📚 Knowledge categories: {progress['training_stats']['knowledge_categories']}")
    
    print("\n✨ AGENT Capabilities Now Include:")
    for capability in progress['capabilities']['supported_formats']:
        print(f"  - {capability} code export")
    
    print("\n🚀 Ready to create immersive 3D experiences with:")
    print("  - Interactive data visualizations")
    print("  - Real-time API integrations") 
    print("  - Dynamic content updates")
    print("  - Professional UI components")
    
    return progress


if __name__ == "__main__":
    asyncio.run(start_spline_training_session())
