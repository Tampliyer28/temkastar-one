import * as React from 'react';
import { Link } from '@inertiajs/react';
import { cn } from '@/lib/utils';

function CasesCategori({ title, type, children, ...props }) {
    return (
        <section className='section-case cont df' {...props}>
            <h2 className="gradient-underline">{title}</h2>
            <div className="all-case-cont mt df">
                {children}
            </div>
        </section>
    );
}

export { CasesCategori };