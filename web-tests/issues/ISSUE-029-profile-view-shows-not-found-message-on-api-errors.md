# ISSUE-029: profile view shows not-found message on API errors

| Field | Value |
|-------|-------|
| **Severity** | Medium |
| **Category** | Bug / UX |
| **Route / Page** | `/profile`, `/profile/[id]` |
| **Component** | `ProfileView` |
| **File** | `web/src/features/profile/components/ProfileView.tsx:69-98` |
| **Status** | Open |

## Description

`ProfileView` uses React Query to fetch profile data. When the query returns an error (network failure, 500 server error, timeout), `isError` is `true` and `data` is `undefined`. Since the component only checks `isLoading` and `!profile`, an error produces `profile === null`, which triggers the "لم يتم العثور على هذا الملف الشخصي" (Profile not found) message.

A network error is treated the same as a 404. The user has no way to distinguish between "this profile does not exist" and "we could not load the profile right now — please try again."

## Current Behavior

```
State: isLoading=false, isError=true, data=undefined
Rendered: "لم يتم العثور على هذا الملف الشخصي"
```
There is no retry button. The only recovery is a full page reload.

## Expected Behavior

- If `isError` is `true`, show a distinct error state with a "Try again" / "أعد المحاولة" button.
- The 404 "not found" message should only appear when the API returns HTTP 404, not on all errors.

## Affected Files

```
web/src/features/profile/components/ProfileView.tsx

Lines 69-77: isLoading → skeleton (handled correctly)
Lines 92-98: !profile → "not found" message  ← also shown on network errors
(No isError check exists anywhere in this component)

Example of missing branch:
  const { data, isLoading, isError } = useQuery({ ... });
                            ^^^^^^^   ← destructured but never used
```

## Suggested Fix

```diff
- const { data, isLoading } = useQuery({ ... });
+ const { data, isLoading, isError, refetch } = useQuery({ ... });

  // After the isLoading guard:
+ if (isError) {
+   return (
+     <div className="rounded-xl bg-[#FDFAF5] border border-[#C8D8DF]/60 p-12 text-center">
+       <p className="text-[#547792] text-sm mb-4">تعذّر تحميل الملف الشخصي</p>
+       <button
+         onClick={() => refetch()}
+         className="rounded-xl border border-[#C8D8DF] px-4 py-2 text-sm text-[#213448] hover:bg-[#D4E8EE] transition-colors"
+       >
+         أعد المحاولة
+       </button>
+     </div>
+   );
+ }
```

## Notes

- The same pattern should also be applied to `ActivityLogViewer` (ISSUE-025) and any other components that fetch data without error handling.
- React Query's `retry` option (default: 3 retries) means transient errors may resolve automatically, but permanent errors (500, 503) will exhaust retries and arrive here with `isError=true`.
