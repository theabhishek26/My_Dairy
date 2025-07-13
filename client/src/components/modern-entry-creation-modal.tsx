import { useState, useEffect } from "react";
import { X, Type, Mic, Camera, Plus, Save, Sparkles, Calendar, Clock, User, Hash, Upload, Image, Video, Music } from "lucide-react";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { useVoiceRecording } from "@/hooks/use-voice-recording";
import { usePhotoCapture } from "@/hooks/use-photo-capture";
import { EnhancedVoiceRecording } from "./enhanced-voice-recording";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatEntryDate } from "@/lib/date-utils";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface EntryCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialDate?: Date;
}

export function ModernEntryCreationModal({ isOpen, onClose, initialDate }: EntryCreationModalProps) {
  const [activeTab, setActiveTab] = useState<'text' | 'voice' | 'photo' | 'mixed'>('text');
  const [textContent, setTextContent] = useState("");
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState("");
  const [mood, setMood] = useState("");
  const [isVoiceRecordingOpen, setIsVoiceRecordingOpen] = useState(false);
  const [selectedPhotos, setSelectedPhotos] = useState<File[]>([]);
  const [voiceRecording, setVoiceRecording] = useState<Blob | null>(null);
  const [selectedDate, setSelectedDate] = useState(initialDate || new Date());
  
  const { capturePhoto, captureFromCamera } = usePhotoCapture();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createEntryMutation = useMutation({
    mutationFn: async (entryData: any) => {
      const response = await apiRequest("/api/entries", {
        method: "POST",
        body: JSON.stringify(entryData),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/entries"] });
      queryClient.invalidateQueries({ queryKey: ["/api/entries", "date"] });
      toast({
        title: "Entry created successfully!",
        description: "Your diary entry has been saved.",
      });
      handleClose();
    },
    onError: (error: any) => {
      console.error("Entry creation error:", error);
      toast({
        title: "Error creating entry",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  const uploadMediaMutation = useMutation({
    mutationFn: async ({ file, entryId }: { file: File; entryId: number }) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("entryId", entryId.toString());
      
      const response = await fetch("/api/media", {
        method: "POST",
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error("Failed to upload media");
      }
      
      return response.json();
    },
  });

  const handleAddTag = () => {
    if (currentTag.trim() && !tags.includes(currentTag.trim())) {
      setTags([...tags, currentTag.trim()]);
      setCurrentTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleSubmit = async () => {
    if (!textContent.trim() && !voiceRecording && selectedPhotos.length === 0) {
      toast({
        title: "Empty entry",
        description: "Please add some content to your entry.",
        variant: "destructive",
      });
      return;
    }

    try {
      const entryData = {
        title: title.trim() || "Untitled Entry",
        content: textContent,
        type: activeTab,
        entryDate: selectedDate.toISOString(),
      };

      const entry = await createEntryMutation.mutateAsync(entryData);

      // Upload media files
      const mediaPromises = [];
      
      if (voiceRecording) {
        const audioFile = new File([voiceRecording], `voice-${Date.now()}.webm`, {
          type: 'audio/webm',
        });
        mediaPromises.push(uploadMediaMutation.mutateAsync({
          file: audioFile,
          entryId: entry.id,
        }));
      }

      if (selectedPhotos.length > 0) {
        for (const photo of selectedPhotos) {
          mediaPromises.push(uploadMediaMutation.mutateAsync({
            file: photo,
            entryId: entry.id,
          }));
        }
      }

      if (mediaPromises.length > 0) {
        await Promise.all(mediaPromises);
      }

    } catch (error) {
      console.error("Error creating entry:", error);
    }
  };

  const handleClose = () => {
    setTextContent("");
    setTitle("");
    setTags([]);
    setCurrentTag("");
    setMood("");
    setSelectedPhotos([]);
    setVoiceRecording(null);
    setActiveTab('text');
    onClose();
  };

  // Update selected date when initialDate changes
  useEffect(() => {
    if (initialDate) {
      setSelectedDate(initialDate);
    }
  }, [initialDate]);

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newPhotos = Array.from(files).filter(file => 
        file.type.startsWith('image/') || file.type.startsWith('video/')
      );
      setSelectedPhotos(prev => [...prev, ...newPhotos]);
    }
  };



  const getTabIcon = (tab: string) => {
    switch (tab) {
      case 'text': return <Type className="w-4 h-4" />;
      case 'voice': return <Mic className="w-4 h-4" />;
      case 'photo': return <Camera className="w-4 h-4" />;
      case 'mixed': return <Plus className="w-4 h-4" />;
      default: return <Type className="w-4 h-4" />;
    }
  };

  const getMediaIcon = (file: File) => {
    if (file.type.startsWith('image/')) return <Image className="w-4 h-4" />;
    if (file.type.startsWith('video/')) return <Video className="w-4 h-4" />;
    if (file.type.startsWith('audio/')) return <Music className="w-4 h-4" />;
    return <Upload className="w-4 h-4" />;
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-white/95 via-blue-50/90 to-purple-50/95 dark:from-gray-900/95 dark:via-indigo-900/90 dark:to-purple-900/95 backdrop-blur-xl border-white/20 shadow-2xl animate-in fade-in-0 zoom-in-95 duration-300">
          <DialogHeader className="space-y-4">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 bg-clip-text text-transparent animate-pulse">
                ✨ Create New Entry
              </DialogTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClose}
                className="h-8 w-8 rounded-full hover:bg-white/20"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Entry Type Tabs */}
            <div className="grid grid-cols-4 gap-3 mb-4">
              {[
                { 
                  id: 'text', 
                  label: 'Write Text', 
                  icon: Type, 
                  description: 'Express your thoughts in words',
                  gradient: 'from-blue-500 to-indigo-600',
                  bgGradient: 'from-blue-50/60 to-indigo-50/60 dark:from-blue-900/30 dark:to-indigo-900/30'
                },
                { 
                  id: 'voice', 
                  label: 'Voice Note', 
                  icon: Mic, 
                  description: 'Record your voice memo',
                  gradient: 'from-green-500 to-emerald-600',
                  bgGradient: 'from-green-50/60 to-emerald-50/60 dark:from-green-900/30 dark:to-emerald-900/30'
                },
                { 
                  id: 'photo', 
                  label: 'Add Photos', 
                  icon: Camera, 
                  description: 'Capture visual memories',
                  gradient: 'from-orange-500 to-red-600',
                  bgGradient: 'from-orange-50/60 to-red-50/60 dark:from-orange-900/30 dark:to-red-900/30'
                },
                { 
                  id: 'mixed', 
                  label: 'Mix Media', 
                  icon: Plus, 
                  description: 'Combine text, voice & photos',
                  gradient: 'from-purple-500 to-pink-600',
                  bgGradient: 'from-purple-50/60 to-pink-50/60 dark:from-purple-900/30 dark:to-pink-900/30'
                },
              ].map(({ id, label, icon: Icon, description, gradient, bgGradient }) => (
                <div
                  key={id}
                  onClick={() => setActiveTab(id as any)}
                  className={cn(
                    "relative p-4 rounded-xl cursor-pointer transition-all duration-300 bg-gradient-to-br backdrop-blur-sm border",
                    activeTab === id
                      ? `${bgGradient} border-white/30 shadow-lg transform scale-105`
                      : "from-white/40 to-white/20 dark:from-gray-800/40 dark:to-gray-800/20 border-white/20 hover:scale-102 hover:shadow-md"
                  )}
                >
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center mb-3 bg-gradient-to-r",
                    gradient,
                    activeTab === id ? "shadow-lg" : ""
                  )}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-semibold text-sm text-gray-800 dark:text-gray-200 mb-1">{label}</h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">{description}</p>
                  {activeTab === id && (
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-2 border-purple-400/50"></div>
                  )}
                </div>
              ))}
            </div>
          </DialogHeader>

          <div className="space-y-6">
            {/* Date Selection */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Entry Date
              </Label>
              <Input
                type="date"
                value={format(selectedDate, 'yyyy-MM-dd')}
                onChange={(e) => setSelectedDate(new Date(e.target.value))}
                className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-white/30 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all duration-200 rounded-lg shadow-sm"
              />
            </div>

            {/* Header Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Entry Title
                </Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="What's on your mind today?"
                  className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-white/30 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all duration-200 rounded-lg shadow-sm"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="mood" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Current Mood
                </Label>
                <Input
                  id="mood"
                  value={mood}
                  onChange={(e) => setMood(e.target.value)}
                  placeholder="Happy, Excited, Calm..."
                  className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-white/30 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all duration-200 rounded-lg shadow-sm"
                />
              </div>
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Tags
              </Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="bg-purple-100 text-purple-800 hover:bg-purple-200 cursor-pointer"
                    onClick={() => handleRemoveTag(tag)}
                  >
                    <Hash className="w-3 h-3 mr-1" />
                    {tag}
                    <X className="w-3 h-3 ml-1" />
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={currentTag}
                  onChange={(e) => setCurrentTag(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Add a tag..."
                  className="flex-1 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-white/20 focus:border-purple-400"
                />
                <Button
                  onClick={handleAddTag}
                  size="sm"
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                >
                  Add
                </Button>
              </div>
            </div>

            {/* Content Area */}
            <div className="space-y-4">
              {activeTab === 'voice' ? (
                <EnhancedVoiceRecording
                  onSave={(audioData, transcription) => {
                    setVoiceRecording(audioData);
                    setTextContent(transcription);
                  }}
                  onCancel={() => {
                    setVoiceRecording(null);
                    setTextContent('');
                  }}
                />
              ) : (
                <>
                  <Label htmlFor="content" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Entry Content
                  </Label>
                  
                  <Textarea
                    id="content"
                    value={textContent}
                    onChange={(e) => setTextContent(e.target.value)}
                    placeholder="Start writing your thoughts..."
                    className="min-h-[200px] bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-white/20 focus:border-purple-400 resize-none"
                  />
                </>
              )}
              
              {/* Media Controls - Only show for non-voice tabs */}
              {activeTab !== 'voice' && (
                <div className="flex flex-wrap gap-3">
                  <Button
                    onClick={captureFromCamera}
                    variant="outline"
                    size="sm"
                    className="gap-2 bg-white/50 hover:bg-white/70 border-white/20"
                  >
                    <Camera className="w-4 h-4" />
                    Take Photo
                  </Button>
                  
                  <Label className="cursor-pointer">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2 bg-white/50 hover:bg-white/70 border-white/20"
                      asChild
                    >
                      <span>
                        <Upload className="w-4 h-4" />
                        Upload Media
                      </span>
                    </Button>
                    <input
                      type="file"
                      multiple
                      accept="image/*,video/*,audio/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </Label>
                </div>
              )}
            </div>

            {/* Media Preview */}
            {(selectedPhotos.length > 0 || voiceRecording) && (
              <div className="space-y-3">
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Attached Media
                </Label>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {selectedPhotos.map((photo, index) => (
                    <div
                      key={index}
                      className="relative group bg-white/50 dark:bg-gray-800/50 rounded-lg p-3 border border-white/20"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        {getMediaIcon(photo)}
                        <span className="text-xs truncate">{photo.name}</span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {(photo.size / 1024 / 1024).toFixed(1)}MB
                      </span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setSelectedPhotos(prev => prev.filter((_, i) => i !== index))}
                        className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 hover:bg-red-600 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                  
                  {voiceRecording && (
                    <div className="relative group bg-white/50 dark:bg-gray-800/50 rounded-lg p-3 border border-white/20">
                      <div className="flex items-center gap-2 mb-1">
                        <Music className="w-4 h-4" />
                        <span className="text-xs">Voice Recording</span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {(voiceRecording.size / 1024).toFixed(1)}KB
                      </span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setVoiceRecording(null)}
                        className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 hover:bg-red-600 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t border-white/20">
              <Button
                variant="outline"
                onClick={handleClose}
                className="bg-white/50 hover:bg-white/70 border-white/20"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={createEntryMutation.isPending || uploadMediaMutation.isPending}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white gap-2"
              >
                {createEntryMutation.isPending ? (
                  <div className="w-4 h-4 animate-spin border-2 border-white/20 border-t-white rounded-full" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Save Entry
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>


    </>
  );
}