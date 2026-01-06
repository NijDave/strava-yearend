"use client";

interface FunFactsProps {
  facts: string[];
}

export function FunFacts({ facts }: FunFactsProps) {
  if (facts.length === 0) {
    return null;
  }

  const emojis = ["🎉", "🚀", "💪", "🔥", "⭐", "🏆", "✨", "🌟"];

  return (
    <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl shadow-xl p-6 md:p-8 text-white">
      <h3 className="text-2xl font-bold mb-6">🎊 Fun Facts</h3>
      <div className="grid md:grid-cols-2 gap-4">
        {facts.map((fact, index) => (
          <div
            key={index}
            className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20 flex items-start gap-3"
          >
            <span className="text-2xl">{emojis[index % emojis.length]}</span>
            <p className="text-lg font-medium">{fact}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

