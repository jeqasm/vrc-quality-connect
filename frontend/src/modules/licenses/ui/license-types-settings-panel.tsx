import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FormEvent, useState } from 'react';

import { createLicenseType, deleteLicenseType, getLicenseTypes } from '../api/licenses-api';
import { Button } from '../../../shared/ui/button/button';
import { EmptyState } from '../../../shared/ui/empty-state/empty-state';

export function LicenseTypesSettingsPanel() {
  const queryClient = useQueryClient();
  const [nameDraft, setNameDraft] = useState('');
  const [formErrorMessage, setFormErrorMessage] = useState<string | null>(null);

  const licenseTypesQuery = useQuery({
    queryKey: ['license-types'],
    queryFn: getLicenseTypes,
  });

  const createMutation = useMutation({
    mutationFn: createLicenseType,
    onSuccess: async () => {
      setNameDraft('');
      setFormErrorMessage(null);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['license-types'] }),
        queryClient.invalidateQueries({ queryKey: ['licenses', 'meta'] }),
      ]);
    },
    onError: (error) => {
      setFormErrorMessage(error instanceof Error ? error.message : 'Не удалось добавить тип лицензии');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteLicenseType,
    onSuccess: async () => {
      setFormErrorMessage(null);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['license-types'] }),
        queryClient.invalidateQueries({ queryKey: ['licenses', 'meta'] }),
      ]);
    },
    onError: (error) => {
      setFormErrorMessage(error instanceof Error ? error.message : 'Не удалось удалить тип лицензии');
    },
  });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedName = nameDraft.replace(/\s+/g, ' ').trim();

    if (!normalizedName) {
      setFormErrorMessage('Введите название типа лицензии');
      return;
    }

    setFormErrorMessage(null);
    createMutation.mutate({ name: normalizedName });
  }

  if (licenseTypesQuery.isLoading) {
    return <div className="muted-text">Загрузка справочника лицензий...</div>;
  }

  if (licenseTypesQuery.isError) {
    return (
      <div className="content-card">
        <EmptyState
          title="Не удалось загрузить справочник лицензий"
          message={licenseTypesQuery.error.message}
        />
      </div>
    );
  }

  const licenseTypes = licenseTypesQuery.data ?? [];

  return (
    <div className="settings-license-types-card">
      <p className="card-subtitle">Управление значениями справочника "Тип лицензии".</p>

      <form className="settings-license-types-form" onSubmit={handleSubmit}>
        <input
          className="field-input"
          value={nameDraft}
          onChange={(event) => setNameDraft(event.target.value)}
          placeholder="Новый тип лицензии"
          maxLength={255}
        />
        <Button type="submit" disabled={createMutation.isPending}>
          {createMutation.isPending ? 'Добавление...' : 'Добавить'}
        </Button>
      </form>

      {formErrorMessage ? <div className="form-inline-notice">{formErrorMessage}</div> : null}

      {licenseTypes.length === 0 ? (
        <div className="license-types-empty">Справочник пока пуст.</div>
      ) : (
        <div className="license-types-list">
          {licenseTypes.map((licenseType) => (
            <div key={licenseType.id} className="license-types-list-item">
              <span className="license-types-name">{licenseType.name}</span>
              <Button
                type="button"
                variant="ghost"
                className="license-types-delete-button"
                disabled={deleteMutation.isPending}
                onClick={() => deleteMutation.mutate(licenseType.id)}
              >
                Удалить
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
