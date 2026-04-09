import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';

import { refreshLicenseRegistry } from '../../../modules/licenses/api/licenses-api';
import { LicenseRegistryTable } from '../../../modules/licenses/ui/license-registry-table';
import { getCurrentWeekDateRange } from '../../../shared/lib/date-range';
import { Button } from '../../../shared/ui/button/button';
import { DateRangePicker } from '../../../shared/ui/date-range/date-range-picker';
import { EmptyState } from '../../../shared/ui/empty-state/empty-state';
import { ErrorBlock } from '../../../shared/ui/error-block/error-block';
import { PageHeader } from '../../../shared/ui/page-header/page-header';

export function LicensesPage() {
  const [dateRange, setDateRange] = useState(getCurrentWeekDateRange());
  const refreshMutation = useMutation({
    mutationFn: refreshLicenseRegistry,
  });

  const registryData = refreshMutation.data;

  return (
    <div className="page-grid">
      <PageHeader
        title="Лицензии"
        subtitle="Импортируйте актуальные строки из реестра Google Sheets по кнопке обновления."
        actions={
          <Button
            type="button"
            onClick={() => refreshMutation.mutate(dateRange)}
            disabled={refreshMutation.isPending}
          >
            {refreshMutation.isPending ? 'Обновление...' : 'Обновить из реестра'}
          </Button>
        }
      />
      <div className="content-card">
        <DateRangePicker variant="panel" value={dateRange} onChange={setDateRange} />

        {refreshMutation.isError ? (
          <ErrorBlock
            title="Не удалось обновить реестр лицензий"
            message={refreshMutation.error.message}
            onRetry={() => refreshMutation.mutate(dateRange)}
          />
        ) : null}

        {!registryData && !refreshMutation.isPending && !refreshMutation.isError ? (
          <EmptyState
            title="Отчет по лицензиям еще не построен"
            message="Выберите период и нажмите «Обновить из реестра», чтобы собрать агрегированные строки по типам лицензий."
          />
        ) : null}

        {refreshMutation.isPending ? (
          <div className="feedback-card">
            <div className="feedback-title">Идет обновление реестра</div>
            <div className="feedback-message">
              Приложение читает лист Google Sheets и собирает строки для отображения.
            </div>
          </div>
        ) : null}

        {registryData ? (
          <div className="page-grid">
            <section className="stats-grid">
              <div className="stat-card">
                <div className="stat-label">Строк в выдаче лицензий</div>
                <div className="stat-value">{registryData.aggregatedRows}</div>
                <div className="stat-trend">Сводка по типам лицензий за выбранный период</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Строк реестра в периоде</div>
                <div className="stat-value">{registryData.matchedSourceRows}</div>
                <div className="stat-trend">
                  Из {registryData.totalSourceRows} непустых строк источника
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Источник</div>
                <div className="stat-value">{registryData.sourceSheetName}</div>
                <div className="stat-trend">
                  Обновлено {new Date(registryData.importedAt).toLocaleString('ru-RU')}
                </div>
              </div>
            </section>

            <div className="pill-row">
              <span className="pill">
                Период: {new Date(`${registryData.dateFrom}T00:00:00`).toLocaleDateString('ru-RU')} -{' '}
                {new Date(`${registryData.dateTo}T00:00:00`).toLocaleDateString('ru-RU')}
              </span>
              <span className="pill pill-neutral">Пропущено строк: {registryData.skippedRows}</span>
            </div>

            {registryData.warnings.length > 0 ? (
              <section className="license-registry-warnings">
                <div className="section-heading">
                  <h2>Пропущенные строки</h2>
                </div>
                <div className="list">
                  {registryData.warnings.map((warning) => (
                    <div key={`${warning.sourceRowNumber}-${warning.message}`} className="list-item">
                      <strong>Строка {warning.sourceRowNumber}</strong>
                      <div className="table-secondary">{warning.message}</div>
                    </div>
                  ))}
                </div>
              </section>
            ) : null}

            <section className="page-grid">
              <div className="section-heading">
                <h2>Выдача лицензий</h2>
                <a
                  href={registryData.sourceDocumentUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="pill pill-neutral"
                >
                  Открыть Google Sheet
                </a>
              </div>
              <LicenseRegistryTable rows={registryData.rows} />
            </section>
          </div>
        ) : null}
      </div>
    </div>
  );
}
