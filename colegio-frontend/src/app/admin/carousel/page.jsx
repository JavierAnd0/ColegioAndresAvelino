'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/templates/AdminLayout';
import CarouselImageUploader from '@/components/molecules/CarouselImageUploader';
import HeroImageUploader from '@/components/molecules/HeroImageUploader';
import { carouselService } from '@/services/carouselService';
import { heroSlidesService } from '@/services/heroSlidesService';
import {
    LuPlus, LuTrash2, LuPencil, LuCheck, LuX,
    LuChevronUp, LuChevronDown, LuImages, LuEye, LuEyeOff,
    LuLayoutTemplate,
} from 'react-icons/lu';

const EMPTY_CAROUSEL_FORM = {
    image:     { url: '', publicId: '' },
    title:     '',
    subtitle:  '',
    linkUrl:   '',
    linkLabel: 'Ver más',
    active:    true,
};

const EMPTY_HERO_FORM = {
    image:    { url: '', publicId: '' },
    title:    '',
    subtitle: '',
    active:   true,
};

function Alert({ type, message, onClose }) {
    if (!message) return null;
    const colors = type === 'success'
        ? 'bg-green-50 border-green-200 text-green-800'
        : 'bg-red-50 border-red-200 text-red-800';
    return (
        <div className={`flex items-center justify-between gap-3 px-4 py-3 rounded-xl border text-sm ${colors}`}>
            <span>{message}</span>
            <button onClick={onClose} className="flex-shrink-0 cursor-pointer"><LuX className="w-4 h-4" /></button>
        </div>
    );
}

function CarouselSlideForm({ initial, onSave, onCancel, saving }) {
    const [form, setForm] = useState(initial || EMPTY_CAROUSEL_FORM);
    const set = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!form.image.url) return;
        onSave(form);
    };

    return (
        <form onSubmit={handleSubmit} className="bg-neutral-50 rounded-2xl border border-neutral-200 p-6 flex flex-col gap-5">
            <h3 className="font-display font-bold text-neutral-900 text-base">
                {initial?._id ? 'Editar slide' : 'Nuevo slide'}
            </h3>

            <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Imagen <span className="text-red-500">*</span>
                </label>
                <CarouselImageUploader
                    currentImage={form.image.url}
                    onUpload={(data) => set('image', data ? { url: data.url, publicId: data.publicId || '' } : { url: '', publicId: '' })}
                />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">Título</label>
                    <input
                        type="text"
                        value={form.title}
                        onChange={e => set('title', e.target.value)}
                        placeholder="Ej: Bienvenidos al nuevo año"
                        maxLength={120}
                        className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg outline-none
                            focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400 transition-all bg-white"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">Subtítulo</label>
                    <input
                        type="text"
                        value={form.subtitle}
                        onChange={e => set('subtitle', e.target.value)}
                        placeholder="Ej: Formando el futuro de Colombia"
                        maxLength={250}
                        className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg outline-none
                            focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400 transition-all bg-white"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">URL del botón</label>
                    <input
                        type="text"
                        value={form.linkUrl}
                        onChange={e => set('linkUrl', e.target.value)}
                        placeholder="Ej: /blog o https://..."
                        className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg outline-none
                            focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400 transition-all bg-white"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">Texto del botón</label>
                    <input
                        type="text"
                        value={form.linkLabel}
                        onChange={e => set('linkLabel', e.target.value)}
                        placeholder="Ver más"
                        maxLength={40}
                        className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg outline-none
                            focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400 transition-all bg-white"
                    />
                </div>
            </div>

            <label className="flex items-center gap-3 cursor-pointer w-fit">
                <div
                    onClick={() => set('active', !form.active)}
                    className={`relative w-10 h-6 rounded-full transition-colors duration-200 cursor-pointer
                        ${form.active ? 'bg-brand-600' : 'bg-neutral-300'}`}
                >
                    <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200
                        ${form.active ? 'translate-x-5' : 'translate-x-1'}`} />
                </div>
                <span className="text-sm font-medium text-neutral-700">Visible en el sitio</span>
            </label>

            <div className="flex gap-3 pt-2 border-t border-neutral-200">
                <button
                    type="submit"
                    disabled={saving || !form.image.url}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700
                        text-white text-sm font-semibold transition-all duration-200 cursor-pointer
                        disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <LuCheck className="w-4 h-4" />
                    {saving ? 'Guardando...' : 'Guardar'}
                </button>
                <button
                    type="button"
                    onClick={onCancel}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-neutral-200
                        text-neutral-600 text-sm font-semibold hover:bg-neutral-100 transition-all duration-200 cursor-pointer"
                >
                    <LuX className="w-4 h-4" />
                    Cancelar
                </button>
            </div>
        </form>
    );
}

function HeroSlideForm({ initial, onSave, onCancel, saving }) {
    const [form, setForm] = useState(initial || EMPTY_HERO_FORM);
    const set = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!form.image.url) return;
        onSave(form);
    };

    return (
        <form onSubmit={handleSubmit} className="bg-neutral-50 rounded-2xl border border-neutral-200 p-6 flex flex-col gap-5">
            <h3 className="font-display font-bold text-neutral-900 text-base">
                {initial?._id ? 'Editar slide del hero' : 'Nuevo slide del hero'}
            </h3>

            <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Imagen <span className="text-red-500">*</span>
                </label>
                <HeroImageUploader
                    currentImage={form.image.url}
                    onUpload={(data) => set('image', data ? { url: data.url, publicId: data.publicId || '' } : { url: '', publicId: '' })}
                />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">Título del slide</label>
                    <input
                        type="text"
                        value={form.title}
                        onChange={e => set('title', e.target.value)}
                        placeholder="Ej: Matrículas abiertas 2026"
                        maxLength={120}
                        className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg outline-none
                            focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400 transition-all bg-white"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">Subtítulo del slide</label>
                    <input
                        type="text"
                        value={form.subtitle}
                        onChange={e => set('subtitle', e.target.value)}
                        placeholder="Ej: A partir del 1 de Septiembre"
                        maxLength={250}
                        className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg outline-none
                            focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400 transition-all bg-white"
                    />
                </div>
            </div>

            <label className="flex items-center gap-3 cursor-pointer w-fit">
                <div
                    onClick={() => set('active', !form.active)}
                    className={`relative w-10 h-6 rounded-full transition-colors duration-200 cursor-pointer
                        ${form.active ? 'bg-brand-600' : 'bg-neutral-300'}`}
                >
                    <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200
                        ${form.active ? 'translate-x-5' : 'translate-x-1'}`} />
                </div>
                <span className="text-sm font-medium text-neutral-700">Visible en el sitio</span>
            </label>

            <div className="flex gap-3 pt-2 border-t border-neutral-200">
                <button
                    type="submit"
                    disabled={saving || !form.image.url}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700
                        text-white text-sm font-semibold transition-all duration-200 cursor-pointer
                        disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <LuCheck className="w-4 h-4" />
                    {saving ? 'Guardando...' : 'Guardar'}
                </button>
                <button
                    type="button"
                    onClick={onCancel}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-neutral-200
                        text-neutral-600 text-sm font-semibold hover:bg-neutral-100 transition-all duration-200 cursor-pointer"
                >
                    <LuX className="w-4 h-4" />
                    Cancelar
                </button>
            </div>
        </form>
    );
}

