export default async function sitemap() {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://colegio.edu.co';
    const apiUrl  = process.env.NEXT_PUBLIC_API_URL  || 'http://localhost:5000/api';

    // Rutas estáticas
    const staticRoutes = [
        { url: siteUrl,                   priority: 1.0,  changeFrequency: 'weekly' },
        { url: `${siteUrl}/actividades`,  priority: 0.8,  changeFrequency: 'weekly' },
        { url: `${siteUrl}/blog`,         priority: 0.8,  changeFrequency: 'daily'  },
        { url: `${siteUrl}/nosotros`,     priority: 0.6,  changeFrequency: 'monthly'},
        { url: `${siteUrl}/contacto`,     priority: 0.6,  changeFrequency: 'monthly'},
    ].map(r => ({ ...r, lastModified: new Date() }));

    // Posts del blog (dinámicos)
    let blogRoutes = [];
    try {
        const res  = await fetch(`${apiUrl}/blog?status=publicado&limit=200`, { next: { revalidate: 3600 } });
        const data = await res.json();
        blogRoutes = (data.data || []).map(post => ({
            url:             `${siteUrl}/blog/${post.slug}`,
            lastModified:    new Date(post.publishedAt || post.updatedAt),
            changeFrequency: 'monthly',
            priority:        0.7,
        }));
    } catch {
        // Si la API no responde, el sitemap solo incluye rutas estáticas
    }

    return [...staticRoutes, ...blogRoutes];
}
