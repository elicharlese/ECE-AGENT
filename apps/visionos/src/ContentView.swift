import SwiftUI
import RealityKit

struct ContentView: View {
    var body: some View {
        NavigationView {
            VStack {
                Text("Welcome to VisionOS Spatial App")
                    .font(.largeTitle)
                    .padding()
                
                Spacer()
                
                RealityView { content in
                    // Add 3D content here
                    let anchor = AnchorEntity(.plane(.horizontal, classification: .any, minimumBounds: SIMD2<Float>(0.6, 0.6)))
                    let box = ModelEntity(mesh: .generateBox(size: 0.3), materials: [SimpleMaterial(color: .blue, isMetallic: false)])
                    anchor.addChild(box)
                    content.add(anchor)
                }
                .frame(width: 400, height: 400)
                
                Spacer()
            }
            .navigationTitle("Spatial Workspace")
        }
    }
}

#Preview {
    ContentView()
}</instructions>
</edit_file>