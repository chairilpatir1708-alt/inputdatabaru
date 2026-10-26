import ArchiveDashboard from '../../components/archive-dashboard';
import archiveData from '../../data/arsip-data.json';

export const metadata = {
    title: 'Arsip Data STTS (PBB)'
};

export default function SttsPage() {
    return <ArchiveDashboard jenis="stts" data={archiveData} />;
}
