
export type Pace = "Slow" | "Normal" | "Fast";

export interface TravelEstimate {
    pace: Pace;
    days: number;
    hours: number;
    minutes: number;
}

export function travelTimeEstimate(
    distance: number,      // total miles
    dailyTravel: number = 24 // miles per "day" (default: 24 miles/day for estimation)
): TravelEstimate[] {
    const paceMultipliers: Record<Pace, number> = {
        Slow: 2 / 3,
        Normal: 1,
        Fast: 4 / 3,
    };

    const results: TravelEstimate[] = [];

    (["Slow", "Normal", "Fast"] as Pace[]).forEach((pace) => {
        const milesPerDay = dailyTravel * paceMultipliers[pace];

        const totalDays = distance / milesPerDay;
        const days = Math.floor(totalDays);
        const fractionalDay = totalDays - days;

        const totalHours = fractionalDay * 24;
        const hours = Math.floor(totalHours);
        const minutes = Math.round((totalHours - hours) * 60);

        // If rounding makes 24 hours, increment day
        const adjustedDays = hours === 24 ? days + 1 : days;
        const adjustedHours = hours === 24 ? 0 : hours;

        results.push({
            pace,
            days: adjustedDays,
            hours: adjustedHours,
            minutes,
        });
    });

    return results;
}