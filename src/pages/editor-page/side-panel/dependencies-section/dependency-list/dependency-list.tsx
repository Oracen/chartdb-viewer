import { Accordion } from '@/components/accordion/accordion';
import type { DBDependency } from '@/lib/domain/db-dependency';
import React, { useCallback } from 'react';
import { DependencyListItem } from './dependency-list-item/dependency-list-item';

export interface DependencyListProps {
    dependencies: DBDependency[];
}

export const DependencyList: React.FC<DependencyListProps> = ({
    dependencies,
}) => {
    const [openedDependency, setOpenedDependency] = React.useState<
        string | null
    >(null);
    const lastOpenedDependency = React.useRef<string | null>(null);

    const refs = dependencies.reduce(
        (acc, dependency) => {
            acc[dependency.id] = React.createRef();
            return acc;
        },
        {} as Record<string, React.RefObject<HTMLDivElement>>
    );

    const scrollToDependency = useCallback(
        (id: string) =>
            refs[id]?.current?.scrollIntoView({
                behavior: 'smooth',
                block: 'start',
            }),
        [refs]
    );

    const handleScrollToDependency = useCallback(() => {
        if (
            openedDependency &&
            lastOpenedDependency.current !== openedDependency
        ) {
            lastOpenedDependency.current = openedDependency;
            scrollToDependency(openedDependency);
        }
    }, [scrollToDependency, openedDependency]);

    return (
        <Accordion
            type="single"
            collapsible
            className="flex w-full flex-col gap-1"
            value={openedDependency || ''}
            onValueChange={setOpenedDependency}
            onAnimationEnd={handleScrollToDependency}
        >
            {dependencies.map((dependency) => (
                <DependencyListItem
                    key={dependency.id}
                    dependency={dependency}
                    ref={refs[dependency.id]}
                />
            ))}
        </Accordion>
    );
};
