import React from 'react';
import type { UUID, Memory } from '@elizaos/core';
import { Book, Clock, File, FileText, LoaderIcon, Trash2, Upload } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Use local UI components instead of importing from client
import { Badge } from './badge';
import { Button } from './button';
import { Card, CardFooter, CardHeader } from './card';
import { Input } from './input';
import { MemoryGraph } from './memory-graph';

// Local utility function instead of importing from client
const cn = (...classes: (string | undefined | null | false)[]) => {
    return classes.filter(Boolean).join(' ');
};

// Temporary toast implementation
const useToast = () => ({
    toast: ({ title, description, variant }: { title: string; description: string; variant?: string }) => {
        console.log(`Toast: ${title} - ${description} (${variant || 'default'})`);
        // TODO: Implement proper toast functionality
    }
});

// Simple Dialog components for now
const Dialog = ({ open, onOpenChange, children }: { open: boolean; onOpenChange: (open: boolean) => void; children: React.ReactNode }) => {
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => onOpenChange(false)}>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg shadow-xl max-w-full max-h-full flex flex-col" onClick={(e) => e.stopPropagation()}>
                {children}
            </div>
        </div>
    );
};

const DialogContent = ({ className, children }: { className?: string; children: React.ReactNode }) => (
    <div className={cn("p-6 flex flex-col border-gray-200 dark:border-gray-700", className)}>{children}</div>
);

const DialogHeader = ({ className, children }: { className?: string; children: React.ReactNode }) => (
    <div className={cn("mb-4", className)}>{children}</div>
);

const DialogTitle = ({ className, children }: { className?: string; children: React.ReactNode }) => (
    <h2 className={cn("text-lg font-semibold", className)}>{children}</h2>
);

const DialogDescription = ({ className, children }: { className?: string; children: React.ReactNode }) => (
    <p className={cn("text-sm text-gray-600", className)}>{children}</p>
);

const DialogFooter = ({ className, children }: { className?: string; children: React.ReactNode }) => (
    <div className={cn("flex justify-end gap-2 mt-4", className)}>{children}</div>
);

const ITEMS_PER_PAGE = 10;

interface MemoryContent {
    text?: string;
    metadata?: {
        fileType?: string;
        title?: string;
        filename?: string;
        path?: string;
        description?: string;
    };
}

interface MemoryMetadata {
    type?: string;
    title?: string;
    filename?: string;
    path?: string;
    description?: string;
    fileExt?: string;
    timestamp?: number;
    contentType?: string;
    documentId?: string;
}

interface UploadResultItem {
    status: string;
    id?: UUID;
    filename?: string;
}

const apiClient = {
    getKnowledgeDocuments: async (agentId: UUID, options?: { limit?: number; before?: number; includeEmbedding?: boolean }) => {
        const params = new URLSearchParams();
        if (options?.limit) params.append('limit', options.limit.toString());
        if (options?.before) params.append('before', options.before.toString());
        if (options?.includeEmbedding) params.append('includeEmbedding', 'true');

        const response = await fetch(`/api/agents/${agentId}/plugins/knowledge/documents?${params.toString()}`);
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to fetch knowledge documents: ${response.status} ${errorText}`);
        }
        return await response.json();
    },

    getKnowledgeChunks: async (agentId: UUID, options?: { limit?: number; before?: number }) => {
        const params = new URLSearchParams();
        if (options?.limit) params.append('limit', options.limit.toString());
        if (options?.before) params.append('before', options.before.toString());

        const response = await fetch(`/api/agents/${agentId}/plugins/knowledge/knowledges?${params.toString()}`);
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to fetch knowledge chunks: ${response.status} ${errorText}`);
        }
        return await response.json();
    },

    deleteKnowledgeDocument: async (agentId: UUID, knowledgeId: UUID) => {
        const response = await fetch(`/api/agents/${agentId}/plugins/knowledge/documents/${knowledgeId}`, {
            method: 'DELETE',
        });
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to delete knowledge document: ${response.status} ${errorText}`);
        }
        if (response.status === 204) return;
        return await response.json();
    },

    uploadKnowledge: async (agentId: string, files: File[]) => {
        const formData = new FormData();
        files.forEach(file => formData.append('files', file));

        const response = await fetch(`/api/agents/${agentId}/plugins/knowledge/documents`, {
            method: 'POST',
            body: formData,
        });
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to upload knowledge: ${response.status} ${errorText}`);
        }
        return await response.json();
    }
};

