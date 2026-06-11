import { registerPageChecks } from '../../lib/checks';
import { AUTH_PAGES } from '../../lib/pages';

for (const meta of AUTH_PAGES) {
  registerPageChecks(meta);
}
