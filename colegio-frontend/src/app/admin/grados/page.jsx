'use client';
import AdminLayout from '@/components/templates/AdminLayout';
import GradeManager from '@/components/organisms/GradeManager';
import Heading from '@/components/atoms/Typography/Heading';

export default function AdminGradosPage() {
    return (
        <AdminLayout>
            <div className="flex flex-col gap-6">
                <Heading level="h3">Gestión de Grados</Heading>
                <GradeManager />
            </div>
        </AdminLayout>
    );
}
