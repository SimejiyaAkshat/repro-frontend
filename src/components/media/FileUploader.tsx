import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  AlertCircleIcon, 
  ArrowUpIcon, 
  CheckCircleIcon, 
  FileIcon, 
  FolderIcon, 
  ImageIcon, 
  FilmIcon, 
  XIcon, 
  UploadCloudIcon,
  CloudIcon,
  PlusIcon,
  BoxIcon,
  MonitorIcon,
  SaveIcon,
  SendIcon
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/components/auth/AuthProvider';
import { useShoots } from '@/context/ShootsContext';
import axios from 'axios';

interface FileUploaderProps {
  shootId?: string;
  onUploadComplete?: (files: File[], notes: string) => void;
  allowedFileTypes?: string[];
  className?: string;
  initialNotes?: string;
}

export function FileUploader({
  shootId,
  onUploadComplete,
  allowedFileTypes = [
    'image/jpeg', 'image/png', 'image/tiff', 
    'video/mp4', 'video/quicktime',
    'application/zip', 'application/x-zip-compressed'
  ],
  className,
  initialNotes = ''
}: FileUploaderProps) {
  const { toast } = useToast();
  const { updateShoot } = useShoots();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropzoneRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  
  // Determine initial upload type based on user role
  // Photographers see raw/unedited, editors see edited/final
  const initialUploadType = user?.role === 'editor' ? 'edited' : 'raw';
  const [uploadType, setUploadType] = useState<'raw' | 'edited'>(initialUploadType);
  
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [notes, setNotes] = useState(initialNotes);
  const [notesChanged, setNotesChanged] = useState(false);
  const [uploadMethod, setUploadMethod] = useState<'local' | 'dropbox' | 'google'>('local');

  // Update notes from props if it changes
  useEffect(() => {
    if (initialNotes !== undefined && initialNotes !== notes && !notesChanged) {
      setNotes(initialNotes);
    }
  }, [initialNotes]);

  // Handle notes change
  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNotes(e.target.value);
    setNotesChanged(true);
  };

  // Save notes to the shoot independently of upload
  const handleSaveNotes = async () => {
    if (!shootId) {
      toast({
        title: "Cannot save notes",
        description: "No shoot ID provided",
        variant: "destructive"
      });
      return;
    }

    try {
      // Determine which note field to update based on user role
      let notesUpdate: any = {};
      
      if (user?.role === 'photographer') {
        notesUpdate = { notes: { photographerNotes: notes } };
      } else if (user?.role === 'editor') {
        notesUpdate = { notes: { editingNotes: notes } };
      } else if (user?.role === 'admin' || user?.role === 'superadmin') {
        // For admin, determine based on the active tab
        if (uploadType === 'raw') {
          notesUpdate = { notes: { photographerNotes: notes } };
        } else {
          notesUpdate = { notes: { editingNotes: notes } };
        }
      } else {
        notesUpdate = { notes: { shootNotes: notes } };
      }
      
      await updateShoot(shootId, notesUpdate);
      
      toast({
        title: "Notes saved",
        description: "Your upload notes have been saved successfully",
      });
      
      setNotesChanged(false);
    } catch (error) {
      console.error("Error saving notes:", error);
      toast({
        title: "Error saving notes",
        description: "There was a problem saving your notes",
        variant: "destructive"
      });
    }
  };
  
  const validateFiles = (fileList: FileList | File[]) => {
    const validFiles: File[] = [];
    const invalidFiles: { file: File; reason: string }[] = [];
    
    Array.from(fileList).forEach(file => {
      if (!allowedFileTypes.includes(file.type)) {
        invalidFiles.push({ file, reason: 'File type not supported' });
        return;
      }
      
      if (file.size > 100 * 1024 * 1024) {
        invalidFiles.push({ file, reason: 'File exceeds 100MB size limit' });
        return;
      }
      
      validFiles.push(file);
    });
    
    if (invalidFiles.length > 0) {
      toast({
        title: `${invalidFiles.length} file(s) couldn't be added`,
        description: invalidFiles.map(f => `${f.file.name}: ${f.reason}`).join(', '),
        variant: 'destructive',
      });
    }
    
    return validFiles;
  };
  
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    
    const validFiles = validateFiles(e.target.files);
    setFiles(prev => [...prev, ...validFiles]);
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    dropzoneRef.current?.classList.remove('border-primary', 'bg-primary/5');
    
    if (!e.dataTransfer.files?.length) return;
    
    const validFiles = validateFiles(e.dataTransfer.files);
    setFiles(prev => [...prev, ...validFiles]);
  };
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dropzoneRef.current?.classList.add('border-primary', 'bg-primary/5');
  };
  
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dropzoneRef.current?.classList.remove('border-primary', 'bg-primary/5');
  };
  
  const connectDropbox = () => {
    toast({
      title: "Connecting to Dropbox",
      description: "Redirecting to Dropbox authorization...",
    });
    
    setUploadMethod('dropbox');
    
    setTimeout(() => {
      toast({
        title: "Dropbox Connected",
        description: "Successfully connected to Dropbox. You can now select files.",
      });
    }, 2000);
  };
  
  const connectGoogleDrive = () => {
    toast({
      title: "Connecting to Google Drive",
      description: "Redirecting to Google authorization...",
    });
    
    setUploadMethod('google');
    
    setTimeout(() => {
      toast({
        title: "Google Drive Connected",
        description: "Successfully connected to Google Drive. You can now select files.",
      });
    }, 2000);
  };
  
  const handleRemoveFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };
  
  const handleClearFiles = () => {
    setFiles([]);
  };
  
  const handleUpload = async () => {
    
    console.log("Starting upload for shoot ID:", shootId);
    if (files.length === 0) {
      toast({
        title: 'No files selected',
        description: 'Please select files to upload',
        variant: 'destructive',
      });
      return;
    }
    
    setUploading(true);
    
      // Replace the timeout in handleUpload with:
      const formData = new FormData();
      files.forEach(file => formData.append('files[]', file));

      try {
        const token = localStorage.getItem('authToken');

        if (!token) {
          throw new Error("No auth token found in localStorage");
        }
        console.log("Soot id is "+shootId)
        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}/api/shoots/${shootId}/upload`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
              Authorization: `Bearer ${token}`, 
            },
            onUploadProgress: (progressEvent) => {
              const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              setProgress(percentCompleted);
            }
          }
        );

        toast({
          title: 'Upload Complete',
          description: `${files.length} files uploaded successfully.`,
        });

        if (onUploadComplete) {
          onUploadComplete(files, notes);
        }

        setUploading(false);
        setProgress(0);
        setFiles([]);
        setNotesChanged(false);
      } catch (error) {
        toast({
          title: 'Upload Failed',
          description: 'Something went wrong while uploading.',
          variant: 'destructive',
        });
        console.error(error);
        setUploading(false);
      }

  };
  
  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <ImageIcon className="h-5 w-5 text-blue-500" />;
    } else if (file.type.startsWith('video/')) {
      return <FilmIcon className="h-5 w-5 text-purple-500" />;
    } else if (file.type.includes('zip')) {
      return <FolderIcon className="h-5 w-5 text-yellow-500" />;
    } else {
      return <FileIcon className="h-5 w-5 text-gray-500" />;
    }
  };
  
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  // Determine which tab to show based on user role
  const showRawTab = user?.role === 'photographer' || user?.role === 'admin' || user?.role === 'superadmin';
  const showEditedTab = user?.role === 'editor' || user?.role === 'admin' || user?.role === 'superadmin';
  
  // Get placeholder text based on user role and upload type
  const getNotesPlaceholder = () => {
    if (user?.role === 'photographer') {
      return "Add your notes about the shoot or specific instructions for the editor...";
    } else if (user?.role === 'editor') {
      return "Add your notes about the edited files or any delivery instructions...";
    } else if (uploadType === 'raw') {
      return "Add photographer notes or instructions for the editor...";
    } else {
      return "Add editor notes or delivery instructions...";
    }
  };
  
  // Get notes section title based on user role
  const getNotesTitle = () => {
    if (user?.role === 'photographer') {
      return "Photographer Notes";
    } else if (user?.role === 'editor') {
      return "Editor Notes";
    } else if (uploadType === 'raw') {
      return "Photographer Upload Notes";
    } else {
      return "Editor Upload Notes";
    }
  };
  
  // Get background color class based on user role - Updated to match dashboard background
  const getNotesBackgroundColorClass = () => {
    if (user?.role === 'photographer') {
      return "bg-blue-50/60 dark:bg-blue-900/10";
    } else if (user?.role === 'editor') {
      return "bg-purple-50/60 dark:bg-purple-900/10";
    } else if (uploadType === 'raw') {
      return "bg-blue-50/60 dark:bg-blue-900/10";
    } else {
      return "bg-purple-50/60 dark:bg-purple-900/10";
    }
  };

  // Get text color class based on user role - Updated for better contrast
  const getNotesTextColorClass = () => {
    if (user?.role === 'photographer') {
      return "text-blue-800 dark:text-blue-300";
    } else if (user?.role === 'editor') {
      return "text-purple-800 dark:text-purple-300";
    } else if (uploadType === 'raw') {
      return "text-blue-800 dark:text-blue-300";
    } else {
      return "text-purple-800 dark:text-purple-300";
    }
  };

  // Get border color class based on user role - Updated for better visual hierarchy
  const getNotesBorderColorClass = () => {
    if (user?.role === 'photographer') {
      return "border-blue-200 dark:border-blue-700";
    } else if (user?.role === 'editor') {
      return "border-purple-200 dark:border-purple-700";
    } else if (uploadType === 'raw') {
      return "border-blue-200 dark:border-blue-700";
    } else {
      return "border-purple-200 dark:border-purple-700";
    }
  };
  
  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-border">
        <div className="flex items-center gap-2">
          <UploadCloudIcon className="h-5 w-5 text-primary" />
          <CardTitle>File Uploader</CardTitle>
        </div>
        
        {shootId && (
          <Badge variant="outline">
            Shoot #{shootId}
          </Badge>
        )}
      </CardHeader>
      
      <CardContent className="p-4">
        {/* Only show tabs if both raw and edited tabs are available (admin) */}
        {showRawTab && showEditedTab ? (
          <Tabs value={uploadType} onValueChange={(v: any) => setUploadType(v)} className="mb-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="raw">Raw/Unedited Files</TabsTrigger>
              <TabsTrigger value="edited">Edited/Final Files</TabsTrigger>
            </TabsList>
            <TabsContent value="raw" className="pt-4">
              <div className="text-sm text-muted-foreground mb-4">
                Upload RAW, unedited files for processing. Supported formats: JPG, PNG, TIFF, NEF, CR2, CR3, ARW, DNG (photos), MP4, MOV (videos), ZIP (iGuide).
              </div>
            </TabsContent>
            <TabsContent value="edited" className="pt-4">
              <div className="text-sm text-muted-foreground mb-4">
                Upload final, edited files ready for client delivery. Supported formats: JPG, PNG (photos), MP4 (videos), ZIP (packages).
              </div>
            </TabsContent>
          </Tabs>
        ) : (
          // Show only one tab description based on user role
          <div className="mb-4">
            {showRawTab && !showEditedTab && (
              <div className="text-sm text-muted-foreground mb-4">
                <h3 className="font-medium text-base mb-1">Raw/Unedited Files</h3>
                Upload RAW, unedited files for processing. Supported formats: JPG, PNG, TIFF, NEF, CR2, CR3, ARW, DNG (photos), MP4, MOV (videos), ZIP (iGuide).
              </div>
            )}
            {showEditedTab && !showRawTab && (
              <div className="text-sm text-muted-foreground mb-4">
                <h3 className="font-medium text-base mb-1">Edited/Final Files</h3>
                Upload final, edited files ready for client delivery. Supported formats: JPG, PNG (photos), MP4 (videos), ZIP (packages).
              </div>
            )}
          </div>
        )}
        
        <div className="flex flex-wrap gap-2 mb-4">
          <Button 
            variant={uploadMethod === 'local' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setUploadMethod('local')}
            className="flex-1"
          >
            <UploadCloudIcon className="h-4 w-4 mr-2" />
            Local Upload
          </Button>
          
          <Button 
            variant={uploadMethod === 'dropbox' ? 'default' : 'outline'} 
            size="sm"
            onClick={connectDropbox}
            className="flex-1"
          >
            <BoxIcon className="h-4 w-4 mr-2" />
            Dropbox
          </Button>
          
          <Button 
            variant={uploadMethod === 'google' ? 'default' : 'outline'} 
            size="sm"
            onClick={connectGoogleDrive}
            className="flex-1"
          >
            <CloudIcon className="h-4 w-4 mr-2" />
            Google Drive
          </Button>
        </div>
        
        {uploadMethod === 'local' && (
          <div
            ref={dropzoneRef}
            className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 hover:bg-primary/5 transition-colors cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileInputChange}
              multiple
              hidden
            />
            
            <UploadCloudIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Drop files here or click to browse</h3>
            <p className="text-sm text-muted-foreground mb-2">
              Upload up to 100 files at once (100MB max per file)
            </p>
            <Button variant="outline" className="mt-2" disabled={uploading}>
              <ArrowUpIcon className="h-4 w-4 mr-2" />
              Select Files
            </Button>
          </div>
        )}
        
        {uploadMethod === 'dropbox' && (
          <div className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BoxIcon className="h-5 w-5 text-blue-600" />
                <h3 className="font-medium">Dropbox Files</h3>
              </div>
              <Button variant="outline" size="sm" onClick={() => setFiles([])}>
                <CheckCircleIcon className="h-4 w-4 mr-2" />
                Select All
              </Button>
            </div>
            
            <div className="border rounded p-3 mb-4 flex items-center justify-between">
              <div className="flex items-center">
                <ImageIcon className="h-5 w-5 text-blue-500 mr-2" />
                <span>client_project_photo.jpg</span>
              </div>
              <Button size="sm" variant="ghost" onClick={() => setFiles([...files, new File([], 'client_project_photo.jpg')])}>
                <PlusIcon className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="border rounded p-3 mb-4 flex items-center justify-between">
              <div className="flex items-center">
                <FilmIcon className="h-5 w-5 text-purple-500 mr-2" />
                <span>property_tour.mov</span>
              </div>
              <Button size="sm" variant="ghost" onClick={() => setFiles([...files, new File([], 'property_tour.mov')])}>
                <PlusIcon className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="border rounded p-3 flex items-center justify-between">
              <div className="flex items-center">
                <FileIcon className="h-5 w-5 text-gray-500 mr-2" />
                <span>listings_package.zip</span>
              </div>
              <Button size="sm" variant="ghost" onClick={() => setFiles([...files, new File([], 'listings_package.zip')])}>
                <PlusIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
        
        {uploadMethod === 'google' && (
          <div className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <CloudIcon className="h-5 w-5 text-green-600" />
                <h3 className="font-medium">Google Drive Files</h3>
              </div>
              <Button variant="outline" size="sm" onClick={() => setFiles([])}>
                <CheckCircleIcon className="h-4 w-4 mr-2" />
                Select All
              </Button>
            </div>
            
            <div className="border rounded p-3 mb-4 flex items-center justify-between">
              <div className="flex items-center">
                <ImageIcon className="h-5 w-5 text-blue-500 mr-2" />
                <span>real_estate_front.jpg</span>
              </div>
              <Button size="sm" variant="ghost" onClick={() => setFiles([...files, new File([], 'real_estate_front.jpg')])}>
                <PlusIcon className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="border rounded p-3 mb-4 flex items-center justify-between">
              <div className="flex items-center">
                <ImageIcon className="h-5 w-5 text-blue-500 mr-2" />
                <span>real_estate_kitchen.jpg</span>
              </div>
              <Button size="sm" variant="ghost" onClick={() => setFiles([...files, new File([], 'real_estate_kitchen.jpg')])}>
                <PlusIcon className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="border rounded p-3 flex items-center justify-between">
              <div className="flex items-center">
                <FilmIcon className="h-5 w-5 text-purple-500 mr-2" />
                <span>property_walkthrough.mp4</span>
              </div>
              <Button size="sm" variant="ghost" onClick={() => setFiles([...files, new File([], 'property_walkthrough.mp4')])}>
                <PlusIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
        
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="notes" className="text-sm font-medium block">
              {getNotesTitle()}
            </label>
            
            {shootId && notesChanged && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleSaveNotes}
                className="flex gap-1 items-center"
              >
                <SaveIcon className="h-3.5 w-3.5 mr-1" />
                Save Notes Only
              </Button>
            )}
          </div>
          
          <textarea
            id="notes"
            className={`w-full min-h-[100px] p-3 rounded-md ${getNotesBackgroundColorClass()} ${getNotesTextColorClass()} ${getNotesBorderColorClass()} border-2 resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder-opacity-70`}
            placeholder={getNotesPlaceholder()}
            value={notes}
            onChange={handleNotesChange}
            disabled={uploading}
            style={{
              boxShadow: "inset 0 1px 3px rgba(0,0,0,0.04)",
              transition: "all 0.2s ease"
            }}
          ></textarea>
          
          {shootId && (
            <p className={`text-xs mt-2 ${getNotesTextColorClass()} opacity-80`}>
              {user?.role === 'photographer' ? 
                "These notes will be visible to editors and admins." : 
                user?.role === 'editor' ? 
                "These notes will be visible to the client and admins." :
                "These notes will be attached to the uploaded files."
              }
            </p>
          )}
        </div>
        
        {files.length > 0 && (
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium">Selected Files ({files.length})</h3>
              <Button
                size="sm"
                variant="outline"
                onClick={handleClearFiles}
                disabled={uploading}
              >
                Clear All
              </Button>
            </div>
            
            <div className="max-h-64 overflow-y-auto rounded-md border border-border">
              {files.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 border-b border-border last:border-0"
                >
                  <div className="flex items-center overflow-hidden">
                    {getFileIcon(file)}
                    <div className="ml-3 overflow-hidden">
                      <p className="font-medium truncate" title={file.name}>
                        {file.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                  </div>
                  
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0"
                    onClick={() => handleRemoveFile(index)}
                    disabled={uploading}
                  >
                    <XIcon className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {uploading && (
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium">Uploading {files.length} files...</p>
              <p className="text-sm">{progress}%</p>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}
        
        <div className="mt-6 flex justify-end gap-3">
          {!uploading && (
            <>
              <Button variant="outline" onClick={handleClearFiles} disabled={files.length === 0}>
                Cancel
              </Button>
              <Button onClick={handleUpload} className="flex items-center gap-1">
                <UploadCloudIcon className="h-4 w-4 mr-1" />
                {files.length > 0
                  ? `Upload ${files.length} ${files.length === 1 ? 'file' : 'files'}`
                  : 'Upload'
                }
              </Button>
            </>
          )}
          
          {uploading && (
            <Button variant="outline" disabled>
              Uploading...
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default FileUploader;
