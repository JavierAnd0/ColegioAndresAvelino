'use client';
import { useEffect, useState } from 'react';
import AdminLayout from '@/components/templates/AdminLayout';
import Heading from '@/components/atoms/Typography/Heading';
import Paragraph from '@/components/atoms/Typography/Paragraph';
import Spinner from '@/components/atoms/Spinner';
import { blogService } from '@/services/blogService';
import { eventService } from '@/services/eventService';
import { LuFileText, LuCalendar, LuTrendingUp } from 'react-icons/lu';


export default function AdminDashboard() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [postsData, eventsData] = await Promise.all([
                    blogService.getAll({ limit: 5, status: 'publicado' }),
                    eventService.getUpcoming(),
                ]);
                setStats({
                    totalPosts: postsData.total || 0,
                    recentPosts: postsData.data?.slice(0, 5) || [],
                    upcomingEvents: eventsData.data?.slice(0, 5) || [],
                });
            } catch (error) {
                console.error('Error cargando stats:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) return (
        <AdminLayout>
            <div className="flex justify-center items-center h-64">
                <Spinner size="lg" />
            </div>
        </AdminLayout>
    );

    return (
        <AdminLayout>
            <div className="flex flex-col gap-8">

                {/* Header */}
                <div>
                    <Heading level="h3">Dashboard</Heading>
                    <Paragraph color="muted" className="mt-1">
                        Resumen general del sitio
                    </Paragraph>
                </div>

                {/* Stats cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                        { label: 'Posts publicados', value: stats?.totalPosts || 0, Icon: LuFileText },
                        { label: 'Eventos próximos', value: stats?.upcomingEvents?.length || 0, Icon: LuCalendar },
                        { label: 'Esta semana', value: stats?.upcomingEvents?.length || 0, Icon: LuCalendar },
                    ].map((stat) => (
                        <div key={stat.label} className="bg-white rounded-xl border border-neutral-200 p-5 flex items-center gap-4">
                            <stat.Icon className="w-7 h-7 text-neutral-600" />
                            <div>
                                <p className="text-2xl font-bold text-neutral-900">{stat.value}</p>
                                <p className="text-sm text-neutral-500">{stat.label}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Posts recientes */}
                <div className="bg-white rounded-xl border border-neutral-200 p-5">
                    <Heading level="h5" className="mb-4">Posts recientes</Heading>
                    {stats?.recentPosts?.length === 0 ? (
                        <Paragraph color="muted">No hay posts aún.</Paragraph>
                    ) : (
                        <div className="flex flex-col divide-y divide-neutral-100">
                            {stats?.recentPosts?.map((post) => (
                                <div key={post._id} className="py-3 flex items-center justify-between gap-3">
                                    <Paragraph className="line-clamp-1 flex-1">{post.title}</Paragraph>
                                    <span className={`text-xs px-2 py-1 rounded-full font-medium
                    ${post.status === 'publicado' ? 'bg-green-100 text-green-700' : 'bg-neutral-100 text-neutral-600'}`}>
                                        {post.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}