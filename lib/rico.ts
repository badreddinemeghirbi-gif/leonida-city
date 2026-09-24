import rawLocations from '@/data/locations.json';
import type { Location } from '@/store/useStore';

const locations = rawLocations as Location[];

/**
 * MVP brain for "Rico" — no API calls, no cost, works offline.
 * Matches the user's message against location names first, then against
 * topic keywords, then falls back to an in-character deflection.
 *
 * To upgrade later: POST to /api/chat instead and keep this as the
 * fallback when the API errors or the user is rate-limited.
 */

const norm = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();

/* Extra nicknames so "the airport" or "downtown" still resolve */
const ALIASES: Record<string, string> = {
  airport: 'escobar-international',
  escobar: 'escobar-international',
  downtown: 'downtown-vice-city',
  beach: 'ocean-beach',
  ocean: 'ocean-beach',
  starfish: 'starfish-island',
  prawn: 'prawn-island',
  mall: 'the-malls',
  malls: 'the-malls',
  harbor: 'viceport-harbor',
  harbour: 'viceport-harbor',
  port: 'viceport-harbor',
  viceport: 'viceport-harbor',
  washington: 'washington-beach',
  havana: 'little-havana',
  cuban: 'little-havana',
  golf: 'leaf-links',
  links: 'leaf-links',
  rockstar: 'rockstar-island',
  point: 'vice-point',
};

function findLocation(input: string): Location | null {
  const q = norm(input);

  const direct = locations.find((l) => q.includes(norm(l.name)));
  if (direct) return direct;

  for (const [alias, id] of Object.entries(ALIASES)) {
    if (new RegExp(`\\b${alias}\\b`).test(q)) {
      return locations.find((l) => l.id === id) ?? null;
    }
  }
  return null;
}

const LOCATION_OPENERS = [
  'Ah, {name}. Let me tell you what the tour guides leave out.',
  '{name}? You picked a good one to ask about.',
  "Everybody asks about {name} eventually. Here's the real version.",
  "{name}. Yeah, I know it. Probably better than I should.",
];

