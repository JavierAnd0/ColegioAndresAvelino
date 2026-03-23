export default function robots() {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://colegio.edu.co';
    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: ['/admin', '/admin/'],
            },
        ],
        sitemap: `${siteUrl}/sitemap.xml`,
    };
}