const useKnowledgeDocuments = (agentId: UUID, enabled: boolean = true, includeEmbedding: boolean = false) => {
    return useQuery<Memory[], Error>({
        queryKey: ['agents', agentId, 'knowledge', 'documents', { includeEmbedding }],
        queryFn: async () => {
            const response = await apiClient.getKnowledgeDocuments(agentId, { includeEmbedding });
            return response.data.memories;
        },
        enabled,
    });
};

const useKnowledgeChunks = (agentId: UUID, enabled: boolean = true) => {
    return useQuery<Memory[], Error>({
        queryKey: ['agents', agentId, 'knowledge', 'chunks'],
        queryFn: async () => {
            const response = await apiClient.getKnowledgeChunks(agentId);
            return response.data.chunks;
        },
        enabled,
    });
};

// Hook for deleting knowledge documents
const useDeleteKnowledgeDocument = (agentId: UUID) => {
    const queryClient = useQueryClient();
    return useMutation<
        void,
        Error,
        { knowledgeId: UUID }
    >({
        mutationFn: async ({ knowledgeId }) => {
            await apiClient.deleteKnowledgeDocument(agentId, knowledgeId);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['agents', agentId, 'knowledge', 'documents'],
            });
        },
    });
};

export function KnowledgeTab({ agentId }: { agentId: UUID }) {
    const [viewingContent, setViewingContent] = useState<Memory | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [visibleItems, setVisibleItems] = useState(ITEMS_PER_PAGE);
    const [loadingMore, setLoadingMore] = useState(false);
    const [viewMode, setViewMode] = useState<'list' | 'graph'>('list');
    const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);
    const [pdfZoom, setPdfZoom] = useState(1.0);
    const [showUrlDialog, setShowUrlDialog] = useState(false);
    const [urlInput, setUrlInput] = useState('');
    const [isUrlUploading, setIsUrlUploading] = useState(false);
    const [urlError, setUrlError] = useState<string | null>(null);
    const [urls, setUrls] = useState<string[]>([]);
    
    const fileInputRef = useRef<HTMLInputElement>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const {
        data: documents = [],
        isLoading: documentsLoading,
        error: documentsError,
    } = useKnowledgeDocuments(agentId, viewMode === 'list', false);

    const {
        data: knowledgeChunks = [],
        isLoading: chunksLoading,
        error: chunksError,
    } = useKnowledgeChunks(agentId, viewMode === 'graph');

    const isLoading = viewMode === 'list' ? documentsLoading : chunksLoading;
    const error = viewMode === 'list' ? documentsError : chunksError;
    const memories = viewMode === 'list' ? documents : knowledgeChunks;

    const { mutate: deleteKnowledgeDoc } = useDeleteKnowledgeDocument(agentId);

    const handleScroll = useCallback(() => {
        if (!scrollContainerRef.current || loadingMore || visibleItems >= memories.length) {
            return;
        }
        const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
        const scrolledToBottom = scrollTop + clientHeight >= scrollHeight - 100;
        if (scrolledToBottom) {
            setLoadingMore(true);
            setTimeout(() => {
                setVisibleItems((prev) => Math.min(prev + ITEMS_PER_PAGE, memories.length));
                setLoadingMore(false);
            }, 300);
        }
    }, [loadingMore, visibleItems, memories.length]);

    useEffect(() => {
        setVisibleItems(ITEMS_PER_PAGE);
    }, []);

    useEffect(() => {
        const scrollContainer = scrollContainerRef.current;
        if (scrollContainer) {
            scrollContainer.addEventListener('scroll', handleScroll);
            return () => scrollContainer.removeEventListener('scroll', handleScroll);
        }
    }, [handleScroll]);

    if (isLoading && (!memories || memories.length === 0)) {
        return (
            <div className="flex items-center justify-center h-40">Loading knowledge documents...</div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-40 text-destructive">
                Error loading knowledge documents: {error.message}
            </div>
        );
    }

    const formatDate = (timestamp: number) => {
        const date = new Date(timestamp);
        return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
    };

    const getFileIcon = (fileName: string) => {
        const ext = fileName.split('.').pop()?.toLowerCase();
        switch (ext) {
            case 'md': return <File className="h-4 w-4 text-blue-500" />;
            case 'js': case 'ts': case 'jsx': case 'tsx': return <File className="h-4 w-4 text-yellow-500" />;
            case 'json': return <File className="h-4 w-4 text-green-500" />;
            case 'pdf': return <FileText className="h-4 w-4 text-red-500" />;
            default: return <FileText className="h-4 w-4 text-gray-500" />;
        }
    };

    const handleDelete = (knowledgeId: string) => {
        if (knowledgeId && window.confirm('Are you sure you want to delete this document?')) {
            deleteKnowledgeDoc({ knowledgeId: knowledgeId as UUID });
            setViewingContent(null);
        }
    };

    const handleUploadClick = () => {
        if (fileInputRef.current) fileInputRef.current.click();
    };

    const handleUrlUploadClick = () => {
        setShowUrlDialog(true);
        setUrlInput('');
        setUrls([]);
        setUrlError(null);
    };

    const addUrlToList = () => {
        try {
            const url = new URL(urlInput);
            if (!url.protocol.startsWith('http')) {
                setUrlError('URL must start with http:// or https://');
                return;
            }
            
            if (urls.includes(urlInput)) {
                setUrlError('This URL is already in the list');
                return;
            }
            
            setUrls([...urls, urlInput]);
            setUrlInput('');
            setUrlError(null);
        } catch (e) {
            setUrlError('URL invalide');
        }
    };

    const removeUrl = (urlToRemove: string) => {
        setUrls(urls.filter(url => url !== urlToRemove));
    };

    const handleUrlSubmit = async () => {
        // Check if there's a URL in the input field that hasn't been added to the list
        if (urlInput.trim()) {
            try {
                const url = new URL(urlInput);
                if (url.protocol.startsWith('http') && !urls.includes(urlInput)) {
                    setUrls([...urls, urlInput]);
                }
            } catch (e) {
                // If the input is not a valid URL, just ignore it
            }
        }
        
        // If no URLs to process, show error
        if (urls.length === 0) {
            setUrlError('Please add at least one valid URL');
            return;
        }

        setIsUrlUploading(true);
        setUrlError(null);

        try {
            const result = await fetch(`/api/agents/${agentId}/plugins/knowledge/documents`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ fileUrls: urls }),
            });

            if (!result.ok) {
                const error = await result.text();
                throw new Error(error);
            }

            const data = await result.json();
            
            if (data.success) {
                toast({
                    title: 'URLs imported',
                    description: `Successfully imported ${urls.length} document(s)`,
                });
                setShowUrlDialog(false);
                queryClient.invalidateQueries({
                    queryKey: ['agents', agentId, 'knowledge', 'documents'],
                });
            } else {
                setUrlError(data.error?.message || 'Error importing documents from URLs');
            }
        } catch (error: any) {
            setUrlError(error.message || 'Error importing documents from URLs');
            toast({
                title: 'Error',
                description: 'Failed to import documents from URLs',
                variant: 'destructive',
            });
        } finally {
            setIsUrlUploading(false);
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;
        setIsUploading(true);
        try {
            const fileArray = Array.from(files);
            const result = await apiClient.uploadKnowledge(agentId, fileArray);

            // The actual array of upload outcomes is in result.data
            const uploadOutcomes: UploadResultItem[] = result.data || [];

            if (Array.isArray(uploadOutcomes) && uploadOutcomes.every((r: UploadResultItem) => r.status === 'success')) {
                toast({
                    title: 'Knowledge Uploaded',
                    description: `Successfully uploaded ${fileArray.length} file(s)`,
                });
                queryClient.invalidateQueries({
                    queryKey: ['agents', agentId, 'knowledge', 'documents'],
                });
            } else {
                const successfulUploads = uploadOutcomes.filter((r: UploadResultItem) => r.status === 'success').length;
                const failedUploads = fileArray.length - successfulUploads;
                toast({
                    title: failedUploads > 0 ? 'Upload Partially Failed' : 'Upload Issues',
                    description: `Uploaded ${successfulUploads} file(s). ${failedUploads} file(s) failed. Check console for details.`,
                    variant: failedUploads > 0 ? 'destructive' : 'default',
                });
                console.error('Upload results:', uploadOutcomes);
            }
        } catch (uploadError: any) {
            toast({
                title: 'Upload Failed',
                description: uploadError instanceof Error ? uploadError.message : 'Failed to upload knowledge files',
                variant: 'destructive',
            });
            console.error('Upload error:', uploadError);
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const visibleMemories = memories.slice(0, visibleItems);
    const hasMoreToLoad = visibleItems < memories.length;

    const LoadingIndicator = () => (
        <div className="flex justify-center p-4">
            {loadingMore ? (
                <div className="flex items-center gap-2">
                    <LoaderIcon className="h-4 w-4 animate-spin" />
                    <span className="text-sm text-muted-foreground">Loading more...</span>
                </div>
            ) : (
                <Button variant="ghost" size="sm" onClick={() => setVisibleItems((prev) => prev + ITEMS_PER_PAGE)} className="text-xs">
                    Show more
                </Button>
            )}
        </div>
    );

    const EmptyState = () => (
        <div className="text-muted-foreground text-center p-12 flex flex-col items-center gap-3 border-2 border-dashed rounded-lg mt-8">
            <Book className="h-12 w-12 text-muted-foreground opacity-20" />
            <h3 className="text-lg font-medium">No Knowledge Documents</h3>
            <p className="max-w-md text-sm">No Knowledge Documents found.</p>
            <Button variant="outline" onClick={handleUploadClick}>
                <Upload className="h-4 w-4 mr-2" />
                Upload Documents
            </Button>
        </div>
    );

    const KnowledgeCard = ({ memory, index }: { memory: Memory; index: number }) => {
        const metadata = (memory.metadata as MemoryMetadata) || {};
        const title = metadata.title || memory.id || 'Unknown Document';
        const filename = metadata.filename || 'Unknown Document';
        const fileExt = metadata.fileExt || filename.split('.').pop()?.toLowerCase() || '';
        const displayName = title || filename;
        const subtitle = metadata.path || filename;

        return (
            <button key={memory.id || index} type="button" className="w-full text-left" onClick={() => setViewingContent(memory)}>
                <Card className="hover:bg-accent/10 transition-colors relative group">
                    <div className="absolute top-3 left-3 opacity-70">{getFileIcon(filename)}</div>
                    <CardHeader className="p-3 pb-2 pl-10">
                        <div className="text-xs text-muted-foreground mb-1 line-clamp-1">{subtitle}</div>
                        <div className="mb-2">
                            <div className="text-sm font-medium mb-1">{displayName}</div>
                            {metadata.description && (
                                <div className="text-xs text-muted-foreground line-clamp-2">{metadata.description}</div>
                            )}
                        </div>
                    </CardHeader>
                    <CardFooter className="p-2 border-t bg-muted/30 text-xs text-muted-foreground">
                        <div className="flex justify-between items-center w-full">
                            <div className="flex items-center">
                                <Clock className="h-3 w-3 mr-1.5" />
                                <span>
                                    {new Date(memory.createdAt || 0).toLocaleString(undefined, {
                                        month: 'numeric', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric',
                                    })}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Badge variant="outline" className="px-1.5 py-0 h-5">{fileExt || 'unknown document'}</Badge>
                                {memory.id && (
                                    <Button variant="ghost" size="icon" className="size-6 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => {
                                        if (e) {
                                            e.stopPropagation();
                                            e.preventDefault();
                                        }
                                        handleDelete(memory.id || '');
                                    }} title="Delete knowledge">
                                        <Trash2 className="h-3.5 w-3.5 text-destructive" />
                                    </Button>
                                )}
                            </div>
                        </div>
                    </CardFooter>
                </Card>
            </button>
        );
    };

    return (
        <div className="flex flex-col h-full">
            <div className="flex items-center justify-between p-4 border-b">
                <h2 className="text-lg font-semibold">Knowledge</h2>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => setViewMode(viewMode === 'list' ? 'graph' : 'list')}>
                        {viewMode === 'list' ? 'Graph' : 'List'}
                    </Button>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={handleUrlUploadClick}>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                            </svg>
                            URL
                        </Button>
                        <Button onClick={handleUploadClick} disabled={isUploading}>
                            {isUploading ? <LoaderIcon className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
                            Upload
                        </Button>
                    </div>
                </div>
            </div>

            {/* Dialog for URL upload */}
            {showUrlDialog && (
                <Dialog open={showUrlDialog} onOpenChange={setShowUrlDialog}>
                    <DialogContent className="max-w-md w-full">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white">Import from URL</DialogTitle>
                            <DialogDescription className="text-gray-700 dark:text-gray-300">
                                Enter one or more URLs of PDF, text, or other files to import into the knowledge base.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="mt-6 space-y-4">
                            <div className="flex gap-2">
                                <Input
                                    placeholder="https://example.com/document.pdf"
                                    value={urlInput}
                                    onChange={(e) => setUrlInput(e.target.value)}
                                    disabled={isUrlUploading}
                                    className="flex-1 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && urlInput.trim()) {
                                            e.preventDefault();
                                            addUrlToList();
                                        }
                                    }}
                                />
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={addUrlToList} 
                                    disabled={isUrlUploading || !urlInput.trim()}
                                    className="bg-blue-50 hover:bg-blue-100 text-blue-600 border-blue-200 hover:border-blue-300 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 dark:text-blue-400 dark:border-blue-800"
                                >
                                    Add
                                </Button>
                            </div>
                            
                            {urlError && (
                                <div className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 p-2 rounded-md">{urlError}</div>
                            )}
                            
                            {urls.length > 0 && (
                                <div className="border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 p-3 mt-2">
                                    <h4 className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">URLs to import ({urls.length})</h4>
                                    <div className="space-y-2 max-h-40 overflow-y-auto">
                                        {urls.map((url, index) => (
                                            <div key={index} className="flex items-center justify-between text-sm bg-gray-50 dark:bg-gray-700 p-2 rounded border border-gray-200 dark:border-gray-600">
                                                <span className="truncate flex-1 text-gray-800 dark:text-gray-200">{url}</span>
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    className="h-6 w-6 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/30 dark:hover:text-red-400" 
                                                    onClick={() => removeUrl(url)}
                                                    disabled={isUrlUploading}
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <DialogFooter className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                            <Button 
                                variant="outline" 
                                onClick={() => setShowUrlDialog(false)} 
                                disabled={isUrlUploading}
                                className="bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-300"
                            >
                                Cancel
                            </Button>
                            <Button 
                                onClick={handleUrlSubmit} 
                                disabled={isUrlUploading || (urls.length === 0 && !urlInput.trim())}
                                className="bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-700 dark:hover:bg-blue-600"
                            >
                                {isUrlUploading ? (
                                    <>
                                        <LoaderIcon className="h-4 w-4 animate-spin mr-2" />
                                        Importing...
                                    </>
                                ) : (
                                    'Import'
                                )}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}

            {/* Existing input for file upload */}
            <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".txt,.md,.markdown,.pdf,.doc,.docx,.json,.xml,.yaml,.yml,.csv,.tsv,.log,.ini,.cfg,.conf,.env,.gitignore,.dockerignore,.editorconfig,.js,.jsx,.ts,.tsx,.mjs,.cjs,.py,.pyw,.pyi,.java,.c,.cpp,.cc,.cxx,.h,.hpp,.cs,.php,.rb,.go,.rs,.swift,.kt,.kts,.scala,.clj,.cljs,.ex,.exs,.r,.R,.m,.mm,.sh,.bash,.zsh,.fish,.ps1,.bat,.cmd,.sql,.html,.htm,.css,.scss,.sass,.less,.vue,.svelte,.astro,.lua,.pl,.pm,.dart,.hs,.elm,.ml,.fs,.fsx,.vb,.pas,.d,.nim,.zig,.jl,.tcl,.awk,.sed"
                onChange={handleFileChange}
                className="hidden"
            />

            <div className="flex-1 overflow-hidden">
                {memories.length === 0 ? (
                    <EmptyState />
                ) : viewMode === 'graph' ? (
                    <div className="h-full p-4">
                        <MemoryGraph
                            memories={memories}
                            onNodeClick={setSelectedMemory}
                            selectedMemoryId={selectedMemory?.id}
                        />
                    </div>
                ) : (
                    <div ref={scrollContainerRef} className="h-full overflow-y-auto p-4">
                        <div className="grid gap-3">
                            {visibleMemories.map((memory, index) => (
                                <KnowledgeCard key={memory.id || index} memory={memory} index={index} />
                            ))}
                        </div>
                        {hasMoreToLoad && <LoadingIndicator />}
                    </div>
                )}
            </div>

            {viewingContent && (
                <Dialog open={!!viewingContent} onOpenChange={() => setViewingContent(null)}>
                    <DialogContent className="max-w-[95vw] w-full max-h-[95vh] h-full overflow-hidden flex flex-col p-0">
                        <DialogHeader className="flex-shrink-0 p-6 pb-2">
                            <div className="flex items-center justify-between">
                                <div>
                                    <DialogTitle className="text-xl">
                                        {(viewingContent.metadata as MemoryMetadata)?.title || 'Document Content'}
                                    </DialogTitle>
                                    <DialogDescription>
                                        {(viewingContent.metadata as MemoryMetadata)?.filename || 'Knowledge document'}
                                    </DialogDescription>
                                </div>
                                {(() => {
                                    const metadata = viewingContent.metadata as MemoryMetadata;
                                    const contentType = metadata?.contentType || '';
                                    const fileExt = metadata?.fileExt?.toLowerCase() || '';
                                    const isPdf = contentType === 'application/pdf' || fileExt === 'pdf';

                                    if (isPdf) {
                                        return (
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setPdfZoom(Math.max(0.5, pdfZoom - 0.25))}
                                                    disabled={pdfZoom <= 0.5}
                                                >
                                                    <span className="text-lg">−</span>
                                                </Button>
                                                <span className="text-sm font-medium min-w-[60px] text-center">
                                                    {Math.round(pdfZoom * 100)}%
                                                </span>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setPdfZoom(Math.min(3, pdfZoom + 0.25))}
                                                    disabled={pdfZoom >= 3}
                                                >
                                                    <span className="text-lg">+</span>
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setPdfZoom(1.0)}
                                                >
                                                    Reset
                                                </Button>
                                            </div>
                                        );
                                    }
                                    return null;
                                })()}
                            </div>
                        </DialogHeader>
                        <div className="flex-1 overflow-auto px-6 pb-2">
                            {(() => {
                                const metadata = viewingContent.metadata as MemoryMetadata;
                                const contentType = metadata?.contentType || '';
                                const fileExt = metadata?.fileExt?.toLowerCase() || '';
                                const isPdf = contentType === 'application/pdf' || fileExt === 'pdf';

                                if (isPdf && viewingContent.content?.text) {
                                    // For PDFs, the content.text contains base64 data
                                    // Create a data URL for the PDF
                                    const pdfDataUrl = `data:application/pdf;base64,${viewingContent.content.text}`;

                                    return (
                                        <div className="w-full h-full rounded-lg overflow-auto bg-gray-100 dark:bg-gray-900">
                                            <div
                                                className="min-w-full flex items-center justify-center p-4"
                                                style={{
                                                    minHeight: '100%',
                                                    transform: `scale(${pdfZoom})`,
                                                    transformOrigin: 'top center',
                                                    width: pdfZoom > 1 ? `${100 / pdfZoom}%` : '100%'
                                                }}
                                            >
                                                <iframe
                                                    src={pdfDataUrl}
                                                    className="w-full border-0 shadow-lg"
                                                    style={{
                                                        height: '90vh',
                                                        maxWidth: '1200px',
                                                    }}
                                                    title="PDF Document"
                                                />
                                            </div>
                                        </div>
                                    );
                                } else {
                                    // For all other documents, display as plain text
                                    return (
                                        <div className="h-full w-full bg-gray-50 dark:bg-gray-900 rounded-lg border p-6">
                                            <pre className="whitespace-pre-wrap text-sm font-mono leading-relaxed text-gray-800 dark:text-gray-200 min-w-0 break-words">
                                                {viewingContent.content?.text || 'No content available'}
                                            </pre>
                                        </div>
                                    );
                                }
                            })()}
                        </div>
                        <DialogFooter className="flex-shrink-0 p-6 pt-4">
                            <Button variant="outline" onClick={() => {
                                setViewingContent(null);
                                setPdfZoom(1.0); // Reset zoom when closing
                            }}>
                                Close
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    );
}
