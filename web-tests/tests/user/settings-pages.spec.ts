import { registerPageChecks } from '../../lib/checks';
import { SETTINGS_PAGES } from '../../lib/pages';

for (const meta of SETTINGS_PAGES) {
  registerPageChecks(meta);
}
