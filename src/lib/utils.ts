import { type ClassValue, clsx } from 'clsx';
import { customAlphabet } from 'nanoid';
import { twMerge } from 'tailwind-merge';
const randomId = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyz', 25);

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export const generateId = () => randomId();

export const getOperatingSystem = (): 'mac' | 'windows' | 'unknown' => {
    const userAgent = window.navigator.userAgent;
    if (userAgent.includes('Mac OS X')) {
        return 'mac';
    }
    if (userAgent.includes('Windows')) {
        return 'windows';
    }
    return 'unknown';
};

export const deepCopy = <T>(obj: T): T => JSON.parse(JSON.stringify(obj));

export const debounce = <T extends (...args: Parameters<T>) => ReturnType<T>>(
    func: T,
    waitFor: number
) => {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>): void => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), waitFor);
    };
};

export const waitFor = async (ms: number): Promise<void> => {
    return new Promise((resolve) => setTimeout(resolve, ms));
};
