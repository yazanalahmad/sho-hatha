import { isRouteErrorResponse, useNavigate, useRouteError } from 'react-router-dom';
import { PageFrame } from '../components/shared/PageFrame';

export function ErrorPage() {
  const navigate = useNavigate();
  const error = useRouteError();

  let message = 'Something went wrong. Please try again.';
  if (isRouteErrorResponse(error)) {
    message = `${error.status} ${error.statusText}`;
  } else if (error instanceof Error) {
    message = error.message;
  }

  return (
    <PageFrame>
      <div className="card p-8 text-center space-y-4">
        <h1 className="text-5xl text-wrong">Unexpected error</h1>
        <p className="text-lg">{message}</p>
        <button
          type="button"
          className="bg-gold text-bg-base font-display text-2xl px-8 py-3"
          onClick={() => navigate('/', { replace: true })}
        >
          Go back to setup
        </button>
      </div>
    </PageFrame>
  );
}
