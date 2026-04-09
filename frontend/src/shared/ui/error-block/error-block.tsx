import { Button } from '../button/button';

type ErrorBlockProps = {
  title: string;
  message: string;
  onRetry?: () => void;
};

export function ErrorBlock(props: ErrorBlockProps) {
  return (
    <div className="feedback-card feedback-card-error">
      <div className="feedback-title">{props.title}</div>
      <div className="feedback-message">{props.message}</div>
      {props.onRetry ? (
        <div className="feedback-actions">
          <Button type="button" variant="secondary" onClick={props.onRetry}>
            Retry
          </Button>
        </div>
      ) : null}
    </div>
  );
}
