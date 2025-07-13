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
          className="w-14 h-14 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border-2 border-white/20 backdrop-blur-sm"
        >
          <Plus className="w-6 h-6 text-white font-bold stroke-[3]" />
        </Button>
      </div>
      
      <ModernEntryCreationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
