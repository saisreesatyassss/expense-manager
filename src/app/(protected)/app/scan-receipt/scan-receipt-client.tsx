'use client';

import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, File as FileIcon, X, Loader2, ScanLine, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { scanReceipt, type ScannedExpenseData } from '@/ai/flows/scan-receipt-flow';
import Link from 'next/link';

export function ScanReceiptClient() {
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [extractedData, setExtractedData] = useState<ScannedExpenseData | null>(null);
    const { toast } = useToast();

    const onDrop = (acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
            const selectedFile = acceptedFiles[0];
            setFile(selectedFile);
            setExtractedData(null);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result as string);
            };
            reader.readAsDataURL(selectedFile);
        }
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'image/*': ['.jpeg', '.png', '.gif', '.jpg'] },
        multiple: false,
    });

    const handleScan = async () => {
        if (!file || !preview) {
            toast({ variant: 'destructive', title: 'No file selected', description: 'Please upload a receipt image first.' });
            return;
        }

        setIsLoading(true);
        setExtractedData(null);

        try {
            const result = await scanReceipt({ receiptImage: preview });
            setExtractedData(result);
            toast({ title: 'Scan Successful', description: 'Receipt data has been extracted.' });
        } catch (error) {
            console.error('OCR Scan failed:', error);
            toast({ variant: 'destructive', title: 'Scan Failed', description: 'Could not extract data from the receipt. Please try another image.' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleReset = () => {
        setFile(null);
        setPreview(null);
        setExtractedData(null);
    };

    const createExpenseUrl = () => {
        if (!extractedData) return '/app/workflows/new';
        const params = new URLSearchParams({
            title: extractedData.description,
            amount: extractedData.totalAmount.toString(),
            date: extractedData.transactionDate,
            merchant: extractedData.merchantName,
            category: extractedData.expenseType,
        });
        return `/app/workflows/new?${params.toString()}`;
    };

    return (
        <div className="grid gap-8 md:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle>1. Upload Receipt</CardTitle>
                    <CardDescription>Drag and drop or click to upload your receipt image.</CardDescription>
                </CardHeader>
                <CardContent>
                    {!preview ? (
                        <div
                            {...getRootProps()}
                            className={cn(
                                'flex flex-col items-center justify-center w-full h-64 p-6 border-2 border-dashed rounded-lg cursor-pointer',
                                isDragActive ? 'border-primary bg-primary/10' : 'border-input hover:bg-muted/50'
                            )}
                        >
                            <input {...getInputProps()} />
                            <UploadCloud className="w-12 h-12 text-muted-foreground mb-4" />
                            {isDragActive ? (
                                <p className="font-semibold text-primary">Drop the receipt here...</p>
                            ) : (
                                <p className="text-muted-foreground text-center"><span className="font-semibold text-primary">Click to upload</span> or drag and drop</p>
                            )}
                            <p className="text-xs text-muted-foreground mt-2">PNG, JPG, GIF up to 10MB</p>
                        </div>
                    ) : (
                        <div className="relative">
                            <Image src={preview} alt="Receipt preview" width={500} height={500} className="rounded-lg object-contain w-full" />
                            <Button variant="destructive" size="icon" className="absolute top-2 right-2 rounded-full" onClick={handleReset}>
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    )}
                    {file && (
                         <div className="mt-4 flex justify-center">
                             <Button onClick={handleScan} disabled={isLoading || !!extractedData}>
                                 {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ScanLine className="mr-2 h-4 w-4" />}
                                 {isLoading ? 'Scanning...' : 'Scan Receipt'}
                             </Button>
                         </div>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>2. Extracted Information</CardTitle>
                    <CardDescription>Review the data extracted by the AI. You can edit it on the next page.</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading && (
                        <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                            <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
                            <p>Analyzing your receipt...</p>
                        </div>
                    )}
                    {!isLoading && !extractedData && (
                        <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                            <ScanLine className="w-12 h-12 mb-4" />
                            <p>Extracted data will appear here after scanning.</p>
                        </div>
                    )}
                    {extractedData && (
                        <div className="space-y-4 animate-fade-in-up">
                            <InfoItem label="Merchant" value={extractedData.merchantName} />
                            <InfoItem label="Date" value={extractedData.transactionDate} />
                            <InfoItem label="Amount" value={`$${extractedData.totalAmount.toFixed(2)}`} />
                            <InfoItem label="Suggested Description" value={extractedData.description} />
                            <InfoItem label="Suggested Category" value={extractedData.expenseType} />
                            <div className="pt-4 flex justify-end">
                                <Button asChild>
                                    <Link href={createExpenseUrl()}>
                                        Continue to Expense Form <ArrowRight className="ml-2 h-4 w-4" />
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

function InfoItem({ label, value }: { label: string; value: string | number }) {
    return (
        <div>
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <p className="text-lg font-semibold">{value}</p>
        </div>
    )
}
