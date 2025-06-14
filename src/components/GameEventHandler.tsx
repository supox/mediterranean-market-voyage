
import React from "react";
import EventModal from "./EventModal";

interface GameEventHandlerProps {
  eventOpen: boolean;
  eventData: {
    type: string;
    description: string;
    options?: { label: string; value: string }[];
  };
  onEventSelect: (val: string) => string | void;
  onEventClose: () => void;
}

const GameEventHandler: React.FC<GameEventHandlerProps> = ({
  eventOpen,
  eventData,
  onEventSelect,
  onEventClose,
}) => {
  // For storms and deserted ships with no options, just show OK button
  const isEventWithoutOptions = (eventData.type === "Storm" || eventData.type === "Deserted Ships") && (!eventData.options || eventData.options.length === 0);

  return (
    <EventModal
      open={eventOpen}
      type={eventData.type}
      description={eventData.description}
      options={eventData.options}
      onClose={onEventClose}
      onSelectOption={isEventWithoutOptions ? undefined : onEventSelect}
      showOkButton={isEventWithoutOptions}
    />
  );
};

export default GameEventHandler;
