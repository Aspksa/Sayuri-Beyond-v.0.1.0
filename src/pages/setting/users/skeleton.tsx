export function UsersSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <div className="h-8 w-36 rounded bg-muted animate-pulse" />
        <div className="mt-1 h-4 w-24 rounded bg-muted animate-pulse" />
      </div>

      <div className="rounded-lg border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              {[
                'sk-id',
                'sk-name',
                'sk-username',
                'sk-email',
                'sk-status',
                'sk-login',
                'sk-actions',
              ].map((key, i) => (
                <th key={key} className="px-4 py-3 text-left">
                  <div
                    className={`h-4 ${['w-12', 'w-28', 'w-28', 'w-40', 'w-16', 'w-24', 'w-16'][i]} rounded bg-muted animate-pulse`}
                  />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {['r1', 'r2', 'r3', 'r4', 'r5'].map((rk) => (
              <tr key={rk} className="border-b">
                {['c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7'].map((ck) => (
                  <td key={ck} className="px-4 py-3">
                    <div className="h-4 rounded bg-muted animate-pulse" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
