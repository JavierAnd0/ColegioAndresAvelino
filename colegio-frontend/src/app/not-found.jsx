import Link from 'next/link';
import MainLayout from '@/components/templates/MainLayout';
import Heading from '@/components/atoms/Typography/Heading';
import Paragraph from '@/components/atoms/Typography/Paragraph';
import Button from '@/components/atoms/Button';

export default function NotFound() {
    return (
        <MainLayout>
            <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center gap-6">
                <span className="text-8xl">🏫</span>
                <div className="flex flex-col gap-3">
                    <Heading level="h1" className="text-neutral-300">404</Heading>
                    <Heading level="h3">Página no encontrada</Heading>
                    <Paragraph color="muted" className="max-w-md mx-auto">
                        La página que buscas no existe o fue movida.
                        Vuelve al inicio para continuar navegando.
                    </Paragraph>
                </div>
                <div className="flex gap-3">
                    <Link href="/">
                        <Button variant="primary" size="lg">Ir al inicio</Button>
                    </Link>
                    <Link href="/blog">
                        <Button variant="outline" size="lg">Ver blog</Button>
                    </Link>
                </div>
            </div>
        </MainLayout>
    );
}
