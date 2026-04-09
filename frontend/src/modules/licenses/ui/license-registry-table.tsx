import { LicenseRegistryRow } from '../model/license-registry';

type LicenseRegistryTableProps = {
  rows: LicenseRegistryRow[];
};

export function LicenseRegistryTable({ rows }: LicenseRegistryTableProps) {
  return (
    <div className="table-wrapper">
      <table className="data-table license-registry-table">
        <thead>
          <tr>
            <th>Тип лицензии</th>
            <th>Количество</th>
            <th>Кому выдано</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.licenseType}>
              <td>{row.licenseType}</td>
              <td>{row.quantity}</td>
              <td>{row.issuedTo}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
