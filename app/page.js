import ArchiveDashboard from '../components/archive-dashboard';
import archiveData from '../data/arsip-data.json';

export default function SpptPage() {
    return <ArchiveDashboard jenis="sppt" data={archiveData} />;
}
