import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-05-27.dahlia',
})

export const CREDIT_PACKS = {
  analyse: {
    id: 'analyse',
    name: 'Pack Analyse',
    description: '20 crédits — idéal pour explorer tous tes critères',
    price: 299, // centimes
    credits: 20,
    priceDisplay: '2,99 €',
    popular: false,
  },
  explorateur: {
    id: 'explorateur',
    name: 'Pack Explorateur',
    description: '60 crédits — pour aller au fond des choses',
    price: 599,
    credits: 60,
    priceDisplay: '5,99 €',
    popular: true,
  },
  cadeau: {
    id: 'cadeau',
    name: 'Cadeau Viral',
    description: 'Offre 3 crédits à quelqu\'un — boucle virale',
    price: 199,
    credits: 3,
    priceDisplay: '1,99 €',
    popular: false,
    isGift: true,
  },
} as const

export type PackId = keyof typeof CREDIT_PACKS

export const PDF_PRICE = {
  id: 'pdf_export',
  price: 99,
  priceDisplay: '0,99 €',
}
