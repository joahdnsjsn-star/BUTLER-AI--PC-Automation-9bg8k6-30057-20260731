import { LegalDocView } from '@/components/LegalDocView';
import { termsText } from '@/constants/terms';
import { D } from '@/constants/design';

export default function TermsScreen() {
  return <LegalDocView title="Terms of Service" body={termsText} accent={D.violet} />;
}
