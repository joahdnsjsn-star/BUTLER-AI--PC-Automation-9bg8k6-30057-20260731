import { LegalDocView } from '@/components/LegalDocView';
import { dataSafetyText } from '@/constants/dataSafety';
import { D } from '@/constants/design';

export default function DataSafetyScreen() {
  return <LegalDocView title="Data Safety" body={dataSafetyText} accent={D.green} />;
}
