
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
  // For storms with no options, just show OK button
  const isStormWithoutOptions = eventData.type === "Storm" && (!eventData.options || eventData.options.length === 0);

  return (
    <EventModal
      open={eventOpen}
      type={eventData.type}
      description={eventData.description}
      options={eventData.options}
      onClose={onEventClose}
      onSelectOption={isStormWithoutOptions ? undefined : onEventSelect}
      showOkButton={isStormWithoutOptions}
    />
  );
};

export default GameEventHandler;
