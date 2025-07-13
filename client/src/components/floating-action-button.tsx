import { useState } from "react";
import { ModernEntryCreationModal } from "./modern-entry-creation-modal";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export function FloatingActionButton() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className="fixed bottom-20 right-6 z-20">
        <Button
          onClick={() => setIsModalOpen(true)}
          className="w-16 h-16 bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-110 animate-pulse"
        >
          <Plus className="w-8 h-8 text-white" />
        </Button>
      </div>
      
      <ModernEntryCreationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
