# ISSUE-021: profile image upload rejects valid formats with silent error

| Field | Value |
|-------|-------|
| **Severity** | High |
| **Category** | Bug |
| **Route / Page** | `/profile` (avatar and cover upload) |
| **Component** | `ProfileHeader` + `UsersController` |
| **Files** | `web/src/features/profile/components/ProfileHeader.tsx:107,113` · `backend/src/users/controllers/users.controller.ts:47-52,74-79` |
| **Status** | Open |

## Description

The frontend file input uses `accept="image/*"`, which the browser allows for all image MIME types — including HEIC (iPhone photos), AVIF, BMP, TIFF, SVG, and ICO. The backend however only accepts `jpg`, `jpeg`, `png`, `gif`, `webp`. Any other image format that passes the browser filter is rejected silently at the server. The only feedback the user gets is a generic Arabic alert with no explanation of which formats are allowed.

## Current Behavior

1. User selects a `.heic` photo from iPhone or a `.bmp`/`.avif` file.
2. Browser's file picker shows it as selectable (because `accept="image/*"` allows all image types).
3. File is sent to `POST /users/me/avatar` or `POST /users/me/cover`.
4. Backend throws `BadRequestException('Only image files are allowed')`.
5. Frontend catches the error and shows `alert('فشل رفع الصورة')` — no format information.
6. Upload silently fails. The user does not know why.

## Expected Behavior

- The frontend `accept` attribute should match the exact formats the backend permits.
- If the backend rejects the file, the UI should show a specific message listing the supported formats and size limit.

## Affected Files

```
web/src/features/profile/components/ProfileHeader.tsx
  Line 107:  accept="image/*"           ← avatar input, too permissive
  Line 113:  accept="image/*"           ← cover input, too permissive
  Line 53-55: catch { alert('فشل رفع الصورة') }   ← generic, no format info
  Line 65-67: catch { alert('فشل رفع الصورة') }   ← generic, no format info

backend/src/users/controllers/users.controller.ts
  Line 47:  /\.(jpg|jpeg|png|gif|webp)$/i      ← extension allowlist
  Line 48:  ['image/jpeg','image/png','image/gif','image/webp']  ← MIME allowlist
  (webp is accepted by backend but not shown to user anywhere)
```

## Suggested Fix

**Frontend — tighten the `accept` attribute:**
```diff
- <input ... accept="image/*" />
+ <input ... accept=".jpg,.jpeg,.png,.gif,.webp,image/jpeg,image/png,image/gif,image/webp" />
```

**Frontend — surface the specific error from the API response:**
```diff
- } catch {
-   alert('فشل رفع الصورة');
- }
+ } catch (err: any) {
+   const msg = err?.response?.data?.message ?? 'فشل رفع الصورة';
+   alert(`${msg}\n\nالصيغ المدعومة: JPG، PNG، GIF، WebP (حد أقصى 5 ميجابايت)`);
+ }
```

## Notes

- The 5 MB size limit (`limits: { fileSize: 5 * 1024 * 1024 }`) is also never communicated to the user before upload.
- The backend extension check happens on `file.originalname` which an attacker can spoof. The MIME check provides the real protection. This dual-check design is correct but the user-facing error message should still be clear.
