export default function EnvironmentDisplay() {
  return (
    <div>
      <h1>Environment Variables</h1>
      <p>API Base URL: {process.env.NEXT_PUBLIC_API_BASE_URL}</p>
      <p>Environment: {process.env.NEXT_PUBLIC_ENVIRONMENT}</p>
      <p>Analytics ID: {process.env.NEXT_PUBLIC_ANALYTICS_ID}</p>
    </div>
  );
}
