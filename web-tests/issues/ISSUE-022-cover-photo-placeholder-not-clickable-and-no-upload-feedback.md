# ISSUE-022: cover photo placeholder not clickable and no upload feedback

| Field | Value |
|-------|-------|
| **Severity** | Critical |
| **Category** | Bug / UX |
| **Route / Page** | `/profile` |
| **Component** | `ProfileHeader` |
| **File** | `web/src/features/profile/components/ProfileHeader.tsx:83-116` |
| **Status** | Open |

## Description

The cover photo upload has two broken UX flows:

1. **The "Add Cover Photo" placeholder is not clickable.** When no cover exists, a camera icon and the text "أضف صورة غلاف" (Add cover photo) is displayed in the centre of the cover area. This looks like a call-to-action button, but it has no click handler. The actual upload button ("تعديل غلاف") is a small element pinned to the bottom-left corner that users are likely to overlook.

2. **No loading indicator during cover upload.** The shared `uploading` state (`useState(false)`) is set to `true` while uploading, but only the avatar button reads it (`{uploading ? '...' : <Camera />}`). The cover button text never changes, giving no feedback that an upload is in progress.

## Current Behavior

- Clicking the centred camera icon / "أضف صورة غلاف" text does nothing.
- Clicking the small "تعديل غلاف" button at bottom-left does open the file picker.
- After selecting a file, the cover button shows no spinner or loading state.
- The new cover photo only appears after the query is refetched following `qc.invalidateQueries`.

## Expected Behavior

- Clicking anywhere on the cover photo area (when no cover exists) should trigger the file picker.
- The entire cover area should have an obvious click affordance — or at minimum the centred placeholder should be wired to the same `coverRef.current?.click()` action.
- While upload is in progress the button (or the cover area) should show a loading indicator.

## Affected Files

```
web/src/features/profile/components/ProfileHeader.tsx

Lines 83-116  — cover photo section:

  Line 87-95: Camera icon + "أضف صورة غلاف" placeholder — NO onClick handler
  Line 97:    Gradient overlay div has pointer-events-none (correct), but
              the placeholder div above has no click handler either
  Line 99-115: {isSelf && <>
                 <button onClick={() => coverRef.current?.click()}>تعديل غلاف</button>
                 <input ref={coverRef} ... className="hidden" />
               </>}

Lines 60-72  — uploadCover function:
  Line 61:  setUploading(true)    ← sets shared state
  Line 68:  qc.invalidateQueries  ← invalidates, but no optimistic update

Line 138-141 — avatar button uses uploading:
  {uploading ? '...' : <Camera size={14} />}   ← only avatar shows loading

Line 101-106 — cover button NEVER checks uploading:
  <button onClick={() => coverRef.current?.click()}>
    <Camera size={18} />
    <span>تعديل غلاف</span>      ← static text, no loading state
  </button>
```

## Suggested Fix

**Wire the placeholder div to the same action:**
```diff
 <div className="w-full h-full flex items-center justify-center">
+  onClick={() => { if (isSelf) coverRef.current?.click(); }}
+  className={`w-full h-full flex items-center justify-center ${isSelf ? 'cursor-pointer' : ''}`}
   <div className="text-center">
     ...
   </div>
 </div>
```

**Show loading state on the cover button:**
```diff
 <button onClick={() => coverRef.current?.click()} ...>
   <Camera size={18} />
-  <span>تعديل غلاف</span>
+  <span>{uploading ? 'جاري الرفع...' : 'تعديل غلاف'}</span>
 </button>
```

## Notes

- The avatar upload correctly handles clicking the avatar div itself (line 123-124) in addition to the small camera button — the same pattern should be applied to the cover area.
- Consider adding an optimistic cover preview before the query refetches to reduce perceived latency.
