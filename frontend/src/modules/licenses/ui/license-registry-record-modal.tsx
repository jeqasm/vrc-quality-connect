import { FormEvent, useEffect, useState } from 'react';

import { Button } from '../../../shared/ui/button/button';
import { FormField } from '../../../shared/ui/form-field/form-field';
import { Input } from '../../../shared/ui/input/input';
import { Modal } from '../../../shared/ui/modal/modal';
import { Textarea } from '../../../shared/ui/textarea/textarea';
import { LicenseRegistryRecord, LicenseTypeOption } from '../model/license-registry';

type LicenseRegistryRecordModalProps = {
  isOpen: boolean;
  licenseTypes: LicenseTypeOption[];
  initialRecord?: LicenseRegistryRecord | null;
  isSubmitting: boolean;
  errorMessage?: string | null;
  onClose: () => void;
  onSubmit: (payload: {
    issueDate: string;
    licenseTypeId: string;
    quantity: number;
    organizationName?: string;
    recipientEmail?: string;
    issuedTo: string;
    comment?: string;
  }) => void;
};

export function LicenseRegistryRecordModal(props: LicenseRegistryRecordModalProps) {
  const [formState, setFormState] = useState({
    issueDate: '',
    licenseTypeId: '',
    quantity: '1',
    organizationName: '',
    recipientEmail: '',
    issuedTo: '',
    comment: '',
  });

  useEffect(() => {
    if (!props.isOpen) {
      return;
    }

    setFormState({
      issueDate: props.initialRecord?.issueDate ?? new Date().toISOString().slice(0, 10),
      licenseTypeId: props.initialRecord?.licenseType.id ?? props.licenseTypes[0]?.id ?? '',
      quantity: String(props.initialRecord?.quantity ?? 1),
      organizationName: props.initialRecord?.organizationName ?? '',
      recipientEmail: props.initialRecord?.recipientEmail ?? '',
      issuedTo: props.initialRecord?.issuedTo ?? '',
      comment: props.initialRecord?.comment ?? '',
    });
  }, [props.initialRecord, props.isOpen, props.licenseTypes]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    props.onSubmit({
      issueDate: formState.issueDate,
      licenseTypeId: formState.licenseTypeId,
      quantity: Number(formState.quantity),
      organizationName: formState.organizationName.trim() || undefined,
      recipientEmail: formState.recipientEmail.trim() || undefined,
      issuedTo: formState.issuedTo.trim(),
      comment: formState.comment.trim() || undefined,
    });
  }

  return (
    <Modal
      isOpen={props.isOpen}
      title={props.initialRecord ? 'Изменить запись' : 'Добавить запись'}
      description="Запись лицензии добавляется сразу во внутренний реестр и участвует в статистике."
      onClose={props.onClose}
    >
      <form className="form-grid" onSubmit={handleSubmit}>
        <div className="settings-account-fields-row">
          <FormField htmlFor="license-record-date" label="Дата">
            <Input
              id="license-record-date"
              type="date"
              value={formState.issueDate}
              onChange={(event) => setFormState((current) => ({ ...current, issueDate: event.target.value }))}
              required
            />
          </FormField>

          <FormField htmlFor="license-record-type" label="Тип лицензии">
            <select
              id="license-record-type"
              className="field-select"
              value={formState.licenseTypeId}
              onChange={(event) => setFormState((current) => ({ ...current, licenseTypeId: event.target.value }))}
              required
            >
              {props.licenseTypes.map((licenseType) => (
                <option key={licenseType.id} value={licenseType.id}>
                  {licenseType.name}
                </option>
              ))}
            </select>
          </FormField>
        </div>

        <div className="settings-account-fields-row">
          <FormField htmlFor="license-record-quantity" label="Количество">
            <Input
              id="license-record-quantity"
              type="number"
              min={1}
              value={formState.quantity}
              onChange={(event) => setFormState((current) => ({ ...current, quantity: event.target.value }))}
              required
            />
          </FormField>

          <FormField htmlFor="license-record-issued-to" label="Кому выдано">
            <Input
              id="license-record-issued-to"
              value={formState.issuedTo}
              onChange={(event) => setFormState((current) => ({ ...current, issuedTo: event.target.value }))}
              required
            />
          </FormField>
        </div>

        <div className="settings-account-fields-row">
          <FormField htmlFor="license-record-organization" label="Организация">
            <Input
              id="license-record-organization"
              value={formState.organizationName}
              onChange={(event) =>
                setFormState((current) => ({ ...current, organizationName: event.target.value }))
              }
            />
          </FormField>

          <FormField htmlFor="license-record-email" label="Email">
            <Input
              id="license-record-email"
              type="email"
              value={formState.recipientEmail}
              onChange={(event) =>
                setFormState((current) => ({ ...current, recipientEmail: event.target.value }))
              }
            />
          </FormField>
        </div>

        <FormField htmlFor="license-record-comment" label="Комментарий">
          <Textarea
            id="license-record-comment"
            value={formState.comment}
            onChange={(event) => setFormState((current) => ({ ...current, comment: event.target.value }))}
            className="compact-textarea"
          />
        </FormField>

        {props.errorMessage ? <div className="form-inline-notice">{props.errorMessage}</div> : null}

        <div className="actions-row">
          <Button type="submit" disabled={props.isSubmitting}>
            {props.isSubmitting ? 'Сохранение...' : 'Сохранить'}
          </Button>
          <Button type="button" variant="ghost" disabled={props.isSubmitting} onClick={props.onClose}>
            Отмена
          </Button>
        </div>
      </form>
    </Modal>
  );
}
