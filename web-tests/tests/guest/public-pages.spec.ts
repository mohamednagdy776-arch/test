import { registerPageChecks } from '../../lib/checks';
import { PUBLIC_PAGES } from '../../lib/pages';

for (const meta of PUBLIC_PAGES) {
  registerPageChecks(meta);
}
