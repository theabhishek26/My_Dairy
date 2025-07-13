import { useState } from "react";
import { VoiceRecordingInterface } from "./voice-recording-interface";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertEntrySchema } from "@shared/schema";
import { PenTool, Camera, Mic, Layers, X } from "lucide-react";

interface EntryCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function EntryCreationModal({ isOpen, onClose }: EntryCreationModalProps) {
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isVoiceRecording, setIsVoiceRecording] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createEntryMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/entries", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/entries'] });
      toast({
        title: "Entry Created",
        description: "Your diary entry has been saved successfully.",
      });
      handleClose();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create entry. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleClose = () => {
    setSelectedType(null);
    setTitle("");
    setContent("");
    setSelectedFile(null);
    setIsVoiceRecording(false);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedType) return;
    
    const entryData = {
      title: title.trim() || null,
      content: content.trim() || null,
      type: selectedType,
      entryDate: new Date().toISOString(),
    };

    try {
      insertEntrySchema.parse(entryData);
      createEntryMutation.mutate(entryData);
    } catch (error) {
      toast({
        title: "Validation Error",
        description: "Please check your entry data and try again.",
        variant: "destructive",
      });
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const entryTypes = [
    {
      type: "text",
      icon: PenTool,
      label: "Text",
      description: "Write your thoughts",
      gradient: "from-primary to-primary-light",
    },
    {
      type: "photo",
      icon: Camera,
      label: "Photo",
      description: "Capture moments",
      gradient: "from-secondary to-secondary-light",
    },
    {
      type: "voice",
      icon: Mic,
      label: "Voice",
      description: "Record audio",
      gradient: "from-accent to-accent-blue",
    },
    {
      type: "mixed",
      icon: Layers,
      label: "Mixed",
      description: "Combine media",
      gradient: "from-purple-500 to-pink-500",
    },
  ];

  if (isVoiceRecording) {
    return (
      <VoiceRecordingInterface
        isOpen={isVoiceRecording}
        onClose={() => setIsVoiceRecording(false)}
        onSave={(audioData) => {
          // TODO: Handle audio data
          console.log("Audio data:", audioData);
          setIsVoiceRecording(false);
        }}
      />
    );
  }

  return (
    <Sheet open={isOpen} onOpenChange={handleClose}>
      <SheetContent side="bottom" className="h-auto max-h-[90vh] rounded-t-3xl border-0 glass-effect">
        <SheetHeader className="pb-6">
          <div className="w-12 h-1 bg-muted rounded-full mx-auto mb-4"></div>
          <SheetTitle className="text-xl font-playfair font-semibold text-center">
            {selectedType ? `Create ${selectedType.charAt(0).toUpperCase() + selectedType.slice(1)} Entry` : "Create New Entry"}
          </SheetTitle>
        </SheetHeader>

        {!selectedType ? (
          <div className="grid grid-cols-2 gap-4 pb-6">
            {entryTypes.map((type) => {
              const Icon = type.icon;
              return (
                <Button
                  key={type.type}
                  variant="ghost"
                  className="h-auto p-4 glass-effect hover:bg-primary/10 transition-all duration-200 flex flex-col items-center space-y-3"
                  onClick={() => {
                    setSelectedType(type.type);
                    if (type.type === "voice") {
                      setIsVoiceRecording(true);
                    }
                  }}
                >
                  <div className={`w-12 h-12 bg-gradient-to-r ${type.gradient} rounded-full flex items-center justify-center`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-medium text-foreground">{type.label}</div>
                    <div className="text-xs text-muted-foreground">{type.description}</div>
                  </div>
                </Button>
              );
            })}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 pb-6">
            <div className="space-y-2">
              <Label htmlFor="title">Title (optional)</Label>
              <Input
                id="title"
                type="text"
                placeholder="Enter a title for your entry..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="glass-effect border-0"
              />
            </div>

            {selectedType === "text" && (
              <div className="space-y-2">
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  placeholder="Write your thoughts here..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="min-h-[120px] glass-effect border-0"
                  required
                />
              </div>
            )}

            {selectedType === "photo" && (
              <div className="space-y-2">
                <Label htmlFor="photo">Photo</Label>
                <input
                  id="photo"
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/90"
                />
                {selectedFile && (
                  <div className="text-sm text-muted-foreground">
                    Selected: {selectedFile.name}
                  </div>
                )}
              </div>
            )}

            {selectedType === "mixed" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="mixed-content">Content</Label>
                  <Textarea
                    id="mixed-content"
                    placeholder="Describe your mixed media entry..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="min-h-[80px] glass-effect border-0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mixed-media">Media</Label>
                  <input
                    id="mixed-media"
                    type="file"
                    accept="image/*,video/*,audio/*"
                    onChange={handleFileSelect}
                    className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/90"
                  />
                </div>
              </div>
            )}

            <div className="flex space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="flex-1 glass-effect border-0"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createEntryMutation.isPending}
                className="flex-1 bg-gradient-to-r from-primary to-primary-light"
              >
                {createEntryMutation.isPending ? "Creating..." : "Create Entry"}
              </Button>
            </div>
          </form>
        )}
      </SheetContent>
    </Sheet>
  );
}
