import { Button } from '../../../shared/ui/button/button';
import { LicenseRegistryRecord, LicenseTypeOption } from '../model/license-registry';

type LicenseRegistryTableProps = {
  rows: LicenseRegistryRecord[];
  licenseTypes: LicenseTypeOption[];
  isCreateRowOpen: boolean;
  isCreateSubmitting: boolean;
  createErrorMessage?: string | null;
  createDraft: {
    issueDate: string;
    licenseTypeId: string;
    quantity: string;
    issuedTo: string;
    organizationName: string;
    recipientEmail: string;
    comment: string;
  };
  onOpenCreateRow: () => void;
  onCloseCreateRow: () => void;
  onChangeCreateDraft: (
    name: 'issueDate' | 'licenseTypeId' | 'quantity' | 'issuedTo' | 'organizationName' | 'recipientEmail' | 'comment',
    value: string,
  ) => void;
  onSubmitCreateRow: () => void;
  onEdit: (record: LicenseRegistryRecord) => void;
  onDelete: (record: LicenseRegistryRecord) => void;
};

export function LicenseRegistryTable(props: LicenseRegistryTableProps) {
  return (
    <div className="table-wrapper license-sheet-table-wrapper">
      <table className="data-table license-registry-table">
        <thead>
          <tr>
            <th>Дата</th>
            <th>Тип лицензии</th>
            <th>Количество</th>
            <th>Кому выдано</th>
            <th>Организация</th>
            <th>Email</th>
            <th>Комментарий</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          <tr className="license-registry-create-toggle-row">
            <td colSpan={8}>
              {props.isCreateRowOpen ? (
                <div className="license-registry-create-row-shell">
                  <div className="license-registry-create-row-title">Новая запись</div>
                  <div className="license-registry-create-grid">
                    <input
                      className="field-input license-registry-inline-input"
                      type="date"
                      value={props.createDraft.issueDate}
                      onChange={(event) => props.onChangeCreateDraft('issueDate', event.target.value)}
                    />
                    <select
                      className="field-select license-registry-inline-select"
                      value={props.createDraft.licenseTypeId}
                      onChange={(event) => props.onChangeCreateDraft('licenseTypeId', event.target.value)}
                    >
                      {props.licenseTypes.map((licenseType) => (
                        <option key={licenseType.id} value={licenseType.id}>
                          {licenseType.name}
                        </option>
                      ))}
                    </select>
                    <input
                      className="field-input license-registry-inline-input"
                      type="number"
                      min={1}
                      value={props.createDraft.quantity}
                      onChange={(event) => props.onChangeCreateDraft('quantity', event.target.value)}
                    />
                    <input
                      className="field-input license-registry-inline-input"
                      value={props.createDraft.issuedTo}
                      onChange={(event) => props.onChangeCreateDraft('issuedTo', event.target.value)}
                      placeholder="Получатель"
                    />
                    <input
                      className="field-input license-registry-inline-input"
                      value={props.createDraft.organizationName}
                      onChange={(event) => props.onChangeCreateDraft('organizationName', event.target.value)}
                      placeholder="Организация"
                    />
                    <input
                      className="field-input license-registry-inline-input"
                      type="email"
                      value={props.createDraft.recipientEmail}
                      onChange={(event) => props.onChangeCreateDraft('recipientEmail', event.target.value)}
                      placeholder="Email"
                    />
                    <input
                      className="field-input license-registry-inline-input"
                      value={props.createDraft.comment}
                      onChange={(event) => props.onChangeCreateDraft('comment', event.target.value)}
                      placeholder="Комментарий"
                    />
                    <div className="license-registry-inline-actions">
                      <Button type="button" disabled={props.isCreateSubmitting} onClick={props.onSubmitCreateRow}>
                        {props.isCreateSubmitting ? '...' : 'Сохранить'}
                      </Button>
                      <Button type="button" variant="ghost" disabled={props.isCreateSubmitting} onClick={props.onCloseCreateRow}>
                        Отмена
                      </Button>
                    </div>
                  </div>
                  {props.createErrorMessage ? (
                    <div className="form-inline-notice">{props.createErrorMessage}</div>
                  ) : null}
                </div>
              ) : (
                <button type="button" className="license-registry-plus-row" onClick={props.onOpenCreateRow}>
                  <span className="license-registry-plus-icon">+</span>
                  <span>Добавить запись</span>
                </button>
              )}
            </td>
          </tr>
          {props.rows.length > 0 ? (
            props.rows.map((row) => (
              <tr key={row.id}>
                <td>{new Date(`${row.issueDate}T00:00:00`).toLocaleDateString('ru-RU')}</td>
                <td>{row.licenseType.name}</td>
                <td>{row.quantity}</td>
                <td>{row.issuedTo}</td>
                <td>{row.organizationName || '—'}</td>
                <td>{row.recipientEmail || '—'}</td>
                <td>{row.comment || '—'}</td>
                <td>
                  <div className="license-table-actions">
                    <Button type="button" variant="ghost" className="license-table-action" onClick={() => props.onEdit(row)}>
                      Изм.
                    </Button>
                    <Button type="button" variant="ghost" className="license-table-delete" onClick={() => props.onDelete(row)}>
                      Удал.
                    </Button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr className="license-registry-empty-row">
              <td colSpan={8}>
                <div className="license-registry-empty-state">
                  <strong>Реестр пока пуст</strong>
                  <span>Добавь первую запись, и она появится в первой строке таблицы.</span>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
