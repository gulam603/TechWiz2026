import { useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import DataTable from 'datatables.net-react';
import DT from 'datatables.net-bs5';
import 'datatables.net-responsive-bs5';
import 'datatables.net-buttons-bs5';
import 'datatables.net-buttons/js/buttons.html5.mjs';
import 'datatables.net-buttons/js/buttons.print.mjs';
import JSZip from 'jszip';
import 'datatables.net-bs5/css/dataTables.bootstrap5.css';
import 'datatables.net-responsive-bs5/css/responsive.bootstrap5.css';
import 'datatables.net-buttons-bs5/css/buttons.bootstrap5.css';
import { api } from '../../api/client';

DT.Buttons.jszip(JSZip); // Excel export
// Tell the React component which DataTables build to use (named so the hooks linter does not mistake it for React's use())
const registerLibrary = DataTable.use;
registerLibrary(DT);

const LANGUAGE = {
  search: '',
  searchPlaceholder: 'Search…',
  lengthMenu: '_MENU_ per page',
  info: 'Showing _START_–_END_ of _TOTAL_',
  infoEmpty: 'No rows',
  infoFiltered: '(filtered from _MAX_)',
  emptyTable: 'Nothing here yet',
  zeroRecords: 'No matching rows',
  processing: '<span class="spinner-border spinner-border-sm text-success"></span> Loading…',
  paginate: { first: '«', previous: '‹', next: '›', last: '»' },
  aria: { paginate: { first: 'First page', previous: 'Previous page', next: 'Next page', last: 'Last page' } },
};

/**
 * DataTables grid (datatables.net) with the MarketLink look.
 *  - `table`: name of a server-side table (POST /api/admin/tables/:table does paging, search and sorting)
 *  - or `data`: an array for a client-side table (e.g. analytics that are already calculated)
 * Cells are HTML strings (see utils/cells.js). Buttons with data-action call onAction(action, row);
 * links with data-href open inside the app. Export buttons: CSV, Excel and Print.
 */
export default function DataGrid({ table, data, columns, filters, order = [[0, 'desc']], pageLength = 10, exportName = 'MarketLink', onAction, reloadKey = 0, searchPlaceholder, className = '' }) {
  const ref = useRef(null);
  const filtersRef = useRef(filters);
  const navigate = useNavigate();
  const filterKey = JSON.stringify(filters || {});
  const first = useRef(true);

  useEffect(() => {
    filtersRef.current = filters;
  });

  // Reload the server data when the filter controls or the reload key change
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (table) ref.current?.dt()?.ajax.reload();
  }, [filterKey, reloadKey, table]);

  const options = useMemo(
    () => ({
      serverSide: Boolean(table),
      processing: true,
      responsive: true,
      autoWidth: false,
      order,
      pageLength,
      lengthMenu: [
        [10, 25, 50, 100, -1],
        [10, 25, 50, 100, 'All'],
      ],
      searchDelay: 350,
      language: { ...LANGUAGE, searchPlaceholder: searchPlaceholder || LANGUAGE.searchPlaceholder },
      layout: {
        topStart: ['pageLength', { buttons: ['csv', 'excel', 'print'].map((type) => ({ extend: type === 'csv' ? 'csvHtml5' : type === 'excel' ? 'excelHtml5' : 'print', text: `<i class="bi ${type === 'csv' ? 'bi-filetype-csv' : type === 'excel' ? 'bi-file-earmark-excel' : 'bi-printer'}"></i> ${type === 'csv' ? 'CSV' : type === 'excel' ? 'Excel' : 'Print'}`, className: 'btn btn-sm btn-white', title: exportName, exportOptions: { columns: ':not(.no-export)', orthogonal: 'export' } })) }],
        topEnd: 'search',
        bottomStart: 'info',
        bottomEnd: 'paging',
      },
      ...(table
        ? {
            ajax: (request, callback) => {
              api
                .post(`/admin/tables/${table}`, { ...request, filters: filtersRef.current || {} })
                .then(callback)
                .catch(() => callback({ draw: request.draw, recordsTotal: 0, recordsFiltered: 0, data: [] }));
            },
          }
        : {}),
    }),
    // The DataTable is created once; filters are read from a ref and trigger ajax.reload()
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  function handleClick(e) {
    const linkEl = e.target.closest('[data-href]');
    if (linkEl && !e.metaKey && !e.ctrlKey) {
      e.preventDefault();
      navigate(linkEl.getAttribute('data-href'));
      return;
    }
    const btn = e.target.closest('[data-action]');
    if (!btn || !onAction) return;
    let tr = btn.closest('tr');
    // Responsive "child" rows (small screens) belong to the row above them
    if (tr?.classList.contains('child')) tr = tr.previousElementSibling;
    const row = ref.current?.dt()?.row(tr).data();
    if (row) onAction(btn.getAttribute('data-action'), row, btn);
  }

  return (
    <div className={`data-grid ${className}`} onClick={handleClick}>
      <DataTable ref={ref} className="table table-hover align-middle w-100" columns={columns} data={table ? undefined : data} options={options} />
    </div>
  );
}
