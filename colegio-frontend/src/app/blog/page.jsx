'use client';
import * as Sentry from '@sentry/nextjs';
import { useState, useEffect } from 'react';
import MainLayout from '@/components/templates/MainLayout';
import BlogList from '@/components/organisms/BlogList';
import { blogService } from '@/services/blogService';

export default function BlogPage() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [pages, setPages] = useState(1);
    const [search, setSearch] = useState('');
    const [activeCategory, setCategory] = useState('all');

    const fetchPosts = async () => {
        setLoading(true);
        try {
            const params = { page, limit: 9 };
            if (search) params.search = search;
            if (activeCategory !== 'all') params.category = activeCategory;

            const data = await blogService.getAll(params);
            setPosts(data.data || []);
            setTotal(data.total || 0);
            setPages(data.pages || 1);
        } catch (error) {
            Sentry.captureException(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchPosts(); }, [page, search, activeCategory]);

    const handleSearch = (value) => { setSearch(value); setPage(1); };
    const handleCategory = (cat) => { setCategory(cat); setPage(1); };

    return (
        <MainLayout>
            <BlogList
                posts={posts}
                loading={loading}
                total={total}
                page={page}
                pages={pages}
                onSearch={handleSearch}
                onCategoryChange={handleCategory}
                onPageChange={setPage}
                activeCategory={activeCategory}
                showFilters={true}
            />
        </MainLayout>
    );
}