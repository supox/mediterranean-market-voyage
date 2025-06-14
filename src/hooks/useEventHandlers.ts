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
    const lostItems = cargoLost.map(
      item => `${item.amount} טון של ${translateGoodType(item.type)}`
    ).join(", ");
    const description = `סערה עזה פוקדת את הספינה! מטען נזרק לים כדי לשמור על יציבותה. איבדת ${lostItems}.`;
    
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
      const description = "גילית צי אוניות נטושות, אך תא המטען שלך מלא! לא ניתן לקחת כלום.";
      setEventData({ type: "Deserted Ships", description, options: [] });
      setEventOpen(true);
      sailingLogic.pauseSailing();
      return;
    }

    const destination = sailingLogic.sailing?.to;
    if (!destination) {
      console.error("Sailing destination not found for deserted ships event");
      const description = "אתה מבחין באוניות נטושות, אך זרמים חזקים מונעים ממך להגיע אליהן. ההפלגה ממשיכה.";
      setEventData({ type: "Deserted Ships", description, options: [] });
      setEventOpen(true);
      sailingLogic.pauseSailing();
      return;
    }

    const cargoTypes = ["Wheat", "Olives", "Copper"];
    const randomType = cargoTypes[Math.floor(Math.random() * cargoTypes.length)];
    // The next line: ensure randomType is string when accessing pricesByCountry
    const price = pricesByCountry[destination]?.[String(randomType)];

    if (!price || price <= 0) {
      console.error(`Price for ${randomType} in ${destination} not found or is zero.`);
      const description = "האוניות הנטושות כבר נבזזו לחלוטין. לא נמצא דבר יקר ערך.";
      setEventData({ type: "Deserted Ships", description, options: [] });
      setEventOpen(true);
      sailingLogic.pauseSailing();
      return;
    }

    let gainAmount = Math.floor(gainedValue / price);
    gainAmount = Math.min(gainAmount, availableSpace);

    if (gainAmount <= 0) {
      const description = "מצאת אוניות נטושות, אך לאחר חיפוש יסודי לא מצאת מטען משמעותי להוסיף.";
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

    const description = `אתה מגלה צי אוניות נטושות שנסחפות בים. לאחר חיפוש, שללת ${gainAmount} טון של ${translateGoodType(randomType)} מתאי המטען שלהן.`;

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
      desc = "ספינות שודדי ים מתקרבות! האם תנסה לברוח, לנהל משא ומתן או להילחם?";
      options = [
        { label: "ברח", value: "escape" },
        { label: "משא ומתן", value: "negotiate" },
        { label: "הילחם", value: "fight" },
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
      const chance = 0.45 + (sailingLogic.sailing?.risk === "Pirate" ? 0.07 : 0);
      if (Math.random() < chance) {
        desc = "הצלחת להימלט בעזרת תמרונים חכמים והליווי ששכרת!";
      } else {
        // Pirates catch up — update logic to take 30%-80% of cargo
        const totalCargo = cargo.reduce((sum, item) => sum + item.amount, 0);
        if (totalCargo === 0) {
          // If no cargo, lose coins instead
          const coinLoss = 200 + Math.floor(Math.random() * 300); // 200-500 coins
          setBalance(b => Math.max(0, b - coinLoss));
          desc = `נכשלת בבריחה. השודדים תופסים אותך ודורשים כופר בסך ${coinLoss} ₪.`;
        } else {
          // Pirates take 30-80% of all cargo, at least 1 ton
          const lossPercent = 0.3 + Math.random() * 0.5; // 30% to 80%
          let totalToLose = Math.max(1, Math.floor(totalCargo * lossPercent));
          let lostCargoMessage = "";
          // Prioritize taking from the largest cargo type
          let updatedCargo = [...cargo];
          let cargoLost: { type: string, amount: number }[] = [];
          while (totalToLose > 0) {
            // Find the cargo type with the most units left to be stolen
            let maxIndex = -1;
            let maxAmount = 0;
            for (let i = 0; i < updatedCargo.length; i++) {
              if (updatedCargo[i].amount > maxAmount) {
                maxAmount = updatedCargo[i].amount;
                maxIndex = i;
              }
            }
            if (maxIndex === -1 || maxAmount === 0) break;
            // Take as much as possible from this type
            const take = Math.min(updatedCargo[maxIndex].amount, totalToLose);
            if (take > 0) {
              cargoLost.push({ type: updatedCargo[maxIndex].type, amount: take });
              updatedCargo[maxIndex] = { ...updatedCargo[maxIndex], amount: updatedCargo[maxIndex].amount - take };
              totalToLose -= take;
            } else {
              break;
            }
          }
          setCargo(updatedCargo);
          // Format the loot message
          if (cargoLost.length === 1) {
            lostCargoMessage = `${cargoLost[0].amount} טון של ${translateGoodType(cargoLost[0].type)}`;
          } else if (cargoLost.length > 1) {
            lostCargoMessage = cargoLost.map(x => `${x.amount} ${translateGoodType(x.type)}`).join(", ");
          }
          desc = `נכשלת בבריחה. השודדים השיגו אותך וגנבו ${lostCargoMessage} ממטענך!`;
        }
      }
    }
    if (val === "negotiate") {
      const totalCargo = cargo.reduce((sum, item) => sum + item.amount, 0);
      if (totalCargo === 0) {
        // No cargo to give, pay coins instead
        const coinLoss = 150 + Math.floor(Math.random() * 200); // 150-350 coins
        setBalance(b => Math.max(0, b - coinLoss));
        desc = `אין לך מטען להציע, אז אתה משלם לשודדים מס בסך ${coinLoss} ₪. השודדים נותנים לך להמשיך.`;
      } else {
        desc = "אתה מסכים לשלם מס ולמסור יחידה אחת מכל סוג מטען. השודדים משחררים אותך.";
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
        desc = `קרב מתפתח! הצלחת לגבור על השודדים ושללת מהם ${plunder} ₪!`;
      } else {
        const totalCargo = cargo.reduce((sum, item) => sum + item.amount, 0);
        if (totalCargo === 0) {
          // No cargo to lose, pay coins instead
          const coinLoss = 100 + Math.floor(Math.random() * 200); // 100-300 coins
          setBalance(b => Math.max(0, b - coinLoss));
          desc = `נלחמת בגבורה, אך השודדים ניצחו. לא היה להם מה לשדוד, לכן דרשו ממך ${coinLoss} ₪.`;
        } else {
          desc = "נלחמת בגבורה, אך השודדים גברו עליך. איבדת יחידה אחת מכל סוג מטען.";
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
      desc = `בסערה נאלצת לזרוק לים ${toLose} יחידות מטען כדי לייצב את הספינה. שרדת את הסערה.`;
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
          ? "הסערה מכה בספינה! איבדת חלק גדול מהמטען, אך ניצלת."
          : "מאבק עיקש מול הסערה. למרות אובדן המטען, הספינה שורדת.";
      } else {
        desc = "הצלחת לעבור את הסערה בשלום!";
      }
    }
    return desc;
  }

  // Utility for translation
  function translateGoodType(type: string): string {
    switch (type) {
      case "Wheat":
        return "חיטה";
      case "Olives":
        return "זיתים";
      case "Copper":
        return "נחושת";
      default:
        return type;
    }
  }

  return {
    handleStormEvent,
    handleDesertedShipsEvent,
    triggerEvent,
    handleEventOption,
  };
}
