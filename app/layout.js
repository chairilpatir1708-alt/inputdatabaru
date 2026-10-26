import '../css/style.css';

export const metadata = {
    title: 'Arsip Data PBB',
    description: 'Arsip data SPPT dan STTS Pajak Bumi dan Bangunan'
};

export const viewport = {
    themeColor: '#123b2c'
};

export default function RootLayout({ children }) {
    return (
        <html lang="id">
            <body>{children}</body>
        </html>
    );
}
