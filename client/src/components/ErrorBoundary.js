import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_error) {
    return { hasError: true };
  }

  componentDidUpdate(prevProps, _previousState) {
    if (!this.props.hasError && prevProps.hasError) {
      this.setState({ hasError: false });
    }
  }

  componentDidCatch(_error, _errorInfo) {
    this.props.setHasError(true);
  }

  render() {
    return this.state.hasError ? (
      <h1>There was an error</h1>
    ) : (
      this.props.children
    );
  }
}
export default ErrorBoundary;


