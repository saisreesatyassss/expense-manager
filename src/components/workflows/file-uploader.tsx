
"use client";

import { useState, useEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, File as FileIcon, X } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type UploadedFile = {
    name: string;
    size: number;
    type: string;
    url: string;
};

interface FileUploaderProps {
    value?: UploadedFile[];
    onValueChange?: (value: UploadedFile[]) => void;
}

export function FileUploader({ value = [], onValueChange }: FileUploaderProps) {
    const [files, setFiles] = useState<(File & { progress: number; error?: string })[]>([]);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const newFiles = acceptedFiles.map(file => Object.assign(file, { progress: 0 }));
        setFiles(prev => [...prev, ...newFiles]);
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.jpeg', '.png', '.gif'],
            'application/pdf': ['.pdf'],
            'application/msword': ['.doc', '.docx'],
            'application/vnd.ms-excel': ['.xls', '.xlsx'],
        }
    });

    useEffect(() => {
        files.forEach((file, index) => {
            if (file.progress < 100 && !file.error) {
                const timer = setTimeout(() => {
                    setFiles(prev => {
                        const newFiles = [...prev];
                        if (newFiles[index]) {
                            newFiles[index].progress += Math.random() * 25;
                            if (newFiles[index].progress >= 100) {
                                newFiles[index].progress = 100;
                                // When upload is "complete", update the form value
                                onValueChange?.([...value, { name: file.name, size: file.size, type: file.type, url: `simulated/path/${file.name}` }]);
                            }
                        }
                        return newFiles;
                    });
                }, 200 + Math.random() * 300);
                return () => clearTimeout(timer);
            }
        });
    }, [files, onValueChange, value]);

    const removeFile = (index: number) => {
        const removedFileName = files[index].name;
        setFiles(prev => prev.filter((_, i) => i !== index));
        onValueChange?.(value.filter(f => f.name !== removedFileName));
    };

    return (
        <div className="space-y-4">
            <div
                {...getRootProps()}
                className={cn(
                    "flex flex-col items-center justify-center w-full p-6 border-2 border-dashed rounded-lg cursor-pointer",
                    isDragActive ? "border-primary bg-primary/10" : "border-input hover:bg-muted/50"
                )}
            >
                <input {...getInputProps()} />
                <UploadCloud className="w-10 h-10 text-muted-foreground mb-2" />
                {isDragActive ? (
                    <p className="font-semibold text-primary">Drop the files here...</p>
                ) : (
                    <p className="text-muted-foreground"><span className="font-semibold text-primary">Click to upload</span> or drag and drop</p>
                )}
                <p className="text-xs text-muted-foreground mt-1">PDF, DOC, XLS, PNG, JPG up to 10MB</p>
            </div>
            {files.length > 0 && (
                <div className="space-y-3">
                    {files.map((file, index) => (
                        <div key={`${file.name}-${index}`} className="p-3 border rounded-lg flex items-center gap-4">
                            <FileIcon className="h-6 w-6 text-muted-foreground" />
                            <div className="flex-1">
                                <p className="text-sm font-medium truncate">{file.name}</p>
                                <div className="flex items-center gap-2">
                                    <Progress value={file.progress} className="h-2 w-full" />
                                    <span className="text-xs text-muted-foreground">{Math.round(file.progress)}%</span>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    {(file.size / 1024).toFixed(2)} KB
                                </p>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => removeFile(index)}>
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

