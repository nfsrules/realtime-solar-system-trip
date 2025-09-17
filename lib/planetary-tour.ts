// Synchronized planetary tour that matches the educational song
export const startPlanetaryTour = (setToolCall: (toolCall: any) => void) => {
  const cameraSequence = [
    { action: "focus", planet: "Mercury", time: 4380 },    // 4.38s "Mercu à de l'élien brillant"
    { action: "focus", planet: "Earth", time: 9660 },      // 9.66s "La terre a aussi j'ai une con-respire" - skip Venus due to Spline scene limitations
    { action: "reset", time: 19500 },                      // 19.50s "Dans le système, se la rompant" (chorus - show whole system)
    { action: "focus", planet: "Mars", time: 39760 },      // 39.76s "Marseille, vous j'avais poussé au-deux"
    { action: "focus", planet: "Jupiter", time: 42640 },   // 42.64s "J'ai piqué ces drogènes c'est vrai"
    { action: "focus", planet: "Saturn", time: 44740 },    // 44.74s "Ça tu m'as les mêmes cagéans"
    { action: "focus", planet: "Neptune", time: 48000 },   // 48.0s - skip Uranus, go directly to Neptune (Spline scene limitation)
    { action: "reset", time: 60440 },                      // 60.44s "Dans le système, se la rompant" (chorus again)
    { action: "focus", planet: "Sun", time: 80080 },       // 80.08s "De soleil jusqu'à tu conchettes"
    { action: "focus", planet: "Pluto", time: 81760 },     // 81.76s "La nette c'est si bon"
    { action: "reset", time: 85160 },                      // 85.16s "Exprateur de l'espace maintenant au site" - show whole system
    { action: "focus", planet: "Earth", time: 89800 },     // 89.80s "Grâce à Herri qui décès se créer" - focus on our home where Air Liquide works
    { action: "reset", time: 94000 },                      // Final gentle return to full system view
  ];

  cameraSequence.forEach(({ action, planet, time }) => {
    setTimeout(() => {
      if (action === "focus") {
        setToolCall({ name: "focus_planet", arguments: { planet } });
      } else if (action === "reset") {
        setToolCall({ name: "reset_camera", arguments: {} });
      }
    }, time);
  });

  // Reset camera at the end of the song (1min 35s = 95 seconds)
  setTimeout(() => {
    setToolCall({ name: "reset_camera", arguments: {} });
  }, 95000); // After song ends (1:35)
};