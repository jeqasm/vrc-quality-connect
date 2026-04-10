import { FormEvent, useEffect, useState } from 'react';

import { Button } from '../../../shared/ui/button/button';
import { Input } from '../../../shared/ui/input/input';
import { Textarea } from '../../../shared/ui/textarea/textarea';
import { ReferenceDataBundle } from '../../reference-data/model/reference-data';
import { CreateActivityRecordPayload } from '../model/activity-record';
import { ActivityRecordZoneDefinition } from '../model/activity-record-zone';

type ActivityRecordCreateFormProps = {
  referenceData: ReferenceDataBundle;
  zone: ActivityRecordZoneDefinition;
  isSubmitting: boolean;
  submitErrorMessage?: string | null;
  onSubmit: (
    payload: CreateActivityRecordPayload,
    options: { keepOpen: boolean },
  ) => Promise<void> | void;
  onCancel: () => void;
  onSubmitted?: () => void;
};

type FormState = {
  workDate: string;
  userId: string;
  departmentId: string;
  activityTypeId: string;
  activityResultId: string;
  durationMinutes: string;
  title: string;
  description: string;
  comment: string;
  externalId: string;
  externalUrl: string;
};

type FormErrors = Partial<Record<keyof FormState, string>>;

const today = new Date().toISOString().slice(0, 10);

const initialFormState: FormState = {
  workDate: today,
  userId: '',
  departmentId: '',
  activityTypeId: '',
  activityResultId: '',
  durationMinutes: '60',
  title: '',
  description: '',
  comment: '',
  externalId: '',
  externalUrl: '',
};

