'use client';

import { useEffect, useRef } from 'react';
import { animate, useMotionValue, useTransform, motion } from 'framer-motion';

interface AnimatedCounterProps {
    value: number;
    duration?: number;
    className?: string;
    formatter?: (val: number) => string;
}

export default function AnimatedCounter({
    value,
    duration = 1.2,
    className,
    formatter = (v) => Math.round(v).toLocaleString('th-TH'),
}: AnimatedCounterProps) {
    const motionValue = useMotionValue(0);
    const displayValue = useTransform(motionValue, (v) => formatter(v));
    const prevValue = useRef(0);

    useEffect(() => {
        const controls = animate(motionValue, value, {
            duration,
            ease: 'easeOut',
        });
        prevValue.current = value;
        return controls.stop;
    }, [value, duration, motionValue]);

    return <motion.span className={className}>{displayValue}</motion.span>;
}
