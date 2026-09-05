/**
 * Deliberately small, keyword-based categoriser. No ML, no API call.
 * Users can override with a hashtag: "chai 80 #fun".
 */
export const CATEGORIES = [
  "food",
  "groceries",
  "transport",
  "bills",
  "shopping",
  "health",
  "fun",
  "other",
] as const;

export type Category = (typeof CATEGORIES)[number];

export const CATEGORY_LABEL: Record<Category, string> = {
  food: "Food & drink",
  groceries: "Groceries",
  transport: "Transport",
  bills: "Bills & subs",
  shopping: "Shopping",
  health: "Health",
  fun: "Fun",
  other: "Other",
};

const KEYWORDS: Record<Exclude<Category, "other">, string[]> = {
  food: [
    "coffee", "chai", "tea", "latte", "cappuccino", "lunch", "dinner", "breakfast", "brunch",
    "biryani", "pizza", "burger", "shawarma", "kebab", "karahi", "nihari", "paratha", "samosa",
    "food", "restaurant", "cafe", "café", "snack", "snacks", "eat", "meal", "kfc", "mcd",
    "mcdonalds", "dominos", "subway", "foodpanda", "zomato", "swiggy", "deliveroo", "doordash",
    "ubereats", "juice", "shake", "dessert", "ice cream", "chocolate", "bakery", "cake", "sandwich",
    "noodles", "sushi", "tikka", "bbq", "dhaba", "canteen", "cafeteria", "tuck", "chips", "cola",
    "pepsi", "coke", "water bottle", "lassi", "roti", "naan", "daal", "chicken", "beef", "fries",
  ],
  groceries: [
    "grocery", "groceries", "milk", "eggs", "bread", "vegetables", "veggies", "sabzi", "fruit",
    "fruits", "supermarket", "imtiaz", "carrefour", "walmart", "costco", "tesco", "sainsbury",
    "aldi", "lidl", "mart", "store run", "rice", "flour", "atta", "sugar", "oil", "onion",
    "potato", "tomato", "kirana", "ration", "dairy", "butter", "cheese", "yogurt", "dahi",
  ],
  transport: [
    "uber", "careem", "indrive", "bykea", "ola", "lyft", "bolt", "grab", "taxi", "cab",
    "rickshaw", "auto", "bus", "train", "metro", "tube", "tram", "fuel", "petrol", "gas",
    "diesel", "cng", "parking", "toll", "flight", "airline", "ticket", "fare", "ride", "bike",
    "scooter", "car wash", "oil change", "tyre", "tire", "mechanic", "service",
  ],
  bills: [
    "bill", "electricity", "electric", "k-electric", "lesco", "wapda", "internet", "wifi",
    "broadband", "ptcl", "phone", "mobile", "recharge", "top up", "topup", "load", "balance",
    "jazz", "zong", "telenor", "ufone", "jio", "airtel", "water bill", "gas bill", "sui gas",
    "rent", "netflix", "spotify", "youtube", "icloud", "google one", "subscription", "prime",
    "disney", "hbo", "apple", "chatgpt", "claude", "insurance", "emi", "installment", "loan",
    "fee", "fees", "tuition", "school", "maid", "domestic", "salary", "maintenance",
  ],
  shopping: [
    "shirt", "tshirt", "t-shirt", "shoes", "sneakers", "clothes", "clothing", "amazon", "daraz",
    "dress", "jeans", "trousers", "watch", "bag", "gift", "perfume", "makeup", "cosmetics",
    "shopping", "mall", "zara", "h&m", "nike", "adidas", "khaadi", "sapphire", "outfitters",
    "kurta", "shalwar", "suit", "jacket", "cap", "glasses", "sunglasses", "headphones",
    "charger", "cable", "phone case", "laptop", "gadget", "electronics", "furniture", "decor",
    "books", "book", "stationery", "toy", "toys",
  ],
  health: [
    "doctor", "dr", "medicine", "medicines", "meds", "pharmacy", "medical", "hospital", "gym",
    "dentist", "clinic", "lab", "test", "checkup", "check-up", "vitamins", "protein", "therapy",
    "physio", "glasses", "lens", "optician", "surgery", "vaccine", "panadol", "tablets",
  ],
  fun: [
    "movie", "movies", "cinema", "film", "game", "games", "gaming", "steam", "playstation",
    "xbox", "concert", "party", "outing", "trip", "hotel", "airbnb", "travel", "vacation",
    "holiday", "beach", "picnic", "bowling", "arcade", "club", "bar", "shisha", "hookah",
    "date", "gift for", "wedding", "birthday", "fun", "entertainment", "museum", "zoo", "park",
  ],
};

export function isCategory(s: string): s is Category {
  return (CATEGORIES as readonly string[]).includes(s);
}

export function categorise(text: string): Category {
  const t = ` ${text.toLowerCase().replace(/[^a-z0-9&'\- ]+/g, " ")} `;
  let best: Category = "other";
  let bestLen = 0;
  for (const [cat, words] of Object.entries(KEYWORDS) as [Category, string[]][]) {
    for (const w of words) {
      // Whole-word match; longer keyword = more specific = wins ties.
      if (t.includes(` ${w} `) && w.length > bestLen) {
        best = cat;
        bestLen = w.length;
      }
    }
  }
  return best;
}
