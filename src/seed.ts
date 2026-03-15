import { collection, getDocs, addDoc, doc, setDoc } from 'firebase/firestore';
import { db } from './firebase';

const MOCK_BUSINESSES = [
  {
    name: "Le Petit Jardin",
    description: "Un restaurant gastronomique au cœur de Saly, proposant une cuisine fusion sénégalaise et française.",
    category: "restaurant",
    city: "Saly",
    address: "Route de Saly, Résidence du Port",
    phone: "+221 33 957 12 34",
    photos: ["https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80"],
    rating: 4.8,
    reviewCount: 124,
    priceRange: "$$$",
    openingHours: { lundi: "12:00 - 23:00", mardi: "12:00 - 23:00", mercredi: "12:00 - 23:00", jeudi: "12:00 - 23:00", vendredi: "12:00 - 00:00", samedi: "12:00 - 00:00", dimanche: "12:00 - 22:00" },
    deliveryAvailable: true,
    deliveryFee: 1500,
    subscriptionPlan: "premium",
    status: "approved",
    ownerId: "system",
    createdAt: new Date().toISOString()
  },
  {
    name: "Gelato Saly",
    description: "Les meilleures glaces artisanales de la côte. Ingrédients frais et saveurs locales.",
    category: "glacier",
    city: "Saly",
    address: "Avenue du Golf",
    phone: "+221 77 123 45 67",
    photos: ["https://images.unsplash.com/photo-1501443762994-82bd5dabb89a?auto=format&fit=crop&w=800&q=80"],
    rating: 4.9,
    reviewCount: 89,
    priceRange: "$",
    openingHours: { lundi: "10:00 - 22:00", mardi: "10:00 - 22:00", mercredi: "10:00 - 22:00", jeudi: "10:00 - 22:00", vendredi: "10:00 - 23:00", samedi: "10:00 - 23:00", dimanche: "10:00 - 22:00" },
    deliveryAvailable: true,
    deliveryFee: 500,
    subscriptionPlan: "standard",
    status: "approved",
    ownerId: "system",
    createdAt: new Date().toISOString()
  },
  {
    name: "Mbour Snack Express",
    description: "Rapide, frais et délicieux. Burgers, chawarmas et frites maison.",
    category: "snack",
    city: "Mbour",
    address: "Marché Central Mbour",
    phone: "+221 70 987 65 43",
    photos: ["https://images.unsplash.com/photo-1561758033-d89a9ad46330?auto=format&fit=crop&w=800&q=80"],
    rating: 4.5,
    reviewCount: 210,
    priceRange: "$",
    openingHours: { lundi: "09:00 - 21:00", mardi: "09:00 - 21:00", mercredi: "09:00 - 21:00", jeudi: "09:00 - 21:00", vendredi: "09:00 - 22:00", samedi: "09:00 - 22:00", dimanche: "Fermé" },
    deliveryAvailable: true,
    deliveryFee: 1000,
    subscriptionPlan: "basic",
    status: "approved",
    ownerId: "system",
    createdAt: new Date().toISOString()
  }
];

const MOCK_MENU = [
  { name: "Thieboudienne Royal", description: "Le plat national revisité avec des produits de la mer frais.", price: 7500, category: "Plats" },
  { name: "Yassa au Poulet", description: "Poulet mariné au citron et oignons caramélisés.", price: 5500, category: "Plats" },
  { name: "Dibi Saly", description: "Agneau grillé au feu de bois, servi avec oignons et moutarde.", price: 6000, category: "Grillades" }
];

export const seedDatabase = async () => {
  const busSnap = await getDocs(collection(db, 'businesses'));
  if (busSnap.empty) {
    console.log("Seeding database...");
    for (const busData of MOCK_BUSINESSES) {
      const docRef = await addDoc(collection(db, 'businesses'), busData);
      
      // Add menu items for each business
      for (const item of MOCK_MENU) {
        await addDoc(collection(db, 'businesses', docRef.id, 'menu'), {
          ...item,
          businessId: docRef.id,
          available: true
        });
      }
    }
    console.log("Seeding complete!");
  }
};
