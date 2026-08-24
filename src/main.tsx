import React from "react";
import ReactDOM from "react-dom/client";
import Home from "../app/page";
import "../app/globals.css";

class AppErrorBoundary extends React.Component<
  React.PropsWithChildren,
  { message: string | null }
> {
  state = { message: null };

  static getDerivedStateFromError(error: Error) {
    return { message: error.message };
  }

  render() {
    if (this.state.message) {
      return <p role="alert">Kalenderen kunne ikke vises: {this.state.message}</p>;
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AppErrorBoundary>
      <Home />
    </AppErrorBoundary>
  </React.StrictMode>,
);
