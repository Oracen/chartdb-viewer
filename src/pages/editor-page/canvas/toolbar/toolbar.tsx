import { Button } from '@/components/button/button';
import { Card, CardContent } from '@/components/card/card';
import { Separator } from '@/components/separator/separator';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/tooltip/tooltip';

import { useOnViewportChange, useReactFlow } from '@xyflow/react';
import { Save, Scan, ZoomIn, ZoomOut } from 'lucide-react';
import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ToolbarButton } from './toolbar-button';

const convertToPercentage = (value: number) => `${Math.round(value * 100)}%`;

export interface ToolbarProps {
    readonly?: boolean;
}

export const Toolbar: React.FC<ToolbarProps> = ({ readonly }) => {
    const { t } = useTranslation();
    const { getZoom, zoomIn, zoomOut, fitView } = useReactFlow();
    const [zoom, setZoom] = useState<string>(convertToPercentage(getZoom()));
    useOnViewportChange({
        onChange: ({ zoom }) => {
            setZoom(convertToPercentage(zoom));
        },
    });

    const zoomDuration = 200;
    const zoomInHandler = () => {
        zoomIn({ duration: zoomDuration });
    };

    const zoomOutHandler = () => {
        zoomOut({ duration: zoomDuration });
    };

    const resetZoom = () => {
        fitView({
            minZoom: 1,
            maxZoom: 1,
            duration: zoomDuration,
        });
    };

    const showAll = useCallback(() => {
        fitView({
            duration: 500,
            padding: 0.1,
            maxZoom: 0.8,
        });
    }, [fitView]);

    return (
        <div className="px-1">
            <Card className="h-[44px] bg-secondary p-0 shadow-none">
                <CardContent className="flex h-full flex-row items-center p-1">
                    {!readonly ? (
                        <>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <span>
                                        <ToolbarButton
                                            onClick={() =>
                                                console.error(
                                                    'Not implemented: Save'
                                                )
                                            }
                                        >
                                            <Save />
                                        </ToolbarButton>
                                    </span>
                                </TooltipTrigger>
                                <TooltipContent>
                                    {t('toolbar.save')}
                                </TooltipContent>
                            </Tooltip>
                            <Separator orientation="vertical" />
                        </>
                    ) : null}
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <span>
                                <ToolbarButton onClick={showAll}>
                                    <Scan />
                                </ToolbarButton>
                            </span>
                        </TooltipTrigger>
                        <TooltipContent>{t('toolbar.show_all')}</TooltipContent>
                    </Tooltip>
                    <Separator orientation="vertical" />
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <span>
                                <ToolbarButton onClick={zoomOutHandler}>
                                    <ZoomOut />
                                </ToolbarButton>
                            </span>
                        </TooltipTrigger>
                        <TooltipContent>{t('toolbar.zoom_out')}</TooltipContent>
                    </Tooltip>
                    <Button
                        variant="ghost"
                        onClick={resetZoom}
                        className="w-[60px] p-2 hover:bg-primary-foreground"
                    >
                        {zoom}
                    </Button>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <span>
                                <ToolbarButton onClick={zoomInHandler}>
                                    <ZoomIn />
                                </ToolbarButton>
                            </span>
                        </TooltipTrigger>
                        <TooltipContent>{t('toolbar.zoom_in')}</TooltipContent>
                    </Tooltip>
                    <Separator orientation="vertical" />
                </CardContent>
            </Card>
        </div>
    );
};
