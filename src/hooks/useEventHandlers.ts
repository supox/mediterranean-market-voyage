import { useState } from "react";

export function useEventHandlers({
  cargo,
  setCargo,
  setBalance,
  setEventData,
  setEventOpen,
  sailingLogic,
  pricesByCountry,
  country,
  weather,
  cargoValue,
  shipCapacity,
  balance,
}: any) {

  function handleStormEvent() {
    const totalCargo = cargo.reduce((sum, item) => sum + item.amount, 0);
    if (totalCargo === 0) return; // Should not happen since storm chance is 0 with no cargo

    // Calculate cargo loss (10-30% of total cargo, minimum 1 ton)
    const lossPercentage = 0.1 + Math.random() * 0.2; // 10-30%
    const baseLoss = Math.floor(totalCargo * lossPercentage);
    const actualLoss = Math.max(1, baseLoss); // Ensure at least 1 ton is lost
    
    let cargoLost: Array<{ type: string; amount: number }> = [];
    let remainingToLose = actualLoss;
    
    // Calculate losses before updating state, distributing across available cargo
    const updatedCargo = cargo.map((good) => {
      if (remainingToLose > 0 && good.amount > 0) {
        const lostAmount = Math.min(good.amount, remainingToLose);
        if (lostAmount > 0) {
          cargoLost.push({ type: good.type, amount: lostAmount });
          remainingToLose -= lostAmount;
          return { ...good, amount: good.amount - lostAmount };
        }
      }
      return good;
    });

    // Update cargo state
    setCargo(updatedCargo);

    // Create description of what was lost
    const lostItems = cargoLost.map(item => `${item.amount} tons of ${item.type}`).join(", ");
    const description = `A violent storm hits your ship! Cargo is thrown overboard to keep the ship stable. You lose ${lostItems}.`;
    
    // Show storm result without options
    setEventData({
      type: "Storm",
      description,
      options: [], // No options for storm
    });
    setEventOpen(true);
    sailingLogic.pauseSailing();
  }

  function handleDesertedShipsEvent() {
    // New logic: gain is based on player's total value and is capped by ship capacity.
    const totalValue = balance + cargoValue;
    const gainPercentage = 0.05 + Math.random() * 0.15; // 5-20%
    const gainedValue = totalValue * gainPercentage;

    const totalCargo = cargo.reduce((sum, item) => sum + item.amount, 0);
    const availableSpace = shipCapacity - totalCargo;

    if (availableSpace <= 0) {
      const description = `You discover a fleet of deserted ships, but your cargo hold is full! You have to leave the potential salvage behind.`;
      setEventData({ type: "Deserted Ships", description, options: [] });
      setEventOpen(true);
      sailingLogic.pauseSailing();
      return;
    }

    const destination = sailingLogic.sailing?.to;
    if (!destination) {
      console.error("Sailing destination not found for deserted ships event");
      const description = `You spot deserted ships, but strong currents prevent you from getting close. You continue your journey.`;
      setEventData({ type: "Deserted Ships", description, options: [] });
      setEventOpen(true);
      sailingLogic.pauseSailing();
      return;
    }

    const cargoTypes = ["Wheat", "Olives", "Copper"];
    const randomType = cargoTypes[Math.floor(Math.random() * cargoTypes.length)] as keyof typeof pricesByCountry[typeof country];
    const price = pricesByCountry[destination]?.[randomType];

    if (!price || price <= 0) {
      console.error(`Price for ${randomType} in ${destination} not found or is zero.`);
      const description = `The deserted ships seem to have been picked clean. You find nothing of value.`;
      setEventData({ type: "Deserted Ships", description, options: [] });
      setEventOpen(true);
      sailingLogic.pauseSailing();
      return;
    }

    let gainAmount = Math.floor(gainedValue / price);
    gainAmount = Math.min(gainAmount, availableSpace);

    if (gainAmount <= 0) {
      const description = `You discover a fleet of deserted ships. After a search, you find some supplies but no significant cargo to add to your hold.`;
      setEventData({ type: "Deserted Ships", description, options: [] });
      setEventOpen(true);
      sailingLogic.pauseSailing();
      return;
    }

    setCargo((prev) => {
      const found = prev.find((g) => g.type === randomType);
      if (found) {
        return prev.map((g) =>
          g.type === randomType ? { ...g, amount: g.amount + gainAmount } : g
        );
      } else {
        return [...prev, { type: randomType, amount: gainAmount }];
      }
    });

    const description = `You discover a fleet of deserted ships drifting in the waters. After searching through them, you salvage ${gainAmount} tons of ${randomType} from their cargo holds.`;

    setEventData({
      type: "Deserted Ships",
      description,
      options: [],
    });
    setEventOpen(true);
    sailingLogic.pauseSailing();
  }

  function triggerEvent(risk: string) {
    if (risk === "Storm") {
      // Handle storm automatically without user options
      handleStormEvent();
      return;
    }
    
    if (risk === "Deserted Ships") {
      // Handle deserted ships automatically without user options
      handleDesertedShipsEvent();
      return;
    }
    
    let desc = "";
    let options = [];
    if (risk === "Pirate") {
      desc = "Pirate ships approach! Will you try to Escape, Negotiate, or Fight Back?";
      options = [
        { label: "Escape", value: "escape" },
        { label: "Negotiate", value: "negotiate" },
        { label: "Fight Back", value: "fight" },
      ];
    }
    
    setEventData({
      type: risk,
      description: desc,
      options,
    });
    setEventOpen(true);
    sailingLogic.pauseSailing();
  }

  function handleEventOption(val: string): string {
    let desc = "";
    if (val === "escape") {
      // Each defend ship slightly increases escape success chance
      const chance = 0.45 + sailingLogic.sailing?.risk === "Pirate" ? 0.07 : 0;
      if (Math.random() < chance) {
        desc = "You escape using clever maneuvers and your hired escorts!";
      } else {
        desc = "Despite your best efforts, pirates catch up. Brace for battle!";
        // If no cargo, lose coins instead
        const totalCargo = cargo.reduce((sum, item) => sum + item.amount, 0);
        if (totalCargo === 0) {
          const coinLoss = 200 + Math.floor(Math.random() * 300); // 200-500 coins
          setBalance(b => Math.max(0, b - coinLoss));
          desc += ` You pay ${coinLoss} ₪ to the pirates.`;
        }
      }
    }
    if (val === "negotiate") {
      const totalCargo = cargo.reduce((sum, item) => sum + item.amount, 0);
      if (totalCargo === 0) {
        // No cargo to give, pay coins instead
        const coinLoss = 150 + Math.floor(Math.random() * 200); // 150-350 coins
        setBalance(b => Math.max(0, b - coinLoss));
        desc = `You have no cargo to offer, so you pay ${coinLoss} ₪ as tribute. The pirates let you go.`;
      } else {
        desc = `You accept paying tribute, losing 1 cargo unit. The pirates let you go.`;
        setCargo((prev) => {
          // Lose 1 of each type
          return prev.map((good) => {
            return good.amount > 0 ? { ...good, amount: good.amount - 1 } : good;
          });
        });
      }
    }
    if (val === "fight") {
      // Chance/reward scales by defend ships
      const winChance = 0.18;
      if (Math.random() < winChance) {
        const plunder = 350 + Math.floor(Math.random() * 400);
        setBalance((b) => b + plunder);
        desc = `Battle ensues! Your fleet prevails, and you win, plundering ${plunder} ₪ from the pirates.`;
      } else {
        const totalCargo = cargo.reduce((sum, item) => sum + item.amount, 0);
        if (totalCargo === 0) {
          // No cargo to lose, pay coins instead
          const coinLoss = 100 + Math.floor(Math.random() * 200); // 100-300 coins
          setBalance(b => Math.max(0, b - coinLoss));
          desc = `Despite your courage, the pirates overpower you. With no cargo to take, they demand ${coinLoss} ₪.`;
        } else {
          desc = "Despite your courage, the pirates overpower you. You lose 1 cargo unit.";
          setCargo((prev) => {
            // Lose 1 of each type
            return prev.map((good) => {
              return good.amount > 0 ? { ...good, amount: good.amount - 1 } : good;
            });
          });
        }
      }
    }
    // --- STORM LOGIC ---
    if (val === "throw") {
      // Always lose 2-3 units (random), distributed among cargo
      const toLose = 2 + Math.floor(Math.random() * 2); // 2 or 3
      // Shuffle type order for some randomness
      const goodTypes = ["Wheat", "Olives", "Copper"].sort(() => Math.random() - 0.5);
      let left = toLose;
      setCargo((prev) =>
        prev.map((good) => {
          if (left > 0 && good.amount > 0) {
            const take = Math.min(good.amount, left);
            left -= take;
            return { ...good, amount: good.amount - take };
          }
          return good;
        })
      );
      desc = `In the chaos, you throw ${toLose} cargo units overboard to keep the ship afloat. You survive the storm.`;
    }
    if (val === "brave") {
      // If current weather is Stormy, risk is higher
      const stormy = weather === "Stormy";
      const lossChance = stormy ? 0.85 : 0.55;
      if (Math.random() < lossChance) {
        // Lose 3-5 units
        let toLose = 3 + Math.floor(Math.random() * 3); // 3,4,5
        const goodTypes = ["Wheat", "Olives", "Copper"].sort(() => Math.random() - 0.5);
        setCargo((prev) =>
          prev.map((good) => {
            if (toLose > 0 && good.amount > 0) {
              const take = Math.min(good.amount, toLose);
              toLose -= take;
              return { ...good, amount: good.amount - take };
            }
            return good;
          })
        );
        desc = stormy
          ? "The storm batters your ship! You lose a large portion of your cargo but survive."
          : "After a tense struggle, some cargo is lost but you make it through.";
      } else {
        desc = "You bravely endure the storm and come out unscathed!";
      }
    }
    return desc;
  }

  return {
    handleStormEvent,
    handleDesertedShipsEvent,
    triggerEvent,
    handleEventOption,
  };
}
