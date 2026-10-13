import { BrowserRouter } from "react-router-dom";
import { AppProviders } from "./providers";
import { ErrorBoundary } from "./ErrorBoundary";

function App() {
  return (
    <ErrorBoundary>
      <AppProviders>
        <BrowserRouter>
          <p>Mbopo Akwa Ibom Admin Portal — scaffold</p>
        </BrowserRouter>
      </AppProviders>
    </ErrorBoundary>
  );
}

export default App;
