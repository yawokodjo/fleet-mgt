export const loadLogoBase64 = () =>
    new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            canvas.getContext('2d').drawImage(img, 0, 0);
            resolve(canvas.toDataURL('image/png'));
        };
        img.onerror = () => resolve(null);
        img.src = '/logo-ci.png';
    });

export const addPdfHeader = (doc, title, subtitle) => {
    // Logo (left)
    return loadLogoBase64().then((logo) => {
        if (logo) doc.addImage(logo, 'PNG', 10, 6, 22, 13);
        // Title (center)
        doc.setFontSize(13); doc.setFont(undefined, 'bold');
        doc.text(title, doc.internal.pageSize.getWidth() / 2, 11, { align: 'center' });
        doc.setFontSize(8); doc.setFont(undefined, 'normal');
        doc.setTextColor(100);
        doc.text('Compassion International Togo', doc.internal.pageSize.getWidth() / 2, 16, { align: 'center' });
        if (subtitle) doc.text(subtitle, doc.internal.pageSize.getWidth() / 2, 20, { align: 'center' });
        doc.setTextColor(0);
    });
};

export const addPdfSignatures = (doc, userName) => {
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    const y = pageH - 22;

    doc.setFontSize(9); doc.setFont(undefined, 'bold');
    doc.text('Responsable', pageW * 0.2, y, { align: 'center' });
    doc.text('Superviseur',  pageW * 0.8, y, { align: 'center' });

    doc.setFont(undefined, 'normal');
    doc.setFontSize(8); doc.setTextColor(100);
    const lineY = y + 8;
    doc.line(pageW * 0.07, lineY, pageW * 0.37, lineY);
    doc.line(pageW * 0.63, lineY, pageW * 0.93, lineY);
    doc.text('Nom & Signature', pageW * 0.2, lineY + 4, { align: 'center' });
    doc.text('Nom & Signature', pageW * 0.8, lineY + 4, { align: 'center' });

    doc.setTextColor(150);
    doc.setFontSize(7);
    const byUser = userName ? ` par ${userName}` : '';
    doc.text(`Rapport généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}${byUser}`, pageW / 2, pageH - 4, { align: 'center' });
    doc.setTextColor(0);
};
