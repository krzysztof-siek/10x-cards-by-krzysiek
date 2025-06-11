import React from "react";

interface FlashcardFrontProps {
  front: string;
}

export default function FlashcardFront({ front }: FlashcardFrontProps) {
  return (
    <div className="text-center">
      <h2 className="text-xl font-semibold mb-2">Pytanie</h2>
      <p className="text-lg">{front}</p>
    </div>
  );
}