function CollapsibleSection({ icon: Icon, title, description, badge, children, defaultOpen = true, action }) {
    const [open, setOpen] = useState(defaultOpen);

    return (
        <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
            <div
                role="button"
                tabIndex={0}
                onClick={() => setOpen(o => !o)}
                onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && setOpen(o => !o)}
                className="w-full flex items-center justify-between gap-4 px-6 py-4 hover:bg-neutral-50 transition-colors cursor-pointer select-none"
            >
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-brand-50 border border-brand-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Icon className="w-4 h-4 text-brand-600" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="font-display font-bold text-neutral-900 text-base">{title}</span>
                            {badge && (
                                <span className="text-[0.6rem] font-mono font-bold bg-neutral-100 text-neutral-500 px-2 py-0.5 rounded-full uppercase tracking-wider">
                                    {badge}
                                </span>
                            )}
                        </div>
                        <p className="text-xs text-neutral-500 mt-0.5">{description}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                    {open && action && (
                        <div onClick={e => e.stopPropagation()}>
                            {action}
                        </div>
                    )}
                    <LuChevronDown
                        className={`w-5 h-5 text-neutral-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
                    />
                </div>
            </div>

            {open && (
                <div className="px-6 pb-6 border-t border-neutral-100 pt-5 flex flex-col gap-5">
                    {children}
                </div>
            )}
        </div>
    );
}

function SlideList({ slides, loading, onEdit, onDelete, onToggle, onMove, deleting }) {
    if (loading) {
        return (
            <div className="flex flex-col gap-3">
                {[1, 2].map(i => (
                    <div key={i} className="bg-neutral-100 rounded-xl h-20 animate-pulse" />
                ))}
            </div>
        );
    }
    if (slides.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
                <div className="w-14 h-14 bg-neutral-100 rounded-2xl flex items-center justify-center">
                    <LuImages className="w-7 h-7 text-neutral-300" />
                </div>
                <div>
                    <p className="font-semibold text-neutral-600 text-sm">No hay slides aún</p>
                    <p className="text-xs text-neutral-400 mt-0.5">Crea el primero con el botón de arriba</p>
                </div>
            </div>
        );
    }
    return (
        <div className="flex flex-col gap-2">
            {slides.map((slide, index) => (
                <div
                    key={slide._id}
                    className={`flex gap-3 bg-neutral-50 rounded-xl border p-3 transition-all duration-200
                        ${slide.active ? 'border-neutral-200' : 'border-neutral-100 opacity-60'}`}
                >
                    <div className="w-20 h-12 rounded-lg overflow-hidden bg-neutral-200 flex-shrink-0 self-start">
                        <img
                            src={slide.image.url}
                            alt={slide.title || `Slide ${index + 1}`}
                            className="w-full h-full object-cover"
                        />
                    </div>

                    <div className="flex-1 min-w-0 flex flex-col gap-2">
                        <div className="flex items-start justify-between gap-2">
                            <p className="font-semibold text-neutral-900 text-sm truncate">
                                {slide.title || <span className="text-neutral-400 italic font-normal">Sin título</span>}
                            </p>
                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0
                                ${slide.active ? 'bg-green-100 text-green-700' : 'bg-neutral-100 text-neutral-500'}`}>
                                {slide.active ? 'Visible' : 'Oculto'}
                            </span>
                        </div>

                        <div className="flex items-center gap-0.5">
                            <div className="flex flex-col">
                                <button
                                    onClick={() => onMove(index, -1)}
                                    disabled={index === 0}
                                    className="p-1 rounded text-neutral-400 hover:text-neutral-700 disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed"
                                >
                                    <LuChevronUp className="w-3.5 h-3.5" />
                                </button>
                                <button
                                    onClick={() => onMove(index, 1)}
                                    disabled={index === slides.length - 1}
                                    className="p-1 rounded text-neutral-400 hover:text-neutral-700 disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed"
                                >
                                    <LuChevronDown className="w-3.5 h-3.5" />
                                </button>
                            </div>

                            <button
                                onClick={() => onToggle(slide)}
                                title={slide.active ? 'Ocultar' : 'Mostrar'}
                                className="p-2 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-200 transition-colors cursor-pointer"
                            >
                                {slide.active ? <LuEyeOff className="w-4 h-4" /> : <LuEye className="w-4 h-4" />}
                            </button>

                            <button
                                onClick={() => onEdit(slide)}
                                className="p-2 rounded-lg text-neutral-400 hover:text-brand-600 hover:bg-brand-50 transition-colors cursor-pointer"
                            >
                                <LuPencil className="w-4 h-4" />
                            </button>

                            <button
                                onClick={() => onDelete(slide._id)}
                                disabled={deleting === slide._id}
                                className="p-2 rounded-lg text-neutral-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer disabled:opacity-50"
                            >
                                <LuTrash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

function useSlidesAdmin(service) {
    const [slides, setSlides]   = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing]   = useState(null);
    const [saving, setSaving]     = useState(false);
    const [deleting, setDeleting] = useState(null);

    const fetch = async (onError) => {
        setLoading(true);
        try {
            const res = await service.getAdmin();
            setSlides(res.data || []);
        } catch {
            onError?.({ type: 'error', message: 'Error al cargar los slides' });
        } finally {
            setLoading(false);
        }
    };

    const save = async (form, onAlert) => {
        setSaving(true);
        try {
            if (editing?._id) {
                await service.update(editing._id, form);
                onAlert({ type: 'success', message: 'Slide actualizado correctamente' });
            } else {
                await service.create(form);
                onAlert({ type: 'success', message: 'Slide creado correctamente' });
            }
            setShowForm(false);
            setEditing(null);
            await fetch(onAlert);
        } catch {
            onAlert({ type: 'error', message: 'Error al guardar el slide' });
        } finally {
            setSaving(false);
        }
    };

    const remove = async (id, onAlert) => {
        if (!confirm('¿Eliminar este slide?')) return;
        setDeleting(id);
        try {
            await service.delete(id);
            onAlert({ type: 'success', message: 'Slide eliminado' });
            await fetch(onAlert);
        } catch {
            onAlert({ type: 'error', message: 'Error al eliminar el slide' });
        } finally {
            setDeleting(null);
        }
    };

    const toggleActive = async (slide, onAlert) => {
        try {
            await service.update(slide._id, { active: !slide.active });
            await fetch(onAlert);
        } catch {
            onAlert({ type: 'error', message: 'Error al actualizar visibilidad' });
        }
    };

    const move = async (index, direction, onAlert) => {
        const newSlides = [...slides];
        const target = index + direction;
        if (target < 0 || target >= newSlides.length) return;
        [newSlides[index], newSlides[target]] = [newSlides[target], newSlides[index]];
        setSlides(newSlides);
        try {
            await service.reorder(newSlides.map(s => s._id));
        } catch {
            onAlert({ type: 'error', message: 'Error al reordenar' });
            await fetch(onAlert);
        }
    };

    return {
        slides, loading, showForm, editing, saving, deleting,
        fetch,
        save,
        remove,
        toggleActive,
        move,
        openNew:   () => { setEditing(null); setShowForm(true); },
        openEdit:  (slide) => { setEditing(slide); setShowForm(true); },
        closeForm: () => { setShowForm(false); setEditing(null); },
    };
}

