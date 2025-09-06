// Expo entrypoint - re-export the TypeScript app (robust Metro resolution)
// Using require here avoids any resolver quirks with file extensions
const App = require('./src/app/App').default
export default App
