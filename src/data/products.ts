export type DietType = 'veg' | 'egg' | 'non-veg';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  offerPrice?: number;
  image: string;
  category: string;
  dietType: DietType;
  isAvailable: boolean;
  isAdvanceOrder?: boolean;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  description: string;
}

export const categories: Category[] = [
  { id: 'cupcakes', name: 'Cupcakes', icon: '🧁', description: 'Freshly baked delights' },
  { id: 'cakes', name: 'Cakes', icon: '🎂', description: 'Advance & anytime orders' },
  { id: 'quick-bites', name: 'Quick Bites', icon: '🥪', description: 'Sandwiches, nuggets & more' },
];

export const products: Product[] = [
  {
    id: '1',
    name: 'Vanilla Dream Cupcake',
    description: 'Fluffy vanilla cupcake topped with silky buttercream frosting and rainbow sprinkles.',
    price: 120,
    offerPrice: 99,
    image: 'https://images.unsplash.com/photo-1587668178277-295251f900ce?w=400&h=400&fit=crop',
    category: 'cupcakes',
    dietType: 'egg',
    isAvailable: true,
  },
  {
    id: '2',
    name: 'Red Velvet Cupcake',
    description: 'Classic red velvet with cream cheese frosting — a timeless favorite.',
    price: 140,
    image: 'https://images.unsplash.com/photo-1614707267537-b85aaf00c4b7?w=400&h=400&fit=crop',
    category: 'cupcakes',
    dietType: 'egg',
    isAvailable: true,
  },
  {
    id: '3',
    name: 'Chocolate Truffle Cupcake',
    description: 'Rich chocolate base with ganache swirl and cocoa dust.',
    price: 130,
    image: 'https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?w=400&h=400&fit=crop',
    category: 'cupcakes',
    dietType: 'egg',
    isAvailable: true,
  },
  {
    id: '4',
    name: 'Strawberry Bliss Cake',
    description: 'Three-layer strawberry cake with fresh berries and whipped cream. Perfect for celebrations.',
    price: 899,
    offerPrice: 749,
    image: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400&h=400&fit=crop',
    category: 'cakes',
    dietType: 'egg',
    isAvailable: true,
    isAdvanceOrder: true,
  },
  {
    id: '5',
    name: 'Classic Chocolate Cake',
    description: 'Dense, moist chocolate cake with dark ganache. A chocolate lover\'s dream.',
    price: 799,
    image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=400&fit=crop',
    category: 'cakes',
    dietType: 'egg',
    isAvailable: true,
    isAdvanceOrder: true,
  },
  {
    id: '6',
    name: 'Pineapple Cake',
    description: 'Light sponge cake with pineapple filling and cream frosting.',
    price: 699,
    image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&h=400&fit=crop',
    category: 'cakes',
    dietType: 'egg',
    isAvailable: true,
    isAdvanceOrder: true,
  },
  {
    id: '7',
    name: 'Veg Club Sandwich',
    description: 'Loaded with fresh veggies, cheese, and our special sauce on toasted bread.',
    price: 149,
    offerPrice: 129,
    image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400&h=400&fit=crop',
    category: 'quick-bites',
    dietType: 'veg',
    isAvailable: true,
  },
  {
    id: '8',
    name: 'Egg Mayo Sandwich',
    description: 'Creamy egg mayo with lettuce and pepper on soft white bread.',
    price: 129,
    image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=400&h=400&fit=crop',
    category: 'quick-bites',
    dietType: 'egg',
    isAvailable: true,
  },
  {
    id: '9',
    name: 'Chicken Popcorn',
    description: 'Crispy bite-sized chicken pieces with special seasoning.',
    price: 199,
    offerPrice: 179,
    image: 'https://images.unsplash.com/photo-1562967914-608f82629710?w=400&h=400&fit=crop',
    category: 'quick-bites',
    dietType: 'non-veg',
    isAvailable: true,
  },
  {
    id: '10',
    name: 'Chicken Nuggets',
    description: 'Golden fried chicken nuggets served with dipping sauce.',
    price: 219,
    image: 'https://images.unsplash.com/photo-1585325701956-60dd9c8553bc?w=400&h=400&fit=crop',
    category: 'quick-bites',
    dietType: 'non-veg',
    isAvailable: true,
  },
  {
    id: '11',
    name: 'Chicken Grilled Sandwich',
    description: 'Grilled chicken breast with veggies and mayo on artisan bread.',
    price: 189,
    image: 'https://images.unsplash.com/photo-1553909489-cd47e0907980?w=400&h=400&fit=crop',
    category: 'quick-bites',
    dietType: 'non-veg',
    isAvailable: true,
  },
  {
    id: '12',
    name: 'Butterscotch Cupcake',
    description: 'Caramel butterscotch cupcake with crunchy praline topping.',
    price: 110,
    image: 'https://images.unsplash.com/photo-1519869325930-281384150729?w=400&h=400&fit=crop',
    category: 'cupcakes',
    dietType: 'veg',
    isAvailable: true,
  },
];

export const offers = [
  { id: '1', title: '20% Off Cupcakes!', description: 'This weekend only — grab your favorites', badge: 'Weekend Special' },
  { id: '2', title: 'Free Delivery on ₹500+', description: 'No delivery charges on orders above ₹500', badge: 'Free Delivery' },
  { id: '3', title: 'Combo: 6 Cupcakes @ ₹499', description: 'Mix & match any 6 cupcakes', badge: 'Combo Deal' },
];
