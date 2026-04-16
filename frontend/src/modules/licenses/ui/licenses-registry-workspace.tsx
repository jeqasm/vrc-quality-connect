import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';

import {
  createLicenseRegistryRecord,
  deleteLicenseRegistryRecord,
  getLicenseRegistrySnapshot,
  getLicensesMeta,
  updateLicenseRegistryRecord,
} from '../api/licenses-api';
import { LicenseRegistryRecord, LicenseRegistrySortBy, SortDirection } from '../model/license-registry';
import { exportLicenseRegistryToExcel } from '../lib/license-registry-excel-export';
import { LicenseRegistryRecordModal } from './license-registry-record-modal';
import { LicenseRegistryTable } from './license-registry-table';
import { Button } from '../../../shared/ui/button/button';
import { DateRangePicker } from '../../../shared/ui/date-range/date-range-picker';
import { ErrorBlock } from '../../../shared/ui/error-block/error-block';
import { Modal } from '../../../shared/ui/modal/modal';

export function LicensesRegistryWorkspace() {
  const initialVisibleCount = 10;
  const loadStepOptions = [10, 50, 100] as const;
  const queryClient = useQueryClient();
  const pendingScrollRestoreRef = useRef<number | null>(null);
  const [dateRange, setDateRange] = useState({
    dateFrom: '',
    dateTo: '',
  });
  const [visibleCount, setVisibleCount] = useState(initialVisibleCount);
  const [loadStep, setLoadStep] = useState<(typeof loadStepOptions)[number]>(10);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [licenseTypeId, setLicenseTypeId] = useState('');
  const [sortBy, setSortBy] = useState<LicenseRegistrySortBy>('issueDate');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [isCreateRowOpen, setIsCreateRowOpen] = useState(false);
  const [createDraft, setCreateDraft] = useState({
    issueDate: new Date().toISOString().slice(0, 10),
    licenseTypeId: '',
    quantity: '1',
    issuedTo: '',
    organizationName: '',
    recipientEmail: '',
    comment: '',
  });
  const [editingRecord, setEditingRecord] = useState<LicenseRegistryRecord | null>(null);
  const [recordToDelete, setRecordToDelete] = useState<LicenseRegistryRecord | null>(null);
  const [createErrorMessage, setCreateErrorMessage] = useState<string | null>(null);
  const [editErrorMessage, setEditErrorMessage] = useState<string | null>(null);
  const [deleteErrorMessage, setDeleteErrorMessage] = useState<string | null>(null);
  const [exportErrorMessage, setExportErrorMessage] = useState<string | null>(null);
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [isExportingExcel, setIsExportingExcel] = useState(false);

  const licenseRegistryQuery = useQuery({
    queryKey: ['licenses', 'registry', dateRange, visibleCount, search, licenseTypeId, sortBy, sortDirection],
    queryFn: () =>
      getLicenseRegistrySnapshot({
        ...dateRange,
        search,
        licenseTypeId,
        sortBy,
        sortDirection,
        limit: visibleCount,
        offset: 0,
      }),
    placeholderData: keepPreviousData,
  });
  const licensesMetaQuery = useQuery({
    queryKey: ['licenses', 'meta'],
    queryFn: getLicensesMeta,
  });

  const createMutation = useMutation({
    mutationFn: createLicenseRegistryRecord,
    onSuccess: async () => {
      setCreateErrorMessage(null);
      setIsCreateRowOpen(false);
      setCreateDraft({
        issueDate: new Date().toISOString().slice(0, 10),
        licenseTypeId: licensesMetaQuery.data?.licenseTypes[0]?.id ?? '',
        quantity: '1',
        issuedTo: '',
        organizationName: '',
        recipientEmail: '',
        comment: '',
      });
      await queryClient.invalidateQueries({ queryKey: ['licenses', 'registry'] });
    },
    onError: (error) => {
      setCreateErrorMessage(error instanceof Error ? error.message : 'Не удалось сохранить запись');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ recordId, payload }: { recordId: string; payload: Parameters<typeof updateLicenseRegistryRecord>[1] }) =>
      updateLicenseRegistryRecord(recordId, payload),
    onSuccess: async () => {
      setEditErrorMessage(null);
      setEditingRecord(null);
      setIsRecordModalOpen(false);
      await queryClient.invalidateQueries({ queryKey: ['licenses', 'registry'] });
    },
    onError: (error) => {
      setEditErrorMessage(error instanceof Error ? error.message : 'Не удалось обновить запись');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteLicenseRegistryRecord,
    onSuccess: async () => {
      setDeleteErrorMessage(null);
      setRecordToDelete(null);
      await queryClient.invalidateQueries({ queryKey: ['licenses', 'registry'] });
    },
    onError: (error) => {
      setDeleteErrorMessage(error instanceof Error ? error.message : 'Не удалось удалить запись');
    },
  });

  useEffect(() => {
    setVisibleCount(initialVisibleCount);
  }, [dateRange.dateFrom, dateRange.dateTo, search, licenseTypeId, sortBy, sortDirection]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setSearch(searchInput.trim());
    }, 350);

    return () => window.clearTimeout(timeoutId);
  }, [searchInput]);

  useEffect(() => {
    if (licenseRegistryQuery.isFetching || pendingScrollRestoreRef.current === null) {
      return;
    }

    window.scrollTo({
      top: pendingScrollRestoreRef.current,
      behavior: 'auto',
    });
    pendingScrollRestoreRef.current = null;
  }, [licenseRegistryQuery.isFetching, licenseRegistryQuery.data]);

  useEffect(() => {
    if (!licensesMetaQuery.data?.licenseTypes.length) {
      return;
    }

    setCreateDraft((current) =>
      current.licenseTypeId
        ? current
        : {
            ...current,
            issueDate: current.issueDate || new Date().toISOString().slice(0, 10),
            licenseTypeId: licensesMetaQuery.data.licenseTypes[0].id,
          },
    );
  }, [licensesMetaQuery.data]);

  function handleCreateDraftChange(
    name: 'issueDate' | 'licenseTypeId' | 'quantity' | 'issuedTo' | 'organizationName' | 'recipientEmail' | 'comment',
    value: string,
  ) {
    setCreateDraft((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function resetCreateRow() {
    setIsCreateRowOpen(false);
    setCreateErrorMessage(null);
    setCreateDraft({
      issueDate: new Date().toISOString().slice(0, 10),
      licenseTypeId: licensesMetaQuery.data?.licenseTypes[0]?.id ?? '',
      quantity: '1',
      issuedTo: '',
      organizationName: '',
      recipientEmail: '',
      comment: '',
    });
  }

  function handleSubmitCreateRow() {
    createMutation.mutate({
      issueDate: createDraft.issueDate,
      licenseTypeId: createDraft.licenseTypeId,
      quantity: Number(createDraft.quantity),
      issuedTo: createDraft.issuedTo.trim(),
      organizationName: createDraft.organizationName.trim() || undefined,
      recipientEmail: createDraft.recipientEmail.trim() || undefined,
      comment: createDraft.comment.trim() || undefined,
    });
  }

  function handleSort(nextSortBy: LicenseRegistrySortBy) {
    if (sortBy === nextSortBy) {
      setSortDirection((current) => (current === 'asc' ? 'desc' : 'asc'));
      return;
    }

    setSortBy(nextSortBy);
    setSortDirection(nextSortBy === 'issueDate' ? 'desc' : 'asc');
  }

  function handleResetFilters() {
    setDateRange({
      dateFrom: '',
      dateTo: '',
    });
    setSearchInput('');
    setSearch('');
    setLicenseTypeId('');
    setSortBy('issueDate');
    setSortDirection('desc');
  }

  async function handleExportExcel() {
    setExportErrorMessage(null);
    setIsExportingExcel(true);

    try {
      const exportBatchSize = 100;
      const initialSnapshot = await getLicenseRegistrySnapshot({
        ...dateRange,
        search,
        licenseTypeId,
        sortBy,
        sortDirection,
        limit: exportBatchSize,
        offset: 0,
      });
      const exportRows = [...initialSnapshot.rows];
      const totalRecords = initialSnapshot.totalRecords;

      for (let offset = exportRows.length; offset < totalRecords; offset += exportBatchSize) {
        const nextSnapshot = await getLicenseRegistrySnapshot({
          ...dateRange,
          search,
          licenseTypeId,
          sortBy,
          sortDirection,
          limit: exportBatchSize,
          offset,
        });

        if (nextSnapshot.rows.length === 0) {
          break;
        }

        exportRows.push(...nextSnapshot.rows);
      }

      const rangeFrom = dateRange.dateFrom || 'all';
      const rangeTo = dateRange.dateTo || 'all';
      const fileName = `license-registry-${rangeFrom}_to_${rangeTo}.xls`;

      exportLicenseRegistryToExcel({
        rows: exportRows,
        fileName,
      });
    } catch (error) {
      setExportErrorMessage(error instanceof Error ? error.message : 'Не удалось выгрузить реестр в Excel');
    } finally {
      setIsExportingExcel(false);
    }
  }

  return (
    <>
      <div className="content-card">
        <div className="licenses-filters">
          <DateRangePicker variant="panel" value={dateRange} onChange={setDateRange} allowEmpty />
        </div>

        <div className="licenses-toolbar">
          <label className="field-grid licenses-toolbar-search">
            <span>Поиск по имени, email или организации</span>
            <input
              className="field-input"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Получатель, email или организация"
            />
          </label>

          <label className="field-grid licenses-toolbar-filter">
            <span>Тип лицензии</span>
            <select
              className="field-select"
              value={licenseTypeId}
              onChange={(event) => setLicenseTypeId(event.target.value)}
            >
              <option value="">Все типы</option>
              {(licensesMetaQuery.data?.licenseTypes ?? []).map((licenseType) => (
                <option key={licenseType.id} value={licenseType.id}>
                  {licenseType.name}
                </option>
              ))}
            </select>
          </label>

          <div className="licenses-toolbar-actions">
            <Button type="button" variant="secondary" onClick={() => void handleExportExcel()} disabled={isExportingExcel}>
              {isExportingExcel ? 'Экспорт...' : 'Экспорт в Excel'}
            </Button>
            <Button type="button" variant="ghost" onClick={handleResetFilters}>
              Сбросить
            </Button>
          </div>
        </div>

        {exportErrorMessage ? <div className="form-inline-notice">{exportErrorMessage}</div> : null}

        {licenseRegistryQuery.isError ? (
          <ErrorBlock
            title="Не удалось загрузить реестр лицензий"
            message={licenseRegistryQuery.error.message}
            onRetry={() => void licenseRegistryQuery.refetch()}
          />
        ) : null}

        {licenseRegistryQuery.isLoading ? (
          <div className="feedback-card">
            <div className="feedback-title">Загружаем записи лицензий</div>
            <div className="feedback-message">
              Подготавливаем реестр и статистику за выбранный период.
            </div>
          </div>
        ) : null}

        {licenseRegistryQuery.data ? (
          <div className="page-grid">
            <div className="license-registry-sheet">
              <LicenseRegistryTable
                rows={licenseRegistryQuery.data.rows}
                licenseTypes={licensesMetaQuery.data?.licenseTypes ?? []}
                isCreateRowOpen={isCreateRowOpen}
                isCreateSubmitting={createMutation.isPending}
                createErrorMessage={createErrorMessage}
                createDraft={createDraft}
                onOpenCreateRow={() => {
                  setCreateErrorMessage(null);
                  setIsCreateRowOpen(true);
                }}
                onCloseCreateRow={resetCreateRow}
                onChangeCreateDraft={handleCreateDraftChange}
                onSubmitCreateRow={handleSubmitCreateRow}
                onEdit={(record) => {
                  setEditingRecord(record);
                  setEditErrorMessage(null);
                  setIsRecordModalOpen(true);
                }}
                onDelete={(record) => {
                  setRecordToDelete(record);
                  setDeleteErrorMessage(null);
                }}
                sortBy={sortBy}
                sortDirection={sortDirection}
                onSort={handleSort}
              />

              <div className="license-registry-toolbar">
                <div className="license-registry-progress">
                  {licenseRegistryQuery.data.rows.length} записей из {licenseRegistryQuery.data.totalRecords}
                </div>

                {licenseRegistryQuery.data.rows.length < licenseRegistryQuery.data.totalRecords ? (
                  <Button
                    type="button"
                    variant="ghost"
                    className="license-registry-load-more-button"
                    onClick={() => {
                      pendingScrollRestoreRef.current = window.scrollY;
                      setVisibleCount((current) => current + loadStep);
                    }}
                    disabled={licenseRegistryQuery.isFetching}
                  >
                    {licenseRegistryQuery.isFetching ? 'Загрузка...' : 'Показать еще'}
                  </Button>
                ) : null}

                <div className="license-registry-stepper" role="group" aria-label="Шаг подгрузки записей">
                  <span className="license-registry-stepper-label">Показывать еще:</span>
                  <div className="license-registry-stepper-options">
                    {loadStepOptions.map((option) => (
                      <button
                        key={option}
                        type="button"
                        className={`license-registry-step-button${loadStep === option ? ' license-registry-step-button-active' : ''}`}
                        onClick={() => setLoadStep(option)}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      <LicenseRegistryRecordModal
        isOpen={isRecordModalOpen}
        initialRecord={editingRecord}
        licenseTypes={licensesMetaQuery.data?.licenseTypes ?? []}
        isSubmitting={updateMutation.isPending}
        errorMessage={editErrorMessage}
        onClose={() => {
          if (updateMutation.isPending) {
            return;
          }

          setIsRecordModalOpen(false);
          setEditingRecord(null);
          setEditErrorMessage(null);
        }}
        onSubmit={(payload) => {
          if (!editingRecord) {
            return;
          }

          updateMutation.mutate({
            recordId: editingRecord.id,
            payload,
          });
        }}
      />

      <Modal
        isOpen={Boolean(recordToDelete)}
        title="Удалить запись лицензии"
        description="Запись будет удалена из внутреннего реестра и перестанет участвовать в статистике."
        onClose={() => {
          if (deleteMutation.isPending) {
            return;
          }

          setRecordToDelete(null);
          setDeleteErrorMessage(null);
        }}
      >
        {recordToDelete ? (
          <div className="form-grid">
            <div className="compact-empty-state">
              <strong>{recordToDelete.licenseType.name}</strong>
              <div className="muted-text">
                {recordToDelete.issuedTo} · {recordToDelete.quantity}
              </div>
            </div>

            {deleteErrorMessage ? <div className="form-inline-notice">{deleteErrorMessage}</div> : null}

            <div className="actions-row">
              <Button type="button" disabled={deleteMutation.isPending} onClick={() => deleteMutation.mutate(recordToDelete.id)}>
                {deleteMutation.isPending ? 'Удаление...' : 'Подтвердить удаление'}
              </Button>
              <Button
                type="button"
                variant="ghost"
                disabled={deleteMutation.isPending}
                onClick={() => {
                  setRecordToDelete(null);
                  setDeleteErrorMessage(null);
                }}
              >
                Отмена
              </Button>
            </div>
          </div>
        ) : null}
      </Modal>
    </>
  );
}