const TOPICS: { keys: string[]; reply: string }[] = [
  {
    keys: ['release', 'come out', 'launch', 'when', 'date'],
    reply:
      "November 19th, 2026. PS5 and Xbox Series X|S first — PC folks gotta wait their turn, like always. Mark it. Take the day off. Tell your boss you got a thing.",
  },
  {
    keys: ['pc', 'computer', 'steam'],
    reply:
      "PC ain't in the launch window, friend. Consoles eat first. Word on the street says sometime the year after, but I've been wrong about Rockstar before — everybody has.",
  },
  {
    keys: ['price', 'cost', 'how much', 'expensive'],
    reply:
      "Nothing official yet. Word going around is it won't be cheap — could be the one that pushes past the usual sixty. Save your money now, that's my advice. Free advice, too. That's rare around here.",
  },
  {
    keys: ['jason', 'lucia', 'protagonist', 'main character', 'character'],
    reply:
      "Jason and Lucia. Two of 'em this time, running together. Bonnie and Clyde energy — you know how that story usually ends, but that's never stopped anybody in Leonida.",
  },
  {
    keys: ['money', 'rich', 'cash', 'earn', 'grind', 'make money'],
    reply:
      "Money in Leonida moves three ways: through Viceport in containers nobody logs, through Leaf Links between holes seven and twelve, and through Downtown offices where they call it consulting. Pick your lane. They all end in the same place — a cell or a compound.",
  },
  {
    keys: ['dangerous', 'danger', 'avoid', 'scary', 'stay away'],
    reply:
      "Prawn Island after dark. Rusted studios, no cell signal, and people who chose that place specifically because nobody finds anybody there. Rockstar Island's worse, but you'll never get close enough to find out.",
  },
  {
    keys: ['party', 'club', 'night', 'drink', 'fun'],
    reply:
      "Washington Beach. The strip doesn't sleep, the cops are mostly for show, and the real law is whoever's working the door at Club Malibu. Tip him. Always tip him.",
  },
  {
    keys: ['map', 'big', 'size', 'how large'],
    reply:
      "Leonida's the whole state, not just the city. Vice City's the heart, but there's swamp, coast, and small towns where people ask fewer questions. Twelve spots on my map worth knowing. Start clicking.",
  },
  {
    keys: ['secret', 'hidden', 'easter egg', 'mystery'],
    reply:
      "Rockstar Island. No bridge, no ferry schedule, invitation only. I know three people who've been. None of 'em talk about it, and two of 'em changed their names after.",
  },
  {
    keys: ['best', 'favorite', 'recommend', 'where should'],
    reply:
      "Depends what you're after. Money — Leaf Links. Trouble — Prawn Island. Something real — Little Havana, and that's not nostalgia talking. Tell me which one and I'll go deeper.",
  },
  {
    keys: ['online', 'multiplayer', 'friends', 'co op'],
    reply:
      "Nothing confirmed about how the online side works yet. Rockstar keeps that card face down until the last second. What I'd bet on? It'll eat years of your life. Theirs always do.",
  },
  {
    keys: ['who are you', 'your name', 'what are you', 'rico'],
    reply:
      "Rico. Been in Leonida longer than I'll admit on the record. I know the streets, the names, and which doors not to knock on. You ask, I answer — mostly straight.",
  },
  {
    keys: ['hello', 'hey', 'hi ', 'yo ', 'sup', 'good morning', 'good evening'],
    reply:
      "You made it. Most people don't get this far. Ask me about any spot on the map — or anything else you think I might know.",
  },
  {
    keys: ['thanks', 'thank you', 'appreciate'],
    reply:
      "Don't mention it. Seriously — don't mention it. Not to anybody.",
  },
  {
    keys: ['police', 'cops', 'wanted', 'arrest'],
    reply:
      "VCPD's presence is loud where the tourists are and quiet where the money is. That's not incompetence, that's design. Learn the difference and you'll last longer.",
  },
  {
    keys: ['cars', 'vehicle', 'drive', 'fast'],
    reply:
      "Everything with an engine gets chopped on Prawn Island eventually. Want something clean, you buy it in Vice Point. Want something fast and unregistered, you know a guy. I might know a guy.",
  },
  {
    keys: ['food', 'eat', 'coffee', 'restaurant'],
    reply:
      "Little Havana. Cuban coffee that'll make your hands shake and your problems seem manageable. Sit at the counter, keep your voice down, tip in cash.",
  },
  {
    keys: ['gang', 'cartel', 'mafia', 'crime', 'criminal'],
    reply:
      "Every neighborhood's got somebody collecting. Downtown calls it business, Viceport calls it shipping, Starfish Island calls it philanthropy. Same money, better suits.",
  },
];

const FALLBACKS = [
  "That's outside what I know, and I don't guess for free. Ask me about a spot on the map — Starfish Island, Viceport, Little Havana, any of 'em.",
  "Hmm. Never heard that one. Try me on a location — twelve of 'em on that map, and I've got stories for all twelve.",
  "Can't help you there, friend. But name me a district and I'll tell you who really runs it.",
  "You're asking the wrong question. Ask me about the places instead — that's where the answers live.",
];

const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];

export function getRicoReply(input: string): string {
  const loc = findLocation(input);
  if (loc) {
    const opener = pick(LOCATION_OPENERS).replace('{name}', loc.name);
    return `${opener}\n\n${loc.lore}\n\n${loc.fullDescription}`;
  }

  const q = norm(input) + ' ';
  const topic = TOPICS.find((t) => t.keys.some((k) => q.includes(k)));
  if (topic) return topic.reply;

  return pick(FALLBACKS);
}

/** Rough "typing" delay so replies don't snap in instantly. */
export const replyDelay = (text: string) =>
  Math.min(1800, 400 + text.length * 4);
