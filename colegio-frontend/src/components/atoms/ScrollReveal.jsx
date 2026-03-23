'use client';
import { useEffect, useRef, useState } from 'react';

const directionStyles = {
    up:    { hidden: 'opacity-0 translate-y-8',  visible: 'opacity-100 translate-y-0' },
    down:  { hidden: 'opacity-0 -translate-y-8', visible: 'opacity-100 translate-y-0' },
    left:  { hidden: 'opacity-0 translate-x-8',  visible: 'opacity-100 translate-x-0' },
    right: { hidden: 'opacity-0 -translate-x-8', visible: 'opacity-100 translate-x-0' },
    scale: { hidden: 'opacity-0 scale-95',        visible: 'opacity-100 scale-100' },
    fade:  { hidden: 'opacity-0',                 visible: 'opacity-100' },
};

export default function ScrollReveal({
    children,
    className = '',
    delay = 0,
    direction = 'up',
    threshold = 0.12,
}) {
    const ref = useRef(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setVisible(true);
                    observer.disconnect();
                }
            },
            { threshold, rootMargin: '0px 0px -40px 0px' }
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, [threshold]);

    const styles = directionStyles[direction] || directionStyles.up;

    return (
        <div
            ref={ref}
            className={`transition-all duration-700 ease-out ${visible ? styles.visible : styles.hidden} ${className}`}
            style={{ transitionDelay: `${delay}ms` }}
        >
            {children}
        </div>
    );
}
