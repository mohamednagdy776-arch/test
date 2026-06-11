import { registerPageChecks } from '../../lib/checks';
import { MAIN_PAGES } from '../../lib/pages';

for (const meta of MAIN_PAGES) {
  registerPageChecks(meta);
}
