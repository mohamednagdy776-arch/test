import { registerPageChecks } from '../../lib/checks';
import { DYNAMIC_PAGES } from '../../lib/pages';

for (const meta of DYNAMIC_PAGES) {
  registerPageChecks(meta);
}