export function ActivityRecordCreateForm(props: ActivityRecordCreateFormProps) {
  const [formState, setFormState] = useState<FormState>(initialFormState);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitMode, setSubmitMode] = useState<'close' | 'continue'>('close');

  useEffect(() => {
    const defaultUser = props.referenceData.users[0];

    setFormState((current) => {
      if (current.userId || !defaultUser) {
        return current;
      }

      return {
        ...current,
        userId: defaultUser.id,
        departmentId: defaultUser.department.id,
      };
    });
  }, [props.referenceData.users]);

  useEffect(() => {
    const selectedUser = props.referenceData.users.find((user) => user.id === formState.userId);

    setFormState((current) => ({
      ...current,
      departmentId: selectedUser?.department.id ?? '',
    }));
  }, [formState.userId, props.referenceData.users]);

  function validate(nextState: FormState): FormErrors {
    const nextErrors: FormErrors = {};

    if (!nextState.workDate) {
      nextErrors.workDate = 'Enter a work date.';
    }

    if (!nextState.userId) {
      nextErrors.userId = 'Select a user.';
    }

    if (!nextState.departmentId) {
      nextErrors.departmentId = 'Department is required.';
    }

    if (!nextState.activityTypeId) {
      nextErrors.activityTypeId = 'Select an activity type.';
    }

    if (!nextState.activityResultId) {
      nextErrors.activityResultId = 'Select an activity result.';
    }

    if (!nextState.durationMinutes || Number(nextState.durationMinutes) <= 0) {
      nextErrors.durationMinutes = 'Duration must be greater than 0.';
    }

    if (!nextState.title.trim()) {
      nextErrors.title = 'Enter a short title.';
    }

    if (nextState.externalUrl && !/^https?:\/\/.+/i.test(nextState.externalUrl)) {
      nextErrors.externalUrl = 'Use a valid URL starting with http:// or https://.';
    }

    return nextErrors;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors = validate(formState);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    await props.onSubmit(
      {
        workDate: formState.workDate,
        userId: formState.userId,
        departmentId: formState.departmentId,
        activityTypeId: formState.activityTypeId,
        activityResultId: formState.activityResultId,
        durationMinutes: Number(formState.durationMinutes),
        title: formState.title.trim(),
        description: formState.description.trim() || undefined,
        comment: formState.comment.trim() || undefined,
        externalId: formState.externalId.trim() || undefined,
        externalUrl: formState.externalUrl.trim() || undefined,
      },
      { keepOpen: submitMode === 'continue' },
    );

    setErrors({});

    if (submitMode === 'continue') {
      setFormState((current) => ({
        workDate: current.workDate,
        userId: current.userId,
        departmentId: current.departmentId,
        activityTypeId: current.activityTypeId,
        activityResultId: current.activityResultId,
        durationMinutes: current.durationMinutes,
        title: '',
        description: '',
        comment: '',
        externalId: '',
        externalUrl: '',
      }));
      return;
    }

    setFormState((current) => ({
      ...initialFormState,
      userId: current.userId,
      departmentId: current.departmentId,
    }));
    props.onSubmitted?.();
  }

  function updateField(name: keyof FormState, value: string) {
    setFormState((current) => ({
      ...current,
      [name]: value,
    }));
    setErrors((current) => ({
      ...current,
      [name]: undefined,
    }));
  }

  return (
    <form className="form-grid" onSubmit={handleSubmit}>
      <div className="drawer-form-section">
        <div className="drawer-form-heading">Main fields</div>
        <div className="drawer-form-caption">
          Required fields are grouped at the top for fast entry.
        </div>
      </div>

      <label className="field-grid">
        <span>Work date</span>
        <Input
          className={errors.workDate ? 'field-error' : undefined}
          type="date"
          value={formState.workDate}
          onChange={(event) => updateField('workDate', event.target.value)}
        />
        {errors.workDate ? <div className="error-text">{errors.workDate}</div> : null}
      </label>

      <label className="field-grid">
        <span>User</span>
        <select
          className={`field-select ${errors.userId ? 'field-error' : ''}`.trim()}
          value={formState.userId}
          onChange={(event) => updateField('userId', event.target.value)}
        >
          <option value="" disabled hidden={formState.userId !== ''}>
            Select user
          </option>
          {props.referenceData.users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.fullName}
            </option>
          ))}
        </select>
        {errors.userId ? <div className="error-text">{errors.userId}</div> : null}
      </label>

      <label className="field-grid">
        <span>Department</span>
        <select
          className={`field-select ${errors.departmentId ? 'field-error' : ''}`.trim()}
          value={formState.departmentId}
          disabled
        >
          <option value="" disabled hidden={formState.departmentId !== ''}>
            Resolved from user
          </option>
          {props.referenceData.departments.map((department) => (
            <option key={department.id} value={department.id}>
              {department.name}
            </option>
          ))}
        </select>
        {errors.departmentId ? <div className="error-text">{errors.departmentId}</div> : null}
      </label>

      <label className="field-grid">
        <span>Activity type</span>
        <select
          className={`field-select ${errors.activityTypeId ? 'field-error' : ''}`.trim()}
          value={formState.activityTypeId}
          onChange={(event) => updateField('activityTypeId', event.target.value)}
        >
          <option value="" disabled hidden={formState.activityTypeId !== ''}>
            Select activity type
          </option>
          {props.referenceData.activityTypes.map((activityType) => (
            <option key={activityType.id} value={activityType.id}>
              {activityType.name}
            </option>
          ))}
        </select>
        {errors.activityTypeId ? <div className="error-text">{errors.activityTypeId}</div> : null}
      </label>

      <label className="field-grid">
        <span>Activity result</span>
        <select
          className={`field-select ${errors.activityResultId ? 'field-error' : ''}`.trim()}
          value={formState.activityResultId}
          onChange={(event) => updateField('activityResultId', event.target.value)}
        >
          <option value="" disabled hidden={formState.activityResultId !== ''}>
            Select activity result
          </option>
          {props.referenceData.activityResults.map((activityResult) => (
            <option key={activityResult.id} value={activityResult.id}>
              {activityResult.name}
            </option>
          ))}
        </select>
        {errors.activityResultId ? <div className="error-text">{errors.activityResultId}</div> : null}
      </label>

      <label className="field-grid">
        <span>Duration minutes</span>
        <Input
          className={errors.durationMinutes ? 'field-error' : undefined}
          type="number"
          min="1"
          max="1440"
          value={formState.durationMinutes}
          onChange={(event) => updateField('durationMinutes', event.target.value)}
        />
        {errors.durationMinutes ? <div className="error-text">{errors.durationMinutes}</div> : null}
      </label>

      <label className="field-grid">
        <span>Title</span>
        <Input
          className={errors.title ? 'field-error' : undefined}
          value={formState.title}
          onChange={(event) => updateField('title', event.target.value)}
          placeholder={props.zone.titlePlaceholder}
        />
        {errors.title ? <div className="error-text">{errors.title}</div> : null}
      </label>

      <div className="drawer-form-section drawer-form-section-spaced">
        <div className="drawer-form-heading">Optional fields</div>
        <div className="drawer-form-caption">
          Use these when extra context or integration links are useful.
        </div>
      </div>

      <label className="field-grid">
        <span>{props.zone.optionalLabels.description}</span>
        <Textarea
          className="compact-textarea"
          value={formState.description}
          onChange={(event) => updateField('description', event.target.value)}
          placeholder="Short operational context"
        />
      </label>

      <label className="field-grid">
        <span>{props.zone.optionalLabels.comment}</span>
        <Textarea
          className="compact-textarea"
          value={formState.comment}
          onChange={(event) => updateField('comment', event.target.value)}
        />
      </label>

      <label className="field-grid">
        <span>{props.zone.optionalLabels.externalId}</span>
        <Input
          value={formState.externalId}
          onChange={(event) => updateField('externalId', event.target.value)}
        />
      </label>

      <label className="field-grid">
        <span>{props.zone.optionalLabels.externalUrl}</span>
        <Input
          className={errors.externalUrl ? 'field-error' : undefined}
          type="url"
          value={formState.externalUrl}
          onChange={(event) => updateField('externalUrl', event.target.value)}
          placeholder="https://..."
        />
        {errors.externalUrl ? <div className="error-text">{errors.externalUrl}</div> : null}
      </label>

      {props.submitErrorMessage ? (
        <div className="form-inline-notice" role="alert">
          {props.submitErrorMessage}
        </div>
      ) : null}

      <div className="actions-row drawer-form-actions">
        <Button type="submit" disabled={props.isSubmitting} onClick={() => setSubmitMode('close')}>
          {props.isSubmitting && submitMode === 'close' ? 'Saving...' : 'Save'}
        </Button>
        <Button
          type="submit"
          variant="secondary"
          disabled={props.isSubmitting}
          onClick={() => setSubmitMode('continue')}
        >
          {props.isSubmitting && submitMode === 'continue'
            ? 'Saving...'
            : 'Save and add another'}
        </Button>
        <Button type="button" variant="ghost" disabled={props.isSubmitting} onClick={props.onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