export default function CarouselAdminPage() {
    const [alert, setAlert] = useState({ type: '', message: '' });

    const hero = useSlidesAdmin(heroSlidesService);
    const carousel = useSlidesAdmin(carouselService);

    useEffect(() => { hero.fetch(setAlert); }, []);
    useEffect(() => { carousel.fetch(setAlert); }, []);

    const heroAction = !hero.showForm && (
        <button
            onClick={hero.openNew}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700
                text-white text-sm font-semibold transition-all duration-200 cursor-pointer"
        >
            <LuPlus className="w-4 h-4" />
            Nuevo slide
        </button>
    );

    const carouselAction = !carousel.showForm && (
        <button
            onClick={carousel.openNew}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700
                text-white text-sm font-semibold transition-all duration-200 cursor-pointer"
        >
            <LuPlus className="w-4 h-4" />
            Nuevo slide
        </button>
    );

    return (
        <AdminLayout>
            <div className="flex flex-col gap-6">

                <div>
                    <h1 className="font-display text-2xl font-bold text-neutral-900">Imágenes del Home</h1>
                    <p className="text-sm text-neutral-500 mt-1">
                        Gestiona los slides del hero y el carousel del home
                    </p>
                </div>

                <Alert type={alert.type} message={alert.message} onClose={() => setAlert({ type: '', message: '' })} />

                {/* Sección: Slides del Hero */}
                <CollapsibleSection
                    icon={LuLayoutTemplate}
                    title="Slides del Hero"
                    description="Imágenes que rotan en la sección principal (pantalla completa)"
                    badge={hero.slides.length > 0 ? `${hero.slides.length} slide${hero.slides.length !== 1 ? 's' : ''}` : undefined}
                    action={heroAction}
                    defaultOpen={true}
                >
                    {hero.showForm && (
                        <HeroSlideForm
                            initial={hero.editing}
                            onSave={(form) => hero.save(form, setAlert)}
                            onCancel={hero.closeForm}
                            saving={hero.saving}
                        />
                    )}
                    <SlideList
                        slides={hero.slides}
                        loading={hero.loading}
                        onEdit={hero.openEdit}
                        onDelete={(id) => hero.remove(id, setAlert)}
                        onToggle={(slide) => hero.toggleActive(slide, setAlert)}
                        onMove={(i, d) => hero.move(i, d, setAlert)}
                        deleting={hero.deleting}
                    />
                </CollapsibleSection>

                {/* Sección: Slides del Carousel */}
                <CollapsibleSection
                    icon={LuImages}
                    title="Slides del Carousel"
                    description="Imágenes que rotan automáticamente entre el cuadro de honor y las noticias"
                    badge={carousel.slides.length > 0 ? `${carousel.slides.length} slide${carousel.slides.length !== 1 ? 's' : ''}` : undefined}
                    action={carouselAction}
                >
                    {carousel.showForm && (
                        <CarouselSlideForm
                            initial={carousel.editing}
                            onSave={(form) => carousel.save(form, setAlert)}
                            onCancel={carousel.closeForm}
                            saving={carousel.saving}
                        />
                    )}
                    <SlideList
                        slides={carousel.slides}
                        loading={carousel.loading}
                        onEdit={carousel.openEdit}
                        onDelete={(id) => carousel.remove(id, setAlert)}
                        onToggle={(slide) => carousel.toggleActive(slide, setAlert)}
                        onMove={(i, d) => carousel.move(i, d, setAlert)}
                        deleting={carousel.deleting}
                    />
                </CollapsibleSection>

            </div>
        </AdminLayout>
    );
}
